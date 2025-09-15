import { setUserService } from './userService';
import { mockUserService } from './users.mock';

// HOY usamos el mock (mañana lo reemplazás por apiUserService)
setUserService(mockUserService);

export * from './userService';
