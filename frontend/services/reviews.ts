import { api } from "../lib/api";

export interface Review {
  id: string;
  orderId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// Define interfaces for the request data types
interface CreateReviewData {
  orderId: string;
  rating: number;
  comment?: string;
}

// Empty object type for requests with no body
type EmptyObject = Record<string, never>;

export const reviewService = {
  async createReview(
    orderId: string,
    rating: number,
    comment?: string
  ): Promise<Review> {
    try {
      return await api.post<Review, Record<string, unknown>>("/reviews", {
        orderId,
        rating,
        comment,
      });
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },
  
  async getGigReviews(gigId: string): Promise<Review[]> {
    try {
      return await api.get<Review[]>(`/reviews/gig/${gigId}`);
    } catch (error) {
      console.error("Error fetching gig reviews:", error);
      throw error;
    }
  },
  
  async getFreelancerReviews(freelancerId: string | number): Promise<Review[]> {
    try {
      return await api.get<Review[]>(`/reviews/freelancer/${freelancerId}`);
    } catch (error) {
      console.error("Error fetching freelancer reviews:", error);
      throw error;
    }
  },
  
  async updateAllGigRatings(): Promise<any> {
    try {
      return await api.post<any, EmptyObject>(`/reviews/update-gig-ratings`, {});
    } catch (error) {
      console.error("Error updating gig ratings:", error);
      throw error;
    }
  }
}; 