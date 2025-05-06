import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = authSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["freelancer", "client"]),
});

export const gigSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  rating: z.number().min(0).max(5),
  reviews: z.number().min(0),
  deliveryTime: z.number().min(1),
  category: z.string().min(1, "Category is required"),
  image: z.string().min(1, "Image is required"),
  freelancer: z.object({
    name: z.string().min(1, "Freelancer name is required"),
    avatar: z.string().min(1, "Avatar is required"),
    rating: z.number().min(0).max(5),
  }),
});

export type Gig = z.infer<typeof gigSchema>;

export const orderSchema = z.object({
  gigId: z.string(),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  price: z.number(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
  orderId: z.string(),
});

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateName(name: string): boolean {
  return name.length >= 2;
} 