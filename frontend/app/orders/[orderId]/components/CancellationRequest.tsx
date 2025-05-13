"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { FadeInWhenVisible } from "@/components/animations/fade-in-when-visible"

interface CancellationRequestProps {
  cancellationRequest: {
    id: string
    reason: string
    status: string
    createdAt: string
    requestedBy: {
      id: string
      name: string
    }
  } | null
  isClient: boolean
  isFreelancer: boolean
  onApproveCancellation: () => Promise<void>
  onRejectCancellation: () => Promise<void>
}

const CancellationRequest = ({
  cancellationRequest,
  isClient,
  isFreelancer,
  onApproveCancellation,
  onRejectCancellation
}: CancellationRequestProps) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [action, setAction] = useState<"approve" | "reject" | "">("")

  // Don't render if there's no active cancellation request
  if (!cancellationRequest || cancellationRequest.status !== "pending") {
    return null
  }

  // Determine who can take action on the request
  const canTakeAction = (isClient && cancellationRequest.requestedBy.id !== isClient) ||
                       (isFreelancer && cancellationRequest.requestedBy.id !== isFreelancer)

  const handleAction = async (actionType: "approve" | "reject") => {
    setIsProcessing(true)
    setAction(actionType)
    
    try {
      if (actionType === "approve") {
        await onApproveCancellation()
      } else {
        await onRejectCancellation()
      }
    } finally {
      setIsProcessing(false)
      setAction("")
    }
  }

  return (
    <FadeInWhenVisible>
      <motion.div 
        className="bg-amber-50 border border-amber-100 rounded-lg p-6 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-amber-800 mb-2">Cancellation Request</h3>
            <p className="text-amber-700 mb-3 text-sm">
              {cancellationRequest.requestedBy.name} has requested to cancel this order.
            </p>
            
            <div className="bg-white rounded-md p-4 mb-4 border border-amber-200">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Reason:</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{cancellationRequest.reason}</p>
            </div>

            {canTakeAction && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => handleAction("approve")}
                  disabled={isProcessing}
                >
                  {isProcessing && action === "approve" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Cancellation
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => handleAction("reject")}
                  disabled={isProcessing}
                >
                  {isProcessing && action === "reject" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Cancellation
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </FadeInWhenVisible>
  )
}

export default CancellationRequest
