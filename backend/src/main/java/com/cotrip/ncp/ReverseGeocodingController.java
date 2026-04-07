package com.cotrip.ncp;

import com.cotrip.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/geocoding")
@RequiredArgsConstructor
public class ReverseGeocodingController {

    private final ReverseGeocodingService reverseGeocodingService;

    @GetMapping("/reverse")
    public ResponseEntity<ApiResponse<ReverseGeocodingResponse>> reverse(
            @RequestParam double lat,
            @RequestParam double lng) {

        String address = reverseGeocodingService.reverseGeocode(lat, lng);
        return ResponseEntity.ok(ApiResponse.ok(new ReverseGeocodingResponse(address)));
    }
}
