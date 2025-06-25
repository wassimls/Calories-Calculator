
import React, { useState } from 'react';
import { ExerciseSuggestion } from '../types';

interface ExerciseSuggestionCardProps {
  exercise: ExerciseSuggestion;
}

const ExerciseSuggestionCard: React.FC<ExerciseSuggestionCardProps> = ({ exercise }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // animationUrl from Gemini service is either a valid string or null.
  // Ensure animationUrl is not an empty string after trimming before considering it valid.
  const hasValidAnimationUrl = exercise.animationUrl && exercise.animationUrl.trim() !== '' && !imageError;
  
  const generateSearchUrl = () => {
    const query = `${exercise.exerciseName} animated exercise GIF`;
    return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
  };

  return (
    <div
      className="w-full text-right bg-slate-800 p-5 rounded-lg shadow-md transition-all hover:shadow-xl hover:bg-slate-700 flex flex-col sm:flex-row gap-4 items-start"
      aria-labelledby={`exercise-name-${exercise.exerciseName.replace(/\s+/g, '-')}`}
    >
      {/* Text Content Area */}
      <div className="flex-grow">
        <h4 id={`exercise-name-${exercise.exerciseName.replace(/\s+/g, '-')}`} className="text-lg font-semibold text-brand-primary mb-2">{exercise.exerciseName}</h4>
        <p className="text-text-secondary text-sm mb-3 whitespace-pre-line">{exercise.description}</p>
        
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-1 text-xs text-text-primary">
          {exercise.duration && (
            <p>
              <span className="font-medium">المدة المقترحة:</span> {exercise.duration}
            </p>
          )}
          {exercise.intensity && (
            <p>
              <span className="font-medium">مستوى الشدة:</span> {exercise.intensity}
            </p>
          )}
          {exercise.estimatedCaloriesBurned && (
            <p>
              <span className="font-medium">السعرات المحروقة (تقديريًا):</span> {exercise.estimatedCaloriesBurned}
            </p>
          )}
        </div>
      </div>

      {/* Animation/Message Area */}
      <div className="sm:w-1/3 w-full mt-4 sm:mt-0 flex-shrink-0 self-center text-center">
        {hasValidAnimationUrl ? (
          <img 
            src={exercise.animationUrl!} // Assert non-null because hasValidAnimationUrl checks it
            alt={`رسم متحرك لتوضيح تمرين ${exercise.exerciseName}`} 
            className="rounded-md w-full h-auto object-contain max-h-48 shadow-md bg-slate-700" // Added bg for better look during load
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[100px] bg-slate-700/50 rounded-md p-3">
            <p className="text-text-secondary text-xs text-center">
              {imageError 
                ? "حدث خطأ أثناء تحميل الرسم المتحرك." 
                : "لا يتوفر رسم متحرك لهذا التمرين."}
            </p>
            <a
              href={generateSearchUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-brand-primary hover:text-brand-primary/80 hover:underline text-xs font-medium py-1 px-2 rounded transition-colors"
              aria-label={`البحث عن توضيح لتمرين ${exercise.exerciseName} على الويب`}
            >
              ابحث عن توضيح على الويب
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseSuggestionCard;