import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router';
import styles from './PlansPage.module.css';

// TODO: 여행 플랜 목록 기능 구현 예정
function PlansPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate(ROUTES.ROOT);
  }

  return (
    <div className={styles.container}>
      <div className={styles.background} />

      <header className={styles.header}>
        <span className={styles.logo}>CO TRIP</span>
        <div className={styles.headerRight}>
          <span className={styles.nickname}>{user?.nickname}님</span>
          <button className={styles.logoutButton} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🗺️</span>
          <h2 className={styles.emptyTitle}>나의 여행 플랜</h2>
          <p className={styles.emptyDescription}>
            아직 여행 플랜이 없습니다. 새로운 플랜을 만들어보세요!
          </p>
          {/* TODO: 플랜 생성 기능 구현 */}
          <button className={styles.createButton}>+ 새 여행 플랜 만들기</button>
        </div>
      </main>
    </div>
  );
}

export default PlansPage;
