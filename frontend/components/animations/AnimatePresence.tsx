import { AnimatePresence as FramerAnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AnimatePresenceProps {
  children: ReactNode;
  mode?: "sync" | "wait" | "popLayout";
}

export function AnimatePresence({ children, mode = "sync" }: AnimatePresenceProps) {
  return (
    <FramerAnimatePresence mode={mode}>
      {children}
    </FramerAnimatePresence>
  );
} 