import express from "express";
import { db } from "../db";
import { messages, orders } from "../db/schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const router = express.Router();

const messageSchema = z.object({
  orderId: z.number(),
  content: z.string().min(1),
  receiverId: z.number(),
});

// Get messages for an order
router.get("/order/:orderId", async (req, res) => {
  try {
    // Check if user has access to this order
    const order = await db.query.orders.findFirst({
      where: (orders, { and, eq, or }) =>
        and(
          eq(orders.id, parseInt(req.params.orderId)),
          or(
            eq(orders.clientId, req.user.id),
            eq(orders.freelancerId, req.user.id)
          )
        ),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderMessages = await db.query.messages.findMany({
      where: eq(messages.orderId, parseInt(req.params.orderId)),
      with: {
        sender: true,
        receiver: true,
      },
      orderBy: (messages, { asc }) => asc(messages.createdAt),
    });

    res.json(orderMessages);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Send message
router.post("/", async (req, res) => {
  try {
    const { orderId, content, receiverId } = messageSchema.parse(req.body);

    // Check if user has access to this order
    const order = await db.query.orders.findFirst({
      where: (orders, { and, eq, or }) =>
        and(
          eq(orders.id, orderId),
          or(
            eq(orders.clientId, req.user.id),
            eq(orders.freelancerId, req.user.id)
          )
        ),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create message
    const [message] = await db
      .insert(messages)
      .values({
        orderId,
        content,
        senderId: req.user.id,
        receiverId,
      })
      .returning();

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Mark messages as read
router.patch("/read", async (req, res) => {
  try {
    const { orderId } = z
      .object({
        orderId: z.number(),
      })
      .parse(req.body);

    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.orderId, orderId),
          eq(messages.receiverId, req.user.id)
        )
      );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
});

export const messagesRouter = router; 