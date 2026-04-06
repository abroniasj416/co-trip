package com.cotrip.plan.dto;

import java.time.LocalDateTime;

public record PlanSummaryResponse(
        String planId,
        String title,
        LocalDateTime createdAt
) {}
