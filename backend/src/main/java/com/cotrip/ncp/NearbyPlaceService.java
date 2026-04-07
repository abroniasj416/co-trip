package com.cotrip.ncp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NearbyPlaceService {

    private static final String LOCAL_SEARCH_URL =
            "https://openapi.naver.com/v1/search/local.json";

    private final NaverSearchProperties naverSearchProperties;
    private final ReverseGeocodingService reverseGeocodingService;
    private final RestClient restClient = RestClient.create();

    /**
     * 좌표 기반 가장 가까운 장소 정보를 조회합니다.
     *
     * 전략:
     * 1) Reverse Geocoding으로 좌표 → 주소 추출
     * 2) 주소에서 "동" 이름만 추출하여 네이버 지역 검색
     * 3) 결과 중 클릭 지점에 가장 가까운 장소 반환
     */
    public NearbyPlaceResponse findNearby(double lat, double lng) {
        String address = reverseGeocodingService.reverseGeocode(lat, lng);
        if (address == null) {
            return null;
        }

        // 동 이름 추출: "서울 종로구 청운동 7-3" → "청운동"
        String dongName = extractDongName(address);

        // 1차: 동 이름으로 검색 (display=5, 가까운 장소 매칭)
        List<Map<String, Object>> items = searchLocal(dongName, 5);

        // 2차: 결과 없으면 "구 동"으로 재시도
        if (items == null || items.isEmpty()) {
            String guDong = extractGuDong(address);
            items = searchLocal(guDong, 5);
        }

        if (items == null || items.isEmpty()) {
            // 3차: 주소 자체가 도로명이면 도로명으로 검색
            String roadName = extractRoadName(address);
            if (roadName != null) {
                items = searchLocal(roadName, 5);
            }
        }

        if (items == null || items.isEmpty()) {
            return null;
        }

        return pickClosest(items, lat, lng);
    }

    /**
     * 주소에서 "동" 이름 추출.
     * "서울 종로구 청운동 7-3" → "청운동"
     * "서울 중구 소파로 138" → "소파로"
     */
    String extractDongName(String address) {
        String[] parts = address.split("\\s+");
        // parts[0]=시, parts[1]=구, parts[2]=동/로, parts[3...]=번지
        if (parts.length >= 3) {
            return parts[2]; // "청운동" or "소파로"
        }
        if (parts.length >= 2) {
            return parts[1];
        }
        return address;
    }

    /**
     * "구 동" 추출.
     * "서울 종로구 청운동 7-3" → "종로구 청운동"
     */
    String extractGuDong(String address) {
        String[] parts = address.split("\\s+");
        if (parts.length >= 3) {
            return parts[1] + " " + parts[2];
        }
        return address;
    }

    /**
     * 도로명 추출 (주소에 "로" 또는 "길"이 포함된 경우).
     * "서울 중구 소파로 138" → "소파로"
     */
    String extractRoadName(String address) {
        String[] parts = address.split("\\s+");
        for (String part : parts) {
            if (part.endsWith("로") || part.endsWith("길")) {
                return part;
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> searchLocal(String query, int display) {
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = LOCAL_SEARCH_URL + "?query=" + encoded + "&display=" + display + "&sort=random";

            Map<?, ?> body = restClient.get()
                    .uri(URI.create(url))
                    .header("X-Naver-Client-Id", naverSearchProperties.getClientId())
                    .header("X-Naver-Client-Secret", naverSearchProperties.getClientSecret())
                    .retrieve()
                    .body(Map.class);

            if (body == null) return null;
            List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
            return items;
        } catch (Exception e) {
            log.error("Naver Search failed for query='{}': {}", query, e.getMessage());
            return null;
        }
    }

    private NearbyPlaceResponse pickClosest(List<Map<String, Object>> items, double lat, double lng) {
        Map<String, Object> closest = null;
        double minDist = Double.MAX_VALUE;

        for (Map<String, Object> item : items) {
            double[] coords = parseCoords(item);
            if (coords == null) continue;

            double dist = haversine(lat, lng, coords[0], coords[1]);
            if (dist < minDist) {
                minDist = dist;
                closest = item;
            }
        }

        if (closest == null) {
            closest = items.get(0);
        }

        return toResponse(closest);
    }

    private double[] parseCoords(Map<String, Object> item) {
        try {
            long mapx = Long.parseLong(item.get("mapx").toString());
            long mapy = Long.parseLong(item.get("mapy").toString());

            if (mapx > 1_000_000 && mapy > 1_000_000) {
                double itemLng = mapx / 10_000_000.0;
                double itemLat = mapy / 10_000_000.0;
                return new double[]{itemLat, itemLng};
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private double haversine(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371_000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private NearbyPlaceResponse toResponse(Map<String, Object> item) {
        return new NearbyPlaceResponse(
                stripHtml(getStr(item, "title")),
                getStr(item, "category"),
                getStr(item, "address"),
                getStr(item, "roadAddress"),
                getStr(item, "telephone")
        );
    }

    private String getStr(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : "";
    }

    private String stripHtml(String text) {
        return text.replaceAll("<[^>]*>", "");
    }
}
