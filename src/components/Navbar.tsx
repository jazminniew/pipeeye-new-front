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
          <img src="/img/ICONO.png" alt="" className={styles.logoImg} />
          PipeEye
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

        <div className={styles.porfile}>
          <img src="/img/imgLailla.png" alt="Perfil" />
          <div className={styles.infoPorfile}>
            <p>Laila Dejtiar</p>
            <Link to="/administrar" className={styles.rol}>Administrador</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
