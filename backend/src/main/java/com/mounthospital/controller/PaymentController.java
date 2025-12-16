package com.mounthospital.controller;

import com.mounthospital.dto.ErrorResponse;
import com.mounthospital.model.Payment;
import com.mounthospital.repository.PaymentRepository;
import com.mounthospital.repository.PatientRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping
    public ResponseEntity<?> createPayment(@Valid @RequestBody Payment payment) {
        // Validate patient exists
        if (!patientRepository.existsById(payment.getPatientId())) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Patient with ID " + payment.getPatientId() + " not found",
                "/api/payments"
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        Payment savedPayment = paymentRepository.save(payment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPayment);
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        Optional<Payment> payment = paymentRepository.findById(id);
        
        if (payment.isPresent()) {
            return ResponseEntity.ok(payment.get());
        } else {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Payment with ID " + id + " not found",
                "/api/payments/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Payment>> getPaymentsByPatientId(@PathVariable Long patientId) {
        List<Payment> payments = paymentRepository.findByPatientId(patientId);
        return ResponseEntity.ok(payments);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayment(@PathVariable Long id, @Valid @RequestBody Payment paymentDetails) {
        Optional<Payment> paymentOptional = paymentRepository.findById(id);
        
        if (paymentOptional.isEmpty()) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Payment with ID " + id + " not found",
                "/api/payments/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Payment payment = paymentOptional.get();
        
        // Validate patient exists if patientId is being updated
        if (paymentDetails.getPatientId() != null && 
            !patientRepository.existsById(paymentDetails.getPatientId())) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Patient with ID " + paymentDetails.getPatientId() + " not found",
                "/api/payments/" + id
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // Update fields
        if (paymentDetails.getPatientId() != null) {
            payment.setPatientId(paymentDetails.getPatientId());
        }
        if (paymentDetails.getAmount() != null) {
            payment.setAmount(paymentDetails.getAmount());
        }
        if (paymentDetails.getPaymentDate() != null) {
            payment.setPaymentDate(paymentDetails.getPaymentDate());
        }
        if (paymentDetails.getPaymentMethod() != null) {
            payment.setPaymentMethod(paymentDetails.getPaymentMethod());
        }
        if (paymentDetails.getStatus() != null) {
            payment.setStatus(paymentDetails.getStatus());
        }

        Payment updatedPayment = paymentRepository.save(payment);
        return ResponseEntity.ok(updatedPayment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        Optional<Payment> payment = paymentRepository.findById(id);
        
        if (payment.isPresent()) {
            paymentRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Payment deleted successfully", "id", id));
        } else {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "Payment with ID " + id + " not found",
                "/api/payments/" + id
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}

