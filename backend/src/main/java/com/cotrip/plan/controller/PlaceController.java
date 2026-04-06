package com.cotrip.plan.controller;

import com.cotrip.common.response.ApiResponse;
import com.cotrip.plan.dto.PlaceDto;
import com.cotrip.plan.service.PlaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans/{planId}/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    /** GET /api/plans/{planId}/places — 장소 목록 조회 */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PlaceDto.PlaceResponse>>> getPlaces(
            @PathVariable String planId) {
        return ResponseEntity.ok(ApiResponse.ok(placeService.getPlaces(planId)));
    }

    /** POST /api/plans/{planId}/places — 장소 추가 */
    @PostMapping
    public ResponseEntity<ApiResponse<PlaceDto.PlaceResponse>> addPlace(
            @PathVariable String planId,
            @Valid @RequestBody PlaceDto.AddPlaceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        // UserDetails.username = email → 닉네임은 PlaceService 내부에서 처리 가능하나
        // 여기서는 email을 nickname 대신 전달하고 PlaceService에서 사용
        PlaceDto.PlaceResponse response = placeService.addPlace(planId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    /** PATCH /api/plans/{planId}/places/{placeId}/status — 상태 변경 */
    @PatchMapping("/{placeId}/status")
    public ResponseEntity<ApiResponse<PlaceDto.PlaceResponse>> updateStatus(
            @PathVariable String planId,
            @PathVariable Long placeId,
            @Valid @RequestBody PlaceDto.UpdateStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.ok(
                placeService.updateStatus(planId, placeId, request, userDetails.getUsername())));
    }

    /** PATCH /api/plans/{planId}/places/{placeId}/memo — 메모 수정 */
    @PatchMapping("/{placeId}/memo")
    public ResponseEntity<ApiResponse<PlaceDto.PlaceResponse>> updateMemo(
            @PathVariable String planId,
            @PathVariable Long placeId,
            @RequestBody PlaceDto.UpdateMemoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.ok(
                placeService.updateMemo(planId, placeId, request, userDetails.getUsername())));
    }

    /** PATCH /api/plans/{planId}/places/{placeId}/order — 순서 변경 */
    @PatchMapping("/{placeId}/order")
    public ResponseEntity<ApiResponse<Void>> updateOrder(
            @PathVariable String planId,
            @PathVariable Long placeId,
            @Valid @RequestBody PlaceDto.UpdateOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        placeService.updateOrder(planId, placeId, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    /** DELETE /api/plans/{planId}/places/{placeId} — 장소 삭제 */
    @DeleteMapping("/{placeId}")
    public ResponseEntity<ApiResponse<Void>> deletePlace(
            @PathVariable String planId,
            @PathVariable Long placeId,
            @AuthenticationPrincipal UserDetails userDetails) {

        placeService.deletePlace(planId, placeId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
