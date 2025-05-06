import express from "express";
import { db } from "../db";
import { gigs } from "../db/schema";
import { z } from "zod";
import { and, eq, inArray, like, between, or } from "drizzle-orm";
import jwt from "jsonwebtoken";

const router = express.Router();

const gigSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(1),
  category: z.enum(["Web Development", "Mobile Development", "Graphic Design", "Content Writing", "Digital Marketing"]),
  image: z.string().url(),
  durationDays: z.number().min(1).default(7),
});

// Helper function to verify token and get user
const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      id: number;
      email: string;
      role: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
};

// Create gig
router.post("/", async (req, res) => {
  try {
    // Check for token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Check if user is a freelancer
    if (decoded.role !== "freelancer") {
      return res.status(403).json({ message: "Only freelancers can create gigs" });
    }

    // Validate request body
    const { title, description, price, category, image, durationDays } = gigSchema.parse(req.body);

    // Create gig
    const [gig] = await db
      .insert(gigs)
      .values({
        title,
        description,
        price,
        category,
        image,
        durationDays: durationDays || 7,
        freelancerId: decoded.id,
      })
      .returning();

    res.status(201).json(gig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Error creating gig:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get all gigs
router.get("/", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    
    // Build where conditions
    const whereConditions = [];
    
    // Search in title and description
    if (search) {
      whereConditions.push(
        or(
          like(gigs.title, `%${search}%`),
          like(gigs.description, `%${search}%`)
        )
      );
    }
    
    // Filter by category
    if (category) {
      // Handle multiple categories
      const categories = Array.isArray(category) ? category : [category];
      whereConditions.push(inArray(gigs.category, categories as string[]));
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;
      whereConditions.push(between(gigs.price, min, max));
    }
    
    // Apply all filters
    const allGigs = await db.query.gigs.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        freelancer: true,
      },
    });
    
    res.json(allGigs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get single gig
router.get("/:id", async (req, res) => {
  try {
    const gig = await db.query.gigs.findFirst({
      where: (gigs, { eq }) => eq(gigs.id, parseInt(req.params.id)),
      with: {
        freelancer: true,
      },
    });

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    res.json(gig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Update gig
router.put("/:id", async (req, res) => {
  try {
    // Check for token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get the gig
    const gig = await db.query.gigs.findFirst({
      where: eq(gigs.id, parseInt(req.params.id)),
    });

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Check if the user owns the gig
    if (gig.freelancerId !== decoded.id) {
      return res.status(403).json({ message: "You can only update your own gigs" });
    }

    // Validate request body
    const { title, description, price, category, image, durationDays } = gigSchema.parse(req.body);

    // Update gig
    const [updatedGig] = await db
      .update(gigs)
      .set({
        title,
        description,
        price,
        category,
        image,
        durationDays: durationDays || 7,
        updatedAt: new Date(),
      })
      .where(eq(gigs.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedGig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Error updating gig:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Delete gig
router.delete("/:id", async (req, res) => {
  try {
    // Check for token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get the gig
    const gig = await db.query.gigs.findFirst({
      where: eq(gigs.id, parseInt(req.params.id)),
    });

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Check if the user owns the gig
    if (gig.freelancerId !== decoded.id) {
      return res.status(403).json({ message: "You can only delete your own gigs" });
    }

    // Delete gig
    await db
      .delete(gigs)
      .where(eq(gigs.id, parseInt(req.params.id)));

    res.json({ message: "Gig deleted successfully" });
  } catch (error) {
    console.error("Error deleting gig:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export const gigsRouter = router; 