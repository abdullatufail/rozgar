"use client"

import { motion } from "framer-motion"
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Package, 
  XCircle,
  Loader2
} from "lucide-react"

interface OrderStatusBannerProps {
  status: string
  isPastDue?: boolean
  isResponsive?: boolean
}

const OrderStatusBanner = ({ 
  status, 
  isPastDue = false,
  isResponsive = false 
}: OrderStatusBannerProps) => {
  let bg = "bg-blue-50"
  let text = "text-blue-800"
  let border = "border-blue-100"
  let Icon = Clock
  let message = "In Progress"
  let animation = {}

  switch (status) {
    case "pending":
      bg = "bg-yellow-50"
      text = "text-yellow-800"
      border = "border-yellow-100"
      Icon = Clock
      message = "Pending"
      animation = {
        rotate: [0, 360],
        transition: {
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }
      }
      break
    case "in_progress":
      bg = "bg-blue-50"
      text = "text-blue-800"
      border = "border-blue-100"
      Icon = isPastDue ? AlertTriangle : Package
      message = isPastDue ? "Past Due" : "In Progress"
      animation = isPastDue ? {
        scale: [1, 1.2, 1],
        transition: {
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }
      } : {
        y: [0, -5, 0],
        transition: {
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }
      }
      break
    case "cancelled":
      bg = "bg-red-50"
      text = "text-red-800"
      border = "border-red-100"
      Icon = XCircle
      message = "Cancelled"
      animation = {
        rotate: [0, 10, -10, 10, 0],
        transition: {
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
          repeatDelay: 3,
        }
      }
      break
    case "completed":
      bg = "bg-green-50"
      text = "text-green-800"
      border = "border-green-100"
      Icon = CheckCircle
      message = "Completed"
      animation = {
        scale: [1, 1.2, 1],
        transition: {
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }
      }
      break
    case "delivered":
      bg = "bg-purple-50"
      text = "text-purple-800"
      border = "border-purple-100"
      Icon = Package
      message = "Delivered - Awaiting Approval"
      animation = {
        y: [0, -5, 0],
        transition: {
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }
      }
      break
    case "loading":
      bg = "bg-gray-50"
      text = "text-gray-800"
      border = "border-gray-100"
      Icon = Loader2
      message = "Loading..."
      animation = {
        rotate: 360,
        transition: {
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }
      }
      break
  }

  const containerClass = `p-3 ${bg} border ${border} rounded-md ${text} ${
    isResponsive ? "hidden md:block" : ""
  }`

  return (
    <motion.div
      className={containerClass}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="font-medium flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div animate={animation}>
          <Icon className="mr-2 h-5 w-5" />
        </motion.div>
        {message}
      </motion.div>
    </motion.div>
  )
}

export default OrderStatusBanner
