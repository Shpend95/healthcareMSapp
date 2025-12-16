-- Clear existing data and reset auto-increment
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE insurance;
TRUNCATE TABLE payments;
TRUNCATE TABLE test_results;
TRUNCATE TABLE appointments;
TRUNCATE TABLE patients;
TRUNCATE TABLE doctors;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Doctors
INSERT INTO doctors (name, email, phone, specialization, created_at, updated_at) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@mounthospital.com', '555-0101', 'Cardiology', NOW(), NOW()),
('Dr. Michael Chen', 'michael.chen@mounthospital.com', '555-0102', 'Orthopedics', NOW(), NOW()),
('Dr. Emily Rodriguez', 'emily.rodriguez@mounthospital.com', '555-0103', 'Pediatrics', NOW(), NOW()),
('Dr. James Wilson', 'james.wilson@mounthospital.com', '555-0104', 'Neurology', NOW(), NOW()),
('Dr. Lisa Anderson', 'lisa.anderson@mounthospital.com', '555-0105', 'Dermatology', NOW(), NOW());

-- Insert Patients
INSERT INTO patients (name, email, phone, date_of_birth, address, created_at, updated_at) VALUES
('John Smith', 'john.smith@email.com', '555-1001', '1985-03-15', '123 Main St, NYC', NOW(), NOW()),
('Mary Johnson', 'mary.johnson@email.com', '555-1002', '1990-07-22', '456 Oak Ave, Brooklyn', NOW(), NOW()),
('Robert Williams', 'robert.williams@email.com', '555-1003', '1978-11-30', '789 Pine Rd, Queens', NOW(), NOW()),
('Patricia Brown', 'patricia.brown@email.com', '555-1004', '1995-01-18', '321 Elm St, Bronx', NOW(), NOW()),
('Michael Davis', 'michael.davis@email.com', '555-1005', '1982-09-25', '654 Maple Dr, Staten Island', NOW(), NOW());

-- Insert Appointments (using last_insert_id won't work, so use fixed IDs starting from 1)
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes, created_at, updated_at) VALUES
(1, 1, '2025-12-20', '09:00:00', 'SCHEDULED', 'Annual checkup', NOW(), NOW()),
(2, 2, '2025-12-20', '10:30:00', 'SCHEDULED', 'Knee pain consultation', NOW(), NOW()),
(3, 3, '2025-12-21', '14:00:00', 'SCHEDULED', 'Child vaccination', NOW(), NOW()),
(4, 4, '2025-12-22', '11:00:00', 'SCHEDULED', 'Migraine treatment', NOW(), NOW()),
(5, 5, '2025-12-23', '15:00:00', 'SCHEDULED', 'Dermatology consultation', NOW(), NOW());

-- Insert Test Results
INSERT INTO test_results (patient_id, test_name, test_date, result, notes, created_at, updated_at) VALUES
(1, 'Blood Test', '2025-12-10', 'Normal', 'All levels within normal range', NOW(), NOW()),
(2, 'X-Ray', '2025-12-11', 'Abnormal', 'Minor fracture detected', NOW(), NOW()),
(3, 'Urine Test', '2025-12-12', 'Normal', 'No issues found', NOW(), NOW());

-- Insert Payments
INSERT INTO payments (patient_id, amount, payment_date, payment_method, status, created_at, updated_at) VALUES
(1, 250.00, '2025-12-15', 'Credit Card', 'COMPLETED', NOW(), NOW()),
(2, 180.50, '2025-12-14', 'Insurance', 'COMPLETED', NOW(), NOW()),
(3, 120.00, '2025-12-13', 'Cash', 'COMPLETED', NOW(), NOW());

-- Insert Insurance
INSERT INTO insurance (patient_id, provider, policy_number, coverage_type, expiry_date, created_at, updated_at) VALUES
(1, 'Blue Cross Blue Shield', 'BCBS-123456', 'PPO', '2026-12-31', NOW(), NOW()),
(2, 'Aetna', 'AET-789012', 'HMO', '2026-06-30', NOW(), NOW()),
(3, 'Cigna', 'CIG-345678', 'PPO', '2026-12-31', NOW(), NOW());