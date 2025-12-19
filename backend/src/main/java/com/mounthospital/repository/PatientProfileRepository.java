package com.mounthospital.repository;

import com.mounthospital.model.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByPatientId(Long patientId);
    Optional<PatientProfile> findByUserId(Long userId);
    boolean existsByPatientId(Long patientId);
}

