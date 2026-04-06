import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { planApi, PlanSummaryResponse } from '../api/plan';
import CreatePlanModal from '../components/plan/CreatePlanModal';
import { ROUTES } from '../router';
import styles from './PlansPage.module.css';

function PlansPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<PlanSummaryResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    planApi.getMyPlans().then(({ data }) => setPlans(data.data));
  }, []);

  async function handleCreatePlan(title: string) {
    setCreating(true);
    try {
      const { data } = await planApi.createPlan({ title });
      navigate(ROUTES.PLAN_DETAIL(data.data.planId));
    } finally {
      setCreating(false);
      setShowModal(false);
    }
  }

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
        {plans.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🗺️</span>
            <h2 className={styles.emptyTitle}>나의 여행 플랜</h2>
            <p className={styles.emptyDescription}>
              아직 여행 플랜이 없습니다. 새로운 플랜을 만들어보세요!
            </p>
            <button className={styles.createButton} onClick={() => setShowModal(true)}>
              + 새 여행 플랜 만들기
            </button>
          </div>
        ) : (
          <div className={styles.plansLayout}>
            <div className={styles.plansHeader}>
              <h2 className={styles.plansTitle}>나의 여행 플랜</h2>
              <button className={styles.createButton} onClick={() => setShowModal(true)}>
                + 새 플랜
              </button>
            </div>
            <div className={styles.planGrid}>
              {plans.map((plan) => (
                <div
                  key={plan.planId}
                  className={styles.planCard}
                  onClick={() => navigate(ROUTES.PLAN_DETAIL(plan.planId))}
                >
                  <span className={styles.cardIcon}>✈️</span>
                  <h3 className={styles.cardTitle}>{plan.title}</h3>
                  <p className={styles.cardDate}>
                    {new Date(plan.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <CreatePlanModal
          onConfirm={handleCreatePlan}
          onCancel={() => setShowModal(false)}
          loading={creating}
        />
      )}
    </div>
  );
}

export default PlansPage;
