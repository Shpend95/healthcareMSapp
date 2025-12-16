# Mount Hospital - Healthcare Management System

A full-stack healthcare management system with patient registration, appointment booking, and doctor management capabilities. Built with React frontend and Spring Boot backend, designed for automation testing with Selenium, REST Assured, and JDBC.

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Test Data Attributes](#test-data-attributes)
- [Testing Guide](#testing-guide)

## Project Overview

Mount Hospital is a healthcare management system that provides:
- Patient registration and management
- Doctor listing and management
- Appointment booking system
- Patient dashboard to view and manage appointments

## Technology Stack

### Frontend
- React 18.2.0
- React Router 6.20.0
- Axios for API calls
- HTML5/CSS3

### Backend
- Java 17
- Spring Boot 3.1.5
- Spring Data JPA
- MySQL Database
- Maven for dependency management

### Database
- MySQL 8.0+

## Project Structure

```
mount-hospital/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   └── App.js        # Main app component
│   ├── public/           # Static files
│   └── package.json
├── backend/              # Spring Boot application
│   ├── src/main/java/
│   │   └── com/mounthospital/
│   │       ├── model/    # Entity classes
│   │       ├── repository/ # Data repositories
│   │       ├── controller/ # REST controllers
│   │       └── config/   # Configuration classes
│   └── pom.xml
├── database/             # SQL scripts
│   ├── schema.sql        # Database schema
│   └── sample_data.sql   # Sample data
└── docs/                 # Documentation
```

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Java Development Kit (JDK) 17 or higher**
   ```bash
   java -version
   ```

2. **Node.js 16+ and npm**
   ```bash
   node -v
   npm -v
   ```

3. **MySQL 8.0+**
   ```bash
   mysql --version
   ```

4. **Maven 3.6+**
   ```bash
   mvn -v
   ```

## Database Setup

### Step 1: Create Database

1. Start MySQL server
2. Open MySQL command line or MySQL Workbench
3. Run the schema script:

```bash
mysql -u root -p < database/schema.sql
```

Or manually:
```sql
mysql -u root -p
source database/schema.sql
```

### Step 2: Load Sample Data

```bash
mysql -u root -p < database/sample_data.sql
```

Or manually:
```sql
mysql -u root -p mount_hospital
source database/sample_data.sql
```

### Step 3: Verify Database

Check that tables are created and sample data is loaded:
```sql
USE mount_hospital;
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM doctors;
SELECT COUNT(*) FROM appointments;
```

You should see:
- 3 patients
- 5 doctors
- 2 appointments

### Database Configuration

Update `backend/src/main/resources/application.properties` with your MySQL credentials:

```properties
spring.datasource.username=root
spring.datasource.password=your_password
```

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Build the Project

```bash
mvn clean install
```

### Step 3: Run the Application

```bash
mvn spring-boot:run
```

The backend will start on **http://localhost:8081**

### Verify Backend is Running

Test the API:
```bash
curl http://localhost:8081/api/doctors
```

You should receive a JSON response with the list of doctors.

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start the Development Server

```bash
npm start
```

The frontend will start on **http://localhost:3000**

The browser should automatically open. If not, navigate to http://localhost:3000

## Running the Application

### Start Services in Order:

1. **Start MySQL Database**
   ```bash
   # macOS/Linux
   sudo systemctl start mysql
   # or
   mysql.server start
   ```

2. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8081/api

## API Documentation

### Base URL
```
http://localhost:8081/api
```

### Patient APIs

#### 1. Register a New Patient
**POST** `/patients`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@email.com",
  "phone": "555-1001",
  "dateOfBirth": "1985-05-15",
  "address": "123 Main Street, Springfield, IL 62701"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@email.com",
  "phone": "555-1001",
  "dateOfBirth": "1985-05-15",
  "address": "123 Main Street, Springfield, IL 62701",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Email already exists",
  "path": "/api/patients"
}
```

#### 2. Get All Patients
**GET** `/patients`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "555-1001",
    "dateOfBirth": "1985-05-15",
    "address": "123 Main Street, Springfield, IL 62701"
  }
]
```

#### 3. Get Patient by ID
**GET** `/patients/{id}`

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@email.com",
  "phone": "555-1001",
  "dateOfBirth": "1985-05-15",
  "address": "123 Main Street, Springfield, IL 62701"
}
```

**Error Response (404 Not Found):**
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Patient with ID 999 not found",
  "path": "/api/patients/999"
}
```

