// src/components/ModernViewer.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  src?: string;                     // dataURL/URL de la preview (jpg/png)
  className?: string;
  rotate?: number;                  // rotación inicial (deg)
  children?: React.ReactNode;       // overlays externos (marcadores/etc)

  // Descarga DICOM (prioridad en este orden)
  dicomBlob?: Blob | File;          // ya en memoria
  dicomUrl?: string;                // URL directa a .dcm en tu API
  onRequestDicom?: () => Promise<Blob>; // fetch “on-demand” a tu API/DB que retorne Blob DICOM
  downloadFileName?: string;        // ej: "estudio_123.dcm"
};

type Size = { w: number; h: number };
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Valida firma DICOM: 128 bytes de preámbulo + "DICM" */
async function validateDicomBlob(blob: Blob): Promise<boolean> {
  if (blob.size < 132) return false;
  const slice = blob.slice(128, 132);
  const buf = await slice.arrayBuffer();
  const sig = new TextDecoder().decode(new Uint8Array(buf));
  return sig === "DICM";
}

const ModernViewer: React.FC<Props> = ({
  src,
  className,
  rotate = -90,
  children,
  dicomBlob,
  dicomUrl,
  onRequestDicom,
  downloadFileName = "imagen.dcm",
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef  = useRef<HTMLImageElement>(null);

  // Viewport
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale]   = useState(1);     // relativo a “fit”
  const [rot, setRot]       = useState(rotate);
  const [flipH, setFlipH]   = useState(false);
  const [flipV, setFlipV]   = useState(false);
  const [invert, setInvert] = useState(false);
  const [isFs, setIsFs]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Dimensiones
  const [container, setContainer] = useState<Size>({ w: 0, h: 0 });
  const [natural, setNatural]     = useState<Size>({ w: 0, h: 0 });

  // ResizeObserver
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const cr = e.contentRect;
        setContainer({ w: cr.width, h: cr.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Carga tamaño natural
  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
  };

  const rot90 = Math.abs(((rot % 360) + 360) % 360) % 180 === 90;

  // Escala base “fit”
  const baseFitScale = useMemo(() => {
    if (!natural.w || !natural.h || !container.w || !container.h) return 1;
    const w0 = rot90 ? natural.h : natural.w;
    const h0 = rot90 ? natural.w : natural.h;
    const sx = container.w / w0;
    const sy = container.h / h0;
    return Math.min(sx, sy);
  }, [natural, container, rot90]);

  const totalScale = baseFitScale * scale;

  // Tamaño mostrado
  const displayed = useMemo<Size>(() => {
    const w0 = rot90 ? natural.h : natural.w;
    const h0 = rot90 ? natural.w : natural.h;
    return { w: Math.abs(w0 * totalScale), h: Math.abs(h0 * totalScale) };
  }, [natural, rot90, totalScale]);

  // Clamp pan
  const clampOffset = (x: number, y: number) => {
    const maxX = Math.max(0, (displayed.w - container.w) / 2);
    const maxY = Math.max(0, (displayed.h - container.h) / 2);
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  };

  // Acciones
  const fit = () => { setScale(1); setOffset({ x: 0, y: 0 }); };
  const oneToOne = () => {
    if (!baseFitScale) return;
    setScale(1 / baseFitScale);
    setOffset({ x: 0, y: 0 });
  };
  const resetAll = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setRot(rotate ?? 0);
    setFlipH(false);
    setFlipV(false);
    setInvert(false);
  };

  // Drag pan
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      dragRef.current = { x: e.clientX, y: e.clientY };
      el.style.cursor = "grabbing";
    };
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      dragRef.current = { x: e.clientX, y: e.clientY };
      setOffset((o) => clampOffset(o.x + dx, o.y + dy));
    };
    const onUp = () => { dragRef.current = null; el.style.cursor = "default"; };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed, container]);

  // Zoom (rueda) hasta 20×
  const MIN_Z = 0.1, MAX_Z = 20;
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!container.w || !container.h) return;

      const step = 0.10;
      const dir = e.deltaY > 0 ? -1 : 1;
      const factor = 1 + step * dir;

      setScale((prev) => {
        const nextScale = clamp(prev * factor, MIN_Z, MAX_Z);

        // mantener punto bajo cursor
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - (cx + offset.x);
        const dy = e.clientY - (cy + offset.y);

        const g = nextScale / prev;
        setOffset(clampOffset(offset.x + (1 - g) * dx, offset.y + (1 - g) * dy));
        return nextScale;
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, container, displayed]);

  // Doble click = acercar
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onDbl = (e: MouseEvent) => {
      e.preventDefault();
      setScale((s) => clamp(s * 1.6, MIN_Z, MAX_Z));
    };
    el.addEventListener("dblclick", onDbl);
    return () => el.removeEventListener("dblclick", onDbl);
  }, []);

  // Fullscreen
  useEffect(() => {
    const onFsChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);
  const toggleFullscreen = async () => {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) await el.requestFullscreen();
    else await document.exitFullscreen();
  };

  // Descarga DICOM segura (valida .dcm)
  const ensureDcm = (name: string) => (name?.toLowerCase().endsWith(".dcm") ? name : `${name || "imagen"}.dcm`);
  const triggerDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const canDownloadDicom = Boolean(dicomBlob || dicomUrl || onRequestDicom);
  const downloadDicom = async () => {
    try {
      setDownloading(true);

      // 1) Blob directo
      if (dicomBlob) {
        const ok = await validateDicomBlob(dicomBlob);
        if (!ok) { alert("El blob recibido no parece un DICOM válido."); return; }
        const url = URL.createObjectURL(dicomBlob);
        triggerDownload(url, ensureDcm(downloadFileName));
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        return;
      }

      // 2) Fetch por URL
      if (dicomUrl) {
        const r = await fetch(dicomUrl, { headers: { /* Authorization si aplica */ } });
        if (!r.ok) { alert(`No se pudo descargar DICOM (${r.status}).`); return; }
        const blob = await r.blob();
        const ok = await validateDicomBlob(blob);
        if (!ok) {
          const ct = r.headers.get("content-type") || "";
          const txt = (ct.includes("json") || ct.includes("html")) ? (await r.clone().text()).slice(0, 200) : "";
          console.error("Respuesta no DICOM:", { ct, sample: txt });
          alert("La respuesta no parece un DICOM válido (¿endpoint/ID incorrecto?).");
          return;
        }
        const url = URL.createObjectURL(blob);
        triggerDownload(url, ensureDcm(downloadFileName));
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        return;
      }

      // 3) Fetch on-demand
      if (onRequestDicom) {
        const blob = await onRequestDicom(); // debería venir con application/dicom
        const ok = await validateDicomBlob(blob);
        if (!ok) { alert("El archivo obtenido no es un DICOM válido."); return; }
        const url = URL.createObjectURL(blob);
        triggerDownload(url, ensureDcm(downloadFileName));
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        return;
      }
    } finally {
      setDownloading(false);
    }
  };

  // Transform compuesto
  const scaleX = totalScale * (flipH ? -1 : 1);
  const scaleY = totalScale * (flipV ? -1 : 1);

  
  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
        background: "#000",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Imagen */}
      {src && (
        <img
          ref={imgRef}
          src={src}
          alt="preview"
          onLoad={onImgLoad}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(${offset.x}px, ${offset.y}px) translate(-50%, -50%) rotate(${rot}deg) scale(${scaleX}, ${scaleY})`,
            transformOrigin: "center center",
            width: "auto",
            height: "auto",
            imageRendering: "auto",
            filter: invert ? "invert(1)" : "none",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Overlay externo */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {children}
      </div>

      {/* Toolbar superior izquierda */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          display: "flex",
          gap: 6,
          background: "rgba(0,0,0,0.5)",
          padding: 6,
          borderRadius: 10,
          pointerEvents: "auto",
        }}
      >
        <Btn title="Fit" onClick={fit}>Fit</Btn>
        <Btn title="1:1 (tamaño nativo)" onClick={oneToOne}>1:1</Btn>
        <Btn title="Zoom +" onClick={() => setScale((s) => clamp(s * 1.2, MIN_Z, MAX_Z))}>＋</Btn>
        <Btn title="Zoom −" onClick={() => setScale((s) => clamp(s / 1.2, MIN_Z, MAX_Z))}>－</Btn>
        <Sep />
        <Btn title="Rotar -90°" onClick={() => { setRot((r) => r - 90); setOffset({ x: 0, y: 0 }); }}>↺</Btn>
        <Btn title="Rotar +90°" onClick={() => { setRot((r) => r + 90); setOffset({ x: 0, y: 0 }); }}>↻</Btn>
        <Btn title="Flip Horizontal" onClick={() => setFlipH((v) => !v)}>⇋</Btn>
        <Btn title="Flip Vertical" onClick={() => setFlipV((v) => !v)}>⇵</Btn>
        <Btn title="Invertir" onClick={() => setInvert((v) => !v)}>⊝</Btn>
        <Sep />
        {/* Reset para limpiar warning TS y utilidad real */}
        <Btn title="Reset" onClick={resetAll}>Reset</Btn>
        <Sep />
        {/* Descarga DICOM con ícono; deshabilitado si no hay fuente */}
        <IconBtn
          title={canDownloadDicom ? (downloading ? "Descargando..." : "Descargar DICOM") : "DICOM no disponible"}
          onClick={canDownloadDicom ? downloadDicom : undefined}
          disabled={!canDownloadDicom || downloading}
          ariaLabel="Descargar DICOM"
          svgPath="M12 3v10m0 0l-4-4m4 4l4-4M4 17h16"  // flecha a base
        />
      </div>

      {/* HUD simple (sin mostrar Fit) */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: "6px 10px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.45)",
          color: "#e4e4e7",
          fontSize: 12,
          pointerEvents: "none",
          lineHeight: 1.3,
          textAlign: "right",
        }}
      >
        <div>Zoom: {Math.round(totalScale * 100)}%</div>
        <div>Rot: {((rot % 360) + 360) % 360}°</div>
        {isFs && <div>FS: ON</div>}
      </div>

      {/* Pantalla completa — esquina inferior derecha */}
      <div style={{ position: "absolute", right: 8, bottom: 8, pointerEvents: "auto" }}>
        <IconBtn
          title={isFs ? "Salir pantalla completa (F)" : "Pantalla completa (F)"}
          onClick={toggleFullscreen}
          ariaLabel="Pantalla completa"
          svgPath="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" // esquinas expand
        />
      </div>
    </div>
  );
};

export default ModernViewer;

// === UI helpers ===
const Btn: React.FC<React.PropsWithChildren<{ onClick?: () => void; title?: string }>> = ({ onClick, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      appearance: "none",
      border: "1px solid rgba(255,255,255,0.15)",
      background: "rgba(20,20,20,0.6)",
      color: "#e5e7eb",
      fontSize: 12,
      padding: "6px 8px",
      borderRadius: 8,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const IconBtn: React.FC<{
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  ariaLabel?: string;
  svgPath: string;
}> = ({ onClick, title, disabled, ariaLabel, svgPath }) => (
  <button
    onClick={onClick}
    title={title}
    aria-label={ariaLabel}
    disabled={disabled}
    style={{
      appearance: "none",
      border: "1px solid rgba(255,255,255,0.15)",
      background: disabled ? "rgba(20,20,20,0.3)" : "rgba(20,20,20,0.6)",
      color: "#e5e7eb",
      width: 34,
      height: 34,
      padding: 0,
      borderRadius: 8,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "grid",
      placeItems: "center",
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={svgPath} />
    </svg>
  </button>
);

const Sep: React.FC = () => (
  <div style={{ width: 1, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />
);
