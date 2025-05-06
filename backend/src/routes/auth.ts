import express from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth";

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["client", "freelancer"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const balanceSchema = z.object({
  amount: z.number().positive(),
});

// Register
router.post("/register", async (req, res) => {
  try {
    console.log("Register request received:", req.body);
    const { name, email, password, role } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      console.log("Email already in use:", email);
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning();

    if (!user) {
      console.error("Failed to create user");
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      }, 
      process.env.JWT_SECRET || "secret", 
      {
        expiresIn: "7d",
      }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log("User registered successfully:", userWithoutPassword);
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      }, 
      process.env.JWT_SECRET || "secret", 
      {
        expiresIn: "7d",
      }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log("User logged in successfully:", userWithoutPassword);
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    console.log("Get current user request received");
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      id: number;
      email: string;
      role: string;
    };

    console.log("Token decoded:", decoded);

    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.id),
    });

    if (!user) {
      console.log("User not found for token");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log("Current user retrieved:", userWithoutPassword);
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Add balance to user account
router.post("/add-balance", auth, async (req, res) => {
  try {
    const { amount } = balanceSchema.parse(req.body);
    
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.id),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate new balance
    const currentBalance = user.balance || 0;
    const newBalance = currentBalance + amount;

    // Update user balance
    const [updatedUser] = await db
      .update(users)
      .set({
        balance: newBalance,
      })
      .where(eq(users.id, req.user!.id))
      .returning();

    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update balance" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Add balance error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
});

export const authRouter = router; 