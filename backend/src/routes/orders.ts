import express, { Router } from "express";
import { db } from "../db";
import { orders, gigs, reviews, users } from "../db/schema";
import { z } from "zod";
import { eq, and, or } from "drizzle-orm";
import { auth, isClient } from "../middleware/auth";
import { Request } from "express";
import multer from "multer";
import path from "path";
import { checkAndUpdateLateOrders } from "../services/orderService";

const router = Router();
const upload = multer({ 
  dest: path.join(__dirname, "..", "uploads"),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const orderSchema = z.object({
  gigId: z.number(),
  requirements: z.string().min(1),
});

// Run the check on each request (will be removed once cron job is in place)
router.use(async (req, res, next) => {
  await checkAndUpdateLateOrders();
  next();
});

// Create order
router.post("/", auth, isClient, async (req, res) => {
  try {
    console.log("Creating order with body:", req.body);
    console.log("User making request:", req.user);
    
    // Parse and validate the request body
    let parsedData;
    try {
      parsedData = orderSchema.parse(req.body);
      console.log("Parsed order data:", parsedData);
    } catch (parseError) {
      console.error("Request validation error:", parseError);
      return res.status(400).json({ 
        message: "Invalid request data", 
        error: parseError instanceof Error ? parseError.message : "Unknown validation error" 
      });
    }
    
    const { gigId, requirements } = parsedData;

    // Get gig details
    let gig;
    try {
      gig = await db.query.gigs.findFirst({
        where: eq(gigs.id, gigId),
      });
      console.log("Found gig:", gig);
    } catch (gigError) {
      console.error("Error fetching gig:", gigError);
      return res.status(500).json({ 
        message: "Failed to fetch gig details",
        error: gigError instanceof Error ? gigError.message : "Unknown database error"
      });
    }

    if (!gig) {
      console.log("Gig not found:", gigId);
      return res.status(404).json({ message: "Gig not found" });
    }

    // Get client details to check balance
    let client;
    try {
      client = await db.query.users.findFirst({
        where: eq(users.id, req.user!.id),
      });
      console.log("Found client:", client);
    } catch (clientError) {
      console.error("Error fetching client:", clientError);
      return res.status(500).json({ 
        message: "Failed to fetch client details",
        error: clientError instanceof Error ? clientError.message : "Unknown database error"
      });
    }

    if (!client) {
      console.log("Client not found:", req.user!.id);
      return res.status(404).json({ message: "Client not found" });
    }

    console.log("Client balance:", client.balance, "Gig price:", gig.price);

    // Check if client has enough balance
    const clientBalance = Number(client.balance || 0);
    if (clientBalance < gig.price) {
      console.log("Insufficient balance. Required:", gig.price, "Available:", clientBalance);
      return res.status(400).json({ 
        message: "Insufficient balance", 
        required: gig.price,
        current: clientBalance
      });
    }

    // Deduct amount from client's balance
    try {
      await db
        .update(users)
        .set({
          balance: clientBalance - gig.price,
        })
        .where(eq(users.id, req.user!.id));
      console.log("Updated client balance to:", clientBalance - gig.price);
    } catch (updateBalanceError) {
      console.error("Error updating client balance:", updateBalanceError);
      return res.status(500).json({ 
        message: "Failed to update client balance",
        error: updateBalanceError instanceof Error ? updateBalanceError.message : "Unknown database error"
      });
    }

    // Create order
    let order;
    try {
      // Calculate due date based on gig duration
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (gig.durationDays || 7));
      
      const [createdOrder] = await db
        .insert(orders)
        .values({
          gigId,
          clientId: req.user!.id,
          freelancerId: gig.freelancerId,
          price: gig.price,
          requirements,
          status: "pending",
          dueDate,
          isLate: false,
        })
        .returning();
      order = createdOrder;
      console.log("Order created successfully:", order);
    } catch (createOrderError) {
      console.error("Error inserting order:", createOrderError);
      
      // Try to refund the client since order creation failed
      try {
        await db
          .update(users)
          .set({
            balance: clientBalance, // Restore original balance
          })
          .where(eq(users.id, req.user!.id));
        console.log("Refunded client's balance due to failed order creation");
      } catch (refundError) {
        console.error("Failed to refund client after order creation error:", refundError);
      }
      
      return res.status(500).json({ 
        message: "Failed to create order",
        error: createOrderError instanceof Error ? createOrderError.message : "Unknown database error"
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Uncaught error in order creation:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ 
      message: "Something went wrong", 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined 
    });
  }
});

// Get user's orders
router.get("/", auth, async (req, res) => {
  try {
    console.log("Fetching orders for user:", req.user!.id);
    const userOrders = await db.query.orders.findMany({
      where: (orders, { or, eq }) =>
        or(
          eq(orders.clientId, req.user!.id),
          eq(orders.freelancerId, req.user!.id)
        ),
      columns: {
        id: true,
        gigId: true,
        clientId: true,
        freelancerId: true,
        price: true,
        requirements: true,
        status: true,
        dueDate: true,
        isLate: true,
        deliveryFile: true,
        deliveryNotes: true,
        cancellationReason: true,
        cancellationApproved: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        gig: true,
        client: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
            balance: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        freelancer: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
            balance: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    console.log("Found orders:", userOrders);
    
    // Ensure all required properties exist
    const safeOrders = userOrders.map(order => ({
      ...order,
      gig: order.gig || { title: "Unknown Gig", id: 0 },
      client: order.client || { name: "Unknown Client", id: 0 },
      freelancer: order.freelancer || { name: "Unknown Freelancer", id: 0 }
    }));
    
    res.json(safeOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({ 
      message: "Something went wrong", 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Get single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await db.query.orders.findFirst({
      where: (orders, { and, eq, or }) =>
        and(
          eq(orders.id, parseInt(req.params.id)),
          or(
            eq(orders.clientId, req.user!.id),
            eq(orders.freelancerId, req.user!.id)
          )
        ),
      columns: {
        id: true,
        gigId: true,
        clientId: true,
        freelancerId: true,
        price: true,
        requirements: true,
        status: true,
        dueDate: true,
        isLate: true,
        deliveryFile: true,
        deliveryNotes: true,
        cancellationReason: true,
        cancellationApproved: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        gig: true,
        client: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
            balance: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        freelancer: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
            balance: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({ 
      message: "Something went wrong", 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Update order status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = z
      .object({
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
      })
      .parse(req.body);

    // Get the order
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, parseInt(req.params.id)),
        eq(orders.freelancerId, req.user!.id)
      ),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
      })
      .where(
        and(
          eq(orders.id, parseInt(req.params.id)),
          eq(orders.freelancerId, req.user!.id)
        )
      )
      .returning();

    res.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Error updating order status:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({ 
      message: "Something went wrong", 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Deliver order
router.post("/:id/deliver", auth, upload.single("file"), async (req: Request & { file?: Express.Multer.File }, res) => {
  try {
    const { notes } = z.object({ notes: z.string() }).parse(req.body);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const [order] = await db
      .update(orders)
      .set({
        status: "delivered",
        deliveryFile: file.path,
        deliveryNotes: notes,
      })
      .where(
        and(
          eq(orders.id, parseInt(req.params.id)),
          eq(orders.freelancerId, req.user!.id)
        )
      )
      .returning();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error delivering order:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Approve delivery - complete the order and transfer funds to freelancer
router.post("/:id/approve", auth, async (req, res) => {
  try {
    // Get the order with price info
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, parseInt(req.params.id)),
        eq(orders.clientId, req.user!.id)
      ),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status to completed
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "completed",
      })
      .where(
        and(
          eq(orders.id, parseInt(req.params.id)),
          eq(orders.clientId, req.user!.id)
        )
      )
      .returning();

    // Add the funds to freelancer's balance
    const freelancer = await db.query.users.findFirst({
      where: eq(users.id, order.freelancerId),
    });

    if (freelancer) {
      const freelancerBalance = Number(freelancer.balance || 0);
      await db
        .update(users)
        .set({
          balance: freelancerBalance + order.price,
        })
        .where(eq(users.id, order.freelancerId));
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error approving delivery:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Reject delivery
router.post("/:id/reject", auth, async (req, res) => {
  try {
    const [order] = await db
      .update(orders)
      .set({
        status: "in_progress",
      })
      .where(
        and(
          eq(orders.id, parseInt(req.params.id)),
          eq(orders.clientId, req.user!.id)
        )
      )
      .returning();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error rejecting delivery:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Request cancellation
router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const { reason } = z.object({ reason: z.string() }).parse(req.body);

    // Get the order to check if it's late
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(req.params.id))
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has permission to cancel this order
    if (order.clientId !== req.user!.id && order.freelancerId !== req.user!.id) {
      return res.status(403).json({ message: "You don't have permission to cancel this order" });
    }

    // If the order is late and the client is requesting cancellation, auto-approve it
    if (order.isLate && req.user!.id === order.clientId) {
      console.log("Auto-approving cancellation for late order", order.id);
      
      // Update order status to cancelled
      const [updatedOrder] = await db
        .update(orders)
        .set({
          status: "cancelled",
          cancellationReason: reason,
          cancellationApproved: true,
        })
        .where(eq(orders.id, order.id))
        .returning();

      // Return the funds to client's balance
      const client = await db.query.users.findFirst({
        where: eq(users.id, order.clientId),
      });

      if (client) {
        const clientBalance = Number(client.balance || 0);
        await db
          .update(users)
          .set({
            balance: clientBalance + order.price,
          })
          .where(eq(users.id, order.clientId));
      }

      return res.json({
        ...updatedOrder,
        message: "Order cancelled automatically due to late delivery"
      });
    }

    // Regular cancellation request flow
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "cancellation_requested",
        cancellationReason: reason,
        cancellationRequestedBy: req.user!.id
      })
      .where(eq(orders.id, order.id))
      .returning();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error requesting cancellation:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Approve cancellation - Return funds to client
router.post("/:id/approve-cancellation", auth, async (req, res) => {
  try {
    // Get the order with price info
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, parseInt(req.params.id)),
        or(
          eq(orders.clientId, req.user!.id),
          eq(orders.freelancerId, req.user!.id)
        )
      ),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status to cancelled
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "cancelled",
        cancellationApproved: true,
      })
      .where(
        and(
          eq(orders.id, parseInt(req.params.id)),
          or(
            eq(orders.clientId, req.user!.id),
            eq(orders.freelancerId, req.user!.id)
          )
        )
      )
      .returning();

    // Return the funds to client's balance
    const client = await db.query.users.findFirst({
      where: eq(users.id, order.clientId),
    });

    if (client) {
      const clientBalance = Number(client.balance || 0);
      await db
        .update(users)
        .set({
          balance: clientBalance + order.price,
        })
        .where(eq(users.id, order.clientId));
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error approving cancellation:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Reject cancellation - Revert to in_progress status
router.post("/:id/reject-cancellation", auth, async (req, res) => {
  try {
    // Get the order
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, parseInt(req.params.id)),
        or(
          eq(orders.clientId, req.user!.id),
          eq(orders.freelancerId, req.user!.id)
        )
      ),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status back to in_progress
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "in_progress",
        cancellationApproved: false,
      })
      .where(
        and(
          eq(orders.id, parseInt(req.params.id)),
          or(
            eq(orders.clientId, req.user!.id),
            eq(orders.freelancerId, req.user!.id)
          )
        )
      )
      .returning();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error rejecting cancellation:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Add review
router.post("/:id/review", auth, async (req, res) => {
  try {
    const { rating, comment } = z
      .object({
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
      .parse(req.body);

    const order = await db.query.orders.findFirst({
      where: (orders, { and, eq }) =>
        and(
          eq(orders.id, parseInt(req.params.id)),
          eq(orders.clientId, req.user!.id)
        ),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "completed") {
      return res.status(400).json({ message: "Order must be completed to add a review" });
    }

    // Check if review already exists
    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.orderId, order.id),
    });

    if (existingReview) {
      return res.status(400).json({ message: "Review already exists for this order" });
    }

    const [review] = await db
      .insert(reviews)
      .values({
        orderId: order.id,
        rating,
        comment,
      })
      .returning();

    // Update gig rating
    const gig = await db.query.gigs.findFirst({
      where: eq(gigs.id, order.gigId),
    });

    if (gig) {
      const newTotalReviews = (gig.totalReviews || 0) + 1;
      const newRating = Math.round(
        ((gig.rating || 0) * (gig.totalReviews || 0) + rating) / newTotalReviews
      );

      await db
        .update(gigs)
        .set({
          rating: newRating,
          totalReviews: newTotalReviews,
        })
        .where(eq(gigs.id, order.gigId));
    }

    res.json(review);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get reviews for a freelancer
router.get("/freelancer/:id/reviews", async (req, res) => {
  try {
    console.log("Fetching reviews for freelancer:", req.params.id);
    
    // Validate the ID parameter
    const freelancerId = parseInt(req.params.id);
    if (isNaN(freelancerId)) {
      console.log("Invalid freelancer ID:", req.params.id);
      return res.status(400).json({ message: "Invalid freelancer ID" });
    }
    
    // Get all completed orders for the freelancer
    let freelancerOrders;
    try {
      freelancerOrders = await db.query.orders.findMany({
        where: and(
          eq(orders.freelancerId, freelancerId),
          eq(orders.status, "completed")
        ),
      });
      console.log(`Found ${freelancerOrders.length} completed orders for freelancer ${freelancerId}`);
    } catch (orderError) {
      console.error("Error fetching completed orders:", orderError);
      return res.json([]);
    }

    if (!freelancerOrders.length) {
      console.log("No completed orders found for freelancer:", freelancerId);
      return res.json([]);
    }

    // Get all reviews for those orders
    const orderIds = freelancerOrders.map(order => order.id);
    console.log("Looking for reviews for order IDs:", orderIds);
    
    try {
      const reviewsData = await db.query.reviews.findMany({
        where: (reviews, { inArray }) => inArray(reviews.orderId, orderIds),
        with: {
          order: {
            with: {
              client: {
                columns: {
                  id: true,
                  name: true,
                }
              },
              gig: {
                columns: {
                  id: true,
                  title: true,
                }
              }
            }
          }
        },
      });

      console.log(`Found ${reviewsData.length} reviews`);
      
      // Make sure all reviews have the required properties
      const safeReviews = reviewsData.map(review => {
        return {
          ...review,
          order: {
            ...review.order,
            client: review.order?.client || { id: 0, name: "Unknown Client" },
            gig: review.order?.gig || { id: 0, title: "Unknown Gig" }
          }
        };
      });
      
      res.json(safeReviews);
    } catch (reviewError) {
      console.error("Error in reviews query:", reviewError);
      // Return empty array instead of error to avoid breaking the UI
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching freelancer reviews:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.stack);
    }
    // Return empty array instead of error to avoid breaking the UI
    res.json([]);
  }
});

export const ordersRouter = router; 