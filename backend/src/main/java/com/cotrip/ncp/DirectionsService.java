package com.cotrip.ncp;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DirectionsService {

    private static final String DIRECTIONS_URL =
            "https://maps.apigw.ntruss.com/map-direction/v1/driving";

    private final NcpProperties ncpProperties;
    private final RestClient restClient = RestClient.create();

    /**
     * 여러 좌표를 도로 경로로 연결합니다.
     *
     * @param points lat/lng 좌표 목록 (최소 2개, 경유지 최대 5개 제한)
     * @return 도로 경로 좌표 목록 [[lat, lng], ...] (실패 시 빈 리스트)
     */
    public List<double[]> getRoute(List<double[]> points) {
        if (points.size() < 2) return Collections.emptyList();

        double[] start = points.get(0);
        double[] goal = points.get(points.size() - 1);
        List<double[]> middle = points.subList(1, points.size() - 1);

        StringBuilder url = new StringBuilder(DIRECTIONS_URL);
        url.append("?start=").append(start[1]).append(",").append(start[0]);
        url.append("&goal=").append(goal[1]).append(",").append(goal[0]);
        url.append("&option=traoptimal");

        if (!middle.isEmpty()) {
            String waypoints = middle.stream()
                    .limit(5)
                    .map(p -> p[1] + "," + p[0])
                    .collect(Collectors.joining(":"));
            url.append("&waypoints=").append(waypoints);
        }

        try {
            @SuppressWarnings("rawtypes")
            Map body = restClient.get()
                    .uri(url.toString())
                    .header("X-NCP-APIGW-API-KEY-ID", ncpProperties.getClientId())
                    .header("X-NCP-APIGW-API-KEY", ncpProperties.getClientSecret())
                    .retrieve()
                    .body(Map.class);

            return parsePath(body);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("rawtypes")
    private List<double[]> parsePath(Map body) {
        if (body == null) return Collections.emptyList();

        Object codeObj = body.get("code");
        if (!(codeObj instanceof Number) || ((Number) codeObj).intValue() != 0) {
            return Collections.emptyList();
        }

        Map route = (Map) body.get("route");
        if (route == null) return Collections.emptyList();

        List traoptimal = (List) route.get("traoptimal");
        if (traoptimal == null || traoptimal.isEmpty()) return Collections.emptyList();

        Map firstRoute = (Map) traoptimal.get(0);
        List path = (List) firstRoute.get("path");
        if (path == null) return Collections.emptyList();

        List<double[]> result = new ArrayList<>();
        for (Object point : path) {
            List coords = (List) point;
            if (coords.size() >= 2) {
                double lng = ((Number) coords.get(0)).doubleValue();
                double lat = ((Number) coords.get(1)).doubleValue();
                result.add(new double[]{lat, lng});
            }
        }
        return result;
    }
}
