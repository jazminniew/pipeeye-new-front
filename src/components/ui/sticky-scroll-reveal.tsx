"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";


export type StickyItem = {
  id?: string | number;         // ✅ para keys estables (opcional)
  title: React.ReactNode;       // puede ser nodo o null
  description: React.ReactNode;
  content: React.ReactNode;
};


type ScrollMode = "page" | "container";

export function StickyScroll({
  content,
  contentClassName,
  sectionClassName,
  switchAt = 2.8,     
}: {
  content: StickyItem[];
  contentClassName?: string;
  scrollMode?: ScrollMode;
  sectionClassName?: string;
  switchAt?: number;   // 👈
}) {

  const [activeCard, setActiveCard] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Si querés que dependa del scroll de la página, usamos `target: sectionRef` (no container)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // "start end" → cuando la parte superior de la sección toca la parte inferior de la viewport
    // "end start" → cuando la parte inferior de la sección toca la parte superior de la viewport
    offset: ["start end", "end start"],
  });

useMotionValueEvent(scrollYProgress, "change", (latest) => {
  const N = content.length;
  if (N <= 1) return setActiveCard(0);

  // clamp del switchAt de 0..1
  const s = Math.min(Math.max(switchAt, 0), 1);

  // umbrales donde cambia de card: (i + s)/N
  const thresholds = Array.from({ length: N - 1 }, (_, i) => (i + s) / N);

  let idx = 0;
  while (idx < thresholds.length && latest >= thresholds[idx]) idx++;

  setActiveCard(idx);
});


  const backgroundColors = ["#0b0f13", "#0b0f13", "#0b0f13"]; //#0b0f13
  const linearGradients = [
    "linear-gradient(to bottom right, transparent, transparent)",
    "linear-gradient(to bottom right, transparent, transparent)",
    "linear-gradient(to bottom right, transparent, transparent)",
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(linearGradients[0]);
  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
<motion.section
  ref={sectionRef}
  animate={{ backgroundColor: backgroundColors[activeCard % backgroundColors.length] }}
  className={cn(
    // full-bleed real sin empujar
    "relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-[100vw] overflow-x-clip py-24 md:py-32",
    sectionClassName
  )}
>
  {/* OJO: el padding horizontal va en el wrapper interno, no en la sección */}
  <div className="mx-auto flex w-full gap-8 px-4 md:px-12">
        {/* Columna de texto (flujo) */}
        <div className="w-full md:w-[60%]">
          {content.map((item, index) => (
  <div
    key={item.id ?? index}   // ✅ sin usar title
    className="min-h-[60vh] md:min-h-[80vh] flex flex-col justify-center"
  >
    <motion.h2
      initial={{ opacity: 0 }}
      animate={{ opacity: activeCard === index ? 1 : 0.35 }}
      className="text-3xl md:text-4xl font-semibold text-slate-100"
    >
      {item.title ?? null}     {/* ✅ si fuera null/undefined no rompe */}
    </motion.h2>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: activeCard === index ? 1 : 0.35 }}
      className="mt-6 max-w-prose text-slate-300"
    >
      {item.description ?? null}
    </motion.p>
  </div>
))}

        </div>

        {/* Columna sticky (visual) */}
        <div className="hidden md:block md:w-[40%]">
          <div
            style={{ background: backgroundGradient }}
            className={cn(
              "sticky top-16 h-[22rem] w-full overflow-hidden rounded-xl bg-transparent outline-none",
              contentClassName
            )}
          >
            {content[activeCard]?.content ?? null}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
