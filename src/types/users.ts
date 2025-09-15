export type RolDeUsuario = 'admin' | 'empleado_a' | 'empleado_b' | 'cliente';

export interface Usuario {
  id: string;
  username: string;
  rol: RolDeUsuario;
}
