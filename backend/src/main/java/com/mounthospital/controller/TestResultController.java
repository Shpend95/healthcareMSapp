package com.mounthospital.controller;

import com.mounthospital.dto.ErrorResponse;
import com.mounthospital.model.TestResult;
import com.mounthospital.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> getAllTestResults() {
        try {
            List<TestResult> testResults = testResultRepository.findAll();
            return ResponseEntity.ok(testResults);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch test results: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTestResultById(@PathVariable Long id) {
        try {
            Optional<TestResult> testResult = testResultRepository.findById(id);
            if (testResult.isPresent()) {
                return ResponseEntity.ok(testResult.get());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Test result not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch test result: " + e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getTestResultsByPatientId(@PathVariable Long patientId) {
        try {
            List<TestResult> testResults = testResultRepository.findByPatientId(patientId);
            return ResponseEntity.ok(testResults);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch test results: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createTestResult(@RequestBody TestResult testResult) {
        try {
            TestResult savedTestResult = testResultRepository.save(testResult);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTestResult);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to create test result: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTestResult(@PathVariable Long id, @RequestBody TestResult testResultDetails) {
        try {
            Optional<TestResult> optionalTestResult = testResultRepository.findById(id);
            if (optionalTestResult.isPresent()) {
                TestResult testResult = optionalTestResult.get();
                testResult.setPatientId(testResultDetails.getPatientId());
                testResult.setTestName(testResultDetails.getTestName());
                testResult.setTestDate(testResultDetails.getTestDate());
                testResult.setResult(testResultDetails.getResult());
                testResult.setNotes(testResultDetails.getNotes());

                TestResult updatedTestResult = testResultRepository.save(testResult);
                return ResponseEntity.ok(updatedTestResult);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Test result not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to update test result: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestResult(@PathVariable Long id) {
        try {
            if (testResultRepository.existsById(id)) {
                testResultRepository.deleteById(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Test result not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to delete test result: " + e.getMessage()));
        }
    }
}
