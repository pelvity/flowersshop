import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FieldConfig, FIELD_CONFIGS, ValidationRule, validateField as validateFieldUtil } from '@/lib/form-utils';
import { useFormField, UseFormFieldProps } from './useFormField';

export type FormValues = Record<string, any>;
export type FormErrors = Record<string, string | null>;
export type FormTouched = Record<string, boolean>;

export type FormFieldConfig = {
  name: string;
  presetConfig?: keyof typeof FIELD_CONFIGS | FieldConfig;
  validations?: ValidationRule[];
  initialValue?: any;
  formatOnChange?: (value: string) => string;
  formatOnBlur?: (value: string) => string;
  dependencies?: string[]; // Field names that this field depends on for validation
};

export type UseFormProps = {
  fields: FormFieldConfig[];
  onSubmit?: (values: FormValues) => void | Promise<void>;
  onChange?: (values: FormValues) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
};

export function useForm({
  fields,
  onSubmit,
  onChange,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormProps) {
  const t = useTranslations();
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize form values
  useEffect(() => {
    const initialValues: FormValues = {};
    fields.forEach((field) => {
      initialValues[field.name] = field.initialValue ?? '';
    });
    // Only set values if they're different to avoid unnecessary renders
    setValues((prev) => {
      // Check if values have changed
      const hasChanged = fields.some(field => 
        prev[field.name] !== (field.initialValue ?? '')
      );
      return hasChanged ? initialValues : prev;
    });
  }, [fields]); // Only depend on fields array

  // Update a single field value
  const setFieldValue = useCallback((name: string, value: any, shouldValidate: boolean = false) => {
    setValues((prev) => {
      const newValues = { ...prev, [name]: value };
      
      if (onChange) {
        onChange(newValues);
      }
      
      return newValues;
    });

    if (shouldValidate) {
      validateField(name);
    }
  }, [onChange]);

  // Mark a field as touched
  const setFieldTouched = useCallback((name: string, isTouched: boolean = true, shouldValidate: boolean = false) => {
    setTouched((prev) => ({
      ...prev,
      [name]: isTouched,
    }));

    if (shouldValidate) {
      validateField(name);
    }
  }, []);

  // Set an error for a field
  const setFieldError = useCallback((name: string, error: string | null) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  // Validate a single field
  const validateField = useCallback((name: string): string | null => {
    const field = fields.find((f) => f.name === name);
    
    if (!field) return null;
    
    // Get validation rules from field config
    let validations: ValidationRule[] = [];
    
    if (field.presetConfig && typeof field.presetConfig === 'string') {
      validations = FIELD_CONFIGS[field.presetConfig]?.validations || [];
    } else if (field.presetConfig && typeof field.presetConfig === 'object') {
      validations = (field.presetConfig as FieldConfig).validations || [];
    }
    
    // Add field-specific validations
    if (field.validations) {
      validations = [...validations, ...field.validations];
    }
    
    // Perform validation
    const fieldError = validateFieldUtil(values[name] || '', validations, t);
    setFieldError(name, fieldError);
    
    return fieldError;
  }, [fields, values, t, setFieldError]);

  // Validate all form fields
  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors: FormErrors = {};
    const newTouched: FormTouched = {};

    // Validate each field
    fields.forEach((field) => {
      const error = validateField(field.name);
      newErrors[field.name] = error;
      newTouched[field.name] = true;
      
      if (error) {
        isValid = false;
      }
    });

    // Update errors and touched state
    setErrors(newErrors);
    setTouched(newTouched);

    return isValid;
  }, [fields, validateField]);

  // Submit handler
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitted(true);
    
    // Validate all fields before submission
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
    
    return isValid;
  }, [onSubmit, validateForm, values]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    const initialValues: FormValues = {};
    
    fields.forEach((field) => {
      initialValues[field.name] = field.initialValue ?? '';
    });
    
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
  }, [fields]);

  // Create field props for each field
  const getFieldProps = useCallback((name: string) => {
    const field = fields.find((f) => f.name === name);

    return {
      name,
      value: values[name] || '',
      onChange: (e: React.ChangeEvent<any>) => {
        let value = e.target.value;
        if (field && field.formatOnChange) {
          value = field.formatOnChange(value);
        }
        setFieldValue(name, value, validateOnChange);
      },
      onBlur: () => {
        if (field && field.formatOnBlur) {
          const currentValue = values[name];
          if (typeof currentValue === 'string') {
            const formattedValue = field.formatOnBlur(currentValue);
            if (formattedValue !== currentValue) {
              setFieldValue(name, formattedValue, false); // No validation on format
            }
          }
        }
        setFieldTouched(name, true, validateOnBlur);
      },
      error: errors[name],
      touched: !!touched[name],
    };
  }, [values, errors, touched, fields, setFieldValue, setFieldTouched, validateOnChange, validateOnBlur]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
    getFieldProps,
  };
} 