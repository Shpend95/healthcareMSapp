package com.mounthospital.config;

import com.mounthospital.model.*;
import com.mounthospital.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TestResultRepository testResultRepository;

    @Autowired
    private InsuranceRepository insuranceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            initializeData();
        }
    }

    private void initializeData() {
        // Create Users
        User admin = new User("admin", "admin@mounthospital.com",
                "admin123", Role.ADMIN, "Admin User");
        admin = userRepository.save(admin);

        User doctor1 = new User("drjohn", "drjohn@mounthospital.com",
                "doctor123", Role.DOCTOR, "Dr. John Smith");
        doctor1 = userRepository.save(doctor1);

        User doctor2 = new User("drsarah", "drsarah@mounthospital.com",
                "doctor123", Role.DOCTOR, "Dr. Sarah Johnson");
        doctor2 = userRepository.save(doctor2);

        User nurse1 = new User("nurse1", "nurse1@mounthospital.com",
                "nurse123", Role.NURSE, "Nurse Emily Brown");
        nurse1 = userRepository.save(nurse1);

        User patient1 = new User("patient1", "patient1@example.com",
                "patient123", Role.PATIENT, "John Doe");
        patient1 = userRepository.save(patient1);

        User patient2 = new User("patient2", "patient2@example.com",
                "patient123", Role.PATIENT, "Jane Smith");
        patient2 = userRepository.save(patient2);

        User patient3 = new User("patient3", "patient3@example.com",
                "patient123", Role.PATIENT, "Bob Wilson");
        patient3 = userRepository.save(patient3);

        // Create Doctors
        Doctor doc1 = new Doctor("Dr. John Smith", "drjohn@mounthospital.com",
                "555-0101", "Cardiology");
        doc1 = doctorRepository.save(doc1);

        Doctor doc2 = new Doctor("Dr. Sarah Johnson", "drsarah@mounthospital.com",
                "555-0102", "Pediatrics");
        doc2 = doctorRepository.save(doc2);

        Doctor doc3 = new Doctor("Dr. Michael Brown", "drmichael@mounthospital.com",
                "555-0103", "Orthopedics");
        doc3 = doctorRepository.save(doc3);

        // Create Nurses
        Nurse nurse1Entity = new Nurse("Nurse Emily Brown", "nurse1@mounthospital.com",
                "555-0201", "Emergency");
        nurse1Entity = nurseRepository.save(nurse1Entity);

        Nurse nurse2 = new Nurse("Nurse David Lee", "nurse2@mounthospital.com",
                "555-0202", "ICU");
        nurse2 = nurseRepository.save(nurse2);

        // Create Patients
        Patient pat1 = new Patient(patient1.getId(), "John Doe", "patient1@example.com",
                "555-1001", "123 Main St, City, State",
                LocalDate.of(1985, 5, 15), "O+", "Jane Doe - 555-1002");
        pat1 = patientRepository.save(pat1);

        Patient pat2 = new Patient(patient2.getId(), "Jane Smith", "patient2@example.com",
                "555-1003", "456 Oak Ave, City, State",
                LocalDate.of(1990, 8, 22), "A+", "John Smith - 555-1004");
        pat2 = patientRepository.save(pat2);

        Patient pat3 = new Patient(patient3.getId(), "Bob Wilson", "patient3@example.com",
                "555-1005", "789 Pine Rd, City, State",
                LocalDate.of(1978, 3, 10), "B+", "Alice Wilson - 555-1006");
        pat3 = patientRepository.save(pat3);

        // Create Appointments
        Appointment appt1 = new Appointment(pat1.getId(), doc1.getId(),
                LocalDate.now().plusDays(5),
                LocalTime.of(10, 0), "SCHEDULED",
                "Regular checkup");
        appointmentRepository.save(appt1);

        Appointment appt2 = new Appointment(pat2.getId(), doc2.getId(),
                LocalDate.now().plusDays(7),
                LocalTime.of(14, 30), "SCHEDULED",
                "Follow-up appointment");
        appointmentRepository.save(appt2);

        Appointment appt3 = new Appointment(pat1.getId(), doc1.getId(),
                LocalDate.now().minusDays(10),
                LocalTime.of(9, 0), "COMPLETED",
                "Previous consultation");
        appointmentRepository.save(appt3);

        Appointment appt4 = new Appointment(pat3.getId(), doc3.getId(),
                LocalDate.now().plusDays(3),
                LocalTime.of(11, 0), "SCHEDULED",
                "X-ray review");
        appointmentRepository.save(appt4);

        // Create Test Results
        TestResult test1 = new TestResult(pat1.getId(), "Blood Test",
                LocalDate.now().minusDays(5),
                "Normal", "All parameters within normal range");
        testResultRepository.save(test1);

        TestResult test2 = new TestResult(pat1.getId(), "X-Ray Chest",
                LocalDate.now().minusDays(3),
                "Clear", "No abnormalities detected");
        testResultRepository.save(test2);

        TestResult test3 = new TestResult(pat2.getId(), "Blood Test",
                LocalDate.now().minusDays(7),
                "Normal", "Routine checkup results");
        testResultRepository.save(test3);

        TestResult test4 = new TestResult(pat3.getId(), "MRI Scan",
                LocalDate.now().minusDays(2),
                "Pending Review", "Results under review by specialist");
        testResultRepository.save(test4);

        // Create Insurance
        Insurance ins1 = new Insurance(pat1.getId(), "HealthCare Plus", "HCP-12345",
                "Premium", LocalDate.now().plusYears(1));
        insuranceRepository.save(ins1);

        Insurance ins2 = new Insurance(pat2.getId(), "MediCover", "MC-67890",
                "Standard", LocalDate.now().plusMonths(6));
        insuranceRepository.save(ins2);

        Insurance ins3 = new Insurance(pat3.getId(), "HealthGuard", "HG-11111",
                "Basic", LocalDate.now().plusYears(2));
        insuranceRepository.save(ins3);

        // Create Payments
        Payment pay1 = new Payment(pat1.getId(), new BigDecimal("150.00"),
                LocalDate.now().minusDays(5), "Credit Card", "COMPLETED");
        paymentRepository.save(pay1);

        Payment pay2 = new Payment(pat1.getId(), new BigDecimal("200.00"),
                LocalDate.now().plusDays(5), "Insurance", "PENDING");
        paymentRepository.save(pay2);

        Payment pay3 = new Payment(pat2.getId(), new BigDecimal("100.00"),
                LocalDate.now().minusDays(3), "Cash", "COMPLETED");
        paymentRepository.save(pay3);

        Payment pay4 = new Payment(pat3.getId(), new BigDecimal("300.00"),
                LocalDate.now().plusDays(10), "Debit Card", "PENDING");
        paymentRepository.save(pay4);

        Payment pay5 = new Payment(pat2.getId(), new BigDecimal("75.00"),
                LocalDate.now().minusDays(1), "Credit Card", "COMPLETED");
        paymentRepository.save(pay5);
    }
}