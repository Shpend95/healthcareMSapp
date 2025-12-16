# Test Attributes Reference

This document lists all `data-testid` attributes for Selenium automation testing.

## Navigation Elements

| Element | data-testid | Description |
|---------|-------------|-------------|
| Navigation bar | `main-navigation` | Main navigation container |
| Home (logo) | `nav-home` | Hospital name/logo link |
| Home link | `nav-home-link` | Home navigation link |
| Register link | `nav-register` | Register Patient navigation link |
| Appointments link | `nav-appointments` | Book Appointment navigation link |
| Doctors link | `nav-doctors` | Doctors navigation link |

## Home Page

| Element | data-testid | Description |
|---------|-------------|-------------|
| Page container | `home-page` | Home page wrapper |
| Title | `home-title` | Main welcome title |
| Subtitle | `home-subtitle` | Welcome subtitle |
| Register button | `home-register-btn` | Call-to-action register button |
| Book appointment button | `home-book-appointment-btn` | Book appointment CTA |
| View doctors button | `home-view-doctors-btn` | View doctors CTA |
| About title | `home-about-title` | About section heading |
| Description | `home-description` | Home page description text |
| Feature 1 title | `feature-1-title` | First feature card title |
| Feature 1 description | `feature-1-description` | First feature description |
| Feature 2 title | `feature-2-title` | Second feature card title |
| Feature 2 description | `feature-2-description` | Second feature description |
| Feature 3 title | `feature-3-title` | Third feature card title |
| Feature 3 description | `feature-3-description` | Third feature description |

## Patient Registration Page

| Element | data-testid | Description |
|---------|-------------|-------------|
| Page container | `patient-registration-page` | Registration page wrapper |
| Title | `registration-title` | Page title |
| Subtitle | `registration-subtitle` | Page subtitle |
| Form | `patient-registration-form` | Registration form element |
| Name input | `patient-name-input` | Patient full name input |
| Name error | `patient-name-error` | Name validation error |
| Email input | `patient-email-input` | Patient email input |
| Email error | `patient-email-error` | Email validation error |
| Phone input | `patient-phone-input` | Patient phone input |
| Phone error | `patient-phone-error` | Phone validation error |
| Date of birth input | `patient-dob-input` | Date of birth input |
| DOB error | `patient-dob-error` | Date of birth validation error |
| Address input | `patient-address-input` | Address textarea |
| Address error | `patient-address-error` | Address validation error |
| Submit button | `submit-btn` | Form submit button |
| Error message | `registration-error` | General error message |
| Success message | `registration-success` | Success message after registration |

## Appointment Booking Page

| Element | data-testid | Description |
|---------|-------------|-------------|
| Page container | `appointment-booking-page` | Booking page wrapper |
| Title | `appointment-title` | Page title |
| Subtitle | `appointment-subtitle` | Page subtitle |
| Form | `appointment-booking-form` | Booking form element |
| Patient select | `appointment-patient-select` | Patient dropdown |
| Patient option | `patient-option-{id}` | Individual patient option |
| Patient error | `appointment-patient-error` | Patient selection error |
| Doctor select | `appointment-doctor-select` | Doctor dropdown |
| Doctor option | `doctor-option-{id}` | Individual doctor option |
| Doctor error | `appointment-doctor-error` | Doctor selection error |
| Date input | `appointment-date-input` | Appointment date input |
| Date error | `appointment-date-error` | Date validation error |
| Time input | `appointment-time-input` | Appointment time input |
| Time error | `appointment-time-error` | Time validation error |
| Notes input | `appointment-notes-input` | Notes textarea |
| Submit button | `appointment-submit-btn` | Book appointment button |
| Error message | `appointment-error` | Booking error message |
| Success message | `appointment-success` | Booking success message |
| Loading state | `appointment-loading` | Loading indicator |

## Doctor Listing Page

| Element | data-testid | Description |
|---------|-------------|-------------|
| Page container | `doctors-page` | Doctors page wrapper |
| Title | `doctors-title` | Page title |
| Subtitle | `doctors-subtitle` | Page subtitle |
| Search input | `doctor-search-input` | Search/filter input |
| Specialization filter | `specialization-filter` | Specialization dropdown |
| Specialization option | `specialization-option-{name}` | Specialization option |
| Doctors grid | `doctors-grid` | Container for doctor cards |
| Doctor card | `doctor-card-{id}` | Individual doctor card |
| Doctor name | `doctor-name-{id}` | Doctor's name |
| Doctor specialization | `doctor-specialization-{id}` | Doctor's specialization |
| Doctor email | `doctor-email-{id}` | Doctor's email |
| Doctor phone | `doctor-phone-{id}` | Doctor's phone |
| Doctors count | `doctors-count` | Number of doctors displayed |
| No doctors message | `no-doctors-message` | Message when no doctors found |
| Error message | `doctors-error` | Error message |
| Loading state | `doctors-loading` | Loading indicator |

