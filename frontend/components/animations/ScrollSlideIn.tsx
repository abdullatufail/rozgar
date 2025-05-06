"use client";

import { motion, useAnimation } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";

type Direction = "left" | "right" | "up" | "down";

interface ScrollSlideInProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
  threshold?: number; // How much of element needs to be visible
}

export function ScrollSlideIn({ 
  children, 
  direction = "left", 
  delay = 0, 
  duration = 0.5, 
  className = "",
  distance = 50,
  threshold = 0.2
}: ScrollSlideInProps) {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start({ opacity: 1, x: 0, y: 0 });
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [controls, threshold]);

  return (
    <motion.div
      ref={ref}
      initial={{ ...getInitialPosition(), opacity: 0 }}
      animate={controls}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
} 