package com.mounthospital.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mounthospital.dto.ErrorResponse;
import com.mounthospital.model.*;
import com.mounthospital.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private InsurancePlanRepository insurancePlanRepository;

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // ========== Patient Profile Endpoints ==========

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getProfile(@PathVariable Long patientId) {
        try {
            Optional<PatientProfile> profile = patientProfileRepository.findByPatientId(patientId);
            if (profile.isPresent()) {
                return ResponseEntity.ok(profile.get());
            } else {
                // Return empty profile structure if not found
                PatientProfile newProfile = new PatientProfile();
                newProfile.setPatientId(patientId);
                return ResponseEntity.ok(newProfile);
            }
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to retrieve profile: " + e.getMessage(),
                "/api/profile/patient/" + patientId
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/patient/{patientId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long patientId, @RequestBody PatientProfile profileData) {
        try {
            Optional<PatientProfile> existingProfile = patientProfileRepository.findByPatientId(patientId);
            PatientProfile profile;
            
            if (existingProfile.isPresent()) {
                profile = existingProfile.get();
                // Update fields
                if (profileData.getFirstName() != null) profile.setFirstName(profileData.getFirstName());
                if (profileData.getMiddleName() != null) profile.setMiddleName(profileData.getMiddleName());
                if (profileData.getLastName() != null) profile.setLastName(profileData.getLastName());
                if (profileData.getSuffix() != null) profile.setSuffix(profileData.getSuffix());
                if (profileData.getGender() != null) profile.setGender(profileData.getGender());
                if (profileData.getPronouns() != null) profile.setPronouns(profileData.getPronouns());
                if (profileData.getPreferredLanguage() != null) profile.setPreferredLanguage(profileData.getPreferredLanguage());
                if (profileData.getPrimaryEmail() != null) profile.setPrimaryEmail(profileData.getPrimaryEmail());
                if (profileData.getSecondaryEmail() != null) profile.setSecondaryEmail(profileData.getSecondaryEmail());
                if (profileData.getPrimaryPhone() != null) profile.setPrimaryPhone(profileData.getPrimaryPhone());
                if (profileData.getSecondaryPhone() != null) profile.setSecondaryPhone(profileData.getSecondaryPhone());
                if (profileData.getMobilePhone() != null) profile.setMobilePhone(profileData.getMobilePhone());
                if (profileData.getPreferredContactMethod() != null) profile.setPreferredContactMethod(profileData.getPreferredContactMethod());
                if (profileData.getCommunicationPreferences() != null) profile.setCommunicationPreferences(profileData.getCommunicationPreferences());
            } else {
                profile = profileData;
                profile.setPatientId(patientId);
            }
            
            PatientProfile saved = patientProfileRepository.save(profile);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to update profile: " + e.getMessage(),
                "/api/profile/patient/" + patientId
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/patient/{patientId}/personal-info")
    public ResponseEntity<?> updatePersonalInfo(@PathVariable Long patientId, @RequestBody Map<String, Object> personalData) {
        try {
            Optional<PatientProfile> existingProfile = patientProfileRepository.findByPatientId(patientId);
            PatientProfile profile;
            
            if (existingProfile.isPresent()) {
                profile = existingProfile.get();
            } else {
                profile = new PatientProfile();
                profile.setPatientId(patientId);
            }
            
            // Update personal info fields
            if (personalData.containsKey("firstName")) profile.setFirstName((String) personalData.get("firstName"));
            if (personalData.containsKey("middleName")) profile.setMiddleName((String) personalData.get("middleName"));
            if (personalData.containsKey("lastName")) profile.setLastName((String) personalData.get("lastName"));
            if (personalData.containsKey("suffix")) profile.setSuffix((String) personalData.get("suffix"));
            if (personalData.containsKey("dateOfBirth")) {
                // Handle date of birth if needed
            }
            if (personalData.containsKey("gender")) profile.setGender((String) personalData.get("gender"));
            if (personalData.containsKey("pronouns")) profile.setPronouns((String) personalData.get("pronouns"));
            if (personalData.containsKey("preferredLanguage")) profile.setPreferredLanguage((String) personalData.get("preferredLanguage"));
            if (personalData.containsKey("primaryEmail")) profile.setPrimaryEmail((String) personalData.get("primaryEmail"));
            if (personalData.containsKey("secondaryEmail")) profile.setSecondaryEmail((String) personalData.get("secondaryEmail"));
            if (personalData.containsKey("primaryPhone")) profile.setPrimaryPhone((String) personalData.get("primaryPhone"));
            if (personalData.containsKey("secondaryPhone")) profile.setSecondaryPhone((String) personalData.get("secondaryPhone"));
            if (personalData.containsKey("mobilePhone")) profile.setMobilePhone((String) personalData.get("mobilePhone"));
            if (personalData.containsKey("preferredContactMethod")) profile.setPreferredContactMethod((String) personalData.get("preferredContactMethod"));
            
            PatientProfile saved = patientProfileRepository.save(profile);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to update personal info: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/personal-info"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/patient/{patientId}/picture")
    public ResponseEntity<?> uploadProfilePicture(
            @PathVariable Long patientId,
            @RequestParam("file") MultipartFile file) {
        try {
            // TODO: Implement file upload to storage (S3, local filesystem, etc.)
            // For now, return a placeholder URL
            String fileUrl = "/uploads/profile-pictures/" + patientId + "/" + file.getOriginalFilename();
            
            Optional<PatientProfile> profileOpt = patientProfileRepository.findByPatientId(patientId);
            PatientProfile profile;
            
            if (profileOpt.isPresent()) {
                profile = profileOpt.get();
            } else {
                profile = new PatientProfile();
                profile.setPatientId(patientId);
            }
            
            profile.setProfilePictureUrl(fileUrl);
            PatientProfile saved = patientProfileRepository.save(profile);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile picture uploaded successfully");
            response.put("profilePictureUrl", saved.getProfilePictureUrl());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to upload profile picture: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/picture"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/patient/{patientId}/picture")
    public ResponseEntity<?> deleteProfilePicture(@PathVariable Long patientId) {
        try {
            Optional<PatientProfile> profileOpt = patientProfileRepository.findByPatientId(patientId);
            if (profileOpt.isPresent()) {
                PatientProfile profile = profileOpt.get();
                profile.setProfilePictureUrl(null);
                patientProfileRepository.save(profile);
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile picture deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to delete profile picture: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/picture"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/patient/{patientId}/preferences")
    public ResponseEntity<?> updatePreferences(@PathVariable Long patientId, @RequestBody Map<String, Object> preferences) {
        try {
            Optional<PatientProfile> profileOpt = patientProfileRepository.findByPatientId(patientId);
            PatientProfile profile;
            
            if (profileOpt.isPresent()) {
                profile = profileOpt.get();
            } else {
                profile = new PatientProfile();
                profile.setPatientId(patientId);
            }
            
            // Convert preferences map to JSON string using Jackson ObjectMapper
            try {
                String jsonPreferences = objectMapper.writeValueAsString(preferences);
                profile.setCommunicationPreferences(jsonPreferences);
            } catch (Exception jsonException) {
                ErrorResponse error = new ErrorResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal Server Error",
                    "Failed to serialize preferences: " + jsonException.getMessage(),
                    "/api/profile/patient/" + patientId + "/preferences"
                );
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }
            
            PatientProfile saved = patientProfileRepository.save(profile);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to update preferences: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/preferences"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/patient/{patientId}/preferences")
    public ResponseEntity<?> getPreferences(@PathVariable Long patientId) {
        try {
            Optional<PatientProfile> profileOpt = patientProfileRepository.findByPatientId(patientId);
            if (profileOpt.isPresent() && profileOpt.get().getCommunicationPreferences() != null) {
                // Deserialize JSON string back to Map
                try {
                    Map<String, Object> preferences = objectMapper.readValue(
                        profileOpt.get().getCommunicationPreferences(),
                        Map.class
                    );
                    Map<String, Object> response = new HashMap<>();
                    response.put("preferences", preferences);
                    return ResponseEntity.ok(response);
                } catch (Exception jsonException) {
                    // If deserialization fails, return the raw string (for backward compatibility)
                    Map<String, Object> response = new HashMap<>();
                    response.put("preferences", profileOpt.get().getCommunicationPreferences());
                    return ResponseEntity.ok(response);
                }
            } else {
                return ResponseEntity.ok(new HashMap<>());
            }
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to get preferences: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/preferences"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ========== Emergency Contacts Endpoints ==========

    @GetMapping("/patient/{patientId}/emergency-contacts")
    public ResponseEntity<?> getEmergencyContacts(@PathVariable Long patientId) {
        try {
            List<EmergencyContact> contacts = emergencyContactRepository.findByPatientId(patientId);
            return ResponseEntity.ok(contacts);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to retrieve emergency contacts: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/emergency-contacts"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/patient/{patientId}/emergency-contacts")
    public ResponseEntity<?> addEmergencyContact(@PathVariable Long patientId, @Valid @RequestBody EmergencyContact contact) {
        try {
            contact.setPatientId(patientId);
            
            // If this is set as primary, unset other primary contacts
            if (contact.getIsPrimary() != null && contact.getIsPrimary()) {
                List<EmergencyContact> existingPrimary = emergencyContactRepository.findByPatientIdAndIsPrimary(patientId, true);
                for (EmergencyContact ec : existingPrimary) {
                    ec.setIsPrimary(false);
                    emergencyContactRepository.save(ec);
                }
            }
            
            EmergencyContact saved = emergencyContactRepository.save(contact);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to add emergency contact: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/emergency-contacts"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/patient/{patientId}/emergency-contacts/{contactId}")
    public ResponseEntity<?> updateEmergencyContact(
            @PathVariable Long patientId,
            @PathVariable Long contactId,
            @Valid @RequestBody EmergencyContact contactData) {
        try {
            Optional<EmergencyContact> contactOpt = emergencyContactRepository.findById(contactId);
            if (contactOpt.isEmpty() || !contactOpt.get().getPatientId().equals(patientId)) {
                ErrorResponse error = new ErrorResponse(
                    HttpStatus.NOT_FOUND.value(),
                    "Not Found",
                    "Emergency contact not found",
                    "/api/profile/patient/" + patientId + "/emergency-contacts/" + contactId
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            EmergencyContact contact = contactOpt.get();
            // Update fields
            if (contactData.getFirstName() != null) contact.setFirstName(contactData.getFirstName());
            if (contactData.getLastName() != null) contact.setLastName(contactData.getLastName());
            if (contactData.getRelationship() != null) contact.setRelationship(contactData.getRelationship());
            if (contactData.getPrimaryPhone() != null) contact.setPrimaryPhone(contactData.getPrimaryPhone());
            if (contactData.getSecondaryPhone() != null) contact.setSecondaryPhone(contactData.getSecondaryPhone());
            if (contactData.getEmail() != null) contact.setEmail(contactData.getEmail());
            if (contactData.getAddressLine1() != null) contact.setAddressLine1(contactData.getAddressLine1());
            if (contactData.getAddressLine2() != null) contact.setAddressLine2(contactData.getAddressLine2());
            if (contactData.getCity() != null) contact.setCity(contactData.getCity());
            if (contactData.getState() != null) contact.setState(contactData.getState());
            if (contactData.getZipCode() != null) contact.setZipCode(contactData.getZipCode());
            if (contactData.getCountry() != null) contact.setCountry(contactData.getCountry());
            
            // Handle primary flag
            if (contactData.getIsPrimary() != null) {
                if (contactData.getIsPrimary() && !contact.getIsPrimary()) {
                    // Unset other primary contacts
                    List<EmergencyContact> existingPrimary = emergencyContactRepository.findByPatientIdAndIsPrimary(patientId, true);
                    for (EmergencyContact ec : existingPrimary) {
                        if (!ec.getId().equals(contactId)) {
                            ec.setIsPrimary(false);
                            emergencyContactRepository.save(ec);
                        }
                    }
                }
                contact.setIsPrimary(contactData.getIsPrimary());
            }
            
            EmergencyContact saved = emergencyContactRepository.save(contact);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to update emergency contact: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/emergency-contacts/" + contactId
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/patient/{patientId}/emergency-contacts/{contactId}")
    public ResponseEntity<?> deleteEmergencyContact(@PathVariable Long patientId, @PathVariable Long contactId) {
        try {
            Optional<EmergencyContact> contactOpt = emergencyContactRepository.findById(contactId);
            if (contactOpt.isEmpty() || !contactOpt.get().getPatientId().equals(patientId)) {
                ErrorResponse error = new ErrorResponse(
                    HttpStatus.NOT_FOUND.value(),
                    "Not Found",
                    "Emergency contact not found",
                    "/api/profile/patient/" + patientId + "/emergency-contacts/" + contactId
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            emergencyContactRepository.deleteById(contactId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Emergency contact deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to delete emergency contact: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/emergency-contacts/" + contactId
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ========== Payment Methods Endpoints ==========

    @GetMapping("/patient/{patientId}/payment-methods")
    public ResponseEntity<?> getPaymentMethods(@PathVariable Long patientId) {
        try {
            List<PaymentMethod> methods = paymentMethodRepository.findByPatientIdAndIsActive(patientId, true);
            return ResponseEntity.ok(methods);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to retrieve payment methods: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/payment-methods"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/patient/{patientId}/payment-methods")
    public ResponseEntity<?> addPaymentMethod(@PathVariable Long patientId, @Valid @RequestBody PaymentMethod paymentMethod) {
        try {
            paymentMethod.setPatientId(patientId);
            
            // If this is set as default, unset other default methods
            if (paymentMethod.getIsDefault() != null && paymentMethod.getIsDefault()) {
                Optional<PaymentMethod> existingDefault = paymentMethodRepository.findByPatientIdAndIsDefault(patientId, true);
                if (existingDefault.isPresent()) {
                    existingDefault.get().setIsDefault(false);
                    paymentMethodRepository.save(existingDefault.get());
                }
            }
            
            PaymentMethod saved = paymentMethodRepository.save(paymentMethod);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to add payment method: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/payment-methods"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/patient/{patientId}/payment-methods/{methodId}")
    public ResponseEntity<?> updatePaymentMethod(
            @PathVariable Long patientId,
            @PathVariable Long methodId,
            @Valid @RequestBody PaymentMethod paymentMethodData) {
        try {
            Optional<PaymentMethod> methodOpt = paymentMethodRepository.findById(methodId);
            if (methodOpt.isEmpty() || !methodOpt.get().getPatientId().equals(patientId)) {
                ErrorResponse error = new ErrorResponse(
                    HttpStatus.NOT_FOUND.value(),
                    "Not Found",
                    "Payment method not found",
                    "/api/profile/patient/" + patientId + "/payment-methods/" + methodId
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            PaymentMethod method = methodOpt.get();
            // Update fields (excluding sensitive data like encrypted token)
            if (paymentMethodData.getCardholderName() != null) method.setCardholderName(paymentMethodData.getCardholderName());
            if (paymentMethodData.getBillingAddressLine1() != null) method.setBillingAddressLine1(paymentMethodData.getBillingAddressLine1());
            if (paymentMethodData.getBillingAddressLine2() != null) method.setBillingAddressLine2(paymentMethodData.getBillingAddressLine2());
            if (paymentMethodData.getBillingCity() != null) method.setBillingCity(paymentMethodData.getBillingCity());
            if (paymentMethodData.getBillingState() != null) method.setBillingState(paymentMethodData.getBillingState());
            if (paymentMethodData.getBillingZipCode() != null) method.setBillingZipCode(paymentMethodData.getBillingZipCode());
            if (paymentMethodData.getBillingCountry() != null) method.setBillingCountry(paymentMethodData.getBillingCountry());
            
            // Handle default flag
            if (paymentMethodData.getIsDefault() != null && paymentMethodData.getIsDefault() && !method.getIsDefault()) {
                Optional<PaymentMethod> existingDefault = paymentMethodRepository.findByPatientIdAndIsDefault(patientId, true);
                if (existingDefault.isPresent()) {
                    existingDefault.get().setIsDefault(false);
                    paymentMethodRepository.save(existingDefault.get());
                }
                method.setIsDefault(true);
            }
            
            PaymentMethod saved = paymentMethodRepository.save(method);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to update payment method: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/payment-methods/" + methodId
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/patient/{patientId}/payment-methods/{methodId}")
    public ResponseEntity<?> deletePaymentMethod(@PathVariable Long patientId, @PathVariable Long methodId) {
        try {
            Optional<PaymentMethod> methodOpt = paymentMethodRepository.findById(methodId);
            if (methodOpt.isEmpty() || !methodOpt.get().getPatientId().equals(patientId)) {
                ErrorResponse error = new ErrorResponse(
                    HttpStatus.NOT_FOUND.value(),
                    "Not Found",
                    "Payment method not found",
                    "/api/profile/patient/" + patientId + "/payment-methods/" + methodId
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Soft delete by setting isActive to false
            PaymentMethod method = methodOpt.get();
            method.setIsActive(false);
            paymentMethodRepository.save(method);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Payment method deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to delete payment method: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/payment-methods/" + methodId
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/patient/{patientId}/payment-methods/{methodId}/set-default")
    public ResponseEntity<?> setDefaultPaymentMethod(@PathVariable Long patientId, @PathVariable Long methodId) {
        try {
            Optional<PaymentMethod> methodOpt = paymentMethodRepository.findById(methodId);
            if (methodOpt.isEmpty() || !methodOpt.get().getPatientId().equals(patientId)) {
                ErrorResponse error = new ErrorResponse(
                    HttpStatus.NOT_FOUND.value(),
                    "Not Found",
                    "Payment method not found",
                    "/api/profile/patient/" + patientId + "/payment-methods/" + methodId + "/set-default"
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Unset other default methods
            Optional<PaymentMethod> existingDefault = paymentMethodRepository.findByPatientIdAndIsDefault(patientId, true);
            if (existingDefault.isPresent() && !existingDefault.get().getId().equals(methodId)) {
                existingDefault.get().setIsDefault(false);
                paymentMethodRepository.save(existingDefault.get());
            }
            
            // Set this as default
            PaymentMethod method = methodOpt.get();
            method.setIsDefault(true);
            PaymentMethod saved = paymentMethodRepository.save(method);
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to set default payment method: " + e.getMessage(),
                "/api/profile/patient/" + patientId + "/payment-methods/" + methodId + "/set-default"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

