import { db } from "../db";
import { orders } from "../db/schema";
import { eq, lt, and, ne } from "drizzle-orm";

/**
 * Utility function to check and update orders that are past their due date
 * This marks them as late and changes their status if needed
 */
export async function checkAndUpdateLateOrders() {
  try {
    const currentDate = new Date();
    
    // Find orders that are past due date but not yet marked as late
    const ordersToUpdate = await db.query.orders.findMany({
      where: (orders, { and, eq, lt, ne }) => 
        and(
          eq(orders.isLate, false),
          lt(orders.dueDate!, currentDate),
          ne(orders.status, "completed"),
          ne(orders.status, "cancelled")
        )
    });
    
    console.log(`Found ${ordersToUpdate.length} orders that are now late`);
    
    // Update each order to mark it as late
    for (const order of ordersToUpdate) {
      await db
        .update(orders)
        .set({
          isLate: true,
          status: order.status === "in_progress" ? "late" : order.status,
        })
        .where(eq(orders.id, order.id));
      
      console.log(`Order #${order.id} marked as late`);
    }
    
    return ordersToUpdate.length;
  } catch (error) {
    console.error("Error checking for late orders:", error);
    throw error;
  }
} 