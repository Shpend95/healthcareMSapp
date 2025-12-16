-- Mount Hospital Sample Data
-- Use this script to insert sample data after running schema.sql

USE mount_hospital;

-- Insert Sample Doctors (5 doctors)
INSERT INTO doctors (name, specialization, email, phone) VALUES
('Dr. Sarah Johnson', 'Cardiology', 'sarah.johnson@mounthospital.com', '555-0101'),
('Dr. Michael Chen', 'Orthopedics', 'michael.chen@mounthospital.com', '555-0102'),
('Dr. Emily Rodriguez', 'Pediatrics', 'emily.rodriguez@mounthospital.com', '555-0103'),
('Dr. James Wilson', 'Neurology', 'james.wilson@mounthospital.com', '555-0104'),
('Dr. Lisa Anderson', 'Dermatology', 'lisa.anderson@mounthospital.com', '555-0105');

-- Insert Sample Patients (3 patients)
INSERT INTO patients (name, email, phone, date_of_birth, address) VALUES
('John Doe', 'john.doe@email.com', '555-1001', '1985-05-15', '123 Main Street, Springfield, IL 62701'),
('Jane Smith', 'jane.smith@email.com', '555-1002', '1990-08-22', '456 Oak Avenue, Springfield, IL 62702'),
('Robert Brown', 'robert.brown@email.com', '555-1003', '1978-12-03', '789 Elm Drive, Springfield, IL 62703');

-- Insert Sample Appointments (2 appointments)
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes) VALUES
(1, 1, '2024-02-15', '10:00:00', 'SCHEDULED', 'Regular checkup for heart condition'),
(2, 3, '2024-02-16', '14:30:00', 'SCHEDULED', 'Pediatric consultation for child');
