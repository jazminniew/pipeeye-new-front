// File: src/components/ContactUsForm.tsx
"use client";
import React, { useMemo, useState } from "react";
import styles from "../styles/ContactUsForm.module.css";

export type Payload = {
  nombre: string;
  email: string;
  empresa?: string;
  telefono?: string;
  preferencia: "email" | "whatsapp" | "llamada";
  mensaje: string;
  detalles?: {
    ubicacion?: string;
    tipo?: string;
    volumen?: string;
  };
  source?: string;
  website?: string; // honeypot
};

// Helpers
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function normalizeName(raw: string) {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

export default function ContactUsForm({
  endpoint = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/contact`
    : "http://localhost:8000/contact",
}: {
  endpoint?: string;
}) {
  const [data, setData] = useState<Payload>({
    nombre: "",
    email: "",
    empresa: "",
    telefono: "",
    preferencia: "email",
    mensaje: "",
    detalles: { ubicacion: "", tipo: "", volumen: "" },
    source: "landing",
    website: "",
  });

  // ✅ mostrar errores solo si el campo tiene valor y está mal
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (data.nombre && data.nombre.trim().length < 2) e.nombre = "Nombre demasiado corto";
    if (data.email && !EMAIL_RE.test(data.email)) e.email = "Email inválido";
    if (data.mensaje && data.mensaje.trim().length < 12) e.mensaje = "Mínimo 12 caracteres";
    if (data.website) e.website = "Spam"; // honeypot
    return e;
  }, [data]);

  // Handlers
  const onChange = <
    T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >(
    e: React.ChangeEvent<T>
  ) => {
    const { name, value } = e.currentTarget;
    // name puede ser de Payload o de detalles.* (para touched no hay problema)
    if (name === "preferencia") {
      setData((d) => ({ ...d, preferencia: value as Payload["preferencia"] }));
    } else if (name.startsWith("detalles.")) {
      const key = name.split(".")[1] as keyof NonNullable<Payload["detalles"]>;
      setData((d) => ({
        ...d,
        detalles: { ...(d.detalles || {}), [key]: value },
      }));
    } else {
      setData((d) => ({ ...d, [name]: value as any }));
    }
  };

  const onBlur = <
    T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >(
    e: React.FocusEvent<T>
  ) => {
    const { name, value } = e.currentTarget;
    setTouched((t) => ({ ...t, [name]: true }));
    if (name === "nombre") {
      setData((d) => ({ ...d, nombre: normalizeName(value) }));
    }
  };

  const update = (key: keyof Payload, value: any) =>
    setData((d) => ({ ...d, [key]: value }));

  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    // si hay errores en campos con valor, no enviamos
    if (Object.keys(errors).length) {
      // marcamos touched para que se vean los errores ya tipeados
      setTouched((t) => ({
        ...t,
        nombre: true,
        email: true,
        mensaje: true,
      }));
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));

      setStatus({ ok: true, msg: "Gracias, te contactamos a la brevedad." });
      setData({
        nombre: "",
        email: "",
        empresa: "",
        telefono: "",
        preferencia: "email",
        mensaje: "",
        detalles: { ubicacion: "", tipo: "", volumen: "" },
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
                  aria-invalid={Boolean(touched.nombre && data.nombre && errors.nombre)}
                />
                {touched.nombre && data.nombre && errors.nombre && (
                  <span className={styles.error}>{errors.nombre}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="f-email">Email*</label>
                <input
                  id="f-email"
                  type="email"
                  name="email"
                  placeholder="nombre@empresa.com"
                  value={data.email}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={Boolean(touched.email && data.email && errors.email)}
                />
                {touched.email && data.email && errors.email && (
                  <span className={styles.error}>{errors.email}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="f-empresa">Empresa (opcional)</label>
                <input
                  id="f-empresa"
                  name="empresa"
                  placeholder="Tu empresa o área"
                  value={data.empresa}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="f-telefono">Teléfono / WhatsApp (opcional)</label>
                <input
                  id="f-telefono"
                  name="telefono"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="+54 911 12345678"
                  value={data.telefono}
                  onChange={(e) => {
                    const digitsOnly = e.currentTarget.value.replace(/\D/g, "");
                    update("telefono", digitsOnly);
                  }}
                  onBlur={onBlur}
                />
              </div>
            </div>

            <div className={styles.segment}>
              <span className={styles.segmentLabel}>Preferencia de contacto</span>
              <div className={styles.chips} role="radiogroup" aria-label="Preferencia de contacto">
                {(["email", "whatsapp", "llamada"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    name="preferencia"
                    className={data.preferencia === opt ? styles.chipActive : styles.chip}
                    onClick={() => update("preferencia", opt)}
                    aria-pressed={data.preferencia === opt}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="f-mensaje">¿Qué necesitás?*</label>
              <textarea
                id="f-mensaje"
                name="mensaje"
                rows={4}
                placeholder="Contanos el alcance (ej. API 1104), formatos, plazos y lo esencial para estimar."
                value={data.mensaje}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={Boolean(touched.mensaje && data.mensaje && errors.mensaje)}
              />
              {touched.mensaje && data.mensaje && errors.mensaje && (
                <span className={styles.error}>{errors.mensaje}</span>
              )}
            </div>

            <details
              className={styles.details}
              open={openAdvanced}
              onToggle={(e) => setOpenAdvanced((e.target as HTMLDetailsElement).open)}
            >
              <summary className={styles.summary}>
                Detalles opcionales <span className={styles.summaryHint}>(ubicación, tipo de activo, volumen)</span>
              </summary>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="f-ubicacion">Ubicación</label>
                  <input
                    id="f-ubicacion"
                    name="detalles.ubicacion"
                    placeholder="País / Región / Sitio"
                    value={data.detalles?.ubicacion || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="f-tipo">Tipo de activo</label>
                  <input
                    id="f-tipo"
                    name="detalles.tipo"
                    placeholder="Oleoducto, gasoducto, tanques, etc."
                    value={data.detalles?.tipo || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="f-volumen">Volumen estimado</label>
                  <input
                    id="f-volumen"
                    name="detalles.volumen"
                    placeholder="Ej: 1.200 radiografías / 40 km / ZIP DICOM"
                    value={data.detalles?.volumen || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                </div>
              </div>
            </details>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.cta}
                disabled={submitting}
                aria-busy={submitting}
              >
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
