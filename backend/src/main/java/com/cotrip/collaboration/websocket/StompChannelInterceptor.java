package com.cotrip.collaboration.websocket;

import com.cotrip.auth.jwt.JwtUtil;
import com.cotrip.auth.redis.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * STOMP CONNECT 시점에 JWT를 검증한다.
 * HTTP 세션 없이 WebSocket 레벨에서 인증을 처리하는 역할.
 * Authorization 헤더 또는 STOMP native header에서 토큰을 추출한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StompChannelInterceptor implements ChannelInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = resolveToken(accessor);

            if (!StringUtils.hasText(token)) {
                log.warn("WebSocket CONNECT: 토큰 없음");
                throw new IllegalArgumentException("인증 토큰이 필요합니다.");
            }
            if (!jwtUtil.validateToken(token)) {
                log.warn("WebSocket CONNECT: 유효하지 않은 토큰");
                throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
            }
            if (tokenBlacklistService.isBlacklisted(token)) {
                log.warn("WebSocket CONNECT: 블랙리스트 토큰");
                throw new IllegalArgumentException("로그아웃된 토큰입니다.");
            }

            String email = jwtUtil.extractEmail(token);
            accessor.setUser(() -> email);
            log.debug("WebSocket CONNECT 인증 성공: {}", email);
        }

        return message;
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith(BEARER_PREFIX)) {
            return authHeader.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
