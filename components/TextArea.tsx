
import React from 'react';

interface TextAreaProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2.5 rounded-md bg-input-bg text-text-primary border ${
          error ? 'border-error' : 'border-input-border'
        } focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-colors duration-200 ease-in-out placeholder:text-text-secondary resize-y min-h-[80px]`}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p id={`${id}-error`} className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
};

export default TextArea;