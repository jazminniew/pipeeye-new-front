

// ==============================================================
// File: src/pages/Radiografias.tsx  (REEMPLAZAR COMPLETO)
// ==============================================================
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import AnimatedHeadline from "@/components/AnimatedHeadline";
import styles from "../styles/History.module.css";
import local from "../styles/Proyectos.module.css";
import { Icon } from "@iconify/react";
import { getRadiografiasByProyecto, type Radiografia } from "../services/api";
import { useParams, useLocation, useNavigate } from "react-router-dom";

function formatFecha(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString("es-AR");
}

// 🔧 Normaliza: minúsculas + sin acentos (para buscar "ra" y matchear "Radiografía")
function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita diacríticos
}

// Mapea un posible estado a la clase de pill (opcional, igual que antes)
function pillClass(estado?: string) {
  const e = (estado ?? "").toLowerCase();
  if (e.includes("analiz")) return `${local.pill} ${local.pill_analizado}`;
  if (e.includes("proceso") || e.includes("proces")) return `${local.pill} ${local.pill_en_proceso}`;
  if (e.includes("error") || e.includes("fall")) return `${local.pill} ${local.pill_error}`;
  return `${local.pill} ${local.pill_pendiente}`;
}

const Radiografias: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ proyectoId?: string }>();

    const proyectoId =
    params.proyectoId ??
    (location.state as any)?.proyectoId ??
    new URLSearchParams(location.search).get("proyectoId") ??
    location.pathname.split("/").filter(Boolean).pop() ?? // último segmento de la URL
    null;

    console.log("🧭 useParams:", params);
  console.log("🧭 location.state:", location.state);
  console.log("🧭 proyectoId resuelto:", proyectoId);

    const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<Radiografia[]>([]);
  const [q, setQ] = useState("");
  const [proyectoNombre] = useState<string>("");

  
  const key = `pipeeye.imgStatus.${proyectoId}`;
const statusMap = JSON.parse(localStorage.getItem(key) || "{}") as Record<string, "aprobado"|"dudoso"|"reprobado">;

// luego, para cada radiografía:
// const estado = statusMap[Radiografias.nombre] ?? "pendiente";


  const empresaSeleccionada = (location.state as any)?.empresa ?? null;

useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        if (!proyectoId) {
          setItems([]);
          setLoading(false);
          return;
        }
        console.log("📡 getRadiografiasByProyecto()", proyectoId);
        const data = await getRadiografiasByProyecto(proyectoId);
        console.log("📥 radiografías:", data);
        setItems(data);
      } catch (e: any) {
        console.error("❌ Error cargando radiografías:", e);
        if (e?.message === "UNAUTHORIZED") {
          window.location.href = "/login";
          return;
        }
        setErr(e.message ?? "Error cargando radiografías");
      } finally {
        setLoading(false);
      }
    })();
  }, [proyectoId]);
  // ✅ Filtro: SOLO por nombre/estado/fecha (NO indexamos por ID)
  const listaFiltrada = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return items;

    return items.filter((r) => {
      const nombre = r?.nombre || "";
      const estado = r?.estado ?? "";
      const fecha = formatFecha(r?.fechaISO);
      const haystack = norm(`${nombre} ${estado} ${fecha}`);
      return haystack.includes(n);
    });
  }, [items, q]);

  const getNombreRx = (r: Radiografia, idx: number) => {
  return r?.nombre || `Radiografía ${idx + 1}`;
};

  return (
    <div>
      <Navbar />

      <div className={styles.breadcrumbContainer}>
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Empresas", to: "/history" },
            empresaSeleccionada && { label: empresaSeleccionada, to: `/proyectos/${empresaSeleccionada}` },
            { label: `Radiografías (${proyectoNombre || "Proyecto"})` },
          ].filter(Boolean) as any}
        />
      </div>

      <div className={styles.wrapper}>
        <div className={styles.todo}>
          <AnimatedHeadline
            text={`Radiografías — ${proyectoNombre || "Proyecto"}`}
            as="h1"
            className={styles.titulo}
          />

          {/* 🔎 SEARCHBAR */}
          <div className={styles.topBar}>
            <div className={styles.searchWrap}>
              <Icon icon="mdi:magnify" className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Buscar por nombre, estado o fecha…"
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
              {listaFiltrada.map((r, i) => {
                const nombre = getNombreRx(r, i);
                const estado = r?.estado ?? "Pendiente";
                const fechaISO = r?.fechaISO;
                const key = `rx-${r.id}-${i}`;

                return (
                  <article key={key} className={local.row} role="listitem">
                    <div className={local.thumb} aria-hidden />
                    <div className={local.info}>
                      <h3 className={local.title}>{nombre}</h3>
                      <p className={local.meta}>
                        <span className={pillClass(estado)}>{estado}</span>
                        <span className={local.dot} />
                        {formatFecha(fechaISO)}
                        {/* 🧽 Se elimina el ID visible al usuario */}
                      </p>
                    </div>

<button
  className={`${styles.btn} ${styles.btnPrimary} ${local.btnInline}`}
  onClick={() =>
    navigate(`/radiografias/${encodeURIComponent(String(r.id))}`, {
      state: { empresa: empresaSeleccionada },
    })
  }
>
  <Icon icon="mdi:eye" className={styles.leftIcon} />
  Ver imagen
</button>

                  </article>
                );
              })}

              {listaFiltrada.length === 0 && (
                <div className={styles.msg}>Sin resultados</div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Radiografias;
