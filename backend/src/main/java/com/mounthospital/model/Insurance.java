package com.mounthospital.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "insurance")
public class Insurance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String provider;

    @Column(name = "policy_number", nullable = false)
    private String policyNumber;

    @Column(name = "coverage_type")
    private String coverageType;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    // Constructors
    public Insurance() {}

    public Insurance(Long patientId, String provider, String policyNumber, String coverageType, LocalDate expiryDate) {
        this.patientId = patientId;
        this.provider = provider;
        this.policyNumber = policyNumber;
        this.coverageType = coverageType;
        this.expiryDate = expiryDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }

    public String getCoverageType() {
        return coverageType;
    }

    public void setCoverageType(String coverageType) {
        this.coverageType = coverageType;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
}
