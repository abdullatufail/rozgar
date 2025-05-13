"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { User, Clock, DollarSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { FadeInWhenVisible } from "@/components/animations/fade-in-when-visible"
import { StaggeredChildren, StaggeredChild } from "@/components/animations/staggered-container"
import { TextReveal } from "@/components/animations/text-reveal"

interface OrderInfoProps {
  order: {
    id: string
    gig: {
      id: string
      title: string
      image: string
    }
    price: number
    createdAt: string
    seller: {
      id: string
      name: string
      avatar: string | null
    }
    buyer: {
      id: string
      name: string
      avatar: string | null
    }
  }
}

const OrderInfo = ({ order }: OrderInfoProps) => {
  return (
    <FadeInWhenVisible>
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <TextReveal>
          <h3 className="font-semibold text-lg mb-4">Order Information</h3>
        </TextReveal>

        <StaggeredChildren>
          {/* Gig Info Section */}
          <StaggeredChild>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Gig</h4>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-md overflow-hidden relative flex-shrink-0">
                  <Image
                    src={order.gig.image || "/images/placeholder.jpg"}
                    alt={order.gig.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <Link href={`/gigs/${order.gig.id}`} passHref>
                    <motion.a 
                      className="font-medium text-primary hover:underline block"
                      whileHover={{ x: 2 }}
                    >
                      {order.gig.title}
                    </motion.a>
                  </Link>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${order.price.toFixed(2)}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    Ordered {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          </StaggeredChild>

          {/* People Section */}
          <StaggeredChild>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">People</h4>
              <div className="space-y-4">
                {/* Freelancer */}
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative mr-3">
                    <Image
                      src={order.seller.avatar || "/images/placeholder-avatar.jpg"}
                      alt={order.seller.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Link href={`/profile/${order.seller.id}`} passHref>
                      <motion.a 
                        className="font-medium hover:underline block"
                        whileHover={{ x: 2 }}
                      >
                        {order.seller.name}
                      </motion.a>
                    </Link>
                    <div className="text-xs text-gray-500">Freelancer</div>
                  </div>
                </div>

                {/* Client */}
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative mr-3">
                    <Image
                      src={order.buyer.avatar || "/images/placeholder-avatar.jpg"}
                      alt={order.buyer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Link href={`/profile/${order.buyer.id}`} passHref>
                      <motion.a 
                        className="font-medium hover:underline block"
                        whileHover={{ x: 2 }}
                      >
                        {order.buyer.name}
                      </motion.a>
                    </Link>
                    <div className="text-xs text-gray-500">Client</div>
                  </div>
                </div>
              </div>
            </div>
          </StaggeredChild>
        </StaggeredChildren>
      </div>
    </FadeInWhenVisible>
  )
}

export default OrderInfo
