import { api } from "../lib/api";

export interface Freelancer {
  id: number;
  name: string;
  email: string;
}

export interface Gig {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating?: number;
  totalReviews?: number;
  durationDays: number;
  freelancerId: number;
  createdAt: string;
  updatedAt: string;
  freelancer: Freelancer;
}

export async function getGigs(): Promise<Gig[]> {
  const response = await api.get<Gig[]>("/gigs");
  return response;
}

export async function getGig(id: string): Promise<Gig> {
  const response = await api.get<Gig>(`/gigs/${id}`);
  return response;
}

export async function createGig(data: Omit<Gig, "id" | "createdAt" | "updatedAt" | "freelancer">): Promise<Gig> {
  const response = await api.post<Gig, typeof data>("/gigs", data);
  return response;
}

export async function updateGig(id: string, data: Partial<Gig>): Promise<Gig> {
  const response = await api.put<Gig, typeof data>(`/gigs/${id}`, data);
  return response;
}

export async function deleteGig(id: string): Promise<void> {
  await api.delete(`/gigs/${id}`);
} 