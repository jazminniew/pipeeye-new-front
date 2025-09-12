"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

type HoverBorderGradientProps = React.PropsWithChildren<{
  as?: React.ElementType;
  containerClassName?: string;
  className?: string;
  href?: string;          // si existe, renderiza <a>
  duration?: number;
  clockwise?: boolean;
}> & React.HTMLAttributes<HTMLElement>;

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  href,
  ...props
}: HoverBorderGradientProps) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, var(--primary, #007BFF) 0%, rgba(0,123,255,0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, var(--primary, #007BFF) 0%, rgba(0,123,255,0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, var(--primary, #007BFF) 0%, rgba(0,123,255,0) 100%)",
    RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, var(--primary, #007BFF) 0%, rgba(0,123,255,0) 100%)",
  };
  const highlight =
    "radial-gradient(75% 181% at 50% 50%, var(--primary, #007BFF) 0%, rgba(88,177,228,0) 100%)";

  const rotateDirection = (d: Direction): Direction => {
    const dirs: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const i = dirs.indexOf(d);
    return clockwise ? dirs[(i - 1 + dirs.length) % dirs.length] : dirs[(i + 1) % dirs.length];
  };

  useEffect(() => {
    if (!hovered) {
      const id = setInterval(() => setDirection((prev) => rotateDirection(prev)), duration * 1000);
      return () => clearInterval(id);
    }
  }, [hovered, duration, clockwise]);

  const Comp: any = href ? "a" : Tag;

  return (
    <Comp
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex w-fit h-min cursor-pointer overflow-visible rounded-full border p-px",
        "items-center justify-center gap-10 content-center",
        "bg-black/20 hover:bg-black/10 transition duration-500 dark:bg-white/20",
        containerClassName
      )}
      {...props}
    >
      {/* Contenido clickeable */}
      <div className={cn("z-10 w-auto rounded-[inherit] bg-black px-6 py-3 text-lg text-white", className)}>
        {children}
      </div>

      {/* Borde animado */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] overflow-hidden"
        style={{ filter: "blur(2px)" }}
        initial={{ background: movingMap[direction] }}
        animate={{ background: hovered ? [movingMap[direction], highlight] : movingMap[direction] }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />

      {/* Relleno interno */}
      <div className="pointer-events-none absolute inset-[2px] z-0 rounded-[100px] bg-black/90" />
    </Comp>
  );
}
