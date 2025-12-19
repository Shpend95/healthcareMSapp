/**
 * Form validation utilities with XPath-friendly error messages
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  return { valid: true };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) {
    return { valid: false, message: 'Phone number must be at least 10 digits' };
  }
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Please enter a valid phone number' };
  }
  return { valid: true };
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validateDate = (date, options = {}) => {
  const { minDate, maxDate, required = true } = options;
  
  if (!date) {
    return required 
      ? { valid: false, message: 'Date is required' }
      : { valid: true };
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: 'Please enter a valid date' };
  }
  
  if (minDate && dateObj < new Date(minDate)) {
    return { valid: false, message: `Date must be after ${minDate}` };
  }
  
  if (maxDate && dateObj > new Date(maxDate)) {
    return { valid: false, message: `Date must be before ${maxDate}` };
  }
  
  return { valid: true };
};

export const validateCardNumber = (cardNumber) => {
  if (!cardNumber) {
    return { valid: false, message: 'Card number is required' };
  }
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) {
    return { valid: false, message: 'Card number must be 13-19 digits' };
  }
  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  if (sum % 10 !== 0) {
    return { valid: false, message: 'Invalid card number' };
  }
  return { valid: true };
};

export const validateCVV = (cvv) => {
  if (!cvv) {
    return { valid: false, message: 'CVV is required' };
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    return { valid: false, message: 'CVV must be 3 or 4 digits' };
  }
  return { valid: true };
};

export const validateZIP = (zip) => {
  if (!zip) {
    return { valid: false, message: 'ZIP code is required' };
  }
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!zipRegex.test(zip)) {
    return { valid: false, message: 'Please enter a valid ZIP code' };
  }
  return { valid: true };
};

export const validateRoutingNumber = (routing) => {
  if (!routing) {
    return { valid: false, message: 'Routing number is required' };
  }
  if (!/^\d{9}$/.test(routing)) {
    return { valid: false, message: 'Routing number must be 9 digits' };
  }
  return { valid: true };
};

export const validateAccountNumber = (account) => {
  if (!account) {
    return { valid: false, message: 'Account number is required' };
  }
  if (account.length < 4 || account.length > 17) {
    return { valid: false, message: 'Account number must be 4-17 digits' };
  }
  return { valid: true };
};

export const validateFile = (file, options = {}) => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'] } = options;
  
  if (!file) {
    return { valid: false, message: 'File is required' };
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return { valid: false, message: `File size must be less than ${maxSizeMB}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  
  return { valid: true };
};

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 4) return cleaned;
  return `•••• ${cleaned.slice(-4)}`;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

