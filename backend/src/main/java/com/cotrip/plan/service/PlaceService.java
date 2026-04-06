package com.cotrip.plan.service;

import com.cotrip.collaboration.message.CollaborationMessage;
import com.cotrip.collaboration.message.MessageType;
import com.cotrip.collaboration.redis.RedisPublisher;
import com.cotrip.common.exception.CustomException;
import com.cotrip.common.exception.ErrorCode;
import com.cotrip.plan.domain.Place;
import com.cotrip.plan.domain.Plan;
import com.cotrip.plan.dto.PlaceDto;
import com.cotrip.plan.repository.PlaceRepository;
import com.cotrip.plan.repository.PlanRepository;
import com.cotrip.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final PlanRepository planRepository;
    private final UserRepository userRepository;
    private final RedisPublisher redisPublisher;

    @Transactional(readOnly = true)
    public List<PlaceDto.PlaceResponse> getPlaces(String planId) {
        Plan plan = findPlan(planId);
        return placeRepository.findByPlanOrderByPlaceOrderAsc(plan)
                .stream()
                .map(PlaceDto.PlaceResponse::from)
                .toList();
    }

    @Transactional
    public PlaceDto.PlaceResponse addPlace(String planId, PlaceDto.AddPlaceRequest request, String email) {
        Plan plan = findPlan(planId);
        String nickname = userRepository.findByEmail(email)
                .map(u -> u.getNickname())
                .orElse(email);
        int nextOrder = placeRepository.countByPlan(plan);

        Place place = Place.builder()
                .plan(plan)
                .latitude(request.latitude())
                .longitude(request.longitude())
                .name(request.name())
                .status(request.status())
                .placeOrder(nextOrder)
                .createdBy(nickname)
                .build();

        Place saved = placeRepository.save(place);
        PlaceDto.PlaceResponse response = PlaceDto.PlaceResponse.from(saved);

        // WebSocket 브로드캐스트
        publish(planId, MessageType.PLACE_ADDED, nickname, Map.of(
                "place", response
        ));

        return response;
    }

    @Transactional
    public PlaceDto.PlaceResponse updateStatus(String planId, Long placeId,
                                               PlaceDto.UpdateStatusRequest request, String email) {
        Place place = findPlace(placeId, planId);
        place.updateStatus(request.status());
        String nickname = resolveNickname(email);

        PlaceDto.PlaceResponse response = PlaceDto.PlaceResponse.from(place);
        publish(planId, MessageType.PLACE_STATUS_CHANGED, nickname, Map.of(
                "placeId", placeId,
                "status", request.status().name()
        ));
        return response;
    }

    @Transactional
    public PlaceDto.PlaceResponse updateMemo(String planId, Long placeId,
                                             PlaceDto.UpdateMemoRequest request, String email) {
        Place place = findPlace(placeId, planId);
        place.updateMemo(request.memo());
        String nickname = resolveNickname(email);

        PlaceDto.PlaceResponse response = PlaceDto.PlaceResponse.from(place);
        publish(planId, MessageType.MEMO_UPDATED, nickname, Map.of(
                "placeId", placeId,
                "memo", request.memo() != null ? request.memo() : ""
        ));
        return response;
    }

    @Transactional
    public void deletePlace(String planId, Long placeId, String email) {
        Place place = findPlace(placeId, planId);
        placeRepository.delete(place);
        String nickname = resolveNickname(email);

        publish(planId, MessageType.PLACE_DELETED, nickname, Map.of(
                "placeId", placeId
        ));
    }

    @Transactional
    public void updateOrder(String planId, Long placeId,
                            PlaceDto.UpdateOrderRequest request, String email) {
        Place place = findPlace(placeId, planId);
        place.updateOrder(request.order());
        String nickname = resolveNickname(email);

        publish(planId, MessageType.PLACE_ORDER_CHANGED, nickname, Map.of(
                "placeId", placeId,
                "order", request.order()
        ));
    }

    // ── 내부 헬퍼 ──────────────────────────────────────

    private String resolveNickname(String email) {
        return userRepository.findByEmail(email)
                .map(u -> u.getNickname())
                .orElse(email);
    }

    private Plan findPlan(String planId) {
        return planRepository.findByPlanId(planId)
                .orElseThrow(() -> new CustomException(ErrorCode.PLAN_NOT_FOUND));
    }

    private Place findPlace(Long placeId, String planId) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new CustomException(ErrorCode.PLACE_NOT_FOUND));
        if (!place.getPlan().getPlanId().equals(planId)) {
            throw new CustomException(ErrorCode.PLACE_NOT_FOUND);
        }
        return place;
    }

    private void publish(String planId, MessageType type, String nickname, Map<String, Object> payload) {
        redisPublisher.publish(planId, CollaborationMessage.builder()
                .type(type)
                .planId(planId)
                .senderNickname(nickname)
                .timestamp(Instant.now().toString())
                .payload(payload)
                .build());
    }
}
