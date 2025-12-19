package com.mounthospital.dto;

import com.mounthospital.model.EmergencyContact;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public class PatientUpdateRequest {
    private String name;
    
    @Email(message = "Email should be valid")
    private String email;
    
    @Pattern(regexp = "^[0-9\\-\\+\\(\\)\\s]+$", message = "Phone number is invalid")
    private String phone;
    
    private LocalDate dateOfBirth;
    
    private String address;
    
    @Valid
    private EmergencyContactUpdateRequest emergencyContact;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public EmergencyContactUpdateRequest getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(EmergencyContactUpdateRequest emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public static class EmergencyContactUpdateRequest {
        private String firstName;
        private String lastName;
        private String relationship;
        private String primaryPhone;
        private String secondaryPhone;
        private String email;

        // Getters and Setters
        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getRelationship() {
            return relationship;
        }

        public void setRelationship(String relationship) {
            this.relationship = relationship;
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

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}