### Doctor APIs

#### 1. Get All Doctors
**GET** `/doctors`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Dr. Sarah Johnson",
    "specialization": "Cardiology",
    "email": "sarah.johnson@mounthospital.com",
    "phone": "555-0101"
  }
]
```

#### 2. Get Doctor by ID
**GET** `/doctors/{id}`

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Dr. Sarah Johnson",
  "specialization": "Cardiology",
  "email": "sarah.johnson@mounthospital.com",
  "phone": "555-0101"
}
```

#### 3. Get Doctors by Specialization
**GET** `/doctors/specialization/{specialization}`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Dr. Sarah Johnson",
    "specialization": "Cardiology",
    "email": "sarah.johnson@mounthospital.com",
    "phone": "555-0101"
  }
]
```

### Appointment APIs

#### 1. Book an Appointment
**POST** `/appointments`

**Request Body:**
```json
{
  "patientId": 1,
  "doctorId": 1,
  "appointmentDate": "2024-02-15",
  "appointmentTime": "10:00:00",
  "status": "SCHEDULED",
  "notes": "Regular checkup"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "patientId": 1,
  "doctorId": 1,
  "appointmentDate": "2024-02-15",
  "appointmentTime": "10:00:00",
  "status": "SCHEDULED",
  "notes": "Regular checkup",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

#### 2. Get All Appointments
**GET** `/appointments`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "doctorId": 1,
    "appointmentDate": "2024-02-15",
    "appointmentTime": "10:00:00",
    "status": "SCHEDULED",
    "notes": "Regular checkup"
  }
]
```

#### 3. Get Appointment by ID
**GET** `/appointments/{id}`

**Response (200 OK):**
```json
{
  "id": 1,
  "patientId": 1,
  "doctorId": 1,
  "appointmentDate": "2024-02-15",
  "appointmentTime": "10:00:00",
  "status": "SCHEDULED",
  "notes": "Regular checkup"
}
```

#### 4. Get Appointments by Patient ID
**GET** `/appointments/patient/{patientId}`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "doctorId": 1,
    "appointmentDate": "2024-02-15",
    "appointmentTime": "10:00:00",
    "status": "SCHEDULED",
    "notes": "Regular checkup"
  }
]
```

#### 5. Update Appointment
**PUT** `/appointments/{id}`

**Request Body:**
```json
{
  "appointmentDate": "2024-02-20",
  "appointmentTime": "14:00:00",
  "status": "SCHEDULED",
  "notes": "Updated appointment"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "patientId": 1,
  "doctorId": 1,
  "appointmentDate": "2024-02-20",
  "appointmentTime": "14:00:00",
  "status": "SCHEDULED",
  "notes": "Updated appointment"
}
```

#### 6. Cancel Appointment
**DELETE** `/appointments/{id}`

**Response (200 OK):**
```json
{
  "message": "Appointment deleted successfully",
  "id": 1
}
```

### HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input or validation error
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Test Data Attributes

All interactive elements in the frontend have `data-testid` attributes for Selenium testing. Below is a comprehensive list:

### Navigation
- `data-testid="main-navigation"` - Main navigation bar
- `data-testid="nav-home"` - Home link in navigation
- `data-testid="nav-home-link"` - Home link
- `data-testid="nav-register"` - Register Patient link
- `data-testid="nav-appointments"` - Book Appointment link
- `data-testid="nav-doctors"` - Doctors link

### Home Page
- `data-testid="home-page"` - Home page container
- `data-testid="home-title"` - Home page title
- `data-testid="home-subtitle"` - Home page subtitle
- `data-testid="home-register-btn"` - Register button
- `data-testid="home-book-appointment-btn"` - Book appointment button
- `data-testid="home-view-doctors-btn"` - View doctors button
- `data-testid="home-about-title"` - About section title
- `data-testid="home-description"` - Home page description
- `data-testid="feature-1-title"` - Feature 1 title
- `data-testid="feature-2-title"` - Feature 2 title
- `data-testid="feature-3-title"` - Feature 3 title

