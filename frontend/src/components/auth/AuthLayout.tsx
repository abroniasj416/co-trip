import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../router';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.background} />

      <header className={styles.header}>
        <button className={styles.logo} onClick={() => navigate(ROUTES.ROOT)}>
          CO TRIP
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          {children}

          <div className={styles.footer}>{footer}</div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
