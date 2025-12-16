# Quick Start Guide

## 5-Minute Setup

### 1. Database Setup (2 minutes)

```bash
# Start MySQL and login
mysql -u root -p

# Create database and tables
source database/schema.sql

# Load sample data
source database/sample_data.sql

# Verify data loaded
SELECT COUNT(*) FROM patients;  -- Should return 3
SELECT COUNT(*) FROM doctors;   -- Should return 5
SELECT COUNT(*) FROM appointments; -- Should return 2
```

### 2. Backend Setup (2 minutes)

```bash
cd backend

# Update database credentials in src/main/resources/application.properties
# Change: spring.datasource.username=root
# Change: spring.datasource.password=your_password

# Run the application
mvn spring-boot:run
```

Wait for: `Started MountHospitalApplication in X seconds`

### 3. Frontend Setup (1 minute)

```bash
cd frontend

# Install dependencies
npm install

# Start the application
npm start
```

Wait for browser to open at http://localhost:3000

## Quick Test

1. **Test API directly:**
   ```bash
   curl http://localhost:8081/api/doctors
   ```
   Should return JSON array of 5 doctors.

2. **Test frontend:**
   - Navigate to http://localhost:3000
   - Click "Register Patient"
   - Fill the form and submit
   - Verify patient is registered

3. **Test appointment booking:**
   - Go to "Book Appointment"
   - Select a patient and doctor
   - Choose date and time
   - Submit and verify success

## Common Issues

**Backend won't start:**
- Check MySQL is running: `mysql -u root -p`
- Verify database exists: `SHOW DATABASES;`
- Check credentials in `application.properties`

**Frontend can't connect to API:**
- Verify backend is running on port 8081
- Check browser console for errors
- Verify CORS is enabled

**Database connection error:**
- Ensure MySQL is running
- Check username/password
- Verify database `mount_hospital` exists

## Next Steps

- Review the full README.md for detailed documentation
- Check TEST_ATTRIBUTES.md for automation testing guide
- Explore the API endpoints using Postman or curl
- Start writing your Selenium/REST Assured/JDBC tests