## Patient Dashboard Page

| Element | data-testid | Description |
|---------|-------------|-------------|
| Page container | `patient-dashboard-page` | Dashboard wrapper |
| Title | `dashboard-title` | Dashboard title |
| Subtitle | `dashboard-subtitle` | Welcome subtitle |
| Patient info title | `patient-info-title` | Patient info section heading |
| Patient name | `patient-info-name` | Patient name display |
| Patient email | `patient-info-email` | Patient email display |
| Patient phone | `patient-info-phone` | Patient phone display |
| Patient DOB | `patient-info-dob` | Patient date of birth |
| Patient address | `patient-info-address` | Patient address |
| Appointments title | `appointments-title` | Appointments section heading |
| Appointments list | `appointments-list` | Appointments container |
| Appointment card | `appointment-card-{id}` | Individual appointment card |
| Appointment doctor | `appointment-doctor-{id}` | Doctor name in appointment |
| Appointment date | `appointment-date-{id}` | Appointment date |
| Appointment time | `appointment-time-{id}` | Appointment time |
| Appointment status | `appointment-status-{id}` | Appointment status |
| Appointment notes | `appointment-notes-{id}` | Appointment notes |
| Update button | `update-appointment-btn-{id}` | Update appointment button |
| Cancel button | `cancel-appointment-btn-{id}` | Cancel appointment button |
| Update form | `update-form-{id}` | Update appointment form |
| Update doctor select | `update-doctor-select-{id}` | Doctor select in update form |
| Update date input | `update-date-input-{id}` | Date input in update form |
| Update time input | `update-time-input-{id}` | Time input in update form |
| Update status select | `update-status-select-{id}` | Status select in update form |
| Update notes input | `update-notes-input-{id}` | Notes input in update form |
| Save update button | `save-update-btn-{id}` | Save changes button |
| Cancel update button | `cancel-update-btn-{id}` | Cancel update button |
| No appointments message | `no-appointments-message` | Message when no appointments |
| Dashboard message | `dashboard-message` | Action feedback message |
| Error message | `dashboard-error` | Error message |
| Loading state | `dashboard-loading` | Loading indicator |

## Usage Examples

### Selenium WebDriver (Java)

```java
// Find element by data-testid
WebElement nameInput = driver.findElement(By.cssSelector("[data-testid='patient-name-input']"));
nameInput.sendKeys("John Doe");

// Find button and click
WebElement submitBtn = driver.findElement(By.cssSelector("[data-testid='submit-btn']"));
submitBtn.click();

// Verify error message
WebElement errorMsg = driver.findElement(By.cssSelector("[data-testid='patient-name-error']"));
assertEquals("Name is required", errorMsg.getText());

// Find doctor card by ID
WebElement doctorCard = driver.findElement(By.cssSelector("[data-testid='doctor-card-1']"));
assertTrue(doctorCard.isDisplayed());
```

### Selenium WebDriver (Python)

```python
# Find element by data-testid
name_input = driver.find_element(By.CSS_SELECTOR, "[data-testid='patient-name-input']")
name_input.send_keys("John Doe")

# Find button and click
submit_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='submit-btn']")
submit_btn.click()

# Verify error message
error_msg = driver.find_element(By.CSS_SELECTOR, "[data-testid='patient-name-error']")
assert "Name is required" in error_msg.text
```

### Playwright (JavaScript)

```javascript
// Find element by data-testid
await page.fill('[data-testid="patient-name-input"]', 'John Doe');

// Click button
await page.click('[data-testid="submit-btn"]');

// Verify error message
const errorMsg = await page.textContent('[data-testid="patient-name-error"]');
expect(errorMsg).toContain('Name is required');
```

### Cypress (JavaScript)

```javascript
// Find and interact with element
cy.get('[data-testid="patient-name-input"]').type('John Doe');
cy.get('[data-testid="submit-btn"]').click();

// Verify error message
cy.get('[data-testid="patient-name-error"]')
  .should('contain', 'Name is required');
```

## Notes

- All `data-testid` attributes are stable and won't change with styling updates
- Use CSS selectors: `[data-testid='value']` to locate elements
- Dynamic IDs (like `{id}` in doctor cards) should be replaced with actual IDs from test data
- Always wait for elements to be visible before interacting
- Use these attributes for reliable test automation, not for styling or JavaScript hooks
