// File: src/components/ContactUsForm.tsx
"use client";
import React, { useMemo, useState } from "react";
import styles from "../styles/ContactUsForm.module.css";

export type Payload = {
  nombre: string;
  empresa: string;
  gmail: string;
  telefono: string;
  contacto: "email" | "telefono";
  mensaje?: string;
  source?: string;   // no se envía al back
  website?: string;  // honeypot (no se envía)
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function normalizeName(raw: string) {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

export default function ContactUsForm() {
  console.log("ContactUsForm styles →", Object.keys(styles));
  // Base sin barra final
  const base = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");
  // Ruta EXACTA con barra final (FastAPI diferencia / y sin /)
  const finalEndpoint = `${base}/contact-us/`;

  const [data, setData] = useState<Payload>({
    nombre: "",
    empresa: "",
    gmail: "",
    telefono: "",
    contacto: "email",
    mensaje: "",
    source: "landing",
    website: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (data.nombre.trim().length < 2) e.nombre = "Nombre demasiado corto";
    if (!EMAIL_RE.test(data.gmail)) e.gmail = "Email inválido";
    if (!data.empresa.trim()) e.empresa = "Empresa requerida";
    if (!data.telefono.trim()) e.telefono = "Teléfono requerido";
    if (data.website) e.website = "Spam"; // honeypot
    return e;
  }, [data]);

  const onChange = <T extends HTMLInputElement | HTMLTextAreaElement>(
    e: React.ChangeEvent<T>
  ) => {
    const { name, value } = e.currentTarget;
    setData((d) => ({ ...d, [name]: value as any }));
  };

  const onBlur = <T extends HTMLInputElement>(
    e: React.FocusEvent<T>
  ) => {
    const { name, value } = e.currentTarget;
    setTouched((t) => ({ ...t, [name]: true }));
    if (name === "nombre") {
      setData((d) => ({ ...d, nombre: normalizeName(value) }));
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (Object.keys(errors).length) {
      setTouched({ nombre: true, empresa: true, gmail: true, telefono: true });
      return;
    }

    try {
      setSubmitting(true);

      // Solo lo que el back espera por Query(...)
      const qs = new URLSearchParams({
        nombre: data.nombre,
        empresa: data.empresa,
        gmail: data.gmail,
        telefono: data.telefono,
        contacto: data.contacto,         // "email" | "telefono"
        mensaje: data.mensaje ?? "",     // opcional
      });

      const url = `${finalEndpoint}?${qs.toString()}`;
      // Útil para debug: debería verse .../contact-us/?nombre=...&empresa=...&...
      console.log("POST →", url);

      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));

      setStatus({ ok: true, msg: "Gracias, te contactamos a la brevedad." });
      setData({
        nombre: "",
        empresa: "",
        gmail: "",
        telefono: "",
        contacto: "email",
        mensaje: "",
        source: "landing",
        website: "",
      });
      setTouched({});
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, msg: "Ups, hubo un error. Probá de nuevo." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contacto" className={styles.section} aria-labelledby="ct-title">
      <div className={styles.container}>
        <div className={styles.shell}>
          <header className={styles.headline}>
            <h2 id="ct-title" className={styles.title}>Hablemos de tu caso</h2>
            <p className={styles.kicker}>
              Nos adaptamos a tu operación — definimos alcance, plazos y entregables según tu necesidad.
            </p>
          </header>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={data.website}
              onChange={onChange}
              className={styles.honeypot}
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
            />

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="f-nombre">Nombre y apellido*</label>
                <input
                  id="f-nombre"
                  name="nombre"
                  placeholder="Ej: Ana Pérez"
                  value={data.nombre}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={!!(touched.nombre && errors.nombre)}
                />
                {touched.nombre && errors.nombre && (
                  <span className={styles.error}>{errors.nombre}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="f-empresa">Empresa*</label>
                <input
                  id="f-empresa"
                  name="empresa"
                  placeholder="Ej: Acme Corp"
                  value={data.empresa}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={!!(touched.empresa && errors.empresa)}
                />
                {touched.empresa && errors.empresa && (
                  <span className={styles.error}>{errors.empresa}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="f-gmail">Email*</label>
                <input
                  id="f-gmail"
                  type="email"
                  name="gmail"
                  placeholder="nombre@empresa.com"
                  value={data.gmail}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={!!(touched.gmail && errors.gmail)}
                />
                {touched.gmail && errors.gmail && (
                  <span className={styles.error}>{errors.gmail}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="f-telefono">Teléfono*</label>
                <input
                  id="f-telefono"
                  name="telefono"
                  placeholder="+54 911 12345678"
                  value={data.telefono}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={!!(touched.telefono && errors.telefono)}
                />
                {touched.telefono && errors.telefono && (
                  <span className={styles.error}>{errors.telefono}</span>
                )}
              </div>
            </div>

            <div className={styles.segment}>
              <span className={styles.segmentLabel}>Preferencia de contacto*</span>
              <div className={styles.chips} role="radiogroup" aria-label="Preferencia de contacto">
                {(["email", "telefono"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={data.contacto === opt ? styles.chipActive : styles.chip}
                    onClick={() => setData((d) => ({ ...d, contacto: opt }))}
                    aria-pressed={data.contacto === opt}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="f-mensaje">Mensaje (opcional)</label>
              <textarea
                id="f-mensaje"
                name="mensaje"
                rows={4}
                placeholder="Contanos el alcance, plazos y lo esencial para estimar."
                value={data.mensaje}
                onChange={onChange}
              />
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.cta} disabled={submitting} aria-busy={submitting}>
                {submitting ? "Enviando…" : "Solicitar contacto"}
              </button>
              {status?.ok && <span className={styles.ok}>{status.msg}</span>}
              {status && !status.ok && <span className={styles.fail}>{status.msg}</span>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
