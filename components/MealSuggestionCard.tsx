import React from 'react';
import { MealSuggestion } from '../types';

interface MealSuggestionCardProps {
  meal: MealSuggestion;
  onSelectMeal: (meal: MealSuggestion) => void;
}

const MealSuggestionCard: React.FC<MealSuggestionCardProps> = ({ meal, onSelectMeal }) => {
  return (
    <button
      onClick={() => onSelectMeal(meal)}
      className="w-full text-right bg-slate-800 p-5 rounded-lg shadow-md transition-all hover:shadow-xl hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-75 cursor-pointer"
      aria-label={`عرض تفاصيل وصفة ${meal.mealName}`}
    >
      <h4 className="text-lg font-semibold text-brand-secondary mb-2">{meal.mealName}</h4>
      <p className="text-text-secondary text-sm mb-3 whitespace-pre-line">{meal.description}</p>
      
      {(meal.estimatedCalories || meal.proteinGrams || meal.carbsGrams || meal.fatsGrams) && (
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-1 text-xs text-text-primary">
          {meal.estimatedCalories && (
            <p>
              <span className="font-medium">السعرات الحرارية:</span> {meal.estimatedCalories}
            </p>
          )}
          {meal.proteinGrams && (
            <p>
              <span className="font-medium">البروتين:</span> {meal.proteinGrams}
            </p>
          )}
          {meal.carbsGrams && (
            <p>
              <span className="font-medium">الكربوهيدرات:</span> {meal.carbsGrams}
            </p>
          )}
          {meal.fatsGrams && (
            <p>
              <span className="font-medium">الدهون:</span> {meal.fatsGrams}
            </p>
          )}
        </div>
      )}
    </button>
  );
};

export default MealSuggestionCard;