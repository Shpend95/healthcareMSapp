package com.mounthospital.repository;

import com.mounthospital.model.Insurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceRepository extends JpaRepository<Insurance, Long> {
    List<Insurance> findByPatientId(Long patientId);
    List<Insurance> findByPatient_Id(Long patientId);
    Optional<Insurance> findByPatientIdAndPolicyNumber(Long patientId, String policyNumber);
    Optional<Insurance> findFirstByPatientIdOrderByExpiryDateDesc(Long patientId);
}
