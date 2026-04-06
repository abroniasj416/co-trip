package com.cotrip.plan.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "places")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlaceStatus status;

    @Column(columnDefinition = "TEXT")
    private String memo;

    /** 경로 순서 (확정 장소 기준) */
    @Column(nullable = false)
    private Integer placeOrder;

    /** 장소를 추가한 사용자 닉네임 */
    @Column(nullable = false)
    private String createdBy;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Place(Plan plan, Double latitude, Double longitude, String name,
                 PlaceStatus status, String memo, Integer placeOrder, String createdBy) {
        this.plan = plan;
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name;
        this.status = status != null ? status : PlaceStatus.CANDIDATE;
        this.memo = memo;
        this.placeOrder = placeOrder != null ? placeOrder : 0;
        this.createdBy = createdBy;
    }

    public void updateStatus(PlaceStatus status) {
        this.status = status;
    }

    public void updateMemo(String memo) {
        this.memo = memo;
    }

    public void updateOrder(Integer order) {
        this.placeOrder = order;
    }

    public void updateName(String name) {
        this.name = name;
    }
}