### Patient Registration Page
- `data-testid="patient-registration-page"` - Registration page container
- `data-testid="registration-title"` - Registration page title
- `data-testid="registration-subtitle"` - Registration subtitle
- `data-testid="patient-registration-form"` - Registration form
- `data-testid="patient-name-input"` - Patient name input field
- `data-testid="patient-name-error"` - Name error message
- `data-testid="patient-email-input"` - Patient email input field
- `data-testid="patient-email-error"` - Email error message
- `data-testid="patient-phone-input"` - Patient phone input field
- `data-testid="patient-phone-error"` - Phone error message
- `data-testid="patient-dob-input"` - Date of birth input field
- `data-testid="patient-dob-error"` - Date of birth error message
- `data-testid="patient-address-input"` - Address textarea
- `data-testid="patient-address-error"` - Address error message
- `data-testid="submit-btn"` - Submit button
- `data-testid="registration-error"` - Registration error message
- `data-testid="registration-success"` - Registration success message

### Appointment Booking Page
- `data-testid="appointment-booking-page"` - Booking page container
- `data-testid="appointment-title"` - Appointment page title
- `data-testid="appointment-subtitle"` - Appointment subtitle
- `data-testid="appointment-booking-form"` - Booking form
- `data-testid="appointment-patient-select"` - Patient dropdown
- `data-testid="patient-option-{id}"` - Patient option in dropdown
- `data-testid="appointment-patient-error"` - Patient selection error
- `data-testid="appointment-doctor-select"` - Doctor dropdown
- `data-testid="doctor-option-{id}"` - Doctor option in dropdown
- `data-testid="appointment-doctor-error"` - Doctor selection error
- `data-testid="appointment-date-input"` - Appointment date input
- `data-testid="appointment-date-error"` - Date error message
- `data-testid="appointment-time-input"` - Appointment time input
- `data-testid="appointment-time-error"` - Time error message
- `data-testid="appointment-notes-input"` - Notes textarea
- `data-testid="appointment-submit-btn"` - Submit appointment button
- `data-testid="appointment-error"` - Booking error message
- `data-testid="appointment-success"` - Booking success message
- `data-testid="appointment-loading"` - Loading state

### Doctor Listing Page
- `data-testid="doctors-page"` - Doctors page container
- `data-testid="doctors-title"` - Doctors page title
- `data-testid="doctors-subtitle"` - Doctors page subtitle
- `data-testid="doctor-search-input"` - Search input field
- `data-testid="specialization-filter"` - Specialization filter dropdown
- `data-testid="specialization-option-{name}"` - Specialization option
- `data-testid="doctors-grid"` - Doctors grid container
- `data-testid="doctor-card-{id}"` - Individual doctor card
- `data-testid="doctor-name-{id}"` - Doctor name
- `data-testid="doctor-specialization-{id}"` - Doctor specialization
- `data-testid="doctor-email-{id}"` - Doctor email
- `data-testid="doctor-phone-{id}"` - Doctor phone
- `data-testid="doctors-count"` - Doctors count text
- `data-testid="no-doctors-message"` - No doctors message
- `data-testid="doctors-error"` - Error message
- `data-testid="doctors-loading"` - Loading state

### Patient Dashboard Page
- `data-testid="patient-dashboard-page"` - Dashboard container
- `data-testid="dashboard-title"` - Dashboard title
- `data-testid="dashboard-subtitle"` - Dashboard subtitle
- `data-testid="patient-info-title"` - Patient info section title
- `data-testid="patient-info-name"` - Patient name display
- `data-testid="patient-info-email"` - Patient email display
- `data-testid="patient-info-phone"` - Patient phone display
- `data-testid="patient-info-dob"` - Patient date of birth display
- `data-testid="patient-info-address"` - Patient address display
- `data-testid="appointments-title"` - Appointments section title
- `data-testid="appointments-list"` - Appointments list container
- `data-testid="appointment-card-{id}"` - Individual appointment card
- `data-testid="appointment-doctor-{id}"` - Appointment doctor name
- `data-testid="appointment-date-{id}"` - Appointment date
- `data-testid="appointment-time-{id}"` - Appointment time
- `data-testid="appointment-status-{id}"` - Appointment status
- `data-testid="appointment-notes-{id}"` - Appointment notes
- `data-testid="update-appointment-btn-{id}"` - Update button
- `data-testid="cancel-appointment-btn-{id}"` - Cancel button
- `data-testid="update-form-{id}"` - Update appointment form
- `data-testid="update-doctor-select-{id}"` - Update form doctor select
- `data-testid="update-date-input-{id}"` - Update form date input
- `data-testid="update-time-input-{id}"` - Update form time input
- `data-testid="update-status-select-{id}"` - Update form status select
- `data-testid="update-notes-input-{id}"` - Update form notes input
- `data-testid="save-update-btn-{id}"` - Save update button
- `data-testid="cancel-update-btn-{id}"` - Cancel update button
- `data-testid="no-appointments-message"` - No appointments message
- `data-testid="dashboard-message"` - Dashboard action message
- `data-testid="dashboard-error"` - Dashboard error message
- `data-testid="dashboard-loading"` - Loading state

