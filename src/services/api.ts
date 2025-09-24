// src/services/api.ts
import { apiFetch } from "../lib/api";

/* ====================== CONFIG & HELPERS ====================== */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8000";

export function getToken(): string {
  return localStorage.getItem("access_token") || localStorage.getItem("token") || "";
}

async function fetchJSON(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function parseJwt(token?: string): any | null {
  try {
    if (!token) return null;
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch { return null; }
}

/** Extrae un ID numérico desde el JWT (claims típicos: user_id | id | sub-numérico). */
export function getUserIdFromToken(): number | null {
  const p = parseJwt(getToken());
  const raw = p?.user_id ?? p?.id ?? p?.sub; // sub podría ser numérico
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && /^\d+$/.test(raw)) return Number(raw);
  return null;
}

function normalizeUsuario(raw: any): Usuario {
  return {
    id: Number(raw?.id),
    username: String(raw?.username ?? "").trim(),
    nombre: String(raw?.nombre ?? "").trim(),
    apellido: String(raw?.apellido ?? "").trim(),
    mail: String(raw?.mail ?? "").trim(),
    empresa: String(raw?.empresa ?? "").trim(),
    jerarquia: String(raw?.jerarquia ?? "").trim(),
  };
}

/* ====================== TIPOS ====================== */

export type Proyecto = {
  id: number | string;
  nombre: string;
  empresa: string;
  fechaISO?: string;
  status?: "analizado" | "en_proceso" | "pendiente" | "error";
};

export type Radiografia = {
  id: string | number;
  nombre: string; // mapeado desde original_title
  estado?: string;
  fechaISO?: string;
  task_id?: number;
  signed_url?: string;
};

export type Usuario = {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  mail: string;
  empresa: string;
  jerarquia: string;
};

export type EmpresaAgrupada = { nombre: string; cantidad: number };

/* ====================== PROYECTOS ====================== */

export async function getProyectos(): Promise<Proyecto[]> {
  return apiFetch<Proyecto[]>("/proyectos/");
}

export function agruparEmpresas(proyectos: Proyecto[]): EmpresaAgrupada[] {
  const mapa = new Map<string, number>();
  for (const p of proyectos) {
    const k = (p.empresa || "").trim();
    if (k) mapa.set(k, (mapa.get(k) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getEmpresasDesdeProyectos(): Promise<EmpresaAgrupada[]> {
  const proyectos = await getProyectos();
  return agruparEmpresas(proyectos);
}

export async function getProyectosDeEmpresa(empresa: string): Promise<Proyecto[]> {
  const proyectos = await getProyectos();
  const e = empresa.trim();
  return proyectos.filter((p) => (p.empresa || "").trim() === e);
}

export async function createProyecto(payload: { nombre: string; empresa: string }): Promise<Proyecto> {
  return apiFetch<Proyecto>("/proyecto/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getProyectoById(id: string | number): Promise<Proyecto> {
  return apiFetch<Proyecto>(`/proyecto/${encodeURIComponent(String(id))}`);
}

/* ====================== RADIOGRAFÍAS ====================== */

export async function getRadiografiasByProyecto(proyectoId: string | number): Promise<Radiografia[]> {
  const token = getToken();
  const url = `${API_BASE}/proyecto-detail/${encodeURIComponent(String(proyectoId))}`;
  const data = await fetchJSON(url, {
    method: "GET",
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
  });
  return (data?.imagenes ?? []).map((img: any) => ({
    id: img.id,
    nombre: img.original_title ?? `Radiografía ${img.id}`,
    estado: "pendiente",
    fechaISO: undefined,
    task_id: img.task_id,
    signed_url: img.signed_url,
  }));
}

/* ====================== USUARIOS ====================== */

/** GET /usuarios/{usuario_id} (tu back): devuelve nombre/apellido formales. */
export async function getUsuarioById(id: number | string): Promise<Usuario> {
  const u = await fetchJSON(`${API_BASE}/usuarios/${encodeURIComponent(String(id))}`, {
    headers: { accept: "application/json", Authorization: `Bearer ${getToken()}` },
  });
  return normalizeUsuario(u);
}

/** “Mi usuario” sin listar, sin /me, y SIN caer al username:
 *  1) ID numérico desde JWT -> /usuarios/{id}
 *  2) Fallback: user_id del localStorage -> /usuarios/{id}
 *  3) Si nada, devuelve null (para que la UI muestre “Cargando…” o placeholder formal).
 */
export async function getMePreferToken(): Promise<Usuario | null> {
  // 1) ID desde el token
  const idFromToken = getUserIdFromToken();
  if (idFromToken != null) {
    try {
      return await getUsuarioById(idFromToken);
    } catch {
      // sigue
    }
  }

  // 2) Fallback: id cacheado
  const stored = localStorage.getItem("user_id");
  if (stored && /^\d+$/.test(stored)) {
    try {
      return await getUsuarioById(Number(stored));
    } catch {
      // sigue
    }
  }

  // 3) Nada: devolvé null (NO mostramos username)
  return null;
}
