package com.mounthospital.repository;

import com.mounthospital.model.InsurancePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsurancePlanRepository extends JpaRepository<InsurancePlan, Long> {
    List<InsurancePlan> findByPatientId(Long patientId);
    List<InsurancePlan> findByPatientIdAndIsActive(Long patientId, Boolean isActive);
    Optional<InsurancePlan> findByPatientIdAndPlanType(Long patientId, String planType);
}

