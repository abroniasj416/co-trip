package com.cotrip.plan.dto;

import com.cotrip.plan.domain.Place;
import com.cotrip.plan.domain.PlaceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class PlaceDto {

    public record AddPlaceRequest(
            @NotNull(message = "위도를 입력해주세요.") Double latitude,
            @NotNull(message = "경도를 입력해주세요.") Double longitude,
            @NotBlank(message = "장소명을 입력해주세요.") String name,
            PlaceStatus status
    ) {}

    public record UpdateStatusRequest(
            @NotNull(message = "상태를 입력해주세요.") PlaceStatus status
    ) {}

    public record UpdateMemoRequest(
            String memo
    ) {}

    public record UpdateOrderRequest(
            @NotNull Integer order
    ) {}

    public record PlaceResponse(
            Long id,
            String name,
            Double latitude,
            Double longitude,
            PlaceStatus status,
            String memo,
            Integer placeOrder,
            String createdBy,
            LocalDateTime createdAt
    ) {
        public static PlaceResponse from(Place place) {
            return new PlaceResponse(
                    place.getId(),
                    place.getName(),
                    place.getLatitude(),
                    place.getLongitude(),
                    place.getStatus(),
                    place.getMemo(),
                    place.getPlaceOrder(),
                    place.getCreatedBy(),
                    place.getCreatedAt()
            );
        }
    }
}
