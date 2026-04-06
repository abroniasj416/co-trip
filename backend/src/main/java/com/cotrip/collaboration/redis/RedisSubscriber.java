package com.cotrip.collaboration.redis;

import com.cotrip.collaboration.message.CollaborationMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Redis에서 메시지 수신 → 해당 planId의 STOMP topic으로 브로드캐스트
     * WAS가 N대 있어도 각 인스턴스의 Redis 구독자가 동일하게 처리하므로
     * 모든 WAS에 연결된 클라이언트가 메시지를 받는다.
     */
    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String body = new String(message.getBody());
            CollaborationMessage msg = objectMapper.readValue(body, CollaborationMessage.class);
            messagingTemplate.convertAndSend("/topic/plan/" + msg.getPlanId(), msg);
        } catch (Exception e) {
            log.error("Failed to process Redis message", e);
        }
    }
}
