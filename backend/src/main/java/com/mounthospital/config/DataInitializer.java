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
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            initializeData();
        }
    }

    private void initializeData() {
        // Create Users
        User admin = new User("admin", "admin@hospital.com", passwordEncoder.encode("admin123"), "Admin User", Role.ADMIN);
        User doctor1 = new User("doctor1", "doctor1@hospital.com", passwordEncoder.encode("doctor123"), "Dr. John Smith", Role.DOCTOR);
        User doctor2 = new User("doctor2", "doctor2@hospital.com", passwordEncoder.encode("doctor123"), "Dr. Sarah Johnson", Role.DOCTOR);
        User nurse1 = new User("nurse1", "nurse1@hospital.com", passwordEncoder.encode("nurse123"), "Nurse Emily Davis", Role.NURSE);
        User patient1 = new User("patient1", "patient1@email.com", passwordEncoder.encode("patient123"), "John Doe", Role.PATIENT);
        User patient2 = new User("patient2", "patient2@email.com", passwordEncoder.encode("patient123"), "Jane Smith", Role.PATIENT);

        admin = userRepository.save(admin);
        doctor1 = userRepository.save(doctor1);
        doctor2 = userRepository.save(doctor2);
        nurse1 = userRepository.save(nurse1);
        patient1 = userRepository.save(patient1);
        patient2 = userRepository.save(patient2);

        // Create Doctors
        Doctor doc1 = new Doctor("Dr. John Smith", "doctor1@hospital.com", "555-0101", "Cardiology");
        Doctor doc2 = new Doctor("Dr. Sarah Johnson", "doctor2@hospital.com", "555-0102", "Pediatrics");
        doc1 = doctorRepository.save(doc1);
        doc2 = doctorRepository.save(doc2);

        // Create Nurses
        Nurse nurse = new Nurse("Nurse Emily Davis", "nurse1@hospital.com", "555-0201", "Emergency");
        nurse = nurseRepository.save(nurse);

        // Create Patients
        Patient pat1 = new Patient(patient1.getId(), "John Doe", "patient1@email.com", 
                "555-1001", "123 Main St, City", "1990-05-15", "O+", "Jane Doe - 555-1002");
        Patient pat2 = new Patient(patient2.getId(), "Jane Smith", "patient2@email.com", 
                "555-1003", "456 Oak Ave, City", "1985-08-20", "A+", "John Smith - 555-1004");
        pat1 = patientRepository.save(pat1);
        pat2 = patientRepository.save(pat2);

        // Create Appointments
        Appointment appt1 = new Appointment(pat1.getId(), doc1.getId(), 
                LocalDate.now().plusDays(7), LocalTime.of(10, 0), "SCHEDULED", "Regular checkup");
        Appointment appt2 = new Appointment(pat2.getId(), doc2.getId(), 
                LocalDate.now().plusDays(14), LocalTime.of(14, 30), "SCHEDULED", "Follow-up appointment");
        Appointment appt3 = new Appointment(pat1.getId(), doc1.getId(), 
                LocalDate.now().minusDays(5), LocalTime.of(11, 0), "COMPLETED", "Completed successfully");
        appointmentRepository.save(appt1);
        appointmentRepository.save(appt2);
        appointmentRepository.save(appt3);

        // Create Test Results
        TestResult test1 = new TestResult(pat1.getId(), "Blood Test", LocalDate.now().minusDays(3), 
                "Normal - All values within range", "Routine blood work");
        TestResult test2 = new TestResult(pat2.getId(), "X-Ray", LocalDate.now().minusDays(1), 
                "Clear - No abnormalities detected", "Chest X-Ray");
        TestResult test3 = new TestResult(pat1.getId(), "ECG", LocalDate.now().minusDays(7), 
                "Normal sinus rhythm", "Electrocardiogram");
        testResultRepository.save(test1);
        testResultRepository.save(test2);
        testResultRepository.save(test3);

        // Create Insurance
        Insurance ins1 = new Insurance(pat1.getId(), "BlueCross BlueShield", "BC123456", 
                "Premium", LocalDate.now().plusYears(1));
        Insurance ins2 = new Insurance(pat2.getId(), "Aetna", "AE789012", 
                "Standard", LocalDate.now().plusMonths(6));
        insuranceRepository.save(ins1);
        insuranceRepository.save(ins2);

        // Create Payments
        Payment pay1 = new Payment(pat1.getId(), new BigDecimal("150.00"), 
                LocalDate.now().minusDays(10), "Credit Card", "PAID");
        Payment pay2 = new Payment(pat2.getId(), new BigDecimal("200.00"), 
                LocalDate.now().minusDays(5), "Insurance", "PAID");
        Payment pay3 = new Payment(pat1.getId(), new BigDecimal("75.50"), 
                LocalDate.now().plusDays(7), "Credit Card", "PENDING");
        paymentRepository.save(pay1);
        paymentRepository.save(pay2);
        paymentRepository.save(pay3);

        System.out.println("Sample data initialized successfully!");
    }
}
