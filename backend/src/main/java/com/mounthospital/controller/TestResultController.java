package com.mounthospital.controller;

import com.mounthospital.dto.ErrorResponse;
import com.mounthospital.model.TestResult;
import com.mounthospital.repository.TestResultRepository;
import com.mounthospital.repository.PatientRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/test-results")
@CrossOrigin(origins = "*")
public class TestResultController {

    @Autowired
    private TestResultRepository testResultRepository;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping
    public ResponseEntity<?> createTestResult(@Valid @RequestBody TestResult testResult) {
        // Validate patient exists
        if (!patientRepository.existsById(testResult.getPatientId())) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Patient with ID " + testResult.getPatientId() + " not found",
                "/api/test-results"
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        TestResult savedTestResult = testResultRepository.save(testResult);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTestResult);
    }

    @GetMapping
    public ResponseEntity<List<TestResult>> getAllTestResults() {
        List<TestResult> testResults = testResultRepository.findAll();
        return ResponseEntity.ok(testResults);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTestResultById(@PathVariable Long id) {
        Optional<TestResult> testResult = testResultRepository.findById(id);
        
        if (testResult.isPresent()) {
            return ResponseEntity.ok(testResult.get());
        } else {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Test result with ID " + id + " not found",
                "/api/test-results/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TestResult>> getTestResultsByPatientId(@PathVariable Long patientId) {
        List<TestResult> testResults = testResultRepository.findByPatientId(patientId);
        return ResponseEntity.ok(testResults);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTestResult(@PathVariable Long id, @Valid @RequestBody TestResult testResultDetails) {
        Optional<TestResult> testResultOptional = testResultRepository.findById(id);
        
        if (testResultOptional.isEmpty()) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Test result with ID " + id + " not found",
                "/api/test-results/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        TestResult testResult = testResultOptional.get();
        
        // Validate patient exists if patientId is being updated
        if (testResultDetails.getPatientId() != null && 
            !patientRepository.existsById(testResultDetails.getPatientId())) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Patient with ID " + testResultDetails.getPatientId() + " not found",
                "/api/test-results/" + id
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // Update fields
        if (testResultDetails.getPatientId() != null) {
            testResult.setPatientId(testResultDetails.getPatientId());
        }
        if (testResultDetails.getTestName() != null) {
            testResult.setTestName(testResultDetails.getTestName());
        }
        if (testResultDetails.getTestDate() != null) {
            testResult.setTestDate(testResultDetails.getTestDate());
        }
        if (testResultDetails.getResult() != null) {
            testResult.setResult(testResultDetails.getResult());
        }
        if (testResultDetails.getNotes() != null) {
            testResult.setNotes(testResultDetails.getNotes());
        }

        TestResult updatedTestResult = testResultRepository.save(testResult);
        return ResponseEntity.ok(updatedTestResult);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestResult(@PathVariable Long id) {
        Optional<TestResult> testResult = testResultRepository.findById(id);
        
        if (testResult.isPresent()) {
            testResultRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Test result deleted successfully", "id", id));
        } else {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Test result with ID " + id + " not found",
                "/api/test-results/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}

