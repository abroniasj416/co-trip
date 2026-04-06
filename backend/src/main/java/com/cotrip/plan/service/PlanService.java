package com.cotrip.plan.service;

import com.cotrip.common.exception.CustomException;
import com.cotrip.common.exception.ErrorCode;
import com.cotrip.plan.domain.Plan;
import com.cotrip.plan.dto.CreatePlanRequest;
import com.cotrip.plan.dto.PlanResponse;
import com.cotrip.plan.dto.PlanSummaryResponse;
import com.cotrip.plan.repository.PlanRepository;
import com.cotrip.user.domain.User;
import com.cotrip.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;
    private final UserRepository userRepository;

    @Transactional
    public PlanResponse createPlan(String email, CreatePlanRequest request) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Plan plan = Plan.builder()
                .planId(UUID.randomUUID().toString())
                .title(request.title())
                .owner(owner)
                .build();

        return toResponse(planRepository.save(plan));
    }

    @Transactional(readOnly = true)
    public PlanResponse getPlan(String planId) {
        Plan plan = findByPlanId(planId);
        return toResponse(plan);
    }

    @Transactional(readOnly = true)
    public List<PlanSummaryResponse> getMyPlans(String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return planRepository.findByOwnerOrderByCreatedAtDesc(owner).stream()
                .map(p -> new PlanSummaryResponse(p.getPlanId(), p.getTitle(), p.getCreatedAt()))
                .toList();
    }

    private Plan findByPlanId(String planId) {
        return planRepository.findByPlanId(planId)
                .orElseThrow(() -> new CustomException(ErrorCode.PLAN_NOT_FOUND));
    }

    private PlanResponse toResponse(Plan plan) {
        return new PlanResponse(
                plan.getPlanId(),
                plan.getTitle(),
                plan.getOwner().getNickname(),
                plan.getCreatedAt()
        );
    }
}
