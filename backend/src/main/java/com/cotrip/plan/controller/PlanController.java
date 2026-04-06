package com.cotrip.plan.controller;

import com.cotrip.common.response.ApiResponse;
import com.cotrip.plan.dto.CreatePlanRequest;
import com.cotrip.plan.dto.PlanResponse;
import com.cotrip.plan.dto.PlanSummaryResponse;
import com.cotrip.plan.service.PlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    /**
     * POST /api/plans
     * 새 여행 플랜 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PlanResponse>> createPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePlanRequest request) {

        PlanResponse response = planService.createPlan(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    /**
     * GET /api/plans/{planId}
     * 플랜 상세 조회 (공유 URL로 접근한 사용자도 조회 가능)
     */
    @GetMapping("/{planId}")
    public ResponseEntity<ApiResponse<PlanResponse>> getPlan(@PathVariable String planId) {
        return ResponseEntity.ok(ApiResponse.ok(planService.getPlan(planId)));
    }

    /**
     * GET /api/plans/mine
     * 내가 만든 플랜 목록 조회
     */
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<PlanSummaryResponse>>> getMyPlans(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<PlanSummaryResponse> plans = planService.getMyPlans(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(plans));
    }
}
