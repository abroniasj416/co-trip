import { Place } from '../../types/place';
import { getDirections } from '../../api/directions';

/**
 * 확정 장소들 사이의 구간별 경로를 관리.
 * 구간 키("fromId→toId") 단위로 캐시하여, 새 장소가 추가되어도
 * 기존 구간의 경로는 그대로 유지됩니다.
 */
export class RoutePolylineManager {
  private map: naver.maps.Map;
  /** 구간 키 → { polyline, path } */
  private segments: Map<string, {
    polyline: naver.maps.Polyline;
    path: naver.maps.LatLng[];
  }> = new Map();

  constructor(map: naver.maps.Map) {
    this.map = map;
  }

  /**
   * 확정 장소 목록이 변경될 때마다 호출.
   * 기존 구간은 유지하고, 새 구간만 Directions API 호출.
   */
  async update(confirmedPlaces: Place[]) {
    // 새로 필요한 구간 키 목록
    const neededKeys = new Set<string>();
    for (let i = 0; i < confirmedPlaces.length - 1; i++) {
      neededKeys.add(this.segmentKey(confirmedPlaces[i], confirmedPlaces[i + 1]));
    }

    // 더 이상 필요 없는 구간 제거
    this.segments.forEach((seg, key) => {
      if (!neededKeys.has(key)) {
        seg.polyline.setMap(null);
        this.segments.delete(key);
      }
    });

    // 새 구간만 API 호출
    const promises: Promise<void>[] = [];
    for (let i = 0; i < confirmedPlaces.length - 1; i++) {
      const from = confirmedPlaces[i];
      const to = confirmedPlaces[i + 1];
      const key = this.segmentKey(from, to);

      if (!this.segments.has(key)) {
        promises.push(this.fetchAndDrawSegment(key, from, to));
      }
    }

    await Promise.all(promises);
  }

  clear() {
    this.segments.forEach((seg) => seg.polyline.setMap(null));
    this.segments.clear();
  }

  private segmentKey(from: Place, to: Place): string {
    return `${from.id}→${to.id}`;
  }

  private async fetchAndDrawSegment(key: string, from: Place, to: Place) {
    const roadPath = await getDirections([from, to]);

    let path: naver.maps.LatLng[];
    let style: { color: string; weight: number; opacity: number; dash: string };

    if (roadPath.length >= 2) {
      path = roadPath.map(([lat, lng]) => new naver.maps.LatLng(lat, lng));
      style = { color: '#3b82f6', weight: 4, opacity: 0.85, dash: 'solid' };
    } else {
      // 폴백: 직선
      path = [
        new naver.maps.LatLng(from.latitude, from.longitude),
        new naver.maps.LatLng(to.latitude, to.longitude),
      ];
      style = { color: '#94a3b8', weight: 3, opacity: 0.7, dash: 'shortdash' };
    }

    const polyline = new naver.maps.Polyline({
      map: this.map,
      path,
      strokeColor: style.color,
      strokeWeight: style.weight,
      strokeOpacity: style.opacity,
      strokeStyle: style.dash,
    });

    this.segments.set(key, { polyline, path });
  }
}
