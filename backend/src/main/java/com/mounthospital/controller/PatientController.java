package com.mounthospital.controller;

import com.mounthospital.dto.ErrorResponse;
import com.mounthospital.dto.PatientUpdateRequest;
import com.mounthospital.model.Patient;
import com.mounthospital.model.EmergencyContact;
import com.mounthospital.repository.PatientRepository;
import com.mounthospital.repository.EmergencyContactRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @PostMapping
    public ResponseEntity<?> createPatient(@Valid @RequestBody Patient patient) {
        // Check if email already exists
        if (patientRepository.findByEmail(patient.getEmail()).isPresent()) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Email already exists",
                "/api/patients"
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        Patient savedPatient = patientRepository.save(patient);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPatient);
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Long id) {
        Optional<Patient> patient = patientRepository.findById(id);
        
        if (patient.isPresent()) {
            return ResponseEntity.ok(patient.get());
        } else {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Patient with ID " + id + " not found",
                "/api/patients/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPatientByUserId(@PathVariable Long userId) {
        List<Patient> patients = patientRepository.findByUserId(userId);
        
        if (patients == null || patients.isEmpty()) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Patient record not found for user ID " + userId + ". Please contact support.",
                "/api/patients/user/" + userId
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        
        // Return the first patient if multiple exist (should typically be one)
        Patient firstPatient = patients.get(0);
        if (firstPatient == null) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Patient record not found for user ID " + userId + ". Please contact support.",
                "/api/patients/user/" + userId
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(firstPatient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @RequestBody Map<String, Object> requestBody) {
        Optional<Patient> patientOptional = patientRepository.findById(id);
        
        if (patientOptional.isEmpty()) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Patient with ID " + id + " not found",
                "/api/patients/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Patient patient = patientOptional.get();
        
        // Update patient fields if provided
        if (requestBody.containsKey("name") && requestBody.get("name") != null) {
            patient.setName((String) requestBody.get("name"));
        }
        if (requestBody.containsKey("email") && requestBody.get("email") != null) {
            String email = (String) requestBody.get("email");
            // Check if email already exists (excluding current patient)
            Optional<Patient> existingPatientOpt = patientRepository.findByEmail(email);
            if (existingPatientOpt.isPresent()) {
                Patient existingPatient = existingPatientOpt.get();
                if (existingPatient != null && existingPatient.getId() != null && !existingPatient.getId().equals(id)) {
                    ErrorResponse error = new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        "Bad Request",
                        "Email already exists",
                        "/api/patients/" + id
                    );
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
                }
            }
            patient.setEmail(email);
        }
        if (requestBody.containsKey("phone") && requestBody.get("phone") != null) {
            patient.setPhone((String) requestBody.get("phone"));
        }
        if (requestBody.containsKey("dateOfBirth") && requestBody.get("dateOfBirth") != null) {
            String dateStr = requestBody.get("dateOfBirth").toString();
            try {
                patient.setDateOfBirth(java.time.LocalDate.parse(dateStr));
            } catch (Exception e) {
                // If parsing fails, try ISO format or other formats
                patient.setDateOfBirth(java.time.LocalDate.parse(dateStr));
            }
        }
        if (requestBody.containsKey("address") && requestBody.get("address") != null) {
            patient.setAddress((String) requestBody.get("address"));
        }

        Patient updatedPatient = patientRepository.save(patient);

        // Handle emergency contact update if provided
        if (requestBody.containsKey("emergencyContact") && requestBody.get("emergencyContact") != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> emergencyContactData = (Map<String, Object>) requestBody.get("emergencyContact");
            if (emergencyContactData != null && !emergencyContactData.isEmpty()) {
                // Get existing primary emergency contact or create new one
                List<EmergencyContact> existingContacts = emergencyContactRepository.findByPatientIdAndIsPrimary(id, true);
                EmergencyContact emergencyContact;
                
                if (!existingContacts.isEmpty()) {
                    emergencyContact = existingContacts.get(0);
                } else {
                    emergencyContact = new EmergencyContact();
                    emergencyContact.setPatientId(id);
                    emergencyContact.setIsPrimary(true);
                }
                
                // Update emergency contact fields
                if (emergencyContactData.containsKey("firstName") && emergencyContactData.get("firstName") != null) {
                    emergencyContact.setFirstName((String) emergencyContactData.get("firstName"));
                }
                if (emergencyContactData.containsKey("lastName") && emergencyContactData.get("lastName") != null) {
                    emergencyContact.setLastName((String) emergencyContactData.get("lastName"));
                }
                if (emergencyContactData.containsKey("relationship") && emergencyContactData.get("relationship") != null) {
                    emergencyContact.setRelationship((String) emergencyContactData.get("relationship"));
                }
                if (emergencyContactData.containsKey("primaryPhone") && emergencyContactData.get("primaryPhone") != null) {
                    emergencyContact.setPrimaryPhone((String) emergencyContactData.get("primaryPhone"));
                }
                if (emergencyContactData.containsKey("secondaryPhone") && emergencyContactData.get("secondaryPhone") != null) {
                    emergencyContact.setSecondaryPhone((String) emergencyContactData.get("secondaryPhone"));
                }
                if (emergencyContactData.containsKey("email") && emergencyContactData.get("email") != null) {
                    emergencyContact.setEmail((String) emergencyContactData.get("email"));
                }
                
                emergencyContactRepository.save(emergencyContact);
            }
        }

        return ResponseEntity.ok(updatedPatient);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setStatus(HttpStatus.BAD_REQUEST.value());
        errorResponse.setError("Validation Failed");
        errorResponse.setMessage("Please check the input data");
        errorResponse.setPath("/api/patients");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
}
