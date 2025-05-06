import { motion } from "framer-motion";
import { ReactNode } from "react";

type Direction = "left" | "right" | "up" | "down";

interface SlideInProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
}

export function SlideIn({ 
  children, 
  direction = "left", 
  delay = 0, 
  duration = 0.5, 
  className = "",
  distance = 50
}: SlideInProps) {
  const getInitialPosition = (): { x?: number; y?: number } => {
    switch (direction) {
      case "left":
        return { x: -distance };
      case "right":
        return { x: distance };
      case "up":
        return { y: -distance };
      case "down":
        return { y: distance };
      default:
        return { x: -distance };
    }
  };

  return (
    <motion.div
      initial={{ ...getInitialPosition(), opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={{ ...getInitialPosition(), opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
} 