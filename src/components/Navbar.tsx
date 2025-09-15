// src/components/Topbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import PrincipalButton from '@/components/SubirImgBtn';
import { Icon } from '@iconify/react';

const Navbar: React.FC = () => {
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
          <div className={styles.botonWrapper}>
            <PrincipalButton />
          </div>
          <Link to="/history" className={styles.historialLink}>
            <Icon icon="mdi:history" width="20" height="20" />
            <span>Historial</span>
          </Link>
        </div>

        {/* PERFIL → link completo clickeable */}
        <Link
          to="/administrar"
          className={styles.profileLink}
          aria-label="Abrir panel de administración"
          title="Administrador"
        >
          <img src="/img/imgLailla.png" alt="Foto de perfil" className={styles.profileAvatar} />
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>Laila Dejtiar</p>
            {/* Texto solo para lectores de pantalla (no visible) */}
            <span className={styles.srOnly}>Administrador</span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
