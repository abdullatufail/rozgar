import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";
import { gigsRouter } from "./routes/gigs";
import { ordersRouter } from "./routes/orders";
import { reviewsRouter } from "./routes/reviews";
import { setupTriggers } from "./db/triggers";
import { startCronJobs } from "./cron";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/gigs", gigsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/reviews", reviewsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3001;

// Initialize database triggers
setupTriggers().catch(error => {
  console.error("Failed to setup database triggers:", error);
});

// Start cron jobs
startCronJobs();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 