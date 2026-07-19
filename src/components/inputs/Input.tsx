import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        className={`input-field w-full ${error ? 'border-status-error focus:ring-status-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-status-error text-sm mt-1">{error}</p>}
      {helperText && (
        <p className="text-text-light text-sm mt-1">{helperText}</p>
      )}
    </div>
  )
}
