
import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  options,
  error,
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 rounded-md bg-input-bg text-text-primary border ${
          error ? 'border-error' : 'border-input-border'
        } focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-colors duration-200 ease-in-out appearance-none bg-no-repeat pl-8`}
        style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'left 0.5rem center', // Adjusted for RTL
            backgroundSize: '1.5em 1.5em',
        }}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-card-bg text-text-primary">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p id={`${id}-error`} className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
};

export default Select;
