package com.mounthospital.controller;

import com.mounthospital.dto.ErrorResponse;
import com.mounthospital.model.Insurance;
import com.mounthospital.repository.InsuranceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/insurance")
@CrossOrigin(origins = "http://localhost:3000")
public class InsuranceController {

    @Autowired
    private InsuranceRepository insuranceRepository;

    @GetMapping
    public ResponseEntity<?> getAllInsurance() {
        try {
            List<Insurance> insuranceList = insuranceRepository.findAll();
            return ResponseEntity.ok(insuranceList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch insurance: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInsuranceById(@PathVariable Long id) {
        try {
            Optional<Insurance> insurance = insuranceRepository.findById(id);
            if (insurance.isPresent()) {
                return ResponseEntity.ok(insurance.get());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Insurance not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch insurance: " + e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getInsuranceByPatientId(@PathVariable Long patientId) {
        try {
            List<Insurance> insuranceList = insuranceRepository.findByPatientId(patientId);
            return ResponseEntity.ok(insuranceList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch insurance: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createInsurance(@RequestBody Insurance insurance) {
        try {
            Insurance savedInsurance = insuranceRepository.save(insurance);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedInsurance);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to create insurance: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInsurance(@PathVariable Long id, @RequestBody Insurance insuranceDetails) {
        try {
            Optional<Insurance> optionalInsurance = insuranceRepository.findById(id);
            if (optionalInsurance.isPresent()) {
                Insurance insurance = optionalInsurance.get();
                insurance.setPatientId(insuranceDetails.getPatientId());
                insurance.setProvider(insuranceDetails.getProvider());
                insurance.setPolicyNumber(insuranceDetails.getPolicyNumber());
                insurance.setCoverageType(insuranceDetails.getCoverageType());
                insurance.setExpiryDate(insuranceDetails.getExpiryDate());

                Insurance updatedInsurance = insuranceRepository.save(insurance);
                return ResponseEntity.ok(updatedInsurance);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Insurance not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to update insurance: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInsurance(@PathVariable Long id) {
        try {
            if (insuranceRepository.existsById(id)) {
                insuranceRepository.deleteById(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Insurance not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to delete insurance: " + e.getMessage()));
        }
    }
}
