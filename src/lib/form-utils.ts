import { useTranslations } from 'next-intl';
// Define TFunction type matching the return type of useTranslations
type TFunction = ReturnType<typeof useTranslations>;

// Validation functions
export const validateRequired = (value: string): boolean => {
  return value !== undefined && value !== null && value.trim() !== '';
};

export const validateEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value !== undefined && value !== null && value.trim().length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value !== undefined && value !== null && value.trim().length <= maxLength;
};

export const validatePhone = (value: string): boolean => {
  // Allow for various phone formats, but require at least 9 digits
  const digitsOnly = value.replace(/\D/g, '');
  return digitsOnly.length >= 9;
};

export const validatePattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value);
};

// Formatting functions
export const sanitizePhoneInput = (value: string): string => {
  // Allow only digits, +, -, spaces, and parentheses
  return value.replace(/[^0-9+\-\s()]/g, '');
};

export const formatPhoneNumber = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  
  if (!digitsOnly) return '';
  
  // Format based on length
  if (digitsOnly.length <= 3) {
    return digitsOnly;
  } else if (digitsOnly.length <= 6) {
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
  } else {
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 12)}`;
  }
};

export const formatCurrency = (value: number | string, locale: string = 'pl-PL', currency: string = 'PLN'): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(numValue);
};

// Form field configuration types
export type ValidationRule = {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'phone' | 'pattern';
  value?: number | RegExp;
  message?: string;
};

export type FieldConfig = {
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'date' | 'password';
  validations?: ValidationRule[];
  formatOnChange?: (value: string) => string;
  formatOnBlur?: (value: string) => string;
  autoComplete?: string;
  maxLength?: number;
  placeholder?: string;
};

// Field configuration registry
export const FIELD_CONFIGS: Record<string, FieldConfig> = {
  NAME: {
    type: 'text',
    validations: [
      { type: 'required' },
      { type: 'minLength', value: 2 }
    ],
    autoComplete: 'name',
    placeholder: 'John Doe'
  },
  EMAIL: {
    type: 'email',
    validations: [
      { type: 'required' },
      { type: 'email' }
    ],
    autoComplete: 'email',
    placeholder: 'email@example.com'
  },
  PHONE: {
    type: 'tel',
    validations: [
      { type: 'phone' }
    ],
    formatOnChange: sanitizePhoneInput,
    formatOnBlur: formatPhoneNumber,
    autoComplete: 'tel',
    placeholder: '123 456 789'
  },
  MESSAGE: {
    type: 'textarea',
    validations: [
      { type: 'required' },
      { type: 'minLength', value: 10 }
    ],
    maxLength: 500
  },
  ADDRESS: {
    type: 'text',
    validations: [
      { type: 'required' },
      { type: 'minLength', value: 5 }
    ],
    autoComplete: 'street-address'
  }
};

// Validate a field against rules
export const validateField = (
  value: string, 
  rules: ValidationRule[], 
  t: TFunction
): string | null => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!validateRequired(value)) {
          return rule.message || t('common.fieldRequired');
        }
        break;
      case 'email':
        if (value && !validateEmail(value)) {
          return rule.message || t('common.emailInvalid');
        }
        break;
      case 'minLength':
        if (value && typeof rule.value === 'number' && !validateMinLength(value, rule.value)) {
          return rule.message || t('common.minLengthError', { count: rule.value });
        }
        break;
      case 'maxLength':
        if (value && typeof rule.value === 'number' && !validateMaxLength(value, rule.value)) {
          return rule.message || t('common.maxLengthError', { count: rule.value });
        }
        break;
      case 'phone':
        if (value && !validatePhone(value)) {
          return rule.message || t('common.phoneInvalid');
        }
        break;
      case 'pattern':
        if (value && rule.value instanceof RegExp && !validatePattern(value, rule.value)) {
          return rule.message || t('common.patternError');
        }
        break;
    }
  }
  
  return null;
}; 