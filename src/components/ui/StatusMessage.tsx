'use client';

import React from 'react';
import { Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type StatusType = 'success' | 'error' | 'info' | 'warning' | 'idle';

interface StatusMessageProps {
  type: StatusType;
  message: string;
  className?: string;
}

export function StatusMessage({ type, message, className = '' }: StatusMessageProps) {
  if (type === 'idle' || !message) {
    return null;
  }

  // Define styles based on type
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    idle: ''
  };

  // Define icons based on type
  const icons = {
    success: <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />,
    error: <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />,
    info: <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />,
    idle: null
  };

  return (
    <div className={`p-2 sm:p-3 border text-sm rounded flex items-start ${styles[type]} ${className}`}>
      {icons[type]}
      <p>{message}</p>
    </div>
  );
} 