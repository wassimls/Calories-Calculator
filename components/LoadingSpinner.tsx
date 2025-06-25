import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const SIZES = {
    sm: { dimension: 'w-3 h-3', textSize: 'text-xs' },
    md: { dimension: 'w-4 h-4', textSize: 'text-sm' },
    lg: { dimension: 'w-6 h-6', textSize: 'text-base' },
  };

  const currentSize = SIZES[size] || SIZES.md;
  const loadingText = text === undefined ? "جاري التحميل..." : text;


  return (
    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
      <div 
        className={`${currentSize.dimension} border-2 border-transparent border-t-white rounded-full animate-spin`}
        role="status"
        aria-live="polite"
        aria-label={loadingText || "جاري التحميل"}
      >
      </div>
      {loadingText && <span className={`${currentSize.textSize}`}>{loadingText}</span>}
    </div>
  );
};

export default LoadingSpinner;