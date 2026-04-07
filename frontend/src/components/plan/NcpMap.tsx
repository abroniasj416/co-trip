import { useEffect, useRef, useState, useCallback } from 'react';
import { useNcpMap, LatLng, PoiClickInfo } from '../../hooks/useNcpMap';
import { usePlaces } from '../../context/PlaceContext';
import { PlaceMarkerManager } from './PlaceMarker';
import { RoutePolylineManager } from './RoutePolyline';
import { PlaceStatus } from '../../types/place';
import PlaceInfoPanel from './PlaceInfoPanel';
import styles from './NcpMap.module.css';

const MAP_CONTAINER_ID = 'ncp-map-container';

interface NcpMapProps {
  onPoiAdd: (name: string, latLng: LatLng, status: PlaceStatus) => void;
}

function NcpMap({ onPoiAdd }: NcpMapProps) {
  const { places, confirmedPlaces, selectedPlaceId, selectPlace } = usePlaces();
  const markerManagerRef = useRef<PlaceMarkerManager | null>(null);
  const routeManagerRef = useRef<RoutePolylineManager | null>(null);
  const [activePoi, setActivePoi] = useState<PoiClickInfo | null>(null);

  const handlePoiClick = useCallback((poi: PoiClickInfo) => {
    setActivePoi(poi);
  }, []);

  const { status, mapRef } = useNcpMap(MAP_CONTAINER_ID, undefined, handlePoiClick);

  // 지도 준비 시 매니저 초기화
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return;
    if (!markerManagerRef.current) {
      markerManagerRef.current = new PlaceMarkerManager(mapRef.current);
    }
    if (!routeManagerRef.current) {
      routeManagerRef.current = new RoutePolylineManager(mapRef.current);
    }
  }, [status, mapRef]);

  // 장소 목록 변경 시 마커 동기화 (확정 순서 번호 전달)
  useEffect(() => {
    if (!markerManagerRef.current) return;
    const confirmedOrder = new Map<number, number>();
    confirmedPlaces.forEach((p, i) => confirmedOrder.set(p.id, i + 1));

    markerManagerRef.current.sync(places, selectedPlaceId, (place) => {
      selectPlace(place.id);
    }, confirmedOrder);
  }, [places, selectedPlaceId, selectPlace, confirmedPlaces]);

  // 확정 장소 변경 시 구간별 경로 업데이트
  useEffect(() => {
    const manager = routeManagerRef.current;
    if (!manager) return;

    if (confirmedPlaces.length < 2) {
      manager.clear();
      return;
    }

    manager.update(confirmedPlaces);
  }, [confirmedPlaces]);

  function handlePoiAdd(name: string, latLng: LatLng, placeStatus: PlaceStatus) {
    onPoiAdd(name, latLng, placeStatus);
    setActivePoi(null);
  }

  return (
    <div className={styles.wrapper}>
      {status === 'error' && (
        <div className={styles.overlay}>
          <span className={styles.overlayIcon}>🗺️</span>
          <p className={styles.overlayText}>지도를 불러올 수 없습니다.</p>
          <p className={styles.overlaySubText}>
            .env 파일에 <code>VITE_NCP_MAP_CLIENT_ID</code>를 설정해주세요.
          </p>
        </div>
      )}
      {status === 'loading' && (
        <div className={styles.overlay}>
          <div className={styles.spinner} />
          <p className={styles.overlayText}>지도 로딩 중...</p>
        </div>
      )}

      <div
        id={MAP_CONTAINER_ID}
        className={styles.mapContainer}
        style={{ visibility: status === 'ready' ? 'visible' : 'hidden' }}
      />

      {activePoi && (
        <PlaceInfoPanel
          poi={activePoi}
          onAdd={handlePoiAdd}
          onClose={() => setActivePoi(null)}
        />
      )}
    </div>
  );
}

export default NcpMap;
