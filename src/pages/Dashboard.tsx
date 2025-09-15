import React, { useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Estadisticas from "../components/Statistics";
import Grafico from "../components/CakeGraph";
import LineGraph from "../components/LineGraph";
import styles from "../styles/Dashboard.module.css";
import AnimatedHeadline from "../components/AnimatedHeadline";
import { gsap } from "gsap";
import "../styles/Globals.css";

const Dashboard: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  // 1) Glow que sigue el mouse
  // dentro de Dashboard.tsx
useEffect(() => {
  const el = glowRef.current;
  if (!el) return;

  // leemos el color "natural" desde CSS
  const root = document.documentElement;
  const glowColor =
    getComputedStyle(root).getPropertyValue("--glow-color").trim() || "#0054EC";

  // estado inicial igual al que se usa en el mousemove (sin mover el mouse)
  el.style.background = `radial-gradient(ellipse 60% 90% at 50% 50%, ${glowColor}, transparent 100%)`;

  const handleMouseMove = (e: MouseEvent) => {
    const x = 30 + (e.clientX / window.innerWidth) * 80;
    const y = 50 + (e.clientY / window.innerHeight) * 80;
    el.style.background = `radial-gradient(ellipse 60% 90% at ${x}% ${y}%, ${glowColor}, transparent 100%)`;
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, []);


useEffect(() => {
  if (typeof window === "undefined") return;

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const cont = document.querySelector(`.${styles.estadisticas}`) as HTMLElement | null;
  if (!cont) return;

  const cards = cont.querySelectorAll<HTMLElement>(`.${styles.caja}`);
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 16, willChange: "transform, opacity" });

  if (reduce) {
    gsap.set(cards, { opacity: 1, y: 0, clearProps: "willChange" });
    return;
  }

  const tl = gsap.timeline();
  tl.to(cards, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out",
    stagger: 0.2,
    clearProps: "willChange",
  });
  return () => {
    tl.kill();      
  };
}, []);


  return (
    <div className={styles.dashboardContainer}>
      <Navbar />

      <div className={styles.dashboardContent}>
        <div ref={glowRef} className={styles.backgroundGlow} />

        <div className={styles.header}>
          <AnimatedHeadline
            text="Bienvenido a PipeEye"
            as="h2"
            className={styles.title}
          />
          <p className={styles.subtitle}>
            Panel de resultados generados por el sistema inteligente de análisis
            PipeEye.
          </p>
        </div>

        <Estadisticas />

        <div className={styles.infoSecundaria}>
          <div className={styles.containerGraficoGrande}>
            <div className={styles.graphHeader}>
              <h3>Radiografías Analizadas</h3>
              <p className={styles.greenLabel}>En 2025</p>
            </div>
            <div className={styles.graphSizedLg}>
              <LineGraph />
            </div>
          </div>

          <div className={styles.containerGrafico}>
            <div className={styles.graphHeader}>
              <h3>Porcentaje</h3>
              <p className={styles.grayLabel}>Porcentaje total de radiografías</p>
            </div>
            <div className={styles.graphSizedSm}>
              <Grafico />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
