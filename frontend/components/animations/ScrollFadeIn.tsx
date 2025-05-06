"use client";

import { motion, useAnimation } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";

interface ScrollFadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number; // How much of element needs to be visible
}

export function ScrollFadeIn({ 
  children, 
  delay = 0, 
  duration = 0.3, 
  className = "",
  threshold = 0.2
}: ScrollFadeInProps) {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start({ opacity: 1, y: 0 });
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
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
} 