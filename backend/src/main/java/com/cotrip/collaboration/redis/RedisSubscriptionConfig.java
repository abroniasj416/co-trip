package com.cotrip.collaboration.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration
@RequiredArgsConstructor
public class RedisSubscriptionConfig {

    private final RedisConnectionFactory redisConnectionFactory;
    private final RedisSubscriber redisSubscriber;

    /**
     * plan-room:* 패턴으로 모든 플랜 룸의 메시지를 구독한다.
     * WAS 인스턴스마다 이 컨테이너가 독립적으로 Redis를 구독하므로
     * 어느 WAS가 메시지를 발행해도 모든 WAS가 수신하여 클라이언트에 전달한다.
     */
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer() {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory);
        container.addMessageListener(redisSubscriber, new PatternTopic(RedisPublisher.CHANNEL_PREFIX + "*"));
        return container;
    }
}
