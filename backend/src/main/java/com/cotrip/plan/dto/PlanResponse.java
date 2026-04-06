package com.cotrip.plan.dto;

import java.time.LocalDateTime;

public record PlanResponse(
        String planId,
        String title,
        String ownerNickname,
        LocalDateTime createdAt
) {}
