package com.cotrip.collaboration.websocket;

import com.cotrip.collaboration.message.CollaborationMessage;
import com.cotrip.collaboration.redis.RedisPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;

/**
 * 클라이언트 → 서버 메시지 수신 처리
 * /app/plan/{planId} 로 수신된 메시지를 Redis에 발행
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class PlanMessageController {

    private final RedisPublisher redisPublisher;

    @MessageMapping("/plan/{planId}")
    public void handlePlanMessage(
            @DestinationVariable String planId,
            @Payload CollaborationMessage message,
            Principal principal) {

        CollaborationMessage enriched = CollaborationMessage.builder()
                .type(message.getType())
                .planId(planId)
                .senderNickname(principal != null ? principal.getName() : "unknown")
                .timestamp(Instant.now().toString())
                .payload(message.getPayload())
                .build();

        log.debug("메시지 수신 - planId: {}, type: {}, sender: {}",
                planId, enriched.getType(), enriched.getSenderNickname());

        redisPublisher.publish(planId, enriched);
    }
}
