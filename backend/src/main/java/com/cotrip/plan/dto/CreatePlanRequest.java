package com.cotrip.plan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePlanRequest(

        @NotBlank(message = "플랜 제목을 입력해주세요.")
        @Size(max = 100, message = "제목은 100자 이하여야 합니다.")
        String title
) {}
