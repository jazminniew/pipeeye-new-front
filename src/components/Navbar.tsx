// src/components/Topbar.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Navbar.module.css";
import PrincipalButton from "@/components/SubirImgBtn";
import { Icon } from "@iconify/react";
// import { getUsuarioById, resolveUserIdByTypedUsername, type Usuario } from "@/services/api";
import { getUsuarioById, type Usuario } from "@/services/api";


const Navbar: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [err, setErr] = useState<string | null>(null);
useEffect(() => {
  (async () => {
    try {
      const raw = localStorage.getItem("user_id");
      const id = raw && /^\d+$/.test(raw) ? Number(raw) : null;
      if (!id) { setErr("No se pudo obtener el usuario actual"); return; }

      const me = await getUsuarioById(id); // /usuarios/{id}
      setUsuario(me);

      // sync LS por si acaso
      localStorage.setItem("user_nombre", me.nombre || "");
      localStorage.setItem("user_apellido", me.apellido || "");
      localStorage.setItem("user_mail", me.mail || "");
    } catch (e: any) {
      if (e?.message === "UNAUTHORIZED") { window.location.href = "/login"; return; }
      console.error("Topbar user error:", e);
      setErr("Error cargando usuario");
    }
  })();
}, []);



  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/dashboard" className={styles.nombreLogo}>
          <img src="/img/ICONO.png" alt="Ícono PipeEye" className={styles.logoImg} />
          <img src="/img/IMAGOTIPO.png" alt="PipeEye" className={styles.logoTextImg} />
        </Link>
      </div>

      <div className={styles.derecha}>
        <div className={styles.botones}>
          <div className={styles.botonWrapper}><PrincipalButton /></div>
          <Link to="/history" className={styles.historialLink}>
            <Icon icon="mdi:history" width="20" height="20" />
            <span>Historial</span>
          </Link>
        </div>

        <Link to="/administrar" className={styles.profileLink} aria-label="Abrir panel de administración">
          <img src="/img/imgLailla.png" alt="Foto de perfil" className={styles.profileAvatar} />
          <div className={styles.profileInfo}>
<p className={styles.profileName}>
  {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Cargando..."}
</p>


            {err && <span className={styles.error}>{err}</span>}
            <span className={styles.srOnly}>Administrador</span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
