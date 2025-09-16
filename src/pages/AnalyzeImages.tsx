import React, { useEffect, useState } from 'react';
import { useDicomStore } from '../store/dicomStore';
import Navbar from '../components/Navbar';
import styles from '../styles/AnalyzeImages.module.css';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
// arriba de todo con el resto de imports:
import ModernViewer from "../components/ModernViewer";


type Prediccion = {
  x1: number; y1: number; x2: number; y2: number;
  score: number;
  categoria_nombre: string;
};

const AnalyzeImages: React.FC = () => {
  const previews = useDicomStore((s) => s.previews);
  const taskId = useDicomStore((s) => s.taskId);
  const formInfo = useDicomStore((s) => s.formInfo);

  const [estado, setEstado] = useState<'esperando...' | 'rechazado' | 'en revision' | 'aprobado' | string>('esperando...');
  const [resultados, setResultados] = useState<Prediccion[][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // ⬇️ ESTA FUNCIÓN FALTABA
  const renderEstadoBoton = () => {
    switch (estado) {
      case 'rechazado':
        return <button className={styles.rechazado}>❌ Rechazado</button>;
      case 'en revision':
        return <button className={styles.revision}>⚠️ En revisión</button>;
      case 'aprobado':
        return <button className={styles.aprobado}>✅ Aprobado</button>;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiFetch<any>(`/tasks/${taskId}`);

        if (data?.task?.estado) setEstado(data.task.estado);

        if (Array.isArray(data?.resultados)) {
          // espero data.resultados[i].predicciones
          const predPorImagen = data.resultados.map((item: any) =>
            Array.isArray(item?.predicciones) ? item.predicciones as Prediccion[] : []
          );
          setResultados(predPorImagen);
        }

        if (data?.task?.estado === 'terminado') clearInterval(interval);
      } catch (error: any) {
        console.error('Error polling:', error);
        if (error?.message === 'UNAUTHORIZED') {
          alert('Sesión expirada. Iniciá sesión de nuevo.');
          clearInterval(interval);
          navigate('/');
        }
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [taskId, navigate]);

  const handleNext = () => {
    if (currentIndex < previews.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const currentImage = previews[currentIndex];
  const currentResultados = resultados[currentIndex] || [];

  return (
    <div className={styles.body}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.imageSection}>
          <div className={styles.imageBox}>
            <div className={styles.title}>
              <span>{currentImage?.name || 'Sin nombre'}</span>
              <span className={styles.estadoAnalisis}>{estado}</span>
            </div>

           <div className={styles.imageViewer}>
  <ModernViewer src={currentImage?.url} className={styles.imageViewer} rotate={-90}>
    {/* Tus marcadores, igual que antes, se renderizan como children */}
    {currentResultados.map((r, i) => {
      const x3 = r.x1 + (r.x2 - r.x1) / 2;
      const y3 = r.y1 + (r.y2 - r.y1) / 2;
      return (
        <div
          key={i}
          className={styles.marker}
          style={{
            left: x3 * 0.3, // mantenemos tu lógica actual
            top:  y3 * 0.3,
            position: "absolute",
          }}
        >
          {r.categoria_nombre}
        </div>
      );
    })}
  </ModernViewer>
</div>


            <div className={styles.statusRow}>{renderEstadoBoton()}</div>
          </div>

          <div className={styles.navigationButtons}>
            <button onClick={handlePrev} disabled={currentIndex === 0}>
              ← Anterior
            </button>
            <button onClick={handleNext} disabled={currentIndex === previews.length - 1}>
              Siguiente →
            </button>
          </div>

          <div className={styles.infoGrid}>
            {/* TABLA DEFECTOS */}
            <div className={styles.infoBox}>
              <h3>Información defectos</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>XY</th>
                    <th>Confianza</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResultados.length > 0 ? (
                    currentResultados.map((r, i) => {
                      const x3 = Math.round(r.x1 + (r.x2 - r.x1) / 2);
                      const y3 = Math.round(r.y1 + (r.y2 - r.y1) / 2);
                      const score = Math.round((r.score ?? 0) * 100);
                      return (
                        <tr key={i}>
                          <td>{r.categoria_nombre}</td>
                          <td>({x3}, {y3})</td>
                          <td>
                            <div className={styles.progressBar}>
                              <div style={{ width: `${score}%` }} />
                            </div>
                            {score}%
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className={styles.emptyRow}>
                      <td>Indeterminado</td>
                      <td>---</td>
                      <td>---</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLA EMPRESA */}
            <div className={styles.infoBox}>
              <h3>Información empresa</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cliente</td>
                    <td>{formInfo?.cliente || '---'}</td>
                  </tr>
                  <tr>
                    <td>Proyecto</td>
                    <td>{formInfo?.proyecto || '---'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeImages;
