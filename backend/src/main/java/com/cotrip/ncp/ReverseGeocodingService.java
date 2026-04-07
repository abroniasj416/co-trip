package com.cotrip.ncp;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReverseGeocodingService {

    private static final String REVERSE_GEOCODING_URL =
            "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc";

    private final NcpProperties ncpProperties;
    private final RestClient restClient = RestClient.create();

    /**
     * 좌표(위도/경도)를 주소 문자열로 변환합니다.
     *
     * @param lat 위도
     * @param lng 경도
     * @return 도로명 주소 또는 지번 주소 (조회 실패 시 null)
     */
    public String reverseGeocode(double lat, double lng) {
        try {
            String coords = lng + "," + lat;

            Map<?, ?> body = restClient.get()
                    .uri(REVERSE_GEOCODING_URL + "?coords={coords}&orders=roadaddr,addr&output=json", coords)
                    .header("X-NCP-APIGW-API-KEY-ID", ncpProperties.getClientId())
                    .header("X-NCP-APIGW-API-KEY", ncpProperties.getClientSecret())
                    .retrieve()
                    .body(Map.class);

            return parseAddress(body);
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private String parseAddress(Map<?, ?> body) {
        if (body == null) return null;

        List<?> results = (List<?>) body.get("results");
        if (results == null || results.isEmpty()) return null;

        // roadaddr 우선, 없으면 addr
        for (Object result : results) {
            Map<String, Object> r = (Map<String, Object>) result;
            String name = (String) r.get("name");
            Map<String, Object> region = (Map<String, Object>) r.get("region");
            Map<String, Object> land = (Map<String, Object>) r.get("land");

            if (region == null) continue;

            String area1 = getAreaName(region, "area1");
            String area2 = getAreaName(region, "area2");
            String area3 = getAreaName(region, "area3");

            if ("roadaddr".equals(name) && land != null) {
                String roadName = (String) land.get("name");
                String buildingNumber = buildingNumber(land);
                if (roadName != null && !roadName.isBlank()) {
                    return buildAddress(area1, area2, area3, roadName + " " + buildingNumber);
                }
            }

            if ("addr".equals(name) && land != null) {
                String number1 = (String) land.get("number1");
                String number2 = (String) land.get("number2");
                String lotNumber = number1 != null ? number1 : "";
                if (number2 != null && !number2.isBlank()) lotNumber += "-" + number2;
                if (!lotNumber.isBlank()) {
                    return buildAddress(area1, area2, area3, lotNumber);
                }
            }
        }
        return null;
    }

    private String getAreaName(Map<String, Object> region, String key) {
        Object area = region.get(key);
        if (area instanceof Map) {
            Object name = ((Map<?, ?>) area).get("name");
            return name != null ? name.toString() : "";
        }
        return "";
    }

    private String buildingNumber(Map<String, Object> land) {
        String number1 = (String) land.get("number1");
        String number2 = (String) land.get("number2");
        if (number1 == null || number1.isBlank()) return "";
        return (number2 != null && !number2.isBlank()) ? number1 + "-" + number2 : number1;
    }

    private String buildAddress(String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (part != null && !part.isBlank()) {
                if (!sb.isEmpty()) sb.append(" ");
                sb.append(part);
            }
        }
        return sb.isEmpty() ? null : sb.toString();
    }
}
