
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string; // Added className prop
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = '', // Default to empty string
}) => {
  const baseStyles = "px-6 py-3 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5";
  
  const variantStyles = {
    primary: `bg-brand-primary text-white hover:bg-opacity-90 focus:ring-brand-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    secondary: `bg-brand-secondary text-white hover:bg-opacity-90 focus:ring-brand-secondary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`} // Applied className
    >
      {children}
    </button>
  );
};

export default Button;
