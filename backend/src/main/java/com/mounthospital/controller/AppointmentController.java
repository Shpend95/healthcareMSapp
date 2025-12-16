package com.mounthospital.controller;

import com.mounthospital.dto.ErrorResponse;
import com.mounthospital.model.Appointment;
import com.mounthospital.repository.AppointmentRepository;
import com.mounthospital.repository.PatientRepository;
import com.mounthospital.repository.DoctorRepository;
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
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping
    public ResponseEntity<?> createAppointment(@Valid @RequestBody Appointment appointment) {
        // Validate patient exists
        if (!patientRepository.existsById(appointment.getPatientId())) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Patient with ID " + appointment.getPatientId() + " not found",
                "/api/appointments"
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // Validate doctor exists
        if (!doctorRepository.existsById(appointment.getDoctorId())) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Doctor with ID " + appointment.getDoctorId() + " not found",
                "/api/appointments"
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAppointment);
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentRepository.findById(id);
        
        if (appointment.isPresent()) {
            return ResponseEntity.ok(appointment.get());
        } else {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Appointment with ID " + id + " not found",
                "/api/appointments/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatientId(@PathVariable Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        return ResponseEntity.ok(appointments);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @Valid @RequestBody Appointment appointmentDetails) {
        Optional<Appointment> appointmentOptional = appointmentRepository.findById(id);
        
        if (appointmentOptional.isEmpty()) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Appointment with ID " + id + " not found",
                "/api/appointments/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Appointment appointment = appointmentOptional.get();
        
        // Validate patient exists if patientId is being updated
        if (appointmentDetails.getPatientId() != null && 
            !patientRepository.existsById(appointmentDetails.getPatientId())) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Patient with ID " + appointmentDetails.getPatientId() + " not found",
                "/api/appointments/" + id
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // Validate doctor exists if doctorId is being updated
        if (appointmentDetails.getDoctorId() != null && 
            !doctorRepository.existsById(appointmentDetails.getDoctorId())) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Doctor with ID " + appointmentDetails.getDoctorId() + " not found",
                "/api/appointments/" + id
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // Update fields
        if (appointmentDetails.getPatientId() != null) {
            appointment.setPatientId(appointmentDetails.getPatientId());
        }
        if (appointmentDetails.getDoctorId() != null) {
            appointment.setDoctorId(appointmentDetails.getDoctorId());
        }
        if (appointmentDetails.getAppointmentDate() != null) {
            appointment.setAppointmentDate(appointmentDetails.getAppointmentDate());
        }
        if (appointmentDetails.getAppointmentTime() != null) {
            appointment.setAppointmentTime(appointmentDetails.getAppointmentTime());
        }
        if (appointmentDetails.getStatus() != null) {
            appointment.setStatus(appointmentDetails.getStatus());
        }
        if (appointmentDetails.getNotes() != null) {
            appointment.setNotes(appointmentDetails.getNotes());
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return ResponseEntity.ok(updatedAppointment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentRepository.findById(id);
        
        if (appointment.isPresent()) {
            appointmentRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Appointment deleted successfully", "id", id));
        } else {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Appointment with ID " + id + " not found",
                "/api/appointments/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
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
        errorResponse.setPath("/api/appointments");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
}
