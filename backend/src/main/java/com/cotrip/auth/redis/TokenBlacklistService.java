package com.cotrip.auth.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "blacklist:";

    private final StringRedisTemplate redisTemplate;

    /**
     * 로그아웃 토큰을 블랙리스트에 등록한다.
     * TTL은 토큰 잔여 만료 시간과 동일하게 설정하여 자동 삭제된다.
     */
    public void addToBlacklist(String token, long remainingExpirationMs) {
        redisTemplate.opsForValue().set(
                BLACKLIST_PREFIX + token,
                "logout",
                remainingExpirationMs,
                TimeUnit.MILLISECONDS
        );
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
    }
}
