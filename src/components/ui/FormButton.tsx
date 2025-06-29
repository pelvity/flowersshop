'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline' | 'link' | 'danger';
  fullWidth?: boolean;
  loadingText?: string;
}

export function FormButton({
  type = 'button',
  children,
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  icon: Icon,
  variant = 'primary',
  fullWidth = true,
  loadingText
}: FormButtonProps) {
  // Base classes for all button variants
  const baseClasses = 'flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70';
  
  // Classes specific to each variant
  const variantClasses = {
    primary: 'bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white focus:ring-pink-400',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-400',
    link: 'bg-transparent hover:underline text-pink-600 shadow-none focus:ring-pink-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400',
  };

  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combined classes
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`;
  
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={combinedClasses}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText || children}
        </>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
} 