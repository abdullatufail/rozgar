"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Package, Upload, Loader2 } from "lucide-react"
import { FadeInWhenVisible } from "@/components/animations/fade-in-when-visible"

interface DeliveryDetailsProps {
  orderId: string
  isFreelancer: boolean
  isClient: boolean
  orderStatus: string
  onDeliverOrder: (file: File, notes: string) => Promise<void>
}

const DeliveryDetails = ({ 
  orderId, 
  isFreelancer, 
  isClient, 
  orderStatus,
  onDeliverOrder
}: DeliveryDetailsProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [isDelivering, setIsDelivering] = useState(false)

  const handleSubmit = async () => {
    if (!file) {
      return // Handle error - should be shown in UI
    }
    if (!notes.trim()) {
      return // Handle error - should be shown in UI
    }
    
    setIsDelivering(true)
    try {
      await onDeliverOrder(file, notes)
      // Reset form after successful delivery
      setFile(null)
      setNotes("")
    } catch (error) {
      console.error("Error delivering order:", error)
    } finally {
      setIsDelivering(false)
    }
  }

  // Only show delivery option for freelancers and when order is in progress
  if (!isFreelancer || orderStatus !== "in_progress") {
    return null
  }

  return (
    <FadeInWhenVisible>
      <div className="mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto" size="lg">
              <Package className="mr-2 h-5 w-5" />
              Deliver Now
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Deliver Your Work</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Your Work</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex justify-center">
                  <div className="space-y-1 text-center">
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/70 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={(e) => {
                              if (e.target.files) {
                                setFile(e.target.files[0])
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">Up to 100MB</p>
                    </div>
                    {file && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-gray-900 bg-gray-50 p-2 rounded"
                      >
                        Selected: {file.name}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what you've delivered and include any instructions for the client..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="pt-2">
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!file || !notes.trim() || isDelivering}
                >
                  {isDelivering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>Submit Delivery</>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </FadeInWhenVisible>
  )
}

export default DeliveryDetails
