import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Estadisticas from '../components/Statistics';
import Grafico from '../components/CakeGraph';
import LineGraph from '../components/LineGraph';
import styles from '../styles/Dashboard.module.css';

const Dashboard: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = 30 + (e.clientX / window.innerWidth) * 80;
      const y = 50 + (e.clientY / window.innerHeight) * 80;
      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(ellipse 60% 90% at ${x}% ${y}%, #0054EC, transparent 100%)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <Navbar />

      <div className={styles.dashboardContent}>
        <div ref={glowRef} className={styles.backgroundGlow} />

        <div className={styles.header}>
          <h2 className={styles.title}>Bienvenido a PipeEye</h2>
          <p className={styles.subtitle}>
            Panel de resultados generados por el sistema inteligente de análisis PipeEye.
          </p>
        </div>

        <Estadisticas />

        <div className={styles.infoSecundaria}>
          {/* Gráfico grande (líneas) */}
          <div className={styles.containerGraficoGrande}>
            <div className={styles.graphHeader}>
              <h3>Radiografías Analizadas</h3>
              <p className={styles.greenLabel}>En 2025</p>
            </div>
            <div className={styles.graphSizedLg}>
              <LineGraph />
            </div>
          </div>

          {/* Gráfico chico (torta) */}
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
