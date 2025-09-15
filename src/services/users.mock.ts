import type { Usuario, RolDeUsuario } from '@/types/users';
import type { UserService } from './userService';

let USERS_DB: Usuario[] = [
  { id: 'u1', username: 'Jazmin Niewiadomski', rol: 'empleado_a' },
  { id: 'u2', username: 'Laila Dejtiar',  rol: 'empleado_b' },
  { id: 'u3', username: 'Tomas Hauser',     rol: 'admin' },
  { id: 'u4', username: 'Matias Grynfeld',      rol: 'cliente' },
  { id: 'u5', username: 'Gabriel Slotnisky',      rol: 'cliente' },
];

export const mockUserService: UserService = {
  async fetchUsuarios() {
    await new Promise((r) => setTimeout(r, 200));
    return structuredClone(USERS_DB);
  },
  async updateRolUsuario(id, nuevoRol) {
    await new Promise((r) => setTimeout(r, 150));
    const idx = USERS_DB.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');
    USERS_DB[idx] = { ...USERS_DB[idx], rol: nuevoRol as RolDeUsuario };
    return structuredClone(USERS_DB[idx]);
  },
};
