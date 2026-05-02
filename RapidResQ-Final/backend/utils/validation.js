/**
 * Validation utilities for form data
 */

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports various formats)
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Invalid email format' };
  }
  if (email.length > 100) {
    return { valid: false, message: 'Email must be less than 100 characters' };
  }
  return { valid: true };
};

/**
 * Validate phone number format
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, message: 'Phone number is required' };
  }
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, message: 'Phone number must be between 10 and 15 digits' };
  }
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Invalid phone number format' };
  }
  return { valid: true };
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (password.length > 50) {
    return { valid: false, message: 'Password must be less than 50 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

/**
 * Validate required field
 */
const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

/**
 * Validate string length
 */
const validateLength = (value, min, max, fieldName) => {
  if (!value || typeof value !== 'string') {
    return { valid: false, message: `${fieldName} is required` };
  }
  const trimmed = value.trim();
  if (trimmed.length < min) {
    return { valid: false, message: `${fieldName} must be at least ${min} characters` };
  }
  if (trimmed.length > max) {
    return { valid: false, message: `${fieldName} must be less than ${max} characters` };
  }
  return { valid: true };
};

/**
 * Validate numeric range
 */
const validateNumericRange = (value, min, max, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return { valid: true }; // Optional field
  }
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a valid number` };
  }
  if (num < min || num > max) {
    return { valid: false, message: `${fieldName} must be between ${min} and ${max}` };
  }
  return { valid: true };
};

/**
 * Validate login data
 */
const validateLogin = (data) => {
  const errors = [];

  // Validate username
  const usernameValidation = validateLength(data.username, 3, 30, 'Username');
  if (!usernameValidation.valid) {
    errors.push(usernameValidation.message);
  }

  // Validate password
  const passwordValidation = validateRequired(data.password, 'Password');
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message);
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate signup data
 */
const validateSignup = (data) => {
  const errors = [];

  // Validate full name
  const fullNameValidation = validateLength(data.fullName, 2, 50, 'Full Name');
  if (!fullNameValidation.valid) {
    errors.push(fullNameValidation.message);
  }

  // Validate username
  const usernameValidation = validateLength(data.username, 3, 30, 'Username');
  if (!usernameValidation.valid) {
    errors.push(usernameValidation.message);
  }

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.message);
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message);
  }

  // Validate phone
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.valid) {
    errors.push(phoneValidation.message);
  }

  // Validate location
  const locationValidation = validateLength(data.location, 2, 50, 'Location');
  if (!locationValidation.valid) {
    errors.push(locationValidation.message);
  }

  // Validate age (optional)
  if (data.age) {
    const ageValidation = validateNumericRange(data.age, 13, 120, 'Age');
    if (!ageValidation.valid) {
      errors.push(ageValidation.message);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate contact form data
 */
const validateContact = (data) => {
  const errors = [];

  // Validate name
  const nameValidation = validateLength(data.name, 2, 50, 'Name');
  if (!nameValidation.valid) {
    errors.push(nameValidation.message);
  }

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.message);
  }

  // Validate message
  const messageValidation = validateLength(data.message, 10, 1000, 'Message');
  if (!messageValidation.valid) {
    errors.push(messageValidation.message);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateLogin,
  validateSignup,
  validateContact,
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  validateLength,
  validateNumericRange
};

