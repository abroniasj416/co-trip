import { useEffect, useState } from 'react';
import { LatLng, PoiClickInfo } from '../../hooks/useNcpMap';
import { fetchNearbyPlace, NearbyPlaceInfo } from '../../api/nearbyPlace';
import { PlaceStatus } from '../../types/place';
import styles from './PlaceInfoPanel.module.css';

interface PlaceInfoPanelProps {
  poi: PoiClickInfo;
  onAdd: (name: string, latLng: LatLng, status: PlaceStatus) => void;
  onClose: () => void;
}

function PlaceInfoPanel({ poi, onAdd, onClose }: PlaceInfoPanelProps) {
  const [place, setPlace] = useState<NearbyPlaceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setPlace(null);
    fetchNearbyPlace(poi.latLng.lat, poi.latLng.lng).then((result) => {
      setPlace(result);
      setLoading(false);
    });
  }, [poi.latLng.lat, poi.latLng.lng]);

  // 표시 이름: API 장소명 > 지도 POI명 > 좌표
  const displayName = place?.name || poi.name || `${poi.latLng.lat.toFixed(5)}, ${poi.latLng.lng.toFixed(5)}`;
  const addName = place?.name || poi.name || '선택한 위치';

  return (
    <div className={styles.panel}>
      <button className={styles.closeButton} onClick={onClose}>×</button>

      <div className={styles.header}>
        <h3 className={styles.name}>
          {loading ? '장소 검색 중...' : displayName}
        </h3>
        {!loading && place?.category && (
          <span className={styles.category}>{place.category}</span>
        )}
      </div>

      <div className={styles.info}>
        {loading ? (
          <p className={styles.loadingText}>주변 장소 정보를 불러오는 중...</p>
        ) : place ? (
          <>
            <p className={styles.address}>
              {place.roadAddress || place.address}
            </p>
            {place.telephone && (
              <p className={styles.telephone}>{place.telephone}</p>
            )}
          </>
        ) : (
          <p className={styles.coords}>
            {poi.latLng.lat.toFixed(5)}, {poi.latLng.lng.toFixed(5)}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.candidateButton}
          onClick={() => onAdd(addName, poi.latLng, 'CANDIDATE')}
          disabled={loading}
        >
          후보
        </button>
        <button
          className={styles.confirmButton}
          onClick={() => onAdd(addName, poi.latLng, 'CONFIRMED')}
          disabled={loading}
        >
          확정
        </button>
      </div>
    </div>
  );
}

export default PlaceInfoPanel;
