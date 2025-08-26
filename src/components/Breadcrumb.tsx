import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Breadcrumb.module.css';


interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav
      className={styles.breadcrumb}
      aria-label="Breadcrumb"
      style={{ margin: '40px 0 20px 140px' }} 
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.to ? (
            <Link to={item.to} className={styles.link}>
              {item.label}
            </Link>
          ) : (
            <span className={styles.current}>{item.label}</span>
          )}
          {index < items.length - 1 && <span className={styles.separator}>/</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
