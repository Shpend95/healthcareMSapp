-- Mount Hospital Database Schema Updates
-- Patient Portal Enhanced Features
-- Run this after the base schema.sql

USE mount_hospital;

-- Patient Profiles Table (Extended patient information)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    user_id BIGINT,
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    suffix VARCHAR(10),
    gender VARCHAR(50),
    pronouns VARCHAR(50),
    preferred_language VARCHAR(10) DEFAULT 'en',
    primary_email VARCHAR(100),
    primary_email_verified BOOLEAN DEFAULT FALSE,
    secondary_email VARCHAR(100),
    secondary_email_verified BOOLEAN DEFAULT FALSE,
    primary_phone VARCHAR(20),
    secondary_phone VARCHAR(20),
    mobile_phone VARCHAR(20),
    preferred_contact_method VARCHAR(20) DEFAULT 'email',
    profile_picture_url VARCHAR(500),
    communication_preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_patient_id (patient_id),
    INDEX idx_user_id (user_id)
);

-- Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    primary_phone VARCHAR(20) NOT NULL,
    secondary_phone VARCHAR(20),
    email VARCHAR(100),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_is_primary (is_primary)
);

-- Insurance Plans Table
CREATE TABLE IF NOT EXISTS insurance_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    plan_type VARCHAR(20) NOT NULL DEFAULT 'PRIMARY', -- PRIMARY, SECONDARY, TERTIARY
    insurance_provider VARCHAR(200) NOT NULL,
    policy_holder_name VARCHAR(200),
    policy_number VARCHAR(100) NOT NULL,
    group_number VARCHAR(100),
    member_id VARCHAR(100),
    effective_date DATE,
    expiration_date DATE,
    card_front_url VARCHAR(500),
    card_back_url VARCHAR(500),
    ocr_extracted_data JSON, -- Store OCR extracted data
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_is_active (is_active),
    INDEX idx_plan_type (plan_type)
);

-- Payment Methods Table (PCI Compliant - encrypted storage)
CREATE TABLE IF NOT EXISTS payment_methods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    method_type VARCHAR(20) NOT NULL, -- CREDIT_CARD, DEBIT_CARD, ACH, PAYPAL
    card_type VARCHAR(50), -- VISA, MASTERCARD, AMEX, etc.
    last_four_digits VARCHAR(4), -- Last 4 digits only
    cardholder_name VARCHAR(200),
    expiration_month INT,
    expiration_year INT,
    encrypted_token VARCHAR(500), -- Encrypted payment token (PCI compliant)
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(50),
    billing_zip_code VARCHAR(20),
    billing_country VARCHAR(100) DEFAULT 'USA',
    bank_name VARCHAR(200), -- For ACH
    account_type VARCHAR(20), -- CHECKING, SAVINGS (for ACH)
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_is_default (is_default),
    INDEX idx_is_active (is_active)
);

-- Enhanced Appointments Table (if not already enhanced)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(50) DEFAULT 'IN_PERSON', -- IN_PERSON, TELEHEALTH
ADD COLUMN IF NOT EXISTS specialty VARCHAR(100),
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_method VARCHAR(20), -- EMAIL, SMS, BOTH
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Health Records Table
CREATE TABLE IF NOT EXISTS health_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    record_type VARCHAR(50) NOT NULL, -- MEDICAL_HISTORY, LAB_RESULT, IMMUNIZATION, ALLERGY, DIAGNOSIS
    title VARCHAR(200) NOT NULL,
    description TEXT,
    record_date DATE NOT NULL,
    provider_name VARCHAR(200),
    provider_id INT,
    facility_name VARCHAR(200),
    diagnosis_code VARCHAR(50), -- ICD-10 code
    procedure_code VARCHAR(50), -- CPT code
    test_type VARCHAR(100), -- For lab results
    test_value VARCHAR(100),
    test_unit VARCHAR(50),
    reference_range VARCHAR(100),
    status VARCHAR(50), -- NORMAL, ABNORMAL, CRITICAL
    file_url VARCHAR(500), -- PDF or document URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_record_type (record_type),
    INDEX idx_record_date (record_date)
);

-- Medications Table
CREATE TABLE IF NOT EXISTS medications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    dosage VARCHAR(100),
    frequency VARCHAR(100), -- e.g., "Once daily", "Twice daily"
    route VARCHAR(50), -- ORAL, TOPICAL, INJECTION, etc.
    start_date DATE,
    end_date DATE,
    prescribing_doctor VARCHAR(200),
    prescribing_doctor_id INT,
    pharmacy_name VARCHAR(200),
    pharmacy_phone VARCHAR(20),
    pharmacy_address VARCHAR(500),
    refills_remaining INT DEFAULT 0,
    prescription_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    reminder_enabled BOOLEAN DEFAULT FALSE,
    reminder_times JSON, -- Array of times for reminders
    last_taken_at TIMESTAMP,
    adherence_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_is_active (is_active),
    INDEX idx_medication_name (medication_name)
);

-- Medication Reminders Table
CREATE TABLE IF NOT EXISTS medication_reminders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    medication_id BIGINT NOT NULL,
    reminder_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    is_active BOOLEAN DEFAULT TRUE,
    last_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    INDEX idx_medication_id (medication_id),
    INDEX idx_is_active (is_active)
);

-- Audit Logs Table (HIPAA Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    patient_id INT,
    action_type VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE, VIEW, EXPORT
    entity_type VARCHAR(50) NOT NULL, -- PATIENT, APPOINTMENT, HEALTH_RECORD, etc.
    entity_id BIGINT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    changes JSON, -- Store what changed (for updates)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_action_type (action_type),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
);

-- Patient Addresses Table (Multiple addresses support)
CREATE TABLE IF NOT EXISTS patient_addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    address_type VARCHAR(50) NOT NULL DEFAULT 'HOME', -- HOME, WORK, MAILING, OTHER
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_is_primary (is_primary)
);

-- Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    payment_method_id BIGINT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_type VARCHAR(50), -- APPOINTMENT, BILL, COPAY, DEDUCTIBLE
    transaction_id VARCHAR(200),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, REFUNDED
    description TEXT,
    bill_id BIGINT,
    appointment_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

