"use client"

import { motion } from "framer-motion"
import { Clock, CheckCircle, Package, DownloadCloud } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { FadeInWhenVisible } from "@/components/animations/fade-in-when-visible"
import { StaggeredChildren, StaggeredChild } from "@/components/animations/staggered-container"
import { TextReveal } from "@/components/animations/text-reveal"

interface TimelineEvent {
  id: string
  type: string
  message: string
  date: string
  metadata?: any
}

interface TimelineProps {
  events: TimelineEvent[]
  downloadDelivery?: (deliveryId: string) => void
}

const Timeline = ({ events, downloadDelivery }: TimelineProps) => {
  if (!events || events.length === 0) {
    return null
  }

  return (
    <FadeInWhenVisible>
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <TextReveal>
          <h3 className="font-semibold text-lg mb-6">Order Timeline</h3>
        </TextReveal>

        <div className="space-y-6 relative">
          {/* Vertical timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

          <StaggeredChildren>
            {events.map((event, index) => {
              let Icon = Clock
              let iconColor = "text-blue-500"
              let bgColor = "bg-blue-100"

              if (event.type === "created") {
                Icon = Clock
                iconColor = "text-blue-500"
                bgColor = "bg-blue-100"
              } else if (event.type === "delivered") {
                Icon = Package
                iconColor = "text-purple-500"
                bgColor = "bg-purple-100"
              } else if (event.type === "completed") {
                Icon = CheckCircle
                iconColor = "text-green-500"
                bgColor = "bg-green-100"
              }

              return (
                <StaggeredChild key={event.id}>
                  <motion.div 
                    className="flex gap-4 relative"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center z-10`}>
                      <Icon className={`h-3 w-3 ${iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                      </p>
                      
                      {/* Download button for delivery event */}
                      {event.type === "delivered" && event.metadata?.deliveryId && downloadDelivery && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => downloadDelivery(event.metadata.deliveryId)}
                        >
                          <DownloadCloud className="mr-2 h-4 w-4" />
                          Download Files
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </StaggeredChild>
              )
            })}
          </StaggeredChildren>
        </div>
      </div>
    </FadeInWhenVisible>
  )
}

export default Timeline
