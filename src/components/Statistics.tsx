// src/components/Statistics.tsx
import React from 'react';
import styles from '../styles/Dashboard.module.css';

const Statistics: React.FC = () => {
  return (
    <div className={styles.estadisticas}>
      <div className={styles.caja}>
        Total Radiografías
        <div className={`${styles.number} ${styles.uno}`}>109</div>
      </div>
      <div className={styles.caja}>
        Aprobadas
        <div className={`${styles.number} ${styles.dos}`}>50</div>
      </div>
      <div className={styles.caja}>
        Dudosas
        <div className={`${styles.number} ${styles.tres}`}>32</div>
      </div>
      <div className={styles.caja}>
        Rechazadas
        <div className={`${styles.number} ${styles.cuatro}`}>37</div>
      </div>
    </div>
  );
};

export default Statistics;
