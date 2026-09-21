"use client";

import React from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";

interface SlideInProps {
  children: React.ReactNode;
  activeKey: string | number;
  direction?: number;
  className?: string;
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.3,
      ease: [0.7, 0, 0.84, 0] as [number, number, number, number],
    },
  }),
};

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  activeKey,
  direction = 1,
  className = "",
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeKey}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="h-full w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};