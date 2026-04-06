import { useEffect, useRef } from 'react';
import { useNcpMap, LatLng } from '../../hooks/useNcpMap';
import { usePlaces } from '../../context/PlaceContext';
import { PlaceMarkerManager } from './PlaceMarker';
import { RoutePolylineManager } from './RoutePolyline';
import styles from './NcpMap.module.css';

const MAP_CONTAINER_ID = 'ncp-map-container';

interface NcpMapProps {
  onMapClick: (latLng: LatLng) => void;
}

function NcpMap({ onMapClick }: NcpMapProps) {
  const { places, confirmedPlaces, selectedPlaceId, selectPlace } = usePlaces();
  const markerManagerRef = useRef<PlaceMarkerManager | null>(null);
  const routeManagerRef = useRef<RoutePolylineManager | null>(null);

  const { status, mapRef } = useNcpMap(MAP_CONTAINER_ID, onMapClick);

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

  // 장소 목록 변경 시 마커 동기화
  useEffect(() => {
    if (!markerManagerRef.current) return;
    markerManagerRef.current.sync(places, selectedPlaceId, (place) => {
      selectPlace(place.id);
    });
  }, [places, selectedPlaceId, selectPlace]);

  // 확정 장소 변경 시 경로 다시 그리기
  useEffect(() => {
    if (!routeManagerRef.current) return;
    routeManagerRef.current.draw(confirmedPlaces);
  }, [confirmedPlaces]);

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
    </div>
  );
}

export default NcpMap;
