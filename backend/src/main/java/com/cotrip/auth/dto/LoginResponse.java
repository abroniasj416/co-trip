package com.cotrip.auth.dto;

public record LoginResponse(
        String accessToken,
        String email,
        String nickname
) {}
