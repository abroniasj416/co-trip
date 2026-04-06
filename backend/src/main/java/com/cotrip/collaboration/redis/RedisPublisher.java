package com.cotrip.collaboration.redis;

import com.cotrip.collaboration.message.CollaborationMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisPublisher {

    static final String CHANNEL_PREFIX = "plan-room:";

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public void publish(String planId, CollaborationMessage message) {
        try {
            String json = objectMapper.writeValueAsString(message);
            stringRedisTemplate.convertAndSend(CHANNEL_PREFIX + planId, json);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize CollaborationMessage", e);
        }
    }
}
