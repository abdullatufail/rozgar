import { api } from "../lib/api";

const getToken = () => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') return value;
  }
  return null;
};

export interface Order {
  id: number;
  gigId: number;
  clientId: number;
  freelancerId: number;
  status: "pending" | "in_progress" | "delivered" | "completed" | "cancelled" | "cancellation_requested" | "late";
  price: number;
  requirements: string;
  dueDate?: string;
  isLate?: boolean;
  deliveryFile?: string;
  deliveryNotes?: string;
  cancellationReason?: string;
  cancellationApproved?: boolean;
  createdAt: string;
  updatedAt: string;
  review?: Review;
  gig: {
    title: string;
    id: number;
  };
  client: {
    name: string;
    id: number;
  };
  freelancer: {
    name: string;
    id: number;
  };
}

export interface Message {
  id: number;
  orderId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Balance {
  amount: number;
}

export interface Review {
  id: number;
  orderId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  order?: {
    client: {
      name: string;
      id: number;
    };
    gig: {
      title: string;
      id: number;
    };
  };
}

type EmptyObject = Record<string, never>;

export const orderService = {
  createOrder: async (gigId: number, requirements: string) => {
    return api.post<Order, { gigId: number; requirements: string }>("/orders", { gigId, requirements });
  },

  fetchOrders: async () => {
    try {
      return await api.get<Order[]>("/orders");
    } catch (error) {
      console.error("Error in fetchOrders:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      throw error;
    }
  },

  fetchOrder: async (id: number) => {
    return api.get<Order>(`/orders/${id}`);
  },

  deliverOrder: async (orderId: number, file: File | null, notes: string) => {
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("notes", notes);

    const token = getToken();
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/deliver`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  approveDelivery: async (orderId: number) => {
    return api.post<Order, EmptyObject>(`/orders/${orderId}/approve`, {});
  },

  rejectDelivery: async (orderId: number) => {
    return api.post<Order, EmptyObject>(`/orders/${orderId}/reject`, {});
  },

  requestCancellation: async (orderId: number, reason: string) => {
    return api.post<Order, { reason: string }>(`/orders/${orderId}/cancel`, { reason });
  },

  approveCancellation: async (orderId: number) => {
    return api.post<Order, EmptyObject>(`/orders/${orderId}/approve-cancellation`, {});
  },

  rejectCancellation: async (orderId: number) => {
    return api.post<Order, EmptyObject>(`/orders/${orderId}/reject-cancellation`, {});
  },

  addReview: async (orderId: number, rating: number, comment?: string) => {
    return api.post<Review, { rating: number; comment?: string }>(`/orders/${orderId}/review`, { rating, comment });
  },

  addMessage: async (orderId: number, content: string): Promise<Message> => {
    return api.post<Message, { content: string }>(`/orders/${orderId}/messages`, {
      content,
    });
  },

  getBalance: async (): Promise<Balance> => {
    return api.get<Balance>("/balance");
  },

  addBalance: async (amount: number): Promise<any> => {
    return api.post<any, { amount: number }>("/auth/add-balance", { amount });
  },
  
  getFreelancerReviews: async (freelancerId: number): Promise<Review[]> => {
    return api.get<Review[]>(`/orders/freelancer/${freelancerId}/reviews`);
  },

  updateOrderStatus: async (orderId: number, status: "pending" | "in_progress" | "completed" | "cancelled") => {
    const token = getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update order status");
    }

    return response.json();
  },
}; 