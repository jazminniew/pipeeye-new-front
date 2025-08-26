// src/services/api.ts
import { apiFetch } from "../lib/api";

export type Proyecto = {
  id: number;
  nombre: string;
  empresa: string;
  // agrega otros campos si los usás
};

// Obtiene /proyectos/ usando el token que ya mete apiFetch
export async function getProyectos() {
  return apiFetch<Proyecto[]>("/proyectos/");
}
