import { db } from ".";
import { sql } from "drizzle-orm";

/**
 * Setup database triggers
 * 
 * This function creates PostgreSQL triggers that will be executed automatically:
 * 1. When a gig is deleted, all associated in-progress orders are cancelled
 * 2. When delivery is approved, auto-complete the order and transfer payment
 * 3. When a review is submitted, update the freelancer's average rating
 * 4. Mark orders as late when their due date passes
 */
export async function setupTriggers() {
  try {
    console.log("Setting up database triggers...");

    // 1. TRIGGER: Cancel orders when a gig is deleted
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

    // Drop existing gig delete trigger if it exists
    await db.execute(sql`
      DROP TRIGGER IF EXISTS gig_delete_trigger ON gigs;
    `);

    // Create the gig delete trigger
    await db.execute(sql`
      CREATE TRIGGER gig_delete_trigger
      BEFORE DELETE ON gigs
      FOR EACH ROW
      EXECUTE FUNCTION cancel_orders_on_gig_delete();
    `);

    // 2. TRIGGER: Auto-complete order and transfer payment when delivery is approved
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION auto_complete_order_on_approval()
      RETURNS TRIGGER AS $$
      BEGIN
        -- If the status is being updated to "completed"
        IF NEW.status = 'completed' AND OLD.status = 'delivered' THEN
          -- Transfer the payment to the freelancer
          UPDATE users
          SET balance = balance + NEW.price
          WHERE id = NEW.freelancer_id;
          
          -- Log the transaction
          INSERT INTO transfer_log (order_id, amount, from_user_id, to_user_id, created_at)
          VALUES (NEW.id, NEW.price, NEW.client_id, NEW.freelancer_id, NOW());
        END IF;
        
        -- Return the updated row
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create a transfer log table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS transfer_log (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Drop existing order update trigger if it exists
    await db.execute(sql`
      DROP TRIGGER IF EXISTS order_approval_trigger ON orders;
    `);

    // Create the order approval trigger
    await db.execute(sql`
      CREATE TRIGGER order_approval_trigger
      AFTER UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION auto_complete_order_on_approval();
    `);

    // 3. TRIGGER: Update freelancer rating when a review is submitted
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_freelancer_rating_on_review()
      RETURNS TRIGGER AS $$
      DECLARE
        freelancer_id INTEGER;
        avg_rating DECIMAL;
        total_reviews INTEGER;
      BEGIN
        -- Get the freelancer ID from the order
        SELECT o.freelancer_id INTO freelancer_id
        FROM orders o
        WHERE o.id = NEW.order_id;
        
        -- Calculate the new average rating and total reviews
        SELECT 
          AVG(r.rating) as average,
          COUNT(*) as count
        INTO 
          avg_rating,
          total_reviews
        FROM reviews r
        JOIN orders o ON r.order_id = o.id
        WHERE o.freelancer_id = freelancer_id;
        
        -- Update the freelancer's profile with new rating data
        UPDATE users
        SET 
          avg_rating = ROUND(avg_rating::numeric, 1),
          total_reviews = total_reviews
        WHERE id = freelancer_id;
        
        -- Return the new review
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Add avg_rating and total_reviews columns to users table if they don't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' 
                      AND column_name = 'avg_rating') THEN
          ALTER TABLE users ADD COLUMN avg_rating DECIMAL DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' 
                      AND column_name = 'total_reviews') THEN
          ALTER TABLE users ADD COLUMN total_reviews INTEGER DEFAULT 0;
        END IF;
      END $$;
    `);

    // Drop existing review insert trigger if it exists
    await db.execute(sql`
      DROP TRIGGER IF EXISTS review_rating_trigger ON reviews;
    `);

    // Create the review rating trigger
    await db.execute(sql`
      CREATE TRIGGER review_rating_trigger
      AFTER INSERT ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_freelancer_rating_on_review();
    `);

    // 4. TRIGGER: Automatically mark orders as late when due date passes
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION mark_orders_as_late()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Check if the current time has passed the due date and the order is not already marked late
        IF NEW.due_date IS NOT NULL AND 
           NEW.due_date < NOW() AND 
           NEW.is_late = FALSE AND 
           NEW.status NOT IN ('completed', 'cancelled') THEN
          
          -- Mark the order as late
          NEW.is_late := TRUE;
          
          -- If the order is in progress, change status to late
          IF NEW.status = 'in_progress' THEN
            NEW.status := 'late';
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Drop existing order late trigger if it exists
    await db.execute(sql`
      DROP TRIGGER IF EXISTS order_late_trigger ON orders;
    `);

    // Create the order late trigger
    await db.execute(sql`
      CREATE TRIGGER order_late_trigger
      BEFORE UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION mark_orders_as_late();
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