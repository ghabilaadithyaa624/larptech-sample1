"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  // Defer animation setup until after hydration to avoid SSR/client mismatch.
  // On the server (and on first client render) we render with no initial styles
  // so the HTML the client receives matches exactly what React hydrates.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      className={className}
      initial={mounted && !reduce ? { opacity: 0, y } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}
