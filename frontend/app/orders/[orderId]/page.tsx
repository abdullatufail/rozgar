"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/auth-context";
import { useToast } from "../../../components/ui/use-toast";
import { Button } from "../../../components/ui/button";
import { Spinner } from "../../../components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { Order } from "../../../services/orders";
import * as orderService from "../../../services/orders";
import { api, ApiError } from "../../../lib/api";
import { Star } from "../../../components/ui/star";
import { 
  FadeIn,
  SlideIn, 
  PageTransition 
} from "../../../components/animations";
import { 
  Calculator, 
  ClipboardList, 
  Clock, 
  Package, 
  Bookmark,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  AlertTriangle,
  Timer
} from "lucide-react";
import Footer from "@/components/common/Footer";
import CancellationRequest from "./components/CancellationRequest";
import ActionButtons from "./components/ActionButtons";

const CountdownTimer = ({ dueDate }: { dueDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(dueDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsPast(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      setIsPast(false);
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  if (isPast) {
    return (
      <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-800">
        <div className="font-medium">Delivery Overdue</div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
      <div className="font-medium text-blue-800 mb-2">Time Remaining</div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white p-2 rounded shadow-sm">
          <div className="text-xl font-bold">{timeLeft.days}</div>
          <div className="text-xs text-gray-500">Days</div>
        </div>
        <div className="bg-white p-2 rounded shadow-sm">
          <div className="text-xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs text-gray-500">Hours</div>
        </div>
        <div className="bg-white p-2 rounded shadow-sm">
          <div className="text-xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs text-gray-500">Mins</div>
        </div>
        <div className="bg-white p-2 rounded shadow-sm">
          <div className="text-xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs text-gray-500">Secs</div>
        </div>
      </div>
    </div>
  );
};

export default function OrderPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isDelivering, setIsDelivering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    if (!user) {
      return; // Will be handled in the rendering logic
    }
    fetchOrder();
  }, [user, orderId, router]);
  
  const fetchOrder = async () => {
    try {
      const data = await orderService.orderService.fetchOrder(parseInt(orderId as string));
      setOrder(data);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Error fetching order:", apiError);
      
      // If unauthorized, redirect to login
      if (apiError.status === 401) {
        router.push("/login");
        return;
      }
      
      toast({
        title: "Error",
        description: apiError.message || "Failed to fetch order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverOrder = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please provide a file",
        variant: "destructive",
      });
      return;
    }
    if (!notes) {
      toast({
        title: "Error",
        description: "Please provide delivery notes",
        variant: "destructive",
      });
      return;
    }
    setIsDelivering(true);
    try {
      await orderService.orderService.deliverOrder(parseInt(orderId as string), file, notes);
      toast({
        title: "Success",
        description: "Order delivered successfully",
      });
      fetchOrder();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Error delivering order:", apiError);
      toast({
        title: "Error",
        description: apiError.message || "Failed to deliver order",
        variant: "destructive",
      });
    } finally {
      setIsDelivering(false);
    }
  };

  const handleApproveDelivery = async () => {
    try {
      await orderService.orderService.approveDelivery(parseInt(orderId as string));
      toast({
        title: "Success",
        description: "Delivery approved",
      });
      fetchOrder();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Error approving delivery:", apiError);
      toast({
        title: "Error",
        description: apiError.message || "Failed to approve delivery",
        variant: "destructive",
      });
    }
  };

  const handleRejectDelivery = async () => {
    try {
      await orderService.orderService.rejectDelivery(parseInt(orderId as string));
      toast({
        title: "Success",
        description: "Delivery rejected",
      });
      fetchOrder();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Error rejecting delivery:", apiError);
      toast({
        title: "Error",
        description: apiError.message || "Failed to reject delivery",
        variant: "destructive",
      });
    }
  };

  const handleRequestCancellation = async () => {
    if (!reason) {
      toast({
        title: "Error",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      });
      return;
    }
    setIsCancelling(true);
    try {
      await orderService.orderService.requestCancellation(parseInt(orderId as string), reason);
      toast({
        title: "Success",
        description: "Cancellation requested",
      });
      fetchOrder();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Error requesting cancellation:", apiError);
      toast({
        title: "Error",
        description: apiError.message || "Failed to request cancellation",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleApproveCancellation = async () => {
    try {
      await orderService.orderService.approveCancellation(parseInt(orderId as string));
      toast({
        title: "Success",
        description: "Cancellation approved",
      });
      fetchOrder();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Error approving cancellation:", apiError);
      toast({
        title: "Error",
        description: apiError.message || "Failed to approve cancellation",
        variant: "destructive",
      });
    }
  };

  const handleRejectCancellation = async () => {
    try {
      await orderService.orderService.rejectCancellation(parseInt(orderId as string));
      toast({
        title: "Success",
        description: "Cancellation rejected",
      });
      fetchOrder();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Error rejecting cancellation:", apiError);
      toast({
        title: "Error",
        description: apiError.message || "Failed to reject cancellation",
        variant: "destructive",
      });
    }
  };

  const handleAddReview = async () => {
    if (rating < 1 || rating > 5) {
      toast({
        title: "Error",
        description: "Rating must be between 1 and 5",
        variant: "destructive",
      });
      return;
    }
    setIsReviewing(true);
    try {
      await orderService.orderService.addReview(parseInt(orderId as string), rating, comment);
      toast({
        title: "Success",
        description: "Review added successfully",
      });
      
      // Fetch the updated order with the review
      fetchOrder();
      
      // Refresh the gig data to update the rating and totalReviews count
      if (order?.gigId) {
        try {
          await api.get(`/gigs/${order.gigId}`);
          console.log("Successfully refreshed gig data");
        } catch (error) {
          console.error("Failed to refresh gig data:", error);
        }
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Error adding review:", apiError);
      
      // Check if error message indicates a duplicate review
      let errorMessage = "Failed to add review";
      
      if (apiError.message) {
        if (apiError.message.includes("Review already exists")) {
          errorMessage = "You have already submitted a review for this order";
        } else if (apiError.responseData?.message) {
          errorMessage = apiError.responseData.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleStartOrder = async () => {
    try {
      await orderService.orderService.updateOrderStatus(parseInt(orderId as string), "in_progress");
      toast({
        title: "Success",
        description: "Order started successfully",
      });
      fetchOrder();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Error starting order:", apiError);
      toast({
        title: "Error",
        description: apiError.message || "Failed to start order",
        variant: "destructive",
      });
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
      case 'late':
        return 'bg-red-100 text-red-800';
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
  
  // Create cancellation request if exists
  const createCancellationRequestData = (order: Order) => {
    if (order.status !== "cancellation_requested") return null;
    
    return {
      id: String(order.id),
      reason: order.cancellationReason || "No reason provided",
      status: "pending",
      createdAt: order.updatedAt || order.createdAt,
      requestedBy: {
        id: String(order.cancellationRequestedBy === order.freelancerId ? order.freelancerId : order.clientId),
        name: order.cancellationRequestedBy === order.freelancerId ? "Seller" : "Client"
      }
    };
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    // If user is not authenticated, show a message and a login button
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Please login to view your orders</h1>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto py-8 px-4">
        <FadeIn>
          <div className="mb-6 flex items-center">
            <Button 
              variant="outline" 
              onClick={() => router.push("/orders")}
              className="mr-4"
            >
              &larr; Back to Orders
            </Button>
            <h1 className="text-3xl font-bold flex items-center">
              <Package className="mr-2 h-6 w-6" />
              Order #{order.id}
            </h1>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Order Details */}
          <SlideIn direction="left" className="lg:col-span-3">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* Status Banner */}
              <div className={`px-6 py-3 ${getStatusColor(order.status)}`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {formatStatus(order.status)}
                  </span>
                  <span className="text-sm">
                    <Clock className="inline mr-1 h-4 w-4" />
                    {formatDistanceToNow(new Date(order.createdAt))} ago
                  </span>
                </div>
              </div>

              {/* Order Info */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Gig Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Gig Title</p>
                        <p className="font-medium">{order.gig?order.gig.title:"Deleted Gig"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium">${order.price}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">People</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Client</p>
                        <p className="font-medium">{order.client.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Freelancer</p>
                        <p className="font-medium">{order.freelancer.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Requirements</h3>
                  <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
                    {order.requirements}
                  </div>
                </div>

                {/* Delivery timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
                    <Timer className="mr-2 h-5 w-5" />
                    Delivery Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Order Created:</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    {order.dueDate && (
                      <div className="flex justify-between">
                        <span>Due Date:</span>
                        <span className={order.isLate ? "text-red-600 font-medium" : ""}>
                          {new Date(order.dueDate).toLocaleDateString()}
                          {order.isLate && " (Late)"}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {order.isLate && order.status !== "cancelled" && order.status !== "completed" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-red-800 font-medium">This order is past its due date</p>
                          {order.status === "late" && (
                            <p className="text-sm text-red-700 mt-1">
                              {user?.role === "client" ? 
                                "You can cancel this order without waiting for approval since it's past the due date." : 
                                "The client can cancel this order without your approval since it's past the due date."}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Details */}
                {order.status === "delivered" && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
                      <Upload className="mr-2 h-5 w-5" />
                      Delivery Details
                    </h3>
                    <div className="space-y-4">
                      {order.deliveryFile && (
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500 mb-2">Delivery File</p>
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${order.deliveryFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Download File
                          </a>
                        </div>
                      )}
                      
                      {order.deliveryNotes && (
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500 mb-2">Delivery Notes</p>
                          <p className="whitespace-pre-line">{order.deliveryNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancellation Request */}
                {order.status === "cancellation_requested" && (
                  <CancellationRequest
                    cancellationRequest={createCancellationRequestData(order)!}
                    isClient={user!.id === order.clientId}
                    isFreelancer={user!.id === order.freelancerId}
                    onApproveCancellation={handleApproveCancellation}
                    onRejectCancellation={handleRejectCancellation}
                  />
                )}

                {/* Show approval buttons to client if freelancer requested cancellation */}
                {user?.id === order.clientId && 
                  order.status === "cancellation_requested" && 
                  order.cancellationRequestedBy === order.freelancerId && (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleApproveCancellation}
                      variant="destructive"
                      className="w-full"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Cancellation
                    </Button>
                    <Button 
                      onClick={handleRejectCancellation}
                      className="w-full"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Cancellation
                    </Button>
                  </div>
                )}
                
                {/* Show approval buttons to freelancer if client requested cancellation */}
                {user?.id === order.freelancerId && 
                  order.status === "cancellation_requested" && 
                  order.cancellationRequestedBy === order.clientId && (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleApproveCancellation}
                      variant="destructive"
                      className="w-full"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Cancellation
                    </Button>
                    <Button 
                      onClick={handleRejectCancellation}
                      className="w-full"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Cancellation
                    </Button>
                  </div>
                )}

                {/* Review */}
                {order.status === "completed" && order.review && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
                      <Star filled className="mr-2 h-5 w-5 text-yellow-400" />
                      Review
                    </h3>
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            filled={star <= order.review!.rating}
                            className={`h-5 w-5 ${star <= order.review!.rating ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="ml-2 font-medium">{order.review.rating}/5</span>
                      </div>
                      {order.review.comment && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Comment</p>
                          <p className="italic">"{order.review.comment}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Show approval buttons to freelancer if client requested cancellation */}
                {user?.id === order.freelancerId && 
                  order.status === "cancellation_requested" && 
                  order.cancellationRequestedBy === order.clientId && (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleApproveCancellation}
                      variant="destructive"
                      className="w-full"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Cancellation
                    </Button>
                    <Button 
                      onClick={handleRejectCancellation}
                      className="w-full"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Cancellation
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SlideIn>

          {/* Right Column - Actions */}
          <SlideIn direction="right" className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Actions</h3>
              
              {/* Countdown Timer - add only if order has a due date and is not completed or cancelled */}
              {order.dueDate && !["completed", "cancelled"].includes(order.status) && (
                <div className="mb-6">
                  <CountdownTimer dueDate={order.dueDate} />
                </div>
              )}
              
              <div className="space-y-3">
                {user?.id === order.freelancerId && order.status === "pending" && (
                  <Button onClick={handleStartOrder} className="w-full">
                    Start Working
                  </Button>
                )}
                
                {user?.id === order.freelancerId && order.status === "in_progress" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Deliver Work
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Deliver Your Work</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Delivery File</label>
                          <Input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Upload your work files here (max 10MB)
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Delivery Notes</label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about your delivery..."
                            rows={4}
                          />
                        </div>
                        <Button
                          onClick={handleDeliverOrder}
                          disabled={isDelivering || !file || !notes}
                          className="w-full"
                        >
                          {isDelivering ? <Spinner className="mr-2" /> : null}
                          Deliver Now
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                {/* Client delivery approval buttons */}
                {user?.id === order.clientId && order.status === "delivered" && (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleApproveDelivery}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Delivery
                    </Button>
                    <Button 
                      onClick={handleRejectDelivery}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Delivery
                    </Button>
                  </div>
                )}
                
                {/* Cancellation request button */}
                {["pending", "in_progress"].includes(order.status) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Request Cancellation
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Cancellation</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Reason for Cancellation</label>
                          <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please explain why you want to cancel this order..."
                            rows={4}
                          />
                        </div>
                        <Button
                          onClick={handleRequestCancellation}
                          disabled={isCancelling || !reason}
                          variant="destructive"
                          className="w-full"
                        >
                          {isCancelling ? <Spinner className="mr-2" /> : null}
                          Submit Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </SlideIn>
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
} 