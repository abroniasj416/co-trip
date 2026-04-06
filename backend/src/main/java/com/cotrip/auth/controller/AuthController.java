package com.cotrip.auth.controller;

import com.cotrip.auth.dto.LoginRequest;
import com.cotrip.auth.dto.LoginResponse;
import com.cotrip.auth.dto.SignUpRequest;
import com.cotrip.auth.service.AuthService;
import com.cotrip.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String BEARER_PREFIX = "Bearer ";

    private final AuthService authService;

    /**
     * POST /api/auth/signup
     * 회원가입
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signUp(@Valid @RequestBody SignUpRequest request) {
        authService.signUp(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("회원가입이 완료되었습니다.", null));
    }

    /**
     * POST /api/auth/login
     * 로그인 → Access Token 발급
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * POST /api/auth/logout
     * 로그아웃 → Access Token 블랙리스트 등록
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader("Authorization") String authorizationHeader) {

        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("유효하지 않은 Authorization 헤더입니다."));
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length());
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.ok("로그아웃되었습니다.", null));
    }
}
