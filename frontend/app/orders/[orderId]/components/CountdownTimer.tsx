"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  dueDate: string;
  orderStatus: string;
}

const CountdownTimer = ({ dueDate, orderStatus }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    // If order is completed or cancelled, don't start the timer
    if (orderStatus === "completed" || orderStatus === "cancelled") {
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(dueDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsPast(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      setIsPast(false);
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate, orderStatus]);

  // For completed orders, show a completion message instead of the timer
  if (orderStatus === "completed") {
    return (
      <motion.div
        className="p-3 bg-green-50 border border-green-100 rounded-md text-green-800"
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
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
          </motion.div>
          Order Completed
        </motion.div>
      </motion.div>
    );
  }

  // For cancelled orders, show a cancellation message
  if (orderStatus === "cancelled") {
    return (
      <motion.div
        className="p-3 bg-red-50 border border-red-100 rounded-md text-red-800"
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
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
              repeatDelay: 3,
            }}
          >
            <XCircle className="mr-2 h-5 w-5" />
          </motion.div>
          Order Cancelled
        </motion.div>
      </motion.div>
    );
  }

  if (isPast) {
    return (
      <motion.div
        className="p-3 bg-red-50 border border-red-100 rounded-md text-red-800"
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
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <AlertTriangle className="mr-2 h-5 w-5" />
          </motion.div>
          Delivery Overdue
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-3 bg-blue-50 border border-blue-100 rounded-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="font-medium text-blue-800 mb-2 flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <Clock className="mr-2 h-5 w-5" />
        </motion.div>
        Time Remaining
      </motion.div>
      <motion.div className="grid grid-cols-4 gap-2 text-center">
        <motion.div
          className="bg-white p-2 rounded shadow-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
        >
          <motion.div
            className="text-xl font-bold"
            animate={{ scale: timeLeft.days === 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeLeft.days === 0 ? Number.POSITIVE_INFINITY : 0, repeatDelay: 2 }}
          >
            {timeLeft.days}
          </motion.div>
          <div className="text-xs text-gray-500">Days</div>
        </motion.div>
        <motion.div
          className="bg-white p-2 rounded shadow-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 15 }}
        >
          <motion.div
            className="text-xl font-bold"
            animate={{ scale: timeLeft.days === 0 && timeLeft.hours < 5 ? [1, 1.1, 1] : 1 }}
            transition={{
              duration: 0.5,
              repeat: timeLeft.days === 0 && timeLeft.hours < 5 ? Number.POSITIVE_INFINITY : 0,
              repeatDelay: 2,
            }}
          >
            {timeLeft.hours}
          </motion.div>
          <div className="text-xs text-gray-500">Hours</div>
        </motion.div>
        <motion.div
          className="bg-white p-2 rounded shadow-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
        >
          <div className="text-xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs text-gray-500">Mins</div>
        </motion.div>
        <motion.div
          className="bg-white p-2 rounded shadow-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 15 }}
        >
          <div className="text-xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs text-gray-500">Secs</div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CountdownTimer;
