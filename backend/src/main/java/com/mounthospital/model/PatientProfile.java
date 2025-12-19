package com.mounthospital.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_profiles")
public class PatientProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "suffix", length = 10)
    private String suffix;

    @Column(name = "gender", length = 50)
    private String gender;

    @Column(name = "pronouns", length = 50)
    private String pronouns;

    @Column(name = "preferred_language", length = 10)
    private String preferredLanguage = "en";

    @Email(message = "Email should be valid")
    @Column(name = "primary_email", length = 100)
    private String primaryEmail;

    @Column(name = "primary_email_verified")
    private Boolean primaryEmailVerified = false;

    @Email(message = "Email should be valid")
    @Column(name = "secondary_email", length = 100)
    private String secondaryEmail;

    @Column(name = "secondary_email_verified")
    private Boolean secondaryEmailVerified = false;

    @Pattern(regexp = "^[0-9\\-\\+\\(\\)\\s]+$", message = "Phone number is invalid")
    @Column(name = "primary_phone", length = 20)
    private String primaryPhone;

    @Pattern(regexp = "^[0-9\\-\\+\\(\\)\\s]+$", message = "Phone number is invalid")
    @Column(name = "secondary_phone", length = 20)
    private String secondaryPhone;

    @Pattern(regexp = "^[0-9\\-\\+\\(\\)\\s]+$", message = "Phone number is invalid")
    @Column(name = "mobile_phone", length = 20)
    private String mobilePhone;

    @Column(name = "preferred_contact_method", length = 20)
    private String preferredContactMethod = "email";

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @Column(name = "communication_preferences", columnDefinition = "JSON")
    private String communicationPreferences;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public PatientProfile() {}

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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getMiddleName() {
        return middleName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getSuffix() {
        return suffix;
    }

    public void setSuffix(String suffix) {
        this.suffix = suffix;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPronouns() {
        return pronouns;
    }

    public void setPronouns(String pronouns) {
        this.pronouns = pronouns;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public String getPrimaryEmail() {
        return primaryEmail;
    }

    public void setPrimaryEmail(String primaryEmail) {
        this.primaryEmail = primaryEmail;
    }

    public Boolean getPrimaryEmailVerified() {
        return primaryEmailVerified;
    }

    public void setPrimaryEmailVerified(Boolean primaryEmailVerified) {
        this.primaryEmailVerified = primaryEmailVerified;
    }

    public String getSecondaryEmail() {
        return secondaryEmail;
    }

    public void setSecondaryEmail(String secondaryEmail) {
        this.secondaryEmail = secondaryEmail;
    }

    public Boolean getSecondaryEmailVerified() {
        return secondaryEmailVerified;
    }

    public void setSecondaryEmailVerified(Boolean secondaryEmailVerified) {
        this.secondaryEmailVerified = secondaryEmailVerified;
    }

    public String getPrimaryPhone() {
        return primaryPhone;
    }

    public void setPrimaryPhone(String primaryPhone) {
        this.primaryPhone = primaryPhone;
    }

    public String getSecondaryPhone() {
        return secondaryPhone;
    }

    public void setSecondaryPhone(String secondaryPhone) {
        this.secondaryPhone = secondaryPhone;
    }

    public String getMobilePhone() {
        return mobilePhone;
    }

    public void setMobilePhone(String mobilePhone) {
        this.mobilePhone = mobilePhone;
    }

    public String getPreferredContactMethod() {
        return preferredContactMethod;
    }

    public void setPreferredContactMethod(String preferredContactMethod) {
        this.preferredContactMethod = preferredContactMethod;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getCommunicationPreferences() {
        return communicationPreferences;
    }

    public void setCommunicationPreferences(String communicationPreferences) {
        this.communicationPreferences = communicationPreferences;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

