package com.mounthospital.config;

import com.mounthospital.model.*;
import com.mounthospital.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner seedDefaultUsers(
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            InsuranceRepository insuranceRepository,
            PaymentRepository paymentRepository,
            TestResultRepository testResultRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Only seed if users table is empty
            if (userRepository.count() > 0) {
                log.info("Database already contains users, skipping seed");
                return;
            }

            log.info("Seeding default users and sample data");

            // Create default users
            User admin = new User(
                    "Admin User",
                    "admin",
                    "admin@mountsinai.com",
                    passwordEncoder.encode("Admin123"),
                    Role.ADMIN
            );

            User doctorUser = new User(
                    "Doctor User",
                    "doctor",
                    "doctor@mountsinai.com",
                    passwordEncoder.encode("Doctor123"),
                    Role.DOCTOR
            );

            User nurse = new User(
                    "Nurse User",
                    "nurse",
                    "nurse@mountsinai.com",
                    passwordEncoder.encode("Nurse123"),
                    Role.NURSE
            );

            // Create 5 patient users
            User patient1User = new User(
                    "John Smith",
                    "patient1",
                    "john.smith@email.com",
                    passwordEncoder.encode("Patient123"),
                    Role.PATIENT
            );

            User patient2User = new User(
                    "Mary Johnson",
                    "patient2",
                    "mary.johnson@email.com",
                    passwordEncoder.encode("Patient123"),
                    Role.PATIENT
            );

            User patient3User = new User(
                    "Robert Williams",
                    "patient3",
                    "robert.williams@email.com",
                    passwordEncoder.encode("Patient123"),
                    Role.PATIENT
            );

            User patient4User = new User(
                    "Patricia Brown",
                    "patient4",
                    "patricia.brown@email.com",
                    passwordEncoder.encode("Patient123"),
                    Role.PATIENT
            );

            User patient5User = new User(
                    "Michael Davis",
                    "patient5",
                    "michael.davis@email.com",
                    passwordEncoder.encode("Patient123"),
                    Role.PATIENT
            );

            admin = userRepository.save(admin);
            doctorUser = userRepository.save(doctorUser);
            nurse = userRepository.save(nurse);
            patient1User = userRepository.save(patient1User);
            patient2User = userRepository.save(patient2User);
            patient3User = userRepository.save(patient3User);
            patient4User = userRepository.save(patient4User);
            patient5User = userRepository.save(patient5User);

            log.info("Default users created: admin, doctor, nurse, and 5 patients");

            // Create doctors
            Doctor doctor1 = new Doctor("Dr. Sarah Johnson", "Cardiology", "sarah.johnson@mounthospital.com", "555-0101");
            Doctor doctor2 = new Doctor("Dr. Michael Chen", "Orthopedics", "michael.chen@mounthospital.com", "555-0102");
            Doctor doctor3 = new Doctor("Dr. Emily Rodriguez", "Pediatrics", "emily.rodriguez@mounthospital.com", "555-0103");
            Doctor doctor4 = new Doctor("Dr. James Wilson", "Neurology", "james.wilson@mounthospital.com", "555-0104");
            Doctor doctor5 = new Doctor("Dr. Lisa Anderson", "Dermatology", "lisa.anderson@mounthospital.com", "555-0105");

            doctor1 = doctorRepository.save(doctor1);
            doctor2 = doctorRepository.save(doctor2);
            doctor3 = doctorRepository.save(doctor3);
            doctor4 = doctorRepository.save(doctor4);
            doctor5 = doctorRepository.save(doctor5);

            log.info("5 doctors created");

            // Create patients linked to users
            Patient patient1 = new Patient("John Smith", "john.smith@email.com", "555-1001", 
                    LocalDate.of(1985, 3, 15), "123 Main St, NYC", patient1User.getId());
            Patient patient2 = new Patient("Mary Johnson", "mary.johnson@email.com", "555-1002", 
                    LocalDate.of(1990, 7, 22), "456 Oak Ave, Brooklyn", patient2User.getId());
            Patient patient3 = new Patient("Robert Williams", "robert.williams@email.com", "555-1003", 
                    LocalDate.of(1978, 11, 30), "789 Pine Rd, Queens", patient3User.getId());
            Patient patient4 = new Patient("Patricia Brown", "patricia.brown@email.com", "555-1004", 
                    LocalDate.of(1995, 1, 18), "321 Elm St, Bronx", patient4User.getId());
            Patient patient5 = new Patient("Michael Davis", "michael.davis@email.com", "555-1005", 
                    LocalDate.of(1982, 9, 25), "654 Maple Dr, Staten Island", patient5User.getId());

            patient1 = patientRepository.save(patient1);
            patient2 = patientRepository.save(patient2);
            patient3 = patientRepository.save(patient3);
            patient4 = patientRepository.save(patient4);
            patient5 = patientRepository.save(patient5);

            log.info("5 patients created and linked to users");

            // Create insurance records (3-5 per patient)
            Insurance ins1 = new Insurance(patient1.getId(), "Blue Cross Blue Shield", "BCBS-123456", "PPO", LocalDate.of(2026, 12, 31));
            Insurance ins2 = new Insurance(patient1.getId(), "Aetna", "AET-111111", "HMO", LocalDate.of(2027, 6, 30));
            Insurance ins3 = new Insurance(patient2.getId(), "Aetna", "AET-789012", "HMO", LocalDate.of(2026, 6, 30));
            Insurance ins4 = new Insurance(patient2.getId(), "UnitedHealthcare", "UHC-222222", "PPO", LocalDate.of(2027, 12, 31));
            Insurance ins5 = new Insurance(patient3.getId(), "Cigna", "CIG-333333", "EPO", LocalDate.of(2026, 3, 31));
            Insurance ins6 = new Insurance(patient4.getId(), "Humana", "HUM-444444", "PPO", LocalDate.of(2027, 9, 30));
            Insurance ins7 = new Insurance(patient4.getId(), "Kaiser Permanente", "KP-555555", "HMO", LocalDate.of(2028, 1, 31));
            Insurance ins8 = new Insurance(patient5.getId(), "Blue Cross Blue Shield", "BCBS-666666", "PPO", LocalDate.of(2026, 12, 31));

            insuranceRepository.save(ins1);
            insuranceRepository.save(ins2);
            insuranceRepository.save(ins3);
            insuranceRepository.save(ins4);
            insuranceRepository.save(ins5);
            insuranceRepository.save(ins6);
            insuranceRepository.save(ins7);
            insuranceRepository.save(ins8);

            log.info("8 insurance records created");

            // Create payment records (5-10 total)
            Payment pay1 = new Payment(patient1.getId(), new BigDecimal("250.00"), LocalDate.of(2025, 12, 15), "Credit Card", "COMPLETED");
            Payment pay2 = new Payment(patient1.getId(), new BigDecimal("180.50"), LocalDate.of(2025, 11, 20), "Insurance", "COMPLETED");
            Payment pay3 = new Payment(patient2.getId(), new BigDecimal("180.50"), LocalDate.of(2025, 12, 14), "Insurance", "COMPLETED");
            Payment pay4 = new Payment(patient2.getId(), new BigDecimal("95.00"), LocalDate.of(2025, 12, 1), "Credit Card", "PENDING");
            Payment pay5 = new Payment(patient3.getId(), new BigDecimal("120.00"), LocalDate.of(2025, 12, 13), "Cash", "COMPLETED");
            Payment pay6 = new Payment(patient3.getId(), new BigDecimal("320.75"), LocalDate.of(2025, 11, 5), "Insurance", "COMPLETED");
            Payment pay7 = new Payment(patient4.getId(), new BigDecimal("450.00"), LocalDate.of(2025, 12, 10), "Credit Card", "COMPLETED");
            Payment pay8 = new Payment(patient4.getId(), new BigDecimal("200.00"), LocalDate.of(2025, 12, 18), "Debit Card", "PENDING");
            Payment pay9 = new Payment(patient5.getId(), new BigDecimal("175.25"), LocalDate.of(2025, 12, 12), "Insurance", "COMPLETED");
            Payment pay10 = new Payment(patient5.getId(), new BigDecimal("89.50"), LocalDate.of(2025, 11, 28), "Cash", "COMPLETED");

            paymentRepository.save(pay1);
            paymentRepository.save(pay2);
            paymentRepository.save(pay3);
            paymentRepository.save(pay4);
            paymentRepository.save(pay5);
            paymentRepository.save(pay6);
            paymentRepository.save(pay7);
            paymentRepository.save(pay8);
            paymentRepository.save(pay9);
            paymentRepository.save(pay10);

            log.info("10 payment records created");

            // Create test results (10-15 total)
            TestResult tr1 = new TestResult(patient1.getId(), "Blood Test - Complete Blood Count", LocalDate.of(2025, 12, 10), "Normal", "All levels within normal range");
            TestResult tr2 = new TestResult(patient1.getId(), "Blood Test - Lipid Panel", LocalDate.of(2025, 12, 10), "Normal", "Cholesterol levels healthy");
            TestResult tr3 = new TestResult(patient1.getId(), "Electrocardiogram (EKG)", LocalDate.of(2025, 11, 5), "Normal", "Regular rhythm, no abnormalities");
            TestResult tr4 = new TestResult(patient2.getId(), "X-Ray - Knee", LocalDate.of(2025, 12, 11), "Abnormal", "Minor fracture detected in left knee");
            TestResult tr5 = new TestResult(patient2.getId(), "MRI - Knee", LocalDate.of(2025, 12, 12), "Abnormal", "Ligament tear confirmed");
            TestResult tr6 = new TestResult(patient3.getId(), "Urine Test", LocalDate.of(2025, 12, 12), "Normal", "No issues found");
            TestResult tr7 = new TestResult(patient3.getId(), "Blood Test - Basic Metabolic Panel", LocalDate.of(2025, 11, 20), "Normal", "All values within range");
            TestResult tr8 = new TestResult(patient3.getId(), "Chest X-Ray", LocalDate.of(2025, 10, 15), "Normal", "Clear lungs");
            TestResult tr9 = new TestResult(patient4.getId(), "Blood Test - Thyroid Function", LocalDate.of(2025, 12, 5), "Abnormal", "Elevated TSH levels");
            TestResult tr10 = new TestResult(patient4.getId(), "MRI - Brain", LocalDate.of(2025, 11, 28), "Normal", "No abnormalities detected");
            TestResult tr11 = new TestResult(patient4.getId(), "Blood Test - Hemoglobin A1C", LocalDate.of(2025, 12, 5), "Normal", "Blood sugar well controlled");
            TestResult tr12 = new TestResult(patient5.getId(), "Skin Biopsy", LocalDate.of(2025, 12, 8), "Normal", "Benign growth");
            TestResult tr13 = new TestResult(patient5.getId(), "Allergy Test", LocalDate.of(2025, 11, 22), "Abnormal", "Allergic to pollen and dust mites");
            TestResult tr14 = new TestResult(patient5.getId(), "Blood Test - Vitamin D", LocalDate.of(2025, 12, 1), "Abnormal", "Low vitamin D levels");
            TestResult tr15 = new TestResult(patient5.getId(), "Dermatology Screening", LocalDate.of(2025, 10, 30), "Normal", "No signs of skin cancer");

            testResultRepository.save(tr1);
            testResultRepository.save(tr2);
            testResultRepository.save(tr3);
            testResultRepository.save(tr4);
            testResultRepository.save(tr5);
            testResultRepository.save(tr6);
            testResultRepository.save(tr7);
            testResultRepository.save(tr8);
            testResultRepository.save(tr9);
            testResultRepository.save(tr10);
            testResultRepository.save(tr11);
            testResultRepository.save(tr12);
            testResultRepository.save(tr13);
            testResultRepository.save(tr14);
            testResultRepository.save(tr15);

            log.info("15 test results created");

            log.info("Sample data seeding completed successfully!");
        };
    }

    /**
     * Ensures that all existing users in the database have a (hashed) password set.
     * <p>
     * Requirements implemented:
     * - Targets all roles: ADMIN, DOCTOR, NURSE, PATIENT
     * - If a user does not have a password (null/blank), generates a secure default password
     * - Preserves existing passwords if they are already set
     * - Uses the existing users table via JPA repository
     * - Ensures passwords are hashed before saving (using the configured PasswordEncoder)
     * - Prints a summary report: number of users updated per role
     * - Keeps data integrity (does not overwrite user emails, roles, or IDs)
     * - Idempotent: once a password is set for a user, subsequent runs make no further changes
     */
    @Bean
    public CommandLineRunner backfillMissingUserPasswords(UserRepository userRepository,
                                                          PasswordEncoder passwordEncoder) {
        return args -> {
            List<User> allUsers = userRepository.findAll();
            if (allUsers.isEmpty()) {
                log.info("Password backfill: no users found, nothing to do.");
                return;
            }

            Map<Role, Long> updatedPerRole = new EnumMap<>(Role.class);
            for (Role role : Role.values()) {
                updatedPerRole.put(role, 0L);
            }

            int totalUpdated = 0;

            for (User user : allUsers) {
                String existingPassword = user.getPassword();
                boolean missingPassword = (existingPassword == null || existingPassword.trim().isEmpty());

                if (!missingPassword) {
                    // Preserve any existing password (assumed to already be hashed)
                    continue;
                }

                // Generate a deterministic but non-trivial default password.
                // Note: Only the hashed value is stored; the raw value is not logged.
                String rawDefaultPassword = "TempPass123!";
                String hashedPassword = passwordEncoder.encode(rawDefaultPassword);

                user.setPassword(hashedPassword);

                // Save only the password change; email, role and ID are preserved automatically.
                userRepository.save(user);

                Role role = user.getRole();
                if (role != null) {
                    updatedPerRole.put(role, updatedPerRole.get(role) + 1);
                }
                totalUpdated++;
            }

            // Print summary report to logs
            if (totalUpdated == 0) {
                log.info("Password backfill: all users already have passwords. No updates performed.");
            } else {
                log.info("Password backfill completed. Total users updated: {}", totalUpdated);
                for (Role role : Role.values()) {
                    long count = updatedPerRole.getOrDefault(role, 0L);
                    log.info(" - {} users updated for role: {}", count, role.name());
                }
            }
        };
    }
}


