"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, ChevronDown, ChevronUp } from "lucide-react"
import { FadeInWhenVisible } from "@/components/animations/fade-in-when-visible"
import { TextReveal } from "@/components/animations/text-reveal"

interface RequirementsProps {
  requirements: string
}

const Requirements = ({ requirements }: RequirementsProps) => {
  const [expanded, setExpanded] = useState(false)
  
  // Check if requirements is too long and needs expansion
  const isLongText = requirements?.length > 300
  const displayText = expanded || !isLongText 
    ? requirements 
    : `${requirements.substring(0, 300)}...`

  return (
    <FadeInWhenVisible>
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <TextReveal>
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Requirements
          </h3>
        </TextReveal>

        <motion.div 
          className="prose prose-sm max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="whitespace-pre-wrap">{displayText}</p>
          
          {isLongText && (
            <motion.button
              className="text-primary font-medium flex items-center mt-2"
              onClick={() => setExpanded(!expanded)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {expanded ? (
                <>
                  Show Less <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </div>
    </FadeInWhenVisible>
  )
}

export default Requirements
