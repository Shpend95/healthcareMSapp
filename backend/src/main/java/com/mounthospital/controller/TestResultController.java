package com.mounthospital.controller;

import com.mounthospital.model.TestResult;
import com.mounthospital.repository.TestResultRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/test-results")
@CrossOrigin(origins = "http://localhost:3000")
public class TestResultController {
    @Autowired
    private TestResultRepository testResultRepository;

    @GetMapping
    public List<TestResult> getAllTestResults() {
        return testResultRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestResult> getTestResultById(@PathVariable Long id) {
        Optional<TestResult> testResult = testResultRepository.findById(id);
        return testResult.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public List<TestResult> getTestResultsByPatientId(@PathVariable Long patientId) {
        return testResultRepository.findByPatientId(patientId);
    }

    @PostMapping
    public TestResult createTestResult(@Valid @RequestBody TestResult testResult) {
        return testResultRepository.save(testResult);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestResult> updateTestResult(@PathVariable Long id, 
                                                      @Valid @RequestBody TestResult testResultDetails) {
        Optional<TestResult> optionalTestResult = testResultRepository.findById(id);
        if (optionalTestResult.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TestResult testResult = optionalTestResult.get();
        testResult.setPatientId(testResultDetails.getPatientId());
        testResult.setTestName(testResultDetails.getTestName());
        testResult.setTestDate(testResultDetails.getTestDate());
        testResult.setResult(testResultDetails.getResult());
        testResult.setNotes(testResultDetails.getNotes());

        return ResponseEntity.ok(testResultRepository.save(testResult));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestResult(@PathVariable Long id) {
        if (!testResultRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        testResultRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
