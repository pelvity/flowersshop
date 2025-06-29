'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { UseFormRegister, FieldError, RegisterOptions } from 'react-hook-form';

interface FormFieldProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  icon?: LucideIcon;
  register?: UseFormRegister<any>;
  error?: FieldError;
  errorMessage?: string;
  className?: string;
  rows?: number;
  rules?: RegisterOptions;
  autoComplete?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function FormField({
  id,
  name,
  type = 'text',
  label,
  required = false,
  placeholder,
  icon: Icon,
  register,
  error,
  errorMessage,
  className = '',
  rows = 4,
  rules = {},
  autoComplete,
  value,
  onChange
}: FormFieldProps) {
  const isTextarea = type === 'textarea';
  const hasError = !!error || !!errorMessage;
  const isControlled = value !== undefined;
  
  // Prepare register options - combine passed rules with required if needed
  const registerOptions = required ? { ...rules, required: true } : rules;

  // Prepare shared props for both input and textarea
  const sharedProps = {
    id,
    placeholder,
    className: `block w-full rounded-md shadow-sm py-2 sm:py-3 pl-10 pr-3 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500 ${
      hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
    } ${className}`,
    ...(autoComplete && { autoComplete }),
    ...(value !== undefined && { value }),
    ...(onChange && { onChange })
  };

  return (
    <div>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {Icon && (
          <div className={`absolute ${isTextarea ? 'top-3' : 'inset-y-0'} left-0 pl-3 flex ${isTextarea ? 'items-start' : 'items-center'} pointer-events-none`}>
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        {isTextarea ? (
          <textarea
            {...(register ? register(name, registerOptions) : {})}
            {...sharedProps}
            rows={rows}
          />
        ) : (
          <input
            type={type}
            {...(register ? register(name, registerOptions) : {})}
            {...sharedProps}
          />
        )}
      </div>
      
      {(error || errorMessage) && (
        <p className="mt-1 text-xs sm:text-sm text-red-600">
          {errorMessage || error?.message}
        </p>
      )}
    </div>
  );
} 