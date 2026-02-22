-- Mount Hospital Sample Data
-- Use this script to insert sample data after running schema.sql

USE mount_hospital;

-- Insert Sample Users (5 users)
INSERT INTO users (username, password, email, name, role) VALUES
('admin1', '$2a$10$EIXzWZWzQWzWzQWzWzQWzO', 'admin@mounthospital.com', 'Admin User', 'ADMIN'),
('doctor1', '$2a$10$EIXzWZWzQWzQWzWzQWzWzO', 'sarah.johnson@mounthospital.com', 'Dr. Sarah Johnson', 'DOCTOR'),
('doctor2', '$2a$10$EIXzWZWzQWzQWzWzQWzWzO', 'michael.chen@mounthospital.com', 'Dr. Michael Chen', 'DOCTOR'),
('nurse1', '$2a$10$EIXzWZWzQWzQWzWzQWzWzO', 'lisa.anderson@mounthospital.com', 'Lisa Anderson', 'NURSE'),
('patient1', '$2a$10$EIXzWZWzQWzQWzWzQWzWzO', 'john.doe@email.com', 'John Doe', 'PATIENT');

-- Insert Sample Doctors (5 doctors)
INSERT INTO doctors (name, specialization, email, phone) VALUES
('Dr. Sarah Johnson', 'Cardiology', 'sarah.johnson@mounthospital.com', '555-0101'),
('Dr. Michael Chen', 'Orthopedics', 'michael.chen@mounthospital.com', '555-0102'),
('Dr. Emily Rodriguez', 'Pediatrics', 'emily.rodriguez@mounthospital.com', '555-0103'),
('Dr. James Wilson', 'Neurology', 'james.wilson@mounthospital.com', '555-0104'),
('Dr. Lisa Anderson', 'Dermatology', 'lisa.anderson@mounthospital.com', '555-0105');

-- Insert Sample Nurses (3 nurses)
INSERT INTO nurses (name, department, email, phone) VALUES
('Nurse Emily Brown', 'Emergency', 'emily.brown@mounthospital.com', '555-0201'),
('Nurse David Lee', 'ICU', 'david.lee@mounthospital.com', '555-0202'),
('Nurse Maria Garcia', 'Pediatrics', 'maria.garcia@mounthospital.com', '555-0203');

-- Insert Sample Patients (3 patients)
INSERT INTO patients (user_id, name, email, phone, date_of_birth, address, blood_group, emergency_contact) VALUES
(5, 'John Doe', 'john.doe@email.com', '555-1001', '1985-05-15', '123 Main Street, Springfield, IL 62701', 'O+', '555-1002'),
(NULL, 'Jane Smith', 'jane.smith@email.com', '555-1002', '1990-08-22', '456 Oak Avenue, Springfield, IL 62702', 'A+', '555-1003'),
(NULL, 'Robert Brown', 'robert.brown@email.com', '555-1003', '1978-12-03', '789 Elm Drive, Springfield, IL 62703', 'B-', '555-1004');

-- Insert Sample Appointments (2 appointments)
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes) VALUES
(1, 1, '2024-02-15', '10:00:00', 'SCHEDULED', 'Regular checkup for heart condition'),
(2, 3, '2024-02-16', '14:30:00', 'SCHEDULED', 'Pediatric consultation for child');

-- Insert Sample Test Results (2 test results)
INSERT INTO test_results (patient_id, test_name, test_date, result, notes) VALUES
(1, 'Blood Pressure', '2024-02-10', '120/80', 'Normal range'),
(2, 'Blood Test', '2024-02-11', 'Normal', 'All values within normal limits');

-- Insert Sample Insurance (2 insurance records)
INSERT INTO insurance (patient_id, provider, policy_number, coverage_type, expiry_date) VALUES
(1, 'Blue Cross Blue Shield', 'BCBS-123456', 'Premium', '2025-12-31'),
(2, 'Aetna Health', 'AET-789012', 'Standard', '2025-06-30');

-- Insert Sample Payments (2 payment records)
INSERT INTO payments (patient_id, amount, payment_date, payment_method, status) VALUES
(1, 250.00, '2024-02-10', 'Credit Card', 'COMPLETED'),
(2, 150.00, '2024-02-11', 'Insurance', 'PENDING');