import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/api";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username || !password) {
      setErrorMsg("Completá usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const body = new URLSearchParams();
      body.append("grant_type", "password");
      body.append("username", username);
      body.append("password", password);

      const res = await fetch(`${API_URL}/login/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!res.ok) {
        const txt = await res.text();
        try {
          const j = JSON.parse(txt);
          setErrorMsg(j.detail || "Error de autenticación.");
        } catch {
          setErrorMsg(txt || "Error de autenticación.");
        }
        return;
      }

      const data = await res.json(); // { access_token, token_type }
      if (!data?.access_token) {
        setErrorMsg("El servidor no devolvió el token.");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type || "bearer");

      navigate("/dashboard");
    } catch {
      setErrorMsg("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Glass + borde MUY sutil gris oscuro */}
      <Card className="bg-black/30 backdrop-blur-3xl backdrop-saturate-150 border border-white/30 text-white shadow-[0_18px_48px_-12px_rgba(0,0,0,0.55)]">
        <CardHeader>
          <CardTitle className="text-white">Inicia sesión en tu cuenta</CardTitle>
          <CardDescription className="text-white/70">
            Ingrese sus datos abajo para iniciar sesión.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username" className="text-white/90">
                  Nombre de usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="user123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white/10 border-white/15 text-white placeholder:text-white/60 focus-visible:border-[#66b2ff]/60 focus-visible:ring-[#66b2ff]/40"
                  autoComplete="username"
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-white/90">
                    Contraseña
                  </Label>
                  <a
                    href="#"
                    className="ml-auto text-sm text-[#66b2ff] hover:text-[#8cc7ff] underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/15 text-white placeholder:text-white/60 focus-visible:border-[#66b2ff]/60 focus-visible:ring-[#66b2ff]/40"
                  autoComplete="current-password"
                />
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                >
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#007bff] cursor-pointer hover:bg-[#006ae0] text-white border-0 shadow-lg shadow-[#001a33]/30 focus-visible:ring-[#66b2ff]/40 disabled:opacity-60"
                >
                  {loading ? "Ingresando..." : "Continuar"}
                </Button>
              </div>

              <div className="mt-2 text-center text-sm text-white/80">
                ¿No tienes una cuenta?{" "}
                <a
                  href="#"
                  className="text-[#66b2ff] hover:text-[#8cc7ff] underline underline-offset-4"
                >
                  Solicitá acceso
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