## Testing Guide

### Selenium Testing

Use the `data-testid` attributes to locate elements:

```java
// Example: Find patient name input
WebElement nameInput = driver.findElement(By.cssSelector("[data-testid='patient-name-input']"));

// Example: Click submit button
WebElement submitBtn = driver.findElement(By.cssSelector("[data-testid='submit-btn']"));
submitBtn.click();

// Example: Verify error message
WebElement errorMsg = driver.findElement(By.cssSelector("[data-testid='patient-name-error']"));
assertTrue(errorMsg.getText().contains("Name is required"));
```

### REST Assured Testing

Example test for patient registration:

```java
@Test
public void testRegisterPatient() {
    given()
        .contentType(ContentType.JSON)
        .body("{\n" +
              "  \"name\": \"Test Patient\",\n" +
              "  \"email\": \"test@email.com\",\n" +
              "  \"phone\": \"555-1234\",\n" +
              "  \"dateOfBirth\": \"1990-01-01\",\n" +
              "  \"address\": \"123 Test St\"\n" +
              "}")
    .when()
        .post("http://localhost:8081/api/patients")
    .then()
        .statusCode(201)
        .body("name", equalTo("Test Patient"));
}
```

### JDBC Testing

Example test for database verification:

```java
@Test
public void testPatientExistsInDatabase() {
    Connection conn = DriverManager.getConnection(
        "jdbc:mysql://localhost:3306/mount_hospital", 
        "root", 
        "password"
    );
    
    PreparedStatement stmt = conn.prepareStatement(
        "SELECT * FROM patients WHERE email = ?"
    );
    stmt.setString(1, "john.doe@email.com");
    ResultSet rs = stmt.executeQuery();
    
    assertTrue(rs.next());
    assertEquals("John Doe", rs.getString("name"));
}
```

## Troubleshooting

### Backend Issues

1. **Port 8081 already in use**
   - Change port in `application.properties`: `server.port=8081`
   - Or stop the process using port 8081

2. **Database connection error**
   - Verify MySQL is running
   - Check credentials in `application.properties`
   - Ensure database `mount_hospital` exists

3. **Compilation errors**
   - Run `mvn clean install` to rebuild
   - Ensure Java 17+ is installed

### Frontend Issues

1. **Port 3000 already in use**
   - React will prompt to use another port

2. **API connection errors**
   - Verify backend is running on port 8081
   - Check CORS configuration
   - Verify API URL in `src/services/api.js`

3. **Module not found errors**
   - Run `npm install` to install dependencies
   - Delete `node_modules` and `package-lock.json`, then reinstall

## Sample Data

The application comes with sample data:

**Doctors (5):**
- Dr. Sarah Johnson - Cardiology
- Dr. Michael Chen - Orthopedics
- Dr. Emily Rodriguez - Pediatrics
- Dr. James Wilson - Neurology
- Dr. Lisa Anderson - Dermatology

**Patients (3):**
- John Doe (john.doe@email.com)
- Jane Smith (jane.smith@email.com)
- Robert Brown (robert.brown@email.com)

**Appointments (2):**
- Patient 1 with Dr. Sarah Johnson on 2024-02-15 at 10:00
- Patient 2 with Dr. Emily Rodriguez on 2024-02-16 at 14:30

## License

This project is created for educational and testing purposes.

## Support

For issues or questions, please check:
1. Database connection settings
2. API endpoints are accessible
3. All prerequisites are installed
4. Ports 3000 and 8081 are available
