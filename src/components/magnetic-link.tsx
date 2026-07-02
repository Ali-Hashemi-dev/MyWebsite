"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";

type MagneticLinkProps = Omit<HTMLMotionProps<"a">, "children"> & {
  children: ReactNode;
  variant?: "solid" | "ghost";
};

export function MagneticLink({ className = "", children, variant = "solid", ...props }: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.22 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.22 });

  const base =
    "group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full px-6 py-3 text-sm font-black outline-none transition focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2 focus-visible:ring-offset-night";
  const styles =
    variant === "solid"
      ? "bg-paper text-night shadow-ember hover:bg-white"
      : "border border-white/15 bg-white/[0.06] text-paper backdrop-blur-xl hover:border-ember-300/50 hover:bg-white/[0.10]";

  return (
    <motion.a
      ref={ref}
      className={`${base} ${styles} ${className}`}
      style={{ x: springX, y: springY }}
      onPointerMove={(event) => {
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        x.set((event.clientX - bounds.left - bounds.width / 2) * 0.22);
        y.set((event.clientY - bounds.top - bounds.height / 2) * 0.22);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <span className="absolute inset-0 translate-y-full bg-ember-500 transition-transform duration-300 ease-out group-hover:translate-y-0" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.a>
  );
}
