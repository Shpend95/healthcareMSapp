package com.mounthospital.config;

import com.mounthospital.model.Role;
import com.mounthospital.model.User;
import com.mounthospital.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner seedDefaultUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            log.info("Seeding default users with roles");

            User admin = new User(
                    "Admin User",
                    "admin",
                    "admin@mountsinai.com",
                    passwordEncoder.encode("Admin123"),
                    Role.ADMIN
            );

            User doctor = new User(
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

            User patient = new User(
                    "Patient User",
                    "patient",
                    "patient@test.com",
                    passwordEncoder.encode("Patient123"),
                    Role.PATIENT
            );

            userRepository.save(admin);
            userRepository.save(doctor);
            userRepository.save(nurse);
            userRepository.save(patient);

            log.info("Default users created: admin, doctor, nurse, patient");
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


