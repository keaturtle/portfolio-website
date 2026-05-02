import { ContactPayload } from './types';

export interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactPayload(payload: Partial<ContactPayload>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!payload.name || payload.name.trim() === '') {
    errors.name = 'Name is required.';
  }

  if (!payload.email || payload.email.trim() === '') {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(payload.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!payload.message || payload.message.trim() === '') {
    errors.message = 'Message is required.';
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
