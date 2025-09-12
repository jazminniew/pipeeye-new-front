// src/components/AnimatedHeadline.tsx
import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  // tuning opcional
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  stagger?: number; // segundos entre letras
};

const AnimatedHeadline: React.FC<Props> = ({
  text,
  as = "h2",
  className,
  from = { opacity: 0, y: 32 },
  to = { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
  stagger = 0.04,
}) => {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    // Respetar reduce-motion
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const chars = ref.current.querySelectorAll<HTMLElement>("[data-char]");

    if (reduce) {
      // Setear estado final sin animar
      gsap.set(chars, to);
      return;
    }

    const tl = gsap.timeline();
    tl.fromTo(chars, from, { ...to, stagger });

    return () => tl.kill();
  }, { scope: ref });

  // Mantener espacios visibles
  const pieces = Array.from(text).map((ch, i) => (
    <span
      key={i}
      data-char
      style={{
        display: "inline-block",
        whiteSpace: ch === " " ? "pre" : "normal",
        willChange: "transform, opacity",
      }}
    >
      {ch}
    </span>
  ));

  const Tag = as as any;
  return (
    <Tag ref={ref} className={className} style={{ color: "var(--blanco)" }}>
      {pieces}
    </Tag>
  );
};

export default AnimatedHeadline;
