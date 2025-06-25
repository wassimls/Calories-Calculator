
import React from 'react';

interface ResultCardProps {
  title: string;
  value: string;
  unit: string;
  descriptionComponent?: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, value, unit, descriptionComponent }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
      <div className="flex items-center justify-center space-x-2">
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
        {descriptionComponent}
      </div>
      <p className="text-4xl font-bold text-brand-primary my-3">{value}</p>
      <p className="text-sm text-text-secondary">{unit}</p>
    </div>
  );
};

export default ResultCard;
