import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../../../components/ui/button";

interface CancellationRequestProps {
  cancellationRequest: {
    id: string;
    reason: string;
    status: string;
    createdAt: string;
    requestedBy: {
      id: string;
      name: string;
    };
  };
  isClient: boolean;
  isFreelancer: boolean;
  onApproveCancellation: () => Promise<void>;
  onRejectCancellation: () => Promise<void>;
}

const CancellationRequest: React.FC<CancellationRequestProps> = ({
  cancellationRequest,
  isClient,
  isFreelancer,
  onApproveCancellation,
  onRejectCancellation
}) => {
  // Determine if this user is the one who requested the cancellation
  const isRequester = (isClient && cancellationRequest.requestedBy.name === 'Client') || 
                     (isFreelancer && cancellationRequest.requestedBy.name === 'Seller');
  
  // Determine who needs to approve (the other party)
  const approverRole = cancellationRequest.requestedBy.name === 'Client' ? 'Seller' : 'Client';
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
        <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
        Cancellation Request
      </h3>
      
      <div className="bg-orange-50 p-4 rounded-md mb-4">
        <p className="text-sm text-gray-500 mb-2">
          {cancellationRequest.requestedBy.name} requested cancellation
        </p>
        <p className="text-sm text-gray-500 mb-2">Reason for Cancellation:</p>
        <p className="whitespace-pre-line">{cancellationRequest.reason}</p>
      </div>

      {/* Show approval/rejection buttons to the party that didn't request cancellation */}
      {(isClient && cancellationRequest.requestedBy.name === 'Seller') && (
        <div className="space-y-3">
          <Button 
            onClick={onApproveCancellation}
            variant="destructive"
            className="w-full"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Cancellation
          </Button>
          <Button 
            onClick={onRejectCancellation}
            className="w-full"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject Cancellation
          </Button>
        </div>
      )}
      
      {/* Show approval/rejection buttons to the party that didn't request cancellation */}
      {(isFreelancer && cancellationRequest.requestedBy.name === 'Client') && (
        <div className="space-y-3">
          <Button 
            onClick={onApproveCancellation}
            variant="destructive"
            className="w-full"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Cancellation
          </Button>
          <Button 
            onClick={onRejectCancellation}
            className="w-full"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject Cancellation
          </Button>
        </div>
      )}
      
      {/* Show waiting message to the party that requested cancellation */}
      {isRequester && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
          <p className="font-medium">Waiting for {approverRole} to respond to your cancellation request.</p>
        </div>
      )}
    </div>
  );
};

export default CancellationRequest;
