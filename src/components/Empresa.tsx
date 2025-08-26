// src/components/Empresa.tsx
import * as React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Empresa.module.css';

type Props = { nombre?: string; proyectosCount?: number; to?: string };

const Empresa: React.FC<Props> = ({ nombre, proyectosCount, to }) => {
  if (!nombre || !to) {
    return <div className={styles.card}>Empresa</div>; // fallback
  }
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.nombre}>{nombre}</div>
      <div className={styles.badge}>
        {proyectosCount ?? 0} {proyectosCount === 1 ? 'proyecto' : 'proyectos'}
      </div>
    </Link>
  );
};

export default Empresa;
