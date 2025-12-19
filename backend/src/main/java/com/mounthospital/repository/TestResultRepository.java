package com.mounthospital.repository;

import com.mounthospital.model.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    List<TestResult> findByPatientId(Long patientId);
    List<TestResult> findByPatient_Id(Long patientId);
}
