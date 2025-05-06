"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/auth-context";
import { redirect } from "next/navigation";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { Plus, DollarSign, Star, Package, RefreshCw } from "lucide-react";
import { orderService } from "../../../services/orders";
import { useToast } from "../../../components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { FadeIn, SlideIn } from "../../../components/animations";
import { AddBalanceModal } from "../../../components/dashboard/AddBalanceModal";
import { reviewService } from "../../../services/reviews";

interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  order?: {
    client: {
      name: string;
      id?: number;
    };
    gig: {
      title: string;
      id?: number;
    };
  };
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [isUpdatingRatings, setIsUpdatingRatings] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
      if (user.role === "freelancer") {
        fetchReviews();
      }
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const fetchedOrders = await orderService.fetchOrders();
      console.log("Fetched orders:", fetchedOrders);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!user) return;
    
    try {
      setReviewsLoading(true);
      const fetchedReviews = await orderService.getFreelancerReviews(user.id);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews",
        variant: "destructive",
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddBalanceSuccess = () => {
    // Reload the page to display the updated balance
    window.location.reload();
  };

  const handleUpdateRatings = async () => {
    if (!user) return;
    
    try {
      setIsUpdatingRatings(true);
      await reviewService.updateAllGigRatings();
      toast({
        title: "Success",
        description: "Gig ratings have been updated successfully",
      });
      // Refresh the reviews data
      if (user.role === "freelancer") {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error updating ratings:", error);
      toast({
        title: "Error",
        description: "Failed to update gig ratings",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRatings(false);
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

  if (!user) {
    redirect("/login");
  }

  const completedOrders = orders.filter(order => order.status === "completed");
  const pendingOrders = orders.filter(order => ["pending", "in_progress", "delivered"].includes(order.status));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <SlideIn direction="left">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </SlideIn>
        <div className="flex space-x-4">
          {user.role === "admin" && (
            <SlideIn direction="right">
              <Link href="/admin">
                <Button variant="outline">
                  Admin Dashboard
                </Button>
              </Link>
            </SlideIn>
          )}
          {user.role === "freelancer" && (
            <>
              <SlideIn direction="right">
                <Link href="/freelancerGigs/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Gig
                  </Button>
                </Link>
              </SlideIn>
              <SlideIn direction="right" delay={0.05}>
                <Link href="/freelancerGigs">
                  <Button variant="secondary">
                    <Package className="mr-2 h-4 w-4" />
                    My Gigs
                  </Button>
                </Link>
              </SlideIn>
              <SlideIn direction="right" delay={0.1}>
                <Button 
                  variant="outline" 
                  onClick={handleUpdateRatings}
                  disabled={isUpdatingRatings}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isUpdatingRatings ? 'animate-spin' : ''}`} />
                  Update Ratings
                </Button>
              </SlideIn>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <SlideIn direction="up" delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Balance
              </CardTitle>
              <CardDescription>Your current balance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${user.balance.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => setIsAddBalanceModalOpen(true)}
              >
                Add Funds
              </Button>
            </CardFooter>
          </Card>
        </SlideIn>
        
        {/* Orders Card */}
        <SlideIn direction="up" delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Orders
              </CardTitle>
              <CardDescription>Your orders overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span>{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span>{completedOrders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span>{pendingOrders.length}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/orders" className="w-full">
                <Button className="w-full">View All Orders</Button>
              </Link>
            </CardFooter>
          </Card>
        </SlideIn>
        
        {/* Reviews Card (Freelancers only) */}
        {user.role === "freelancer" && (
          <SlideIn direction="up" delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Reviews
                </CardTitle>
                <CardDescription>Your client reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Reviews:</span>
                    <span>{reviews.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Rating:</span>
                    <span>
                      {reviews.length > 0 
                        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
                        : "No reviews yet"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  View All Reviews
                </Button>
              </CardFooter>
            </Card>
          </SlideIn>
        )}
      </div>

      <FadeIn delay={0.4}>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">
            {user.role === "freelancer" 
              ? "Manage your gigs, track your orders, and see what clients are saying about your work."
              : "Browse gigs, place orders, and track your projects all in one place."}
          </p>
        </div>
      </FadeIn>

      {/* Recent Orders Section */}
      <FadeIn delay={0.5}>
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.slice(0, 3).map((order, index) => (
                <SlideIn key={order.id} direction="up" delay={0.6 + index * 0.1}>
                  <Link href={`/orders/${order.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{order.gig.title}</CardTitle>
                        <CardDescription>
                          {user.role === "freelancer" ? `Client: ${order.client.name}` : `Freelancer: ${order.freelancer.name}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <span className={`font-medium ${order.status === "completed" ? "text-green-600" : order.status === "cancelled" ? "text-red-600" : "text-orange-600"}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Price:</span>
                            <span>${order.price}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Date:</span>
                            <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </SlideIn>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          )}
          
          {orders.length > 3 && (
            <div className="mt-4 text-center">
              <Link href="/orders">
                <Button variant="outline">View All Orders</Button>
              </Link>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Reviews Section (Freelancers only) */}
      {user.role === "freelancer" && (
        <FadeIn delay={0.7}>
          <div id="reviews-section" className="mt-12">
            <h3 className="text-xl font-bold mb-4">Client Reviews</h3>
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review, index) => (
                  <SlideIn key={review.id} direction="up" delay={0.8 + index * 0.1}>
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{review.order?.gig.title}</CardTitle>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <CardDescription>From: {review.order?.client.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {review.comment ? (
                          <p className="text-gray-600">{review.comment}</p>
                        ) : (
                          <p className="text-gray-500 italic">No comment provided</p>
                        )}
                      </CardContent>
                      <CardFooter className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </CardFooter>
                    </Card>
                  </SlideIn>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet</p>
            )}
          </div>
        </FadeIn>
      )}

      {/* Add Balance Modal */}
      <AddBalanceModal 
        isOpen={isAddBalanceModalOpen}
        onClose={() => setIsAddBalanceModalOpen(false)}
        onSuccess={handleAddBalanceSuccess}
      />
    </div>
  );
} 