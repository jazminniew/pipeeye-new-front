"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";

export type StickyItem = {
  title: string;
  description: string;
  content?: React.ReactNode;
};

type ScrollMode = "page" | "container";

export function StickyScroll({
  content,
  contentClassName,
  scrollMode = "page", // 👈 default: usa el scroll de la página
  sectionClassName,
}: {
  content: StickyItem[];
  contentClassName?: string;
  scrollMode?: ScrollMode;
  sectionClassName?: string; // para pasar clases (paddings/margins) al wrapper
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
    // Calcula el “breakpoint” de cada card a lo largo de la sección
    const cardLength = content.length;
    const breakpoints = content.map((_, i) => i / Math.max(cardLength - 1, 1));
    // Buscamos el índice con distancia mínima al progreso actual
    let closest = 0;
    for (let i = 1; i < breakpoints.length; i++) {
      if (Math.abs(latest - breakpoints[i]) < Math.abs(latest - breakpoints[closest])) {
        closest = i;
      }
    }
    setActiveCard(closest);
  });

  const backgroundColors = ["#0f172a", "#000000", "#171717"];
  const linearGradients = [
    "linear-gradient(to bottom right, #06b6d4, #10b981)",
    "linear-gradient(to bottom right, #ec4899, #6366f1)",
    "linear-gradient(to bottom right, #f97316, #eab308)",
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
              key={item.title + index}
              // altura generosa para “marcar” cada card en el scroll de la página
              className="min-h-[60vh] md:min-h-[80vh] flex flex-col justify-center"
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.35 }}
                className="text-3xl md:text-4xl font-semibold text-slate-100"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.35 }}
                className="mt-6 max-w-prose text-slate-300"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
        </div>

        {/* Columna sticky (visual) */}
        <div className="hidden md:block md:w-[40%]">
          <div
            style={{ background: backgroundGradient }}
            className={cn(
              "sticky top-16 h-[22rem] w-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-white/10 backdrop-blur",
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
