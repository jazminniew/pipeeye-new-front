// src/pages/Administrar.tsx
import styles from "../styles/Administrar.module.css";
import TablaAdmin from "../components/UserRolesTable";
import Navbar from '@/components/Navbar';

export default function Administrar() {
  return (
        <>
     <Navbar />
    <div className={styles.page}>
      <TablaAdmin />
    </div>
    </>
  );
}

