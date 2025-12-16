package com.mounthospital.controller;

import com.mounthospital.dto.ErrorResponse;
import com.mounthospital.model.Insurance;
import com.mounthospital.repository.InsuranceRepository;
import com.mounthospital.repository.PatientRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/insurance")
@CrossOrigin(origins = "*")
public class InsuranceController {

    @Autowired
    private InsuranceRepository insuranceRepository;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping
    public ResponseEntity<?> createInsurance(@Valid @RequestBody Insurance insurance) {
        // Validate patient exists
        if (!patientRepository.existsById(insurance.getPatientId())) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Patient with ID " + insurance.getPatientId() + " not found",
                "/api/insurance"
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        Insurance savedInsurance = insuranceRepository.save(insurance);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedInsurance);
    }

    @GetMapping
    public ResponseEntity<List<Insurance>> getAllInsurance() {
        List<Insurance> insuranceList = insuranceRepository.findAll();
        return ResponseEntity.ok(insuranceList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInsuranceById(@PathVariable Long id) {
        Optional<Insurance> insurance = insuranceRepository.findById(id);
        
        if (insurance.isPresent()) {
            return ResponseEntity.ok(insurance.get());
        } else {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Insurance with ID " + id + " not found",
                "/api/insurance/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Insurance>> getInsuranceByPatientId(@PathVariable Long patientId) {
        List<Insurance> insuranceList = insuranceRepository.findByPatientId(patientId);
        return ResponseEntity.ok(insuranceList);
    }

    @GetMapping("/patient/{patientId}/current")
    public ResponseEntity<?> getCurrentInsuranceByPatientId(@PathVariable Long patientId) {
        Optional<Insurance> insurance = insuranceRepository.findFirstByPatientIdOrderByExpiryDateDesc(patientId);
        
        if (insurance.isPresent()) {
            return ResponseEntity.ok(insurance.get());
        } else {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "No insurance found for patient ID " + patientId,
                "/api/insurance/patient/" + patientId + "/current"
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInsurance(@PathVariable Long id, @Valid @RequestBody Insurance insuranceDetails) {
        Optional<Insurance> insuranceOptional = insuranceRepository.findById(id);
        
        if (insuranceOptional.isEmpty()) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Insurance with ID " + id + " not found",
                "/api/insurance/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Insurance insurance = insuranceOptional.get();
        
        // Validate patient exists if patientId is being updated
        if (insuranceDetails.getPatientId() != null && 
            !patientRepository.existsById(insuranceDetails.getPatientId())) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Patient with ID " + insuranceDetails.getPatientId() + " not found",
                "/api/insurance/" + id
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // Update fields
        if (insuranceDetails.getPatientId() != null) {
            insurance.setPatientId(insuranceDetails.getPatientId());
        }
        if (insuranceDetails.getProvider() != null) {
            insurance.setProvider(insuranceDetails.getProvider());
        }
        if (insuranceDetails.getPolicyNumber() != null) {
            insurance.setPolicyNumber(insuranceDetails.getPolicyNumber());
        }
        if (insuranceDetails.getCoverageType() != null) {
            insurance.setCoverageType(insuranceDetails.getCoverageType());
        }
        if (insuranceDetails.getExpiryDate() != null) {
            insurance.setExpiryDate(insuranceDetails.getExpiryDate());
        }

        Insurance updatedInsurance = insuranceRepository.save(insurance);
        return ResponseEntity.ok(updatedInsurance);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInsurance(@PathVariable Long id) {
        Optional<Insurance> insurance = insuranceRepository.findById(id);
        
        if (insurance.isPresent()) {
            insuranceRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Insurance deleted successfully", "id", id));
        } else {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Insurance with ID " + id + " not found",
                "/api/insurance/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}

