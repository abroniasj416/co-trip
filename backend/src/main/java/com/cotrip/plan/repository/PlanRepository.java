package com.cotrip.plan.repository;

import com.cotrip.plan.domain.Plan;
import com.cotrip.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Long> {

    Optional<Plan> findByPlanId(String planId);

    List<Plan> findByOwnerOrderByCreatedAtDesc(User owner);
}
