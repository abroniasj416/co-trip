package com.cotrip.ncp;

import com.cotrip.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class NearbyPlaceController {

    private final NearbyPlaceService nearbyPlaceService;

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<NearbyPlaceResponse>> nearby(
            @RequestParam double lat,
            @RequestParam double lng) {

        NearbyPlaceResponse result = nearbyPlaceService.findNearby(lat, lng);

        if (result == null) {
            return ResponseEntity.ok(ApiResponse.ok(null));
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
