"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "@/components/ui/star"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"
import { FadeInWhenVisible } from "@/components/animations/fade-in-when-visible"
import { StaggeredChildren, StaggeredChild } from "@/components/animations/staggered-container"
import { TextReveal } from "@/components/animations/text-reveal"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  reviewer: {
    id: string
    name: string
    avatar: string | null
  }
}

interface ReviewSectionProps {
  orderId: string
  isCompleted: boolean
  isClient: boolean
  isFreelancer: boolean
  review: Review | null
  onSubmitReview: (rating: number, comment: string) => Promise<void>
}

const ReviewSection = ({
  orderId,
  isCompleted,
  isClient,
  isFreelancer,
  review,
  onSubmitReview
}: ReviewSectionProps) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  // Don't render if the order isn't completed
  if (!isCompleted) {
    return null
  }

  const handleSubmitReview = async () => {
    if (comment.trim() === "") return

    setIsSubmitting(true)
    try {
      await onSubmitReview(rating, comment)
      setShowReviewDialog(false)
      // Reset form
      setRating(5)
      setComment("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FadeInWhenVisible>
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <TextReveal>
          <h3 className="font-semibold text-lg mb-4">Review</h3>
        </TextReveal>

        {review ? (
          <StaggeredChildren>
            <StaggeredChild>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        filled={star <= review.rating}
                        className="h-4 w-4 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-2">
                  — {review.reviewer.name}
                </p>
              </div>
            </StaggeredChild>
          </StaggeredChildren>
        ) : isClient ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              This order has been completed. Share your experience by leaving a review for the freelancer.
            </p>
            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">Leave a Review</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Review the Freelancer</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          onClick={() => setRating(star)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Star
                            filled={star <= rating}
                            className="h-8 w-8 text-yellow-400 cursor-pointer"
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience working with this freelancer..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full"
                      onClick={handleSubmitReview}
                      disabled={!comment.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>Submit Review</>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            The client hasn't left a review yet.
          </p>
        )}
      </div>
    </FadeInWhenVisible>
  )
}

export default ReviewSection
