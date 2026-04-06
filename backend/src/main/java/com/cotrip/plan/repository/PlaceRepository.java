package com.cotrip.plan.repository;

import com.cotrip.plan.domain.Place;
import com.cotrip.plan.domain.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    List<Place> findByPlanOrderByPlaceOrderAsc(Plan plan);

    int countByPlan(Plan plan);
}
