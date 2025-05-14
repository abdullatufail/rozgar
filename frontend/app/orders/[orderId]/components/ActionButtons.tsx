import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../components/ui/dialog";

interface ActionButtonsProps {
  orderId: string;
  status: string;
  isClient: boolean;
  isFreelancer: boolean;
  onAcceptDelivery: () => Promise<void>;
  onRequestRevision: (message: string) => Promise<void>;
  onCancelOrder: (reason: string) => Promise<void>;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  orderId,
  status,
  isClient,
  isFreelancer,
  onAcceptDelivery,
  onRequestRevision,
  onCancelOrder
}) => {
  const [reason, setReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  
  const handleCancelOrder = async () => {
    if (!reason) {
      return; // Don't proceed if no reason provided
    }
    
    setIsCancelling(true);
    try {
      await onCancelOrder(reason);
      // Clear form after successful submission
      setReason("");
    } finally {
      setIsCancelling(false);
    }
  };
  
  const handleRequestRevision = async () => {
    if (!revisionMessage) {
      return; // Don't proceed if no message provided
    }
    
    setIsRequestingRevision(true);
    try {
      await onRequestRevision(revisionMessage);
      // Clear form after successful submission
      setRevisionMessage("");
    } finally {
      setIsRequestingRevision(false);
    }
  };
  
  // Don't show any buttons for completed or cancelled orders
  if (status === "completed" || status === "cancelled") {
    return null;
  }
  
  // Don't show any buttons for orders with pending cancellation
  if (status === "cancellation_requested") {
    return null;
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">Order Actions</h3>
      
      <div className="space-y-3">
        {/* Client buttons for delivered orders */}
        {isClient && status === "delivered" && (
          <>
            <Button 
              onClick={onAcceptDelivery}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept Delivery
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <XCircle className="mr-2 h-4 w-4" />
                  Request Revision
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Revision</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Explain what needs to be revised</label>
                    <Textarea
                      value={revisionMessage}
                      onChange={(e) => setRevisionMessage(e.target.value)}
                      placeholder="Please explain what changes you need..."
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleRequestRevision}
                    disabled={isRequestingRevision || !revisionMessage}
                    className="w-full"
                  >
                    {isRequestingRevision ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Requesting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
        
        {/* Cancellation button for both parties during in-progress */}
        {(isClient || isFreelancer) && ["pending", "in_progress"].includes(status) && (
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
                  onClick={handleCancelOrder}
                  disabled={isCancelling || !reason}
                  variant="destructive"
                  className="w-full"
                >
                  {isCancelling ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
