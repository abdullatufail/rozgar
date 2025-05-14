import { db } from ".";
import { sql } from "drizzle-orm";

/**
 * Setup database triggers
 * 
 * This function creates PostgreSQL triggers that will be executed automatically:
 * 1. When a gig is deleted, all associated in-progress orders are cancelled
 */
export async function setupTriggers() {
  try {
    console.log("Setting up database triggers...");

    // First, create the function that will be called by the trigger
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION cancel_orders_on_gig_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Update all active orders to cancelled status
        UPDATE orders 
        SET 
          status = 'cancelled',
          cancellation_reason = 'The gig was deleted by the freelancer',
          cancellation_approved = true
        WHERE 
          gig_id = OLD.id 
          AND status IN ('pending', 'in_progress', 'cancellation_requested', 'late');
          
        -- Return the row being deleted
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Check if trigger already exists and drop it to avoid errors
    await db.execute(sql`
      DROP TRIGGER IF EXISTS gig_delete_trigger ON gigs;
    `);

    // Create the trigger
    await db.execute(sql`
      CREATE TRIGGER gig_delete_trigger
      BEFORE DELETE ON gigs
      FOR EACH ROW
      EXECUTE FUNCTION cancel_orders_on_gig_delete();
    `);

    console.log("Database triggers setup complete");
  } catch (error) {
    console.error("Error setting up database triggers:", error);
    throw error;
  }
}

/**
 * Function to handle refunding customers when orders are automatically cancelled
 * This should be called after the trigger has run (e.g., in a scheduled job)
 */
export async function processAutoCancelledOrderRefunds() {
  try {
    console.log("Processing refunds for auto-cancelled orders...");
    
    // Execute a raw SQL query to find cancelled orders that need refunds
    await db.execute(sql`
      WITH cancelled_orders AS (
        SELECT o.id, o.client_id, o.price
        FROM orders o
        WHERE o.status = 'cancelled' 
          AND o.cancellation_approved = true
          AND NOT EXISTS (
            -- Subquery to check if the refund has already been processed
            SELECT 1 FROM refund_log WHERE order_id = o.id
          )
      )
      UPDATE users u
      SET balance = balance + co.price
      FROM cancelled_orders co
      WHERE u.id = co.client_id;
      
      -- Create a refund log table if it doesn't exist
      CREATE TABLE IF NOT EXISTS refund_log (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Log the refunds to prevent double processing
      INSERT INTO refund_log (order_id, amount)
      SELECT o.id, o.price
      FROM orders o
      WHERE o.status = 'cancelled' 
        AND o.cancellation_approved = true
        AND NOT EXISTS (
          SELECT 1 FROM refund_log WHERE order_id = o.id
        );
    `);
    
    console.log("Refund processing complete");
  } catch (error) {
    console.error("Error processing refunds:", error);
    throw error;
  }
} 