import type { Usuario, RolDeUsuario } from '@/types/users';

export interface UserService {
  fetchUsuarios(): Promise<Usuario[]>;
  updateRolUsuario(id: string, nuevoRol: RolDeUsuario): Promise<Usuario>;
}

/** 
 * Exportá un "service" por defecto. 
 * Hoy apunta al mock. Mañana lo cambiás por la implementación real.
 */
export let userService: UserService;

/** Permite swappear fácil la implementación (mock ↔ backend). */
export function setUserService(impl: UserService) {
  userService = impl;
}
