import React, { forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { FieldConfig, FIELD_CONFIGS } from '@/lib/form-utils';
import { useFormField, UseFormFieldProps } from '@/hooks/useFormField';
import { LucideIcon } from 'lucide-react';

export type FormFieldProps = {
  id: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'date' | 'password';
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  icon?: LucideIcon;
  className?: string;
  fieldClassName?: string;
  errorMessage?: string;
  helperText?: string;
  presetConfig?: keyof typeof FIELD_CONFIGS | FieldConfig;
  children?: React.ReactNode;
  options?: { value: string; label: string }[];
  containerRef?: React.RefObject<HTMLDivElement>;
};

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, FormFieldProps>(
  (props, ref) => {
    const {
      id,
      name,
      type = 'text',
      label,
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      required,
      disabled,
      readOnly,
      autoComplete,
      minLength,
      maxLength,
      rows = 4,
      icon: Icon,
      className = '',
      fieldClassName = '',
      errorMessage,
      helperText,
      presetConfig,
      children,
      options,
      containerRef,
      ...rest
    } = props;
    
    const t = useTranslations('common');
    
    // Get configuration if a preset was specified
    let config: FieldConfig | undefined;
    if (presetConfig) {
      if (typeof presetConfig === 'string') {
        config = FIELD_CONFIGS[presetConfig];
      } else {
        config = presetConfig;
      }
    }
    
    // Use the config to determine field type and other properties
    const fieldType = config?.type || type;
    const fieldAutoComplete = autoComplete || config?.autoComplete;
    const fieldMaxLength = maxLength || config?.maxLength;
    const fieldPlaceholder = placeholder || config?.placeholder || '';
    
    // Common props for all input types
    const commonProps = {
      id,
      name,
      disabled,
      readOnly,
      required,
      placeholder: fieldPlaceholder,
      autoComplete: fieldAutoComplete,
      maxLength: fieldMaxLength,
      onChange,
      onBlur,
      onFocus,
      ref,
      className: `w-full rounded-md border py-2 ${Icon ? 'pl-10 pr-3' : 'px-3'} focus:outline-none focus:ring-2 focus:ring-pink-400 ${
        errorMessage ? 'border-red-500' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'} ${fieldClassName}`,
      ...rest,
    };
    
    // Render different field types
    const renderField = () => {
      switch (fieldType) {
        case 'textarea':
          return (
            <textarea 
              rows={rows} 
              value={value} 
              {...commonProps} 
              ref={ref as React.RefObject<HTMLTextAreaElement>}
            />
          );
          
        case 'select':
          return (
            <select 
              value={value} 
              {...commonProps} 
              ref={ref as React.RefObject<HTMLSelectElement>}
            >
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              {children}
            </select>
          );
          
        default:
          return (
            <input 
              type={fieldType} 
              value={value} 
              minLength={minLength} 
              {...commonProps} 
              ref={ref as React.RefObject<HTMLInputElement>}
            />
          );
      }
    };
    
    return (
      <div className={`relative ${className}`} ref={containerRef}>
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          )}
          
          {renderField()}
        </div>
        
        {(errorMessage || helperText) && (
          <div className={`mt-1 text-sm ${errorMessage ? 'text-red-600' : 'text-gray-500'}`}>
            {errorMessage || helperText}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// Smart form field that uses our hook
export type SmartFormFieldProps = Omit<FormFieldProps, 'onChange' | 'onBlur' | 'onFocus' | 'value' | 'errorMessage'> & {
  hookProps?: UseFormFieldProps;
  onValueChange?: (value: string) => void;
};

export const SmartFormField = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, SmartFormFieldProps>(
  (props, ref) => {
    const {
      id,
      name,
      hookProps,
      onValueChange,
      presetConfig,
      ...rest
    } = props;
    
    // Get config if provided
    let config: FieldConfig | undefined;
    if (presetConfig) {
      if (typeof presetConfig === 'string') {
        config = FIELD_CONFIGS[presetConfig];
      } else {
        config = presetConfig;
      }
    }
    
    // Create form field hook props
    const formFieldProps: UseFormFieldProps = hookProps || {
      name,
      initialValue: '',
      validations: config?.validations || [],
      formatOnChange: config?.formatOnChange,
      formatOnBlur: config?.formatOnBlur,
      onValueChange
    };
    
    // Use our form field hook
    const {
      value,
      error,
      handleChange,
      handleBlur,
      handleFocus
    } = useFormField(formFieldProps);
    
    return (
      <FormField
        id={id}
        name={name}
        value={value as string}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        errorMessage={error || undefined}
        presetConfig={presetConfig}
        ref={ref}
        {...rest}
      />
    );
  }
);

SmartFormField.displayName = 'SmartFormField'; 