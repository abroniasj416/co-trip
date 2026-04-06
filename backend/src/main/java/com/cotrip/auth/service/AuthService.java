package com.cotrip.auth.service;

import com.cotrip.auth.dto.LoginRequest;
import com.cotrip.auth.dto.LoginResponse;
import com.cotrip.auth.dto.SignUpRequest;
import com.cotrip.auth.jwt.JwtUtil;
import com.cotrip.auth.redis.TokenBlacklistService;
import com.cotrip.common.exception.CustomException;
import com.cotrip.common.exception.ErrorCode;
import com.cotrip.user.domain.User;
import com.cotrip.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    @Transactional
    public void signUp(SignUpRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new CustomException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .nickname(request.nickname())
                .build();

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token, user.getEmail(), user.getNickname());
    }

    public void logout(String token) {
        long remainingMs = jwtUtil.getRemainingExpirationMs(token);
        tokenBlacklistService.addToBlacklist(token, remainingMs);
    }
}
