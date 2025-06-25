import React, { useEffect, useState, useCallback } from 'react';
import { DetailedMealRecipe, Ingredient } from '../types';
import { getDetailedRecipe, findRecipeVideo } from '../services/geminiService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface MealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealName: string | null;
}

const MealDetailModal: React.FC<MealDetailModalProps> = ({ isOpen, onClose, mealName }) => {
  const [recipe, setRecipe] = useState<DetailedMealRecipe | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState<boolean>(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setRecipe(null);
    setIsLoadingRecipe(false);
    setRecipeError(null);
    setYoutubeVideoId(null);
    setIsLoadingVideo(false);
    setVideoError(null);
  }, []);

  useEffect(() => {
    if (isOpen && mealName) {
      document.body.classList.add('modal-open');
      resetState(); // Reset state each time modal opens with a new meal
      const fetchRecipe = async () => {
        setIsLoadingRecipe(true);
        setRecipeError(null);
        try {
          const detailedRecipeData = await getDetailedRecipe(mealName);
          setRecipe(detailedRecipeData);
        } catch (error) {
          console.error("Error fetching detailed recipe:", error);
          setRecipeError(error instanceof Error ? error.message : "فشل تحميل تفاصيل الوصفة.");
        } finally {
          setIsLoadingRecipe(false);
        }
      };
      fetchRecipe();
    } else {
      document.body.classList.remove('modal-open');
    }
    // Cleanup function to remove class when component unmounts or isOpen changes
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, mealName, resetState]);


  const handleFindVideo = async () => {
    if (!recipe?.mealName) return;
    setIsLoadingVideo(true);
    setVideoError(null);
    setYoutubeVideoId(null);
    try {
      const videoData = await findRecipeVideo(recipe.mealName);
      if (videoData.youtubeVideoId) {
        setYoutubeVideoId(videoData.youtubeVideoId);
      } else {
        setVideoError("لم يتم العثور على فيديو لهذه الوصفة.");
      }
    } catch (error) {
      console.error("Error finding recipe video:", error);
      setVideoError(error instanceof Error ? error.message : "فشل البحث عن الفيديو.");
    } finally {
      setIsLoadingVideo(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="meal-detail-title"
    >
      <div 
        className="bg-card-bg p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        {isLoadingRecipe && (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner text="جاري تحميل تفاصيل الوصفة..." size="lg" />
          </div>
        )}
        {recipeError && !isLoadingRecipe && (
          <div className="text-center py-10">
            <p className="text-error text-lg mb-4">خطأ في تحميل الوصفة</p>
            <p className="text-text-secondary">{recipeError}</p>
            <Button onClick={onClose} variant="secondary" className="mt-6">إغلاق</Button>
          </div>
        )}
        {!isLoadingRecipe && !recipeError && recipe && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 id="meal-detail-title" className="text-2xl sm:text-3xl font-bold text-brand-secondary">{recipe.mealName}</h2>
              <button 
                onClick={onClose} 
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label="إغلاق النافذة"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">المقادير:</h3>
                {recipe.ingredients.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-text-secondary pl-4">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>
                        <span className="font-medium text-text-primary">{ingredient.name}:</span> {ingredient.quantity}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-secondary">لا توجد معلومات عن المقادير.</p>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">خطوات التحضير:</h3>
                {recipe.preparationSteps.length > 0 ? (
                  <ol className="list-decimal list-inside space-y-2 text-text-secondary pl-4">
                    {recipe.preparationSteps.map((step, index) => (
                      <li key={index} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-text-secondary">لا توجد معلومات عن خطوات التحضير.</p>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-input-border">
                {youtubeVideoId ? (
                  <div className="aspect-video"> {/* Changed from aspect-w-16 aspect-h-9 */}
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                      title={`فيديو يوتيوب لوصفة ${recipe.mealName}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <>
                    <Button onClick={handleFindVideo} variant="primary" disabled={isLoadingVideo} fullWidth>
                      {isLoadingVideo ? <LoadingSpinner text="جاري البحث عن فيديو..." /> : `ابحث عن فيديو على يوتيوب لوصفة "${recipe.mealName}"`}
                    </Button>
                    {videoError && <p className="text-sm text-error text-center mt-3">{videoError}</p>}
                  </>
                )}
              </div>
            </div>
            <Button onClick={onClose} variant="secondary" className="mt-8 w-full sm:w-auto">
              إغلاق
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MealDetailModal;