package com.cotrip.ncp;

import com.cotrip.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/directions")
@RequiredArgsConstructor
public class DirectionsController {

    private final DirectionsService directionsService;

    /**
     * @param points "lat1,lng1|lat2,lng2|..." 형식의 좌표 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<double[]>>> getDirections(
            @RequestParam String points) {

        List<double[]> pointList = parsePoints(points);
        List<double[]> route = directionsService.getRoute(pointList);
        return ResponseEntity.ok(ApiResponse.ok(route));
    }

    private List<double[]> parsePoints(String points) {
        List<double[]> result = new ArrayList<>();
        for (String p : points.split("\\|")) {
            String[] parts = p.split(",");
            if (parts.length == 2) {
                try {
                    result.add(new double[]{
                            Double.parseDouble(parts[0].trim()),
                            Double.parseDouble(parts[1].trim())
                    });
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return result;
    }
}
