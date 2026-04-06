package com.cotrip.collaboration.message;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CollaborationMessage {

    private MessageType type;

    /** Redis 채널 라우팅 및 STOMP topic 결정에 사용 */
    private String planId;

    private String senderNickname;

    private String timestamp;

    /**
     * 메시지 타입에 따라 다른 내용을 담는 유연한 페이로드
     * PLACE_ADDED       → { name, lat, lng, status }
     * PLACE_STATUS_CHANGED → { placeId, status }
     * MEMO_UPDATED      → { placeId, memo }
     */
    private Map<String, Object> payload;
}
