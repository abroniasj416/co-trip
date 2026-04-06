import { Place } from '../../types/place';

/**
 * 확정 장소들을 순서대로 연결하는 Polyline 관리 유틸리티
 * 추후 Directions API 연동 시 이 클래스만 수정하면 된다
 */
export class RoutePolylineManager {
  private map: naver.maps.Map;
  private polyline: naver.maps.Polyline | null = null;

  constructor(map: naver.maps.Map) {
    this.map = map;
  }

  /** 확정 장소 순서대로 경로 그리기 */
  draw(confirmedPlaces: Place[]) {
    this.clear();
    if (confirmedPlaces.length < 2) return;

    const path = confirmedPlaces.map(
      (p) => new naver.maps.LatLng(p.latitude, p.longitude)
    );

    this.polyline = new naver.maps.Polyline({
      map: this.map,
      path,
      strokeColor: '#3b82f6',
      strokeWeight: 3,
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
    });
  }

  clear() {
    if (this.polyline) {
      this.polyline.setMap(null);
      this.polyline = null;
    }
  }
}
