"use client";

import React, { useLayoutEffect, useRef } from "react";
import { motion, useAnimationControls } from "motion/react";

interface FadeInProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
}

const directions = {
  up: { y: 30, x: 0 },
  down: { y: -30, x: 0 },
  left: { x: 30, y: 0 },
  right: { x: -30, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * Rendered visible on the server, so content in the first screen shows on the
 * first paint instead of waiting for JS to download and hydrate. After
 * hydration, only elements still below the fold are hidden (before the browser
 * paints, so there's no flicker) and fade in when scrolled into view.
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;

    controls.set({ opacity: 0, ...directions[direction] });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        controls.start({
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration, delay, ease: [0.21, 0.47, 0.32, 0.98] },
        });
        observer.disconnect();
      },
      { rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [controls, direction, delay, duration]);

  return (
    <motion.div ref={ref} animate={controls} className={className}>
      {children}
    </motion.div>
  );
};
