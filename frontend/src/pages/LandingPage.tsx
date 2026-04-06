import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { ROUTES } from '../router';
import { LANDING } from '../constants/ui';
import styles from './LandingPage.module.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.background} />

      <header className={styles.header}>
        <span className={styles.logo}>{LANDING.SERVICE_NAME}</span>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.headline}>
            <span className={styles.headlineTop}>{LANDING.HEADLINE}</span>
            <span className={styles.serviceName}>{LANDING.SERVICE_NAME}</span>
          </h1>

          <p className={styles.subtitle}>{LANDING.SUBTITLE}</p>
          <p className={styles.description}>{LANDING.DESCRIPTION}</p>

          <div className={styles.actions}>
            <Button
              label={LANDING.LOGIN_BUTTON}
              variant="primary"
              size="lg"
              onClick={() => navigate(ROUTES.LOGIN)}
            />
            <Button
              label={LANDING.SIGN_UP_BUTTON}
              variant="outline"
              size="lg"
              onClick={() => navigate(ROUTES.SIGN_UP)}
            />
          </div>
        </section>

        <section className={styles.features}>
          {LANDING.FEATURES.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{feature.icon}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
