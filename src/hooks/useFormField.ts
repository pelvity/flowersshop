import { useState, ChangeEvent, FocusEvent, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FieldConfig, ValidationRule, validateField } from '@/lib/form-utils';

export type FieldState<T = string> = {
  value: T;
  error: string | null;
  touched: boolean;
  focused: boolean;
};

export type UseFormFieldProps<T = string> = {
  name: string;
  initialValue?: T;
  validations?: ValidationRule[];
  formatOnChange?: (value: string) => string;
  formatOnBlur?: (value: string) => string;
  onValueChange?: (value: T) => void;
};

export function useFormField<T = string>({
  name,
  initialValue = '' as unknown as T,
  validations = [],
  formatOnChange,
  formatOnBlur,
  onValueChange,
}: UseFormFieldProps<T>) {
  const t = useTranslations();
  // Use useRef for the validation rules to prevent them from causing re-renders
  const validationsRef = useRef(validations);
  
  // Update validations ref when validations change
  if (JSON.stringify(validationsRef.current) !== JSON.stringify(validations)) {
    validationsRef.current = validations;
  }
  
  const [state, setState] = useState<FieldState<T>>({
    value: initialValue,
    error: null,
    touched: false,
    focused: false,
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const rawValue = e.target.value;
    
    // Apply formatting if provided
    let formattedValue = rawValue;
    if (formatOnChange && typeof rawValue === 'string') {
      formattedValue = formatOnChange(rawValue);
    }
    
    // Update state
    setState(prev => {
      const newValue = formattedValue as unknown as T;
      // Only update if value has changed to prevent unnecessary re-renders
      if (prev.value === newValue) return prev;
      
      return {
        ...prev,
        value: newValue,
        // Clear errors on change if the field has been touched
        error: prev.touched ? validateField(formattedValue as string, validationsRef.current, t) : prev.error
      };
    });
    
    // Notify parent component if needed
    if (onValueChange) {
      onValueChange(formattedValue as unknown as T);
    }
  }, [formatOnChange, onValueChange, t]);

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    // Apply blur formatting if provided
    if (formatOnBlur && typeof value === 'string') {
      value = formatOnBlur(value);
    }
    
    // Validate on blur
    const error = validateField(value as string, validationsRef.current, t);
    
    setState(prev => ({
      ...prev,
      value: value as unknown as T,
      error,
      touched: true,
      focused: false
    }));
    
    // Notify parent if needed and value changed
    if (onValueChange && value !== state.value) {
      onValueChange(value as unknown as T);
    }
  }, [formatOnBlur, state.value, onValueChange, t]);

  const handleFocus = useCallback(() => {
    setState(prev => ({
      ...prev,
      focused: true
    }));
  }, []);

  const setValue = useCallback((value: T, shouldValidate: boolean = true) => {
    setState(prev => {
      const error = shouldValidate ? validateField(value as unknown as string, validationsRef.current, t) : prev.error;
      return {
        ...prev,
        value,
        error
      };
    });
    
    if (onValueChange) {
      onValueChange(value);
    }
  }, [onValueChange, t]);

  // Force validation, useful when submitting a form
  const validate = useCallback(() => {
    const error = validateField(state.value as unknown as string, validationsRef.current, t);
    setState(prev => ({
      ...prev,
      error,
      touched: true
    }));
    return !error;
  }, [state.value, t]);

  // Reset the field to its initial state
  const reset = useCallback(() => {
    setState({
      value: initialValue,
      error: null,
      touched: false,
      focused: false
    });
  }, [initialValue]);

  return {
    name,
    value: state.value,
    error: state.error,
    touched: state.touched,
    focused: state.focused,
    handleChange,
    handleBlur,
    handleFocus,
    setValue,
    validate,
    reset
  };
}

// Helper to create field props with config
export const createFieldProps = <T = string>(
  config: FieldConfig, 
  hookProps: Omit<UseFormFieldProps<T>, 'validations' | 'formatOnChange' | 'formatOnBlur'>
): UseFormFieldProps<T> => {
  return {
    ...hookProps,
    validations: config.validations,
    formatOnChange: config.formatOnChange,
    formatOnBlur: config.formatOnBlur
  };
}; 