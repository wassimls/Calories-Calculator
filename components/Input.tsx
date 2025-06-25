
import React from 'react';

interface InputProps {
  label: string;
  id: string;
  name: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  unit?: string;
  error?: string;
  min?: string;
  max?: string;
  step?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  unit,
  error,
  min,
  max,
  step
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full px-4 py-2.5 rounded-md bg-input-bg text-text-primary border ${
            error ? 'border-error' : 'border-input-border'
          } focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-colors duration-200 ease-in-out placeholder:text-text-secondary ${unit ? 'pl-10' : ''}`}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {unit && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm text-text-secondary">
            {unit}
          </span>
        )}
      </div>
      {error && <p id={`${id}-error`} className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
};

export default Input;