import React, { useEffect, useMemo, useState } from "react";
import { useDicomStore } from "../store/dicomStore";
import Navbar from "../components/Navbar";
import styles from "../styles/AnalyzeImages.module.css";
import { apiFetch } from "../lib/api";
import { useNavigate } from "react-router-dom";
import ModernViewer from "../components/ModernViewer";

type Prediccion = {
  x1: number; y1: number; x2: number; y2: number;
  score: number;
  categoria_nombre: string;
};

type Clasificacion = "aprobado" | "dudoso" | "reprobado" | null;

const LS_TASK_ID = "pipeeye.taskId";
const LS_PROJECT_ID = "pipeeye.projectId";
const lsKeyIdx = (taskId: string) => `pipeeye.currentIndex.${taskId}`;
const lsKeyClasifs = (taskId: string) => `pipeeye.clasificaciones.${taskId}`;
const lsKeyEstado = (taskId: string) => `pipeeye.lastEstado.${taskId}`;
const lsKeyImgStatus = (projectId: string) => `pipeeye.imgStatus.${projectId}`;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const AnalyzeImages: React.FC = () => {
  const previews = useDicomStore((s) => s.previews); // {name, url?}[]
  const taskIdFromStore = useDicomStore((s) => s.taskId);
  const formInfo = useDicomStore((s) => s.formInfo);

  const projectId =
    (formInfo as any)?.projectId ??
    (formInfo as any)?.proyectoId ??
    localStorage.getItem(LS_PROJECT_ID) ??
    undefined;

  const taskId = useMemo<string | undefined>(() => {
    return taskIdFromStore ?? localStorage.getItem(LS_TASK_ID) ?? undefined;
  }, [taskIdFromStore]);

  const [estado, setEstado] = useState<string>(() => {
    if (!taskId) return "esperando...";
    return localStorage.getItem(lsKeyEstado(taskId)) ?? "esperando...";
  });
  const [resultados, setResultados] = useState<Prediccion[][]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (!taskId) return 0;
    return Number(readJSON<number>(lsKeyIdx(taskId), 0)) || 0;
  });
  const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>(() => {
    if (!taskId) return [];
    return readJSON<Clasificacion[]>(lsKeyClasifs(taskId), []);
  });

  const navigate = useNavigate();

  // Persistencias base
  useEffect(() => {
    if (taskIdFromStore) localStorage.setItem(LS_TASK_ID, taskIdFromStore);
  }, [taskIdFromStore]);

  useEffect(() => {
    if (projectId) localStorage.setItem(LS_PROJECT_ID, projectId);
  }, [projectId]);

  useEffect(() => {
    if (!taskId) return;
    localStorage.setItem(lsKeyIdx(taskId), JSON.stringify(currentIndex));
  }, [currentIndex, taskId]);

  useEffect(() => {
    if (!taskId) return;
    localStorage.setItem(lsKeyEstado(taskId), estado);
  }, [estado, taskId]);

  // Alinear tamaño de clasificaciones a previews
  useEffect(() => {
    if (!taskId) return;
    if (!previews || previews.length === 0) return;
    setClasificaciones((prev) => {
      const next = prev.slice(0, previews.length);
      while (next.length < previews.length) next.push(null);
      return next;
    });
  }, [previews, taskId]);

  useEffect(() => {
    if (!taskId) return;
    localStorage.setItem(lsKeyClasifs(taskId), JSON.stringify(clasificaciones));
  }, [clasificaciones, taskId]);

  // CLAMP del índice si cambió la cantidad (por reload)
  useEffect(() => {
    if (!previews) return;
    if (currentIndex > 0 && currentIndex >= previews.length) {
      setCurrentIndex(previews.length - 1);
    }
  }, [previews, currentIndex]);

  // Polling
  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const data = await apiFetch<any>(`/tasks/${taskId}`);
        if (cancelled) return;

        if (data?.task?.estado) setEstado(String(data.task.estado));

        if (Array.isArray(data?.resultados)) {
          const predPorImagen: Prediccion[][] = data.resultados.map((item: any) =>
            Array.isArray(item?.predicciones) ? (item.predicciones as Prediccion[]) : []
          );
          setResultados(predPorImagen);
        }
      } catch (error: any) {
        console.error("Error polling:", error);
        if (error?.message === "UNAUTHORIZED") {
          alert("Sesión expirada. Iniciá sesión de nuevo.");
          navigate("/");
        }
      }
    };

    tick();
    const interval = setInterval(tick, 6000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [taskId, navigate]);

  // Guardar estado por imagen (para Radiografías)
  const upsertImgStatus = (imgName: string, value: Exclude<Clasificacion, null>) => {
    if (!projectId || !imgName) return;
    const key = lsKeyImgStatus(projectId);
    const map = readJSON<Record<string, Exclude<Clasificacion, null>>>(key, {});
    map[imgName] = value;
    localStorage.setItem(key, JSON.stringify(map));
  };

  // Navegación
  const handleNext = () => {
    if (!previews || previews.length <= 1) return;
    if (currentIndex < previews.length - 1) setCurrentIndex((i) => i + 1);
  };
  const handlePrev = () => {
    if (!previews || previews.length <= 1) return;
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  // Clasificación
  const setClasificacionActual = (value: Exclude<Clasificacion, null>) => {
    setClasificaciones((prev) => {
      const next = prev.slice();
      if (currentIndex >= 0) next[currentIndex] = value;
      return next;
    });
    const imgName = previews?.[currentIndex]?.name ?? `Imagen ${currentIndex + 1}`;
    upsertImgStatus(imgName, value);
  };

  // Continuar / Finalizar → Radiografías del proyecto
  const goRadiografias = () => {
    if (projectId) navigate(`/radiografias/${projectId}`);
    else navigate(`/radiografias`);
  };
  const handleContinuar = () => {
    if (!previews || previews.length === 0) {
      goRadiografias();
      return;
    }
    if (currentIndex < previews.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // última
      goRadiografias();
    }
  };

  // Derivados
  const currentImage = previews?.[currentIndex];
  const currentResultados = resultados?.[currentIndex] || [];
  const clasifActual: Clasificacion = clasificaciones?.[currentIndex] ?? null;

  const renderEstadoBadge = () => {
    const v = (estado || "").toLowerCase();
    if (v.includes("rechaz")) return <span className={styles.rechazado}>❌ Rechazado</span>;
    if (v.includes("revis")) return <span className={styles.revision}>⚠️ En revisión</span>;
    if (v.includes("aprob")) return <span className={styles.aprobado}>✅ Aprobado</span>;
    return <span className={styles.estadoAnalisis}>{estado || "..."}</span>;
  };

  const hayUnaSola = (previews?.length ?? 0) <= 1;

  return (
    <div className={styles.body}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.imageSection}>
          <div className={styles.imageBox}>
            <div className={styles.title}>
              <span>{currentImage?.name || `Imagen ${currentIndex + 1}`}</span>
              {renderEstadoBadge()}
            </div>

            <div className={styles.imageViewer}>
              {currentImage?.url ? (
                <ModernViewer src={currentImage.url} className={styles.imageViewer} rotate={-90}>
                  {currentResultados.map((r, i) => {
                    const x3 = r.x1 + (r.x2 - r.x1) / 2;
                    const y3 = r.y1 + (r.y2 - r.y1) / 2;
                    return (
                      <div
                        key={i}
                        className={styles.marker}
                        style={{ left: x3 * 0.3, top: y3 * 0.3, position: "absolute" }}
                      >
                        {r.categoria_nombre}
                      </div>
                    );
                  })}
                </ModernViewer>
              ) : (
                <div className={styles.viewerPlaceholder}>
                  <p>
                    Vista previa no disponible tras recargar.
                    {taskId ? " El análisis sigue en curso." : "" }
                  </p>
                </div>
              )}
            </div>

            {/* Clasificación */}
            <div className={styles.statusRow}>
              <button
                className={`${styles.tagBtn} ${clasifActual === "aprobado" ? styles.tagActiveAprobado : ""}`}
                onClick={() => setClasificacionActual("aprobado")}
              >
                ✅ Aprobado
              </button>
              <button
                className={`${styles.tagBtn} ${clasifActual === "dudoso" ? styles.tagActiveDudoso : ""}`}
                onClick={() => setClasificacionActual("dudoso")}
              >
                ⚠️ Dudoso
              </button>
              <button
                className={`${styles.tagBtn} ${clasifActual === "reprobado" ? styles.tagActiveReprobado : ""}`}
                onClick={() => setClasificacionActual("reprobado")}
              >
                ❌ Reprobado
              </button>
            </div>

            {/* Continuar / Finalizar */}
            <div className={styles.continueRow}>
              <button className={styles.continueBtn} onClick={handleContinuar}>
                {currentIndex < (previews?.length ?? 0) - 1 ? "Continuar →" : "Finalizar"}
              </button>
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navigationButtons}>
            <button onClick={handlePrev} disabled={hayUnaSola || currentIndex === 0}>
              ← Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={hayUnaSola || !previews || currentIndex === previews.length - 1}
            >
              Siguiente →
            </button>
          </div>

          {/* Info */}
          <div className={styles.infoGrid}>
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

            <div className={styles.infoBox}>
              <h3>Información</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Empresa</td>
                    <td>{formInfo?.cliente || "---"}</td>
                  </tr>
                  <tr>
                    <td>Proyecto</td>
                    <td>{formInfo?.proyecto || "---"}</td>
                  </tr>
                  <tr>
                    <td>Imagen</td>
                    <td>{previews?.[currentIndex]?.name || `Imagen ${currentIndex + 1}`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* /infoGrid */}
        </div>
      </div>
    </div>
  );
};

export default AnalyzeImages;
