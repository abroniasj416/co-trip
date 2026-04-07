import { Place } from '../../types/place';

const COLORS = {
  CANDIDATE: '#f59e0b',   // 노란색 — 후보
  CONFIRMED: '#3b82f6',   // 파란색 — 확정
  SELECTED: '#ef4444',    // 빨간색 — 선택됨
} as const;

/**
 * 지도에 Place 마커를 그리고 관리하는 유틸리티 클래스
 * NcpMap 컴포넌트에서 사용하며, 마커 인스턴스를 Map으로 관리
 */
export class PlaceMarkerManager {
  private map: naver.maps.Map;
  private markers: Map<number, naver.maps.Marker> = new Map();

  constructor(map: naver.maps.Map) {
    this.map = map;
  }

  /**
   * 장소 목록 전체를 지도에 동기화
   * 없어진 마커는 제거, 새 마커는 추가, 상태 변경된 마커는 아이콘 갱신
   * confirmedOrder: 확정 장소의 id → 확정 순서 번호 (1-based)
   */
  sync(
    places: Place[],
    selectedId: number | null,
    onClick: (place: Place) => void,
    confirmedOrder: Map<number, number> = new Map(),
  ) {
    const currentIds = new Set(places.map((p) => p.id));

    // 제거된 장소 마커 삭제
    this.markers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.setMap(null);
        this.markers.delete(id);
      }
    });

    // 추가/갱신
    places.forEach((place) => {
      const isSelected = place.id === selectedId;
      const orderNum = confirmedOrder.get(place.id) ?? null;
      const icon = this.buildIcon(place, isSelected, orderNum);

      if (this.markers.has(place.id)) {
        this.markers.get(place.id)!.setIcon(icon);
      } else {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(place.latitude, place.longitude),
          map: this.map,
          icon,
          title: place.name,
        });
        naver.maps.Event.addListener(marker, 'click', () => onClick(place));
        this.markers.set(place.id, marker);
      }
    });
  }

  panTo(place: Place) {
    this.map.panTo(new naver.maps.LatLng(place.latitude, place.longitude));
  }

  removeAll() {
    this.markers.forEach((m) => m.setMap(null));
    this.markers.clear();
  }

  private buildIcon(place: Place, isSelected: boolean, orderNum: number | null) {
    const color = isSelected ? COLORS.SELECTED : COLORS[place.status];
    const size = isSelected ? 36 : 30;
    const order = orderNum != null ? `<text x="12" y="16" font-size="10" fill="white" text-anchor="middle" font-weight="bold">${orderNum}</text>` : '';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 24 32">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        ${order}
        <path d="M12 22 L8 28 L12 26 L16 28 Z" fill="${color}"/>
      </svg>`.trim();

    return {
      content: `<div style="cursor:pointer">${svg}</div>`,
      anchor: new naver.maps.LatLng(0, 0),
      size: new (naver.maps as unknown as { Size: new (w: number, h: number) => object }).Size(size, size + 8),
    };
  }
}
