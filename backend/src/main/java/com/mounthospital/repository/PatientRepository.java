package com.mounthospital.repository;

import com.mounthospital.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByUserId(Long userId);
    Optional<Patient> findByUser_Id(Long userId);
    Optional<Patient> findByEmail(String email);
}
