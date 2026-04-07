import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlaceProvider, usePlaces } from '../context/PlaceContext';
import { planApi, PlanResponse } from '../api/plan';
import { placeApi } from '../api/place';
import { usePlanWebSocket, CollaborationMessage } from '../hooks/usePlanWebSocket';
import { LatLng } from '../hooks/useNcpMap';
import { Place, PlaceStatus } from '../types/place';
import NcpMap from '../components/plan/NcpMap';
import ShareUrl from '../components/plan/ShareUrl';
import PlacePanel from '../components/plan/PlacePanel';
import { ROUTES } from '../router';
import styles from './PlanDetailPage.module.css';

/** PlaceContext를 소비하는 실제 페이지 내용 */
function PlanDetailContent({ plan }: { plan: PlanResponse }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setPlaces, addPlace, updatePlaceStatus, updatePlaceMemo, updatePlaceOrder, removePlace, confirmedPlaces } = usePlaces();

  const token = localStorage.getItem('accessToken');

  // ── 초기 장소 목록 로드 ──────────────────────────────
  useEffect(() => {
    placeApi.getPlaces(plan.planId).then(({ data }) => setPlaces(data.data));
  }, [plan.planId, setPlaces]);

  // ── WebSocket 메시지 처리 ────────────────────────────
  // WebSocket으로 수신된 메시지는 다른 사용자의 변경만 처리
  // (자기 자신의 변경은 API 응답으로 이미 로컬 반영됨)
  const onMessage = useCallback((msg: CollaborationMessage) => {
    if (msg.senderNickname === user?.nickname) return;
    const p = msg.payload;

    switch (msg.type) {
      case 'PLACE_ADDED':
        addPlace(p.place as Place);
        break;
      case 'PLACE_DELETED':
        removePlace(p.placeId as number);
        break;
      case 'PLACE_STATUS_CHANGED':
        updatePlaceStatus(p.placeId as number, p.status as PlaceStatus);
        break;
      case 'MEMO_UPDATED':
        updatePlaceMemo(p.placeId as number, p.memo as string);
        break;
      case 'PLACE_ORDER_CHANGED':
        updatePlaceOrder(p.placeId as number, p.order as number);
        break;
    }
  }, [user?.nickname, addPlace, removePlace, updatePlaceStatus, updatePlaceMemo, updatePlaceOrder]);

  usePlanWebSocket({ planId: plan.planId, token, onMessage });

  // ── 지도/POI 클릭 → 바로 장소 추가 (후보/확정 선택) ──────
  async function handlePoiAdd(name: string, latLng: LatLng, status: PlaceStatus) {
    const { data } = await placeApi.addPlace(plan.planId, {
      name,
      latitude: latLng.lat,
      longitude: latLng.lng,
      status,
    });
    addPlace(data.data);
  }

  // ── 상태 변경 ────────────────────────────────────────
  async function handleStatusChange(placeId: number, status: PlaceStatus) {
    const { data } = await placeApi.updateStatus(plan.planId, placeId, status);
    updatePlaceStatus(data.data.id, data.data.status);
  }

  // ── 메모 변경 ────────────────────────────────────────
  async function handleMemoChange(placeId: number, memo: string) {
    const { data } = await placeApi.updateMemo(plan.planId, placeId, memo);
    updatePlaceMemo(data.data.id, data.data.memo ?? '');
  }

  // ── 순서 변경 ────────────────────────────────────────
  async function handleReorder(placeId: number, direction: 'up' | 'down') {
    const sorted = [...confirmedPlaces].sort((a, b) => a.placeOrder - b.placeOrder);
    const idx = sorted.findIndex((p) => p.id === placeId);
    if (idx < 0) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const current = sorted[idx];
    const target = sorted[swapIdx];

    // 두 장소의 order를 교환
    await Promise.all([
      placeApi.updateOrder(plan.planId, current.id, target.placeOrder),
      placeApi.updateOrder(plan.planId, target.id, current.placeOrder),
    ]);
    updatePlaceOrder(current.id, target.placeOrder);
    updatePlaceOrder(target.id, current.placeOrder);
  }

  // ── 장소 삭제 ────────────────────────────────────────
  async function handleDelete(placeId: number) {
    await placeApi.deletePlace(plan.planId, placeId);
    removePlace(placeId);
  }

  async function handleLogout() {
    await logout();
    navigate(ROUTES.ROOT);
  }

  return (
    <div className={styles.container}>
      <div className={styles.background} />

      <header className={styles.header}>
        <button className={styles.logoButton} onClick={() => navigate(ROUTES.PLANS)}>
          CO TRIP
        </button>
        <h1 className={styles.planTitle}>{plan.title}</h1>
        <div className={styles.headerRight}>
          <span className={styles.nickname}>{user?.nickname}님</span>
          <button className={styles.logoutButton} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        <section className={styles.mapSection}>
          <NcpMap onPoiAdd={handlePoiAdd} />
        </section>

        <aside className={styles.sidePanel}>
          <ShareUrl planId={plan.planId} />

          <div className={styles.planInfo}>
            <span className={styles.infoLabel}>만든 사람</span>
            <span className={styles.infoValue}>{plan.ownerNickname}</span>
          </div>

          <div className={styles.sectionBox}>
            <h3 className={styles.sectionTitle}>📍 장소 목록</h3>
            <PlacePanel
              planId={plan.planId}
              onStatusChange={handleStatusChange}
              onMemoChange={handleMemoChange}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
          </div>
        </aside>
      </div>

    </div>
  );
}

/** 로딩/에러/정상 분기 + PlaceProvider 래핑 */
function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!planId) return;
    planApi.getPlan(planId)
      .then(({ data }) => setPlan(data.data))
      .catch(() => setError('플랜을 찾을 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) return (
    <div className={styles.fullCenter}>
      <div className={styles.background} />
      <div className={styles.spinner} />
    </div>
  );

  if (error || !plan) return (
    <div className={styles.fullCenter}>
      <div className={styles.background} />
      <p className={styles.errorText}>{error || '플랜을 찾을 수 없습니다.'}</p>
      <button className={styles.backButton} onClick={() => navigate(ROUTES.PLANS)}>
        목록으로 돌아가기
      </button>
    </div>
  );

  return (
    <PlaceProvider>
      <PlanDetailContent plan={plan} />
    </PlaceProvider>
  );
}

export default PlanDetailPage;
