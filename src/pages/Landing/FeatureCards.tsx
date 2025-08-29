"use client";
import React from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import styles from "./FeatureCards.module.css"; // 👈 import como módulo
import { Clock3, ScanSearch, LayoutDashboard } from "lucide-react";


type Feature = {
  title: string;
  text: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const features: Feature[] = [
  {
    title: "Ahorro de tiempo en inspecciones",
    text:
      "Automatizamos el análisis de imágenes radiográficas para reducir drásticamente los tiempos de detección de fallas en ductos.",
    Icon: Clock3,
  },
  {
    title: "Máxima precisión con IA",
    text:
      "Nuestra inteligencia artificial mejora la detección y medición de fallas donde los defectos son casi imperceptibles al ojo humano.",
    Icon: ScanSearch,
  },
  {
    title: "Digitalización al servicio de la industria",
    text:
      "Promovemos el uso de radiografías digitales y dashboards interactivos para modernizar el proceso de inspección.",
    Icon: LayoutDashboard,
  },
];

// FeatureCards.tsx
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.12 }
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.995 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 160,
      damping: 20,
      mass: 0.6,
    },
  },
};

export default function FeatureCards({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`${styles.featureGrid} ${className}`}   // 👈 usa styles.featureGrid
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
    >
      {features.map(({ title, text, Icon }) => (
        <motion.article key={title} className={styles.featureCard} variants={item}>
          <div className={styles.featureIcon}>
            <Icon strokeWidth={1.75} />
          </div>
          <div className={styles.featureBody}>
            <h3 className={styles.featureTitle}>{title}</h3>
            <p className={styles.featureText}>{text}</p>
          </div>
          <div className={styles.featureGlow} aria-hidden />
        </motion.article>
      ))}
    </motion.div>
  );
}
