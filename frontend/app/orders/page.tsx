"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/auth-context";
import * as orderService from "../../services/orders";
import { ApiError } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Navbar } from "@/components/common/Navbar";
import { FadeIn, SlideIn, PageTransition } from "../../components/animations";
import { Package, Calendar, DollarSign, Clock, ArrowRight } from "lucide-react";
import Footer from "@/components/common/Footer";

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<orderService.Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return; // Will be handled in the rendering logic
    }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      console.log("Fetching orders for user:", user?.id);
      const ordersData = await orderService.orderService.fetchOrders();
      console.log("Received orders:", ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      
      // If unauthorized, redirect to login
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login");
        return;
      }
      
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack
        });
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancellation_requested':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
    // If user is not authenticated, show a message and a login button
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-xl font-semibold mb-2">Please login to view your orders</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to see your orders.</p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <Navbar/>
      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="mb-8 flex items-center">
            <Package className="mr-3 h-7 w-7" />
            <h1 className="text-3xl font-bold">My Orders</h1>
          </div>
        </FadeIn>

        {orders.length === 0 ? (
          <FadeIn delay={0.2}>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No orders found</h2>
              <p className="text-muted-foreground mb-6">You haven't placed or received any orders yet.</p>
              <Button onClick={() => router.push('/search/gigs')}>
                Browse Gigs
              </Button>
            </div>
          </FadeIn>
        ) : (
          <div className="grid gap-6">
            {orders.map((order, index) => (
              <SlideIn key={order.id} direction="up" delay={0.1 * (index % 10)}>
                <div
                  className="rounded-lg border overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`px-4 py-2 ${getStatusColor(order.status)}`}>
                    <span className="font-medium">{formatStatus(order.status)}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold flex items-center">
                          Order #{order.id}
                        </h2>
                        <div className="flex items-center text-gray-500 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          <p className="text-sm">
                            Created {formatDistanceToNow(new Date(order.createdAt))} ago
                          </p>
                        </div>
                        <p className="mt-2 text-gray-600">{order.gig.title}</p>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <div className="flex items-center justify-end">
                          <DollarSign className="h-5 w-5 text-gray-700" />
                          <p className="text-xl font-bold">${order.price}</p>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="flex items-center"
                          >
                            View Details
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SlideIn>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </PageTransition>
  );
} 