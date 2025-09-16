// src/components/ModernViewer.tsx
import React, { useEffect, useRef, useState } from "react";

type Props = {
  src?: string;                // dataURL actual de tus previews
  className?: string;          // p/ reutilizar tu .imageViewer
  rotate?: number;             // por defecto -90 como tenías
  children?: React.ReactNode;  // marcadores que vos renders desde afuera
};

const ModernViewer: React.FC<Props> = ({ src, className, rotate = -90, children }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  console.log('[ModernViewer] src:', src ? src.slice(0, 80) : src);


  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);

  // zoom con rueda
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      const step = reduce ? 0.05 : 0.12;

      setScale((prev) => {
        const next = e.deltaY > 0 ? prev * (1 - step) : prev * (1 + step);
        return Math.max(0.25, Math.min(next, 6));
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // pan con drag
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onDown = (e: MouseEvent) => {
      e.preventDefault();
      setDrag({ x: e.clientX, y: e.clientY });
      el.style.cursor = "grabbing";
    };
    const onMove = (e: MouseEvent) => {
      if (!drag) return;
      setOffset((o) => ({ x: o.x + (e.clientX - drag.x), y: o.y + (e.clientY - drag.y) }));
      setDrag({ x: e.clientX, y: e.clientY });
    };
    const onUp = () => {
      setDrag(null);
      el.style.cursor = "default";
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag]);

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
      {/* IMG centrada con transform (igual que antes pero con pan/zoom) */}
      {src && (
        <img
          ref={imgRef}
          src={src}
          alt="preview"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotate}deg) scale(${scale})`,
            transformOrigin: "center center",
            height: "100%",
            width: "auto",
            willChange: "transform",
            pointerEvents: "none",
          }}

          onLoad={(e) => {
    const t = e.currentTarget;
    console.log('[ModernViewer] onLoad natural:', t.naturalWidth, t.naturalHeight);
  }}
  onError={(e) => {
    console.error('[ModernViewer] onError IMG. src=', (e.currentTarget as HTMLImageElement).src);
  }}
        />
      )}

      {/* Capa para tus marcadores (vos los pasás como children) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {children}
      </div>

      {/* Overlay simple (WW/WL/Zoom — ahora sólo mostramos Zoom real) */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 10,
          padding: "6px 10px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.45)",
          color: "#e4e4e7",
          fontSize: 12,
          pointerEvents: "none",
        }}
      >
        <div>Zoom: {Math.round(scale * 100)}%</div>
      </div>
    </div>
  );
};

export default ModernViewer;
