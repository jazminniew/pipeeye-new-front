// src/pages/Login.tsx
import DarkVeil from '../blocks/DarkVeil/DarkVeil';
import { LoginForm } from '../components/login-form';

export default function Login() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      {/* Fondo animado (no bloquea clics) */}
      <div className="absolute inset-0 -z-0 pointer-events-none">
        <DarkVeil />
      </div>


      {/* Imagotipo arriba a la derecha */}
      <img
        src="/IMAGOTIPO.png"      
        alt="Imagotipo PipeEye"
        className="absolute top-4 right-4 z-10 w-24 sm:w-28 md:w-28 h-auto select-none pointer-events-none drop-shadow-lg"
      />

      {/* Contenido centrado (no tocamos el diseño del form) */}
      <main className="grid min-h-screen place-items-center p-4 sm:p-6">
        <div className="w-full max-w-[480px]">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
