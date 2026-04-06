import { useEffect, useRef, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_NCP_MAP_CLIENT_ID;
const SCRIPT_ID = 'ncp-map-sdk';
const SCRIPT_SRC = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`;

export type MapStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface LatLng {
  lat: number;
  lng: number;
}

export function useNcpMap(
  containerId: string,
  onMapClick?: (latLng: LatLng) => void
) {
  const [status, setStatus] = useState<MapStatus>('idle');
  const mapRef = useRef<naver.maps.Map | null>(null);
  const clickListenerRef = useRef<naver.maps.MapEventListener | null>(null);

  useEffect(() => {
    if (!CLIENT_ID) { setStatus('error'); return; }

    const initMap = () => {
      const container = document.getElementById(containerId);
      if (!container || mapRef.current) return;

      mapRef.current = new naver.maps.Map(container, {
        center: new naver.maps.LatLng(37.5665, 126.978),
        zoom: 13,
        mapTypeId: naver.maps.MapTypeId.NORMAL,
      });
      setStatus('ready');
    };

    if (window.naver?.maps) { initMap(); return; }

    if (document.getElementById(SCRIPT_ID)) {
      const t = setInterval(() => {
        if (window.naver?.maps) { clearInterval(t); initMap(); }
      }, 100);
      return () => clearInterval(t);
    }

    setStatus('loading');
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = initMap;
    script.onerror = () => setStatus('error');
    document.head.appendChild(script);
  }, [containerId]);

  // 클릭 이벤트 등록/해제
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || !onMapClick) return;

    if (clickListenerRef.current) {
      naver.maps.Event.removeListener(clickListenerRef.current);
    }

    clickListenerRef.current = naver.maps.Event.addListener(
      mapRef.current,
      'click',
      (e: unknown) => {
        const event = e as { coord: naver.maps.LatLng };
        onMapClick({ lat: event.coord.lat(), lng: event.coord.lng() });
      }
    );

    return () => {
      if (clickListenerRef.current) {
        naver.maps.Event.removeListener(clickListenerRef.current);
      }
    };
  }, [status, onMapClick]);

  return { status, mapRef };
}

// ── NCP Maps 전역 타입 선언 ──────────────────────────────
declare global {
  interface Window { naver: typeof naver; }

  namespace naver.maps {
    class Map {
      constructor(container: HTMLElement, options: object);
      setCenter(latLng: LatLng): void;
      panTo(latLng: LatLng): void;
    }
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }
    class Marker {
      constructor(options: object);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLng): void;
      setIcon(icon: object): void;
    }
    class Polyline {
      constructor(options: object);
      setMap(map: Map | null): void;
      setPath(path: LatLng[]): void;
    }
    class InfoWindow {
      constructor(options: object);
      open(map: Map, anchor: Marker): void;
      close(): void;
    }
    type MapEventListener = object;
    const MapTypeId: { NORMAL: string };
    const Event: {
      addListener(target: object, eventName: string, listener: (e: unknown) => void): MapEventListener;
      removeListener(listener: MapEventListener): void;
    };
  }
}
