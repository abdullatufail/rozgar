import express from "express";
import { db } from "../db";
import { reviews, orders, users, gigs } from "../db/schema";
import { z } from "zod";
import { eq, and, inArray, sql } from "drizzle-orm";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

const router = express.Router();

const reviewSchema = z.object({
  orderId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

// Create review
router.post("/", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { orderId, rating, comment } = reviewSchema.parse(req.body);

    // Check if order exists and is completed
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.clientId, req.user.id),
        eq(orders.status, "completed")
      ),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found or not completed" });
    }

    // Check if review already exists
    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.orderId, orderId),
    });

    if (existingReview) {
      return res.status(400).json({ message: "Review already exists" });
    }

    // Create review
    const [review] = await db
      .insert(reviews)
      .values({
        orderId,
        rating,
        comment,
      })
      .returning();

    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get reviews for a gig
router.get("/gig/:gigId", async (req, res) => {
  try {
    const gigId = parseInt(req.params.gigId);
    
    // Use SQL to get reviews with client info
    const reviewsResult = await db.execute(sql`
      SELECT r.id, r.order_id, r.rating, r.comment, r.created_at, u.id as client_id, u.name as client_name 
      FROM reviews r 
      JOIN orders o ON r.order_id = o.id 
      JOIN users u ON o.client_id = u.id 
      WHERE o.gig_id = ${gigId}
    `);
    
    // Transform the response to match the frontend interface
    const transformedReviews = reviewsResult.map((review: any) => ({
      id: review.id,
      orderId: review.order_id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      client: {
        id: review.client_id,
        name: review.client_name
      }
    }));

    res.json(transformedReviews);
  } catch (error) {
    console.error("Error in /reviews/gig/:gigId:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get reviews for a freelancer
router.get("/freelancer/:freelancerId", async (req, res) => {
  try {
    // Get all orders for this freelancer
    const freelancerOrders = await db.query.orders.findMany({
      where: (orders, { eq }) => eq(orders.freelancerId, parseInt(req.params.freelancerId)),
    });

    const orderIds = freelancerOrders.map(order => order.id);
    if (orderIds.length === 0) {
      return res.json([]);
    }

    // Get all reviews for those orders
    const freelancerReviews = await db.query.reviews.findMany({
      where: (reviews, { inArray }) => inArray(reviews.orderId, orderIds),
      with: {
        order: {
          with: {
            client: true,
          },
        },
      },
    });

    res.json(freelancerReviews);
  } catch (error) {
    console.error("Error in /reviews/freelancer/:freelancerId:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Update gig ratings
router.post("/update-gig-ratings", async (req, res) => {
  try {
    console.log("Updating all gig ratings");
    
    // Get all gigs
    const allGigs = await db.query.gigs.findMany();
    console.log(`Found ${allGigs.length} gigs to update`);
    
    const updatedGigs = [];
    
    // For each gig, recalculate rating based on actual reviews
    for (const gig of allGigs) {
      // Find all reviews for orders of this gig
      const gigOrders = await db.query.orders.findMany({
        where: eq(orders.gigId, gig.id),
      });
      
      const orderIds = gigOrders.map(order => order.id);
      
      if (orderIds.length === 0) {
        // No orders for this gig, set default values
        const [updatedGig] = await db
          .update(gigs)
          .set({
            rating: 0,
            totalReviews: 0,
          })
          .where(eq(gigs.id, gig.id))
          .returning();
          
        updatedGigs.push(updatedGig);
        continue;
      }
      
      // Get all reviews for the gig's orders
      const gigReviews = await db.query.reviews.findMany({
        where: (reviews, { inArray }) => inArray(reviews.orderId, orderIds),
      });
      
      console.log(`Gig ${gig.id} has ${gigReviews.length} reviews`);
      
      if (gigReviews.length === 0) {
        // No reviews for this gig, set default values
        const [updatedGig] = await db
          .update(gigs)
          .set({
            rating: 0,
            totalReviews: 0,
          })
          .where(eq(gigs.id, gig.id))
          .returning();
          
        updatedGigs.push(updatedGig);
      } else {
        // Calculate average rating
        const totalRating = gigReviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = Math.round(totalRating / gigReviews.length);
        
        // Update gig with new rating and total reviews
        const [updatedGig] = await db
          .update(gigs)
          .set({
            rating: avgRating,
            totalReviews: gigReviews.length,
          })
          .where(eq(gigs.id, gig.id))
          .returning();
          
        updatedGigs.push(updatedGig);
      }
    }
    
    res.json({ 
      message: "Gig ratings updated successfully", 
      updatedCount: updatedGigs.length,
      gigs: updatedGigs 
    });
  } catch (error) {
    console.error("Error updating gig ratings:", error);
    res.status(500).json({ message: "Failed to update gig ratings" });
  }
});

export const reviewsRouter = router; 