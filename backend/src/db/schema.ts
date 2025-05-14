import { pgTable, serial, text, timestamp, integer, boolean, varchar, numeric, customType } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
const numericAsNumber = customType({
  dataType() {
    return "numeric";
  },
  fromDriver(value: unknown): number | null {
    if (value === null) return null;
    return typeof value === 'string' ? parseFloat(value) : null;
  },
});
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["client", "freelancer", "admin"] }).notNull(),
  balance: numericAsNumber("balance", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gigs = pgTable("gigs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  image: text("image").notNull(),
  rating: integer("rating").default(0).notNull(),
  totalReviews: integer("total_reviews").default(0).notNull(),
  durationDays: integer("duration_days").default(7).notNull(),
  freelancerId: integer("freelancer_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id").references(() => gigs.id).notNull(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  freelancerId: integer("freelancer_id").references(() => users.id).notNull(),
  price: integer("price").notNull(),
  requirements: text("requirements").notNull(),
  status: text("status", { 
    enum: ["pending", "in_progress", "delivered", "completed", "cancelled", "cancellation_requested", "late"] 
  }).notNull(),
  dueDate: timestamp("due_date"),
  isLate: boolean("is_late").default(false),
  deliveryFile: text("delivery_file"),
  deliveryNotes: text("delivery_notes"),
  cancellationReason: text("cancellation_reason"),
  cancellationApproved: boolean("cancellation_approved"),
  cancellationRequestedBy: integer("cancellation_requested_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  gigs: many(gigs),
  clientOrders: many(orders, { relationName: "client" }),
  freelancerOrders: many(orders, { relationName: "freelancer" }),
}));

export const gigsRelations = relations(gigs, ({ one, many }) => ({
  freelancer: one(users, {
    fields: [gigs.freelancerId],
    references: [users.id],
  }),
  orders: many(orders),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  gig: one(gigs, {
    fields: [orders.gigId],
    references: [gigs.id],
  }),
  client: one(users, {
    fields: [orders.clientId],
    references: [users.id],
  }),
  freelancer: one(users, {
    fields: [orders.freelancerId],
    references: [users.id],
  }),
  review: one(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
})); 