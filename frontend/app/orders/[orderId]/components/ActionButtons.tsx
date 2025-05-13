"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { MagneticButton } from "@/components/animations/magnetic-button"
import { FadeInWhenVisible } from "@/components/animations/fade-in-when-visible"

interface ActionButtonsProps {
  orderId: string
  status: string
  isClient: boolean
  isFreelancer: boolean
  onAcceptDelivery: () => Promise<void>
  onRequestRevision: (message: string) => Promise<void>
  onCancelOrder: (reason: string) => Promise<void>
}

const ActionButtons = ({
  orderId,
  status,
  isClient,
  isFreelancer,
  onAcceptDelivery,
  onRequestRevision,
  onCancelOrder
}: ActionButtonsProps) => {
  const [revisionMessage, setRevisionMessage] = useState("")
  const [cancelReason, setCancelReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionType, setActionType] = useState<"accept" | "revision" | "cancel" | "">("")

  const handleAction = async (type: "accept" | "revision" | "cancel") => {
    setIsSubmitting(true)
    setActionType(type)

    try {
      if (type === "accept") {
        await onAcceptDelivery()
      } else if (type === "revision" && revisionMessage.trim()) {
        await onRequestRevision(revisionMessage)
        setRevisionMessage("")
      } else if (type === "cancel" && cancelReason.trim()) {
        await onCancelOrder(cancelReason)
        setCancelReason("")
      }
    } finally {
      setIsSubmitting(false)
      setActionType("")
    }
  }

  // Don't show action buttons if not relevant
  if (!isClient || status !== "delivered") {
    return null
  }

  return (
    <FadeInWhenVisible>
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h3 className="font-semibold text-lg mb-4">Review Delivery</h3>
        <p className="text-sm text-gray-600 mb-4">
          The freelancer has delivered their work. Please review and take action.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Accept Delivery */}
          <MagneticButton>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleAction("accept")}
              disabled={isSubmitting}
            >
              {isSubmitting && actionType === "accept" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept & Complete
                </>
              )}
            </Button>
          </MagneticButton>

          {/* Request Revision */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isSubmitting}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Request Revision
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Request Revision</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explain what needs to be revised
                  </label>
                  <Textarea
                    value={revisionMessage}
                    onChange={(e) => setRevisionMessage(e.target.value)}
                    placeholder="Please provide specific feedback on what needs to be revised..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full"
                    onClick={() => handleAction("revision")}
                    disabled={!revisionMessage.trim() || isSubmitting}
                  >
                    {isSubmitting && actionType === "revision" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>Submit Revision Request</>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Cancel Order */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmitting}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Cancel Order</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-amber-800 text-sm">
                  <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                  Canceling an order is a serious action and may affect the freelancer's rating.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for cancellation
                  </label>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please explain why you'd like to cancel this order..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleAction("cancel")}
                    disabled={!cancelReason.trim() || isSubmitting}
                  >
                    {isSubmitting && actionType === "cancel" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>Confirm Cancellation</>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </FadeInWhenVisible>
  )
}

export default ActionButtons
