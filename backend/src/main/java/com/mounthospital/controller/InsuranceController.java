package com.mounthospital.controller;

import com.mounthospital.model.Insurance;
import com.mounthospital.repository.InsuranceRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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
    public List<Insurance> getAllInsurance() {
        return insuranceRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Insurance> getInsuranceById(@PathVariable Long id) {
        Optional<Insurance> insurance = insuranceRepository.findById(id);
        return insurance.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public List<Insurance> getInsuranceByPatientId(@PathVariable Long patientId) {
        return insuranceRepository.findByPatientId(patientId);
    }

    @PostMapping
    public Insurance createInsurance(@Valid @RequestBody Insurance insurance) {
        return insuranceRepository.save(insurance);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Insurance> updateInsurance(@PathVariable Long id, 
                                                      @Valid @RequestBody Insurance insuranceDetails) {
        Optional<Insurance> optionalInsurance = insuranceRepository.findById(id);
        if (optionalInsurance.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Insurance insurance = optionalInsurance.get();
        insurance.setPatientId(insuranceDetails.getPatientId());
        insurance.setProvider(insuranceDetails.getProvider());
        insurance.setPolicyNumber(insuranceDetails.getPolicyNumber());
        insurance.setCoverageType(insuranceDetails.getCoverageType());
        insurance.setExpiryDate(insuranceDetails.getExpiryDate());

        return ResponseEntity.ok(insuranceRepository.save(insurance));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInsurance(@PathVariable Long id) {
        if (!insuranceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        insuranceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
