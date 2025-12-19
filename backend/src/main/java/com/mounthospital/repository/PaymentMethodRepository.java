package com.mounthospital.repository;

import com.mounthospital.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByPatientId(Long patientId);
    List<PaymentMethod> findByPatientIdAndIsActive(Long patientId, Boolean isActive);
    Optional<PaymentMethod> findByPatientIdAndIsDefault(Long patientId, Boolean isDefault);
}

