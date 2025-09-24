// src/pages/Proyectos.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import AnimatedHeadline from "@/components/AnimatedHeadline";
import styles from "../styles/History.module.css";
import local from "../styles/Proyectos.module.css";
import { Icon } from "@iconify/react";

import { getProyectos, getProyectosDeEmpresa, type Proyecto } from "../services/api";

function formatFecha(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString("es-AR");
}

const Proyectos: React.FC = () => {
  const { empresa: empresaParam } = useParams<{ empresa?: string }>();
  const empresaSeleccionada = empresaParam ? decodeURIComponent(empresaParam).trim() : undefined;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const data = empresaSeleccionada
          ? await getProyectosDeEmpresa(empresaSeleccionada)
          : await getProyectos();

        setProyectos(data);
      } catch (e: any) {
        if (e?.message === "UNAUTHORIZED") {
          window.location.href = "/login";
          return;
        }
        setErr(e.message ?? "Error cargando proyectos");
      } finally {
        setLoading(false);
      }
    })();
  }, [empresaSeleccionada]);

  const listaFiltrada = useMemo(() => {
    const base = empresaSeleccionada
      ? proyectos.filter(
          (p) => (p.empresa || "").trim().toLowerCase() === empresaSeleccionada.toLowerCase()
        )
      : proyectos;

    const n = q.trim().toLowerCase();
    if (!n) return base;
    return base.filter(
      (p) =>
        (p.nombre || "").toLowerCase().includes(n) ||
        (p.empresa || "").toLowerCase().includes(n) ||
        formatFecha(p.fechaISO).includes(n)
    );
  }, [proyectos, empresaSeleccionada, q]);

  return (
    <div>
      <Navbar />

      <div className={styles.breadcrumbContainer}>
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Empresas", to: "/history" },
            { label: empresaSeleccionada ?? "Proyectos" },
          ]}
        />
      </div>

      <div className={styles.wrapper}>
        <div className={styles.todo}>
          <AnimatedHeadline
            text={empresaSeleccionada ? `Proyectos — ${empresaSeleccionada}` : "Proyectos"}
            as="h1"
            className={styles.titulo}
          />

          {/* 🔎 SEARCHBAR */}
          <div className={styles.topBar}>
            <div className={styles.searchWrap}>
              <Icon icon="mdi:magnify" className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Buscar proyecto…"
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
            <section className={local.list} role="list">
              {listaFiltrada.map((p, i) => {
                const key =
                  p?.id != null
                    ? `proj-${String(p.id)}`
                    : `${p?.nombre ?? "sin-nombre"}-${p?.empresa ?? "sin-empresa"}-${i}`;

                return (
                  <article key={key} className={local.row} role="listitem">
                    <div className={local.thumb} aria-hidden />
                    <div className={local.info}>
                      <h3 className={local.title}>{p.nombre}</h3>
                      <p className={local.meta}>
                        <span className={`${local.pill} ${local.pill_analizado}`}>Proyecto</span>
                        <span className={local.dot} />
                        {formatFecha(p.fechaISO)}
                      </p>
                    </div>
                    <button
                      className={`${styles.btn} ${styles.btnPrimary} ${local.btnInline}`}
                      onClick={() =>
                        navigate(`/radiografias/${encodeURIComponent(String(p.id))}`, {
                          state: { empresa: p.empresa },
                        })
                      }
                    >
                      <Icon icon="mdi:eye" className={styles.leftIcon} />
                      Ver detalle
                    </button>
                  </article>
                );
              })}

              {listaFiltrada.length === 0 && (
                <div className={styles.msg}>
                  {empresaSeleccionada
                    ? `No hay proyectos para “${empresaSeleccionada}”.`
                    : "Sin resultados"}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Proyectos;
