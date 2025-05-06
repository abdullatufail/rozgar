"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../contexts/auth-context";
import { orderService } from "../../../services/orders";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useToast } from "../../../components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { api, ApiError } from "../../../lib/api";
import { Star } from "../../../components/ui/star";
import { Navbar } from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

interface Gig {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  freelancerId: number;
  freelancer: {
    name: string;
  };
  createdAt: string;
  rating?: number;
  totalReviews?: number;
  durationDays?: number;
}

interface Review {
  id: number;
  orderId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  client: {
    name: string;
  };
}

export default function GigPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [gig, setGig] = useState<Gig | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [requirements, setRequirements] = useState("");

  useEffect(() => {
    const loadData = async () => {
      await fetchGig();
      await fetchReviews();
    };
    
    loadData();
  }, [params.id]);

  useEffect(() => {
    if (reviews.length > 0) {
      fetchGig();
    }
  }, [reviews]);

  const fetchGig = async () => {
    try {
      setLoading(true);
      const response = await api.get<Gig>(`/gigs/${params.id}`);
      setGig(response);
    } catch (error) {
      console.error("Error fetching gig:", error);
      toast({
        title: "Error",
        description: "Failed to fetch gig details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get<Review[]>(`/reviews/gig/${params.id}`);
      console.log("Fetched reviews:", response);
      setReviews(response);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "client") {
      toast({
        title: "Error",
        description: "Only clients can place orders",
        variant: "destructive",
      });
      return;
    }

    if (!requirements.trim()) {
      toast({
        title: "Error",
        description: "Please provide your requirements",
        variant: "destructive",
      });
      return;
    }

    setOrderLoading(true);
    try {
      const order = await orderService.createOrder(parseInt(params.id), requirements);
      toast({
        title: "Success",
        description: "Order placed successfully",
      });
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      
      // Check if it's an insufficient balance error
      let errorMessage = "Failed to place order";
      
      if (error instanceof ApiError && error.responseData) {
        if (error.responseData.message === 'Insufficient balance') {
          errorMessage = `Insufficient balance. Required: $${error.responseData.required}, Available: $${error.responseData.current.toFixed(2)}`;
        } else {
          errorMessage = error.responseData.message || errorMessage;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          Gig not found
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={gig.image || "https://via.placeholder.com/800x450"}
              alt={gig.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{gig.title}</h1>
            <p className="mt-2 text-muted-foreground">
              Posted {formatDistanceToNow(new Date(gig.createdAt))} ago
            </p>
          </div>
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold">Description</h2>
            <p>{gig.description}</p>
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review) => {
                  console.log("Rendering review:", review);
                  return (
                    <div key={review.id} className="rounded-2xl border p-6 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-700">
                          {review.client?.name?.[0] || "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{review.client?.name || "Unknown User"}</span>
                          </div>
                        </div>
                      </div>
                      <hr className="my-2" />
                      <div className="flex items-center gap-2 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} filled={i < review.rating} />
                        ))}
                        <span className="font-medium ml-2">{review.rating}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-muted-foreground text-sm">{formatDistanceToNow(new Date(review.createdAt))} ago</span>
                      </div>
                      <div className="text-lg mb-4">
                        {review.comment || "No comment provided"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">No reviews yet</div>
          )}
        </div>

        <div className="sticky top-8 rounded-lg border bg-card p-6 transition-all hover:border-2 hover:border-black">
          <div className="mb-6">
            <p className="text-3xl font-bold">${gig.price}</p>
            <p className="mt-1 text-muted-foreground">
              by {gig.freelancer.name}
            </p>
            {gig.rating !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                <Star filled />
                <span className="font-medium">{typeof gig.rating === 'number' ? gig.rating.toFixed(1) : '0'}</span>
                <span className="text-muted-foreground">
                  ({gig.totalReviews || 0} {gig.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Category</h3>
              <p className="text-muted-foreground">{gig.category}</p>
            </div>
            <div>
              <h3 className="font-medium">Delivery Time</h3>
              <p className="text-muted-foreground">{gig.durationDays || 7} days</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="requirements" className="text-sm font-medium">
                Your Requirements
              </label>
              <Input
                id="requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe what you need..."
                className="h-24"
              />
            </div>
            <Button
              onClick={handleOrder}
              disabled={orderLoading || !requirements.trim()}
              className="w-full"
            >
              {orderLoading ? "Processing..." : "Order Now"}
            </Button>
            {!user && (
              <p className="text-sm text-muted-foreground text-center">
                Please login to place an order
              </p>
            )}
            {user?.role !== "client" && (
              <p className="text-sm text-muted-foreground text-center">
                Only clients can place orders
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
} 