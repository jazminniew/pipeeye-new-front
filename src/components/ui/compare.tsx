"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";           // ✅ icono sin instalar nada extra

interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number; // ms (ida y vuelta serán 2x)
}

export const Compare = ({
  firstImage = "",
  secondImage = "",
  className,
  firstImageClassName,
  secondImageClassname,
  initialSliderPercentage = 50,
  slideMode = "hover",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
}: CompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  // autoplay con requestAnimationFrame (sin NodeJS.Timeout)
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const animateAutoplay = useCallback(
    (ts: number) => {
      if (!autoplay) return;
      if (startTimeRef.current == null) startTimeRef.current = ts;

      const elapsed = ts - startTimeRef.current;
      const period = autoplayDuration * 2; // ida y vuelta
      const progress = (elapsed % period) / autoplayDuration; // 0..2
      const percentage = progress <= 1 ? progress * 100 : (2 - progress) * 100;

      setSliderXPercent(percentage);
      rafIdRef.current = requestAnimationFrame(animateAutoplay);
    },
    [autoplay, autoplayDuration]
  );

  const startAutoplay = useCallback(() => {
    if (!autoplay) return;
    stopAutoplay();
    startTimeRef.current = null;
    rafIdRef.current = requestAnimationFrame(animateAutoplay);
  }, [autoplay, animateAutoplay]);

  const stopAutoplay = useCallback(() => {
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  // handlers
  const handleStart = useCallback(
    (_clientX: number) => {
      if (slideMode === "drag") setIsDragging(true);
      stopAutoplay();
    },
    [slideMode, stopAutoplay]
  );

  const handleEnd = useCallback(() => {
    if (slideMode === "drag") setIsDragging(false);
    startAutoplay();
  }, [slideMode, startAutoplay]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        requestAnimationFrame(() => {
          setSliderXPercent(Math.max(0, Math.min(100, percent)));
        });
      }
    },
    [slideMode, isDragging]
  );

  return (
    <div
      ref={sliderRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        position: "relative",
        cursor: slideMode === "drag" ? "grab" : "col-resize",
      }}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseLeave={() => {
        if (slideMode === "hover") setSliderXPercent(initialSliderPercentage);
        if (slideMode === "drag") setIsDragging(false);
        startAutoplay();
      }}
      onMouseEnter={() => stopAutoplay()}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseUp={() => handleEnd()}
      onTouchStart={(e) => {
        stopAutoplay();
        handleStart(e.touches[0].clientX);
      }}
      onTouchEnd={() => handleEnd()}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* Línea + glow + partículas + handle */}
      <AnimatePresence initial={false}>
        <motion.div
          className="h-full w-px absolute top-0 m-auto z-30 bg-gradient-to-b from-transparent from-[5%] to-[95%] via-indigo-500 to-transparent"
          style={{ left: `${sliderXPercent}%`, top: 0, zIndex: 40 }}
          transition={{ duration: 0 }}
        >
          <div className="w-36 h-full [mask-image:radial-gradient(100px_at_left,white,transparent)] absolute top-1/2 -translate-y-1/2 left-0 bg-gradient-to-r from-indigo-400 via-transparent to-transparent z-20 opacity-50" />
          <div className="w-10 h-1/2 [mask-image:radial-gradient(50px_at_left,white,transparent)] absolute top-1/2 -translate-y-1/2 left-0 bg-gradient-to-r from-cyan-400 via-transparent to-transparent z-10 opacity-100" />
          <div className="w-10 h-3/4 top-1/2 -translate-y-1/2 absolute -right-10 [mask-image:radial-gradient(100px_at_left,white,transparent)]">
          </div>

          {showHandlebar && (
            <div className="h-5 w-5 rounded-md top-1/2 -translate-y-1/2 bg-white z-30 -right-2.5 absolute flex items-center justify-center shadow-[0px_-1px_0px_0px_#FFFFFF40]">
              <GripVertical className="h-4 w-4 text-black" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Capa 1 (left) */}
      <div className="overflow-hidden w-full h-full relative z-20 pointer-events-none">
        <AnimatePresence initial={false}>
          {firstImage && (
            <motion.div
              className={cn(
                "absolute inset-0 z-20 rounded-2xl shrink-0 w-full h-full select-none overflow-hidden",
                firstImageClassName
              )}
              style={{ clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)` }}
              transition={{ duration: 0 }}
            >
              <img
                alt="first image"
                src={firstImage}
                className={cn(
                  "absolute inset-0 z-20 rounded-2xl w-full h-full select-none object-cover",
                  firstImageClassName
                )}
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Capa 2 (right) */}
      <AnimatePresence initial={false}>
        {secondImage && (
          <motion.img
            className={cn(
              "absolute top-0 left-0 z-[19] rounded-2xl w-full h-full select-none object-cover",
              secondImageClassname
            )}
            alt="second image"
            src={secondImage}
            draggable={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

