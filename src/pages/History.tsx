import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb.tsx";
import styles from "../styles/History.module.css";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import AnimatedHeadline from "@/components/AnimatedHeadline";

import { getEmpresasDesdeProyectos, type EmpresaAgrupada } from "../services/api";

const History: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaAgrupada[]>([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await getEmpresasDesdeProyectos(); // ✅ devuelve EmpresaAgrupada[]
        setEmpresas(data);
      } catch (e: any) {
        if (e?.message === "UNAUTHORIZED") {
          window.location.href = "/login";
          return;
        }
        setErr(e.message ?? "Error cargando empresas");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtradas = useMemo(
    () => empresas.filter((e) => e.nombre.toLowerCase().includes(q.toLowerCase())),
    [empresas, q]
  );

  return (
    <div>
      <Navbar />
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Empresas" }]} />
      </div>

      <div className={styles.wrapper}>
        <div className={styles.todo}>
          <AnimatedHeadline text="Empresas" as="h1" className={styles.titulo} />

          <div className={styles.topBar}>
            <div className={styles.searchWrap}>
              <Icon icon="mdi:magnify" className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Buscar empresa…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setQ("")}
                  aria-label="Borrar búsqueda"
                  title="Borrar"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {loading && <div className={styles.msg}>Cargando…</div>}
          {err && !loading && <div className={styles.error}>{err}</div>}

          {!loading && !err && (
            <div className={styles.gridContainer}>
              {filtradas.map((e) => (
                <article key={e.nombre} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.avatar} />
                    <div>
                      <h3 className={styles.cardTitle}>{e.nombre}</h3>
                      <p className={styles.cardMeta}>
                        {e.cantidad} {e.cantidad === 1 ? "proyecto" : "proyectos"}
                      </p>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.btn} ${styles.btnSecondary}`}
                      onClick={() => navigate(`/estadisticas/${encodeURIComponent(e.nombre)}`)}
                    >
                      <Icon icon="mdi:chart-line" className={styles.leftIcon} />
                      Estadísticas
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={() => navigate(`/proyectos/${encodeURIComponent(e.nombre)}`)}
                    >
                      <Icon icon="mdi:eye" className={styles.leftIcon} />
                      Ver proyectos
                    </button>
                  </div>
                </article>
              ))}
              {filtradas.length === 0 && <div className={styles.msg}>Sin resultados</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
