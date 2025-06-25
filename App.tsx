import React, { useState, useCallback } from 'react';
import { UserData, CalculationResults, Gender, ActivityLevelName, MealSuggestion, ExerciseSuggestion, ExerciseGoalValue, SuggestExercisesParams } from './types';
import { GENDER_OPTIONS, ACTIVITY_LEVEL_OPTIONS, EXERCISE_GOAL_OPTIONS } from './constants';
import { calculateBMR, calculateTDEE, calculateMacronutrients } from './services/calorieService';
import { suggestMealsFromIngredients, suggestExercises } from './services/geminiService'; // Added suggestExercises
import Input from './components/Input';
import Select from './components/Select';
import Button from './components/Button';
import ResultCard from './components/ResultCard';
import InfoTooltip from './components/InfoTooltip';
import TextArea from './components/TextArea';
import MealSuggestionCard from './components/MealSuggestionCard';
import LoadingSpinner from './components/LoadingSpinner';
import MealDetailModal from './components/MealDetailModal';
import ExerciseSuggestionCard from './components/ExerciseSuggestionCard'; // Import new component

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    age: '',
    gender: Gender.MALE,
    weightKg: '',
    heightCm: '',
    activityLevel: ActivityLevelName.SEDENTARY,
  });
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for Meal Suggester
  const [ingredients, setIngredients] = useState<string>('');
  const [suggestedMeals, setSuggestedMeals] = useState<MealSuggestion[] | null>(null);
  const [isSuggestingMeals, setIsSuggestingMeals] = useState<boolean>(false);
  const [mealSuggestionError, setMealSuggestionError] = useState<string | null>(null);

  // State for Meal Detail Modal
  const [selectedMealForDetail, setSelectedMealForDetail] = useState<MealSuggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // State for Exercise Suggester
  const [exerciseGoal, setExerciseGoal] = useState<ExerciseGoalValue | ''>('');
  const [suggestedExercises, setSuggestedExercises] = useState<ExerciseSuggestion[] | null>(null);
  const [isSuggestingExercises, setIsSuggestingExercises] = useState<boolean>(false);
  const [exerciseSuggestionError, setExerciseSuggestionError] = useState<string | null>(null);


  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value as Gender | ActivityLevelName }));
     if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!userData.age || +userData.age <= 0 || +userData.age > 120) {
      newErrors.age = 'أدخل عمرًا صالحًا (١-١٢٠).';
    }
    if (!userData.weightKg || +userData.weightKg <= 0 || +userData.weightKg > 500) {
      newErrors.weightKg = 'أدخل وزنًا صالحًا (١-٥٠٠ كجم).';
    }
    if (!userData.heightCm || +userData.heightCm <= 0 || +userData.heightCm > 300) {
      newErrors.heightCm = 'أدخل طولًا صالحًا (١-٣٠٠ سم).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const ageNum = parseInt(userData.age, 10);
      const weightNum = parseFloat(userData.weightKg);
      const heightNum = parseFloat(userData.heightCm);
      const activityOption = ACTIVITY_LEVEL_OPTIONS.find(opt => opt.value === userData.activityLevel);
      
      if (activityOption && !isNaN(ageNum) && !isNaN(weightNum) && !isNaN(heightNum)) {
        const bmr = calculateBMR({
          age: ageNum,
          gender: userData.gender,
          weightKg: weightNum,
          heightCm: heightNum,
        });
        const tdee = calculateTDEE(bmr, activityOption.multiplier);
        const { proteinGrams, carbsGrams, fatsGrams } = calculateMacronutrients(tdee);
        setResults({ bmr, tdee, proteinGrams, carbsGrams, fatsGrams });
        // Reset exercise suggestions if form is re-submitted
        setSuggestedExercises(null);
        setExerciseSuggestionError(null);
        setExerciseGoal('');
      } else {
        setErrors(prev => ({...prev, form: "بيانات غير صالحة للحساب."}))
      }
    }
  };

  const handleIngredientsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIngredients(e.target.value);
    if (mealSuggestionError) {
      setMealSuggestionError(null);
    }
  }, [mealSuggestionError]);

  const handleSuggestMeals = async () => {
    if (!ingredients.trim()) {
      setMealSuggestionError("الرجاء إدخال المكونات المتوفرة لديك.");
      setSuggestedMeals(null);
      return;
    }
    setIsSuggestingMeals(true);
    setMealSuggestionError(null);
    setSuggestedMeals(null);
    try {
      const meals = await suggestMealsFromIngredients(ingredients);
      if (meals && meals.length > 0) {
        setSuggestedMeals(meals);
      } else {
        setMealSuggestionError("لم يتم العثور على اقتراحات وجبات بناءً على المكونات المقدمة. حاول تعديل المدخلات.");
      }
    } catch (error) {
      console.error("Error suggesting meals:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء محاولة اقتراح الوجبات. يرجى المحاولة مرة أخرى.";
      setMealSuggestionError(errorMessage);
    } finally {
      setIsSuggestingMeals(false);
    }
  };

  const handleOpenMealModal = useCallback((meal: MealSuggestion) => {
    setSelectedMealForDetail(meal);
    setIsModalOpen(true);
  }, []);

  const handleCloseMealModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMealForDetail(null); 
  }, []);

  // Handlers for Exercise Suggester
  const handleExerciseGoalChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setExerciseGoal(e.target.value as ExerciseGoalValue);
    if (exerciseSuggestionError) {
      setExerciseSuggestionError(null);
    }
    setSuggestedExercises(null); // Clear previous suggestions when goal changes
  }, [exerciseSuggestionError]);

  const handleSuggestExercises = async () => {
    if (!results || !results.tdee) {
      setExerciseSuggestionError("يرجى حساب السعرات الحرارية والمغذيات أولاً.");
      return;
    }
    if (!exerciseGoal) {
      setExerciseSuggestionError("الرجاء اختيار هدف التمرين أولاً.");
      return;
    }

    setIsSuggestingExercises(true);
    setExerciseSuggestionError(null);
    setSuggestedExercises(null);

    try {
      const ageNum = parseInt(userData.age, 10);
      if (isNaN(ageNum)) {
          throw new Error("العمر المدخل غير صالح.");
      }
      const params: SuggestExercisesParams = {
        tdee: results.tdee,
        gender: userData.gender,
        age: ageNum,
        currentActivityLevel: userData.activityLevel,
        exerciseGoal: exerciseGoal,
      };
      const exercises = await suggestExercises(params);
      if (exercises && exercises.length > 0) {
        setSuggestedExercises(exercises);
      } else {
        setExerciseSuggestionError("لم يتم العثور على اقتراحات تمارين بناءً على مدخلاتك. حاول تعديل الهدف أو المحاولة لاحقاً.");
      }
    } catch (error) {
      console.error("Error suggesting exercises:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء محاولة اقتراح التمارين. يرجى المحاولة مرة أخرى.";
      setExerciseSuggestionError(errorMessage);
    } finally {
      setIsSuggestingExercises(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-card-bg p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl animate-fade-in">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary">حاسبة السعرات الحرارية</h1>
          <p className="text-text-secondary mt-2 text-sm sm:text-base">
            قدّر احتياجاتك اليومية من الطاقة والمغذيات الكبرى واحصل على اقتراحات مخصصة.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="العمر (سنوات)"
              id="age"
              name="age"
              type="number"
              value={userData.age}
              onChange={handleInputChange}
              placeholder="مثال: ٣٠"
              error={errors.age}
            />
            <Select
              label="الجنس"
              id="gender"
              name="gender"
              value={userData.gender}
              onChange={handleSelectChange}
              options={GENDER_OPTIONS}
              error={errors.gender}
            />
            <Input
              label="الوزن (كجم)"
              id="weightKg"
              name="weightKg"
              type="number"
              value={userData.weightKg}
              onChange={handleInputChange}
              placeholder="مثال: ٧٠"
              error={errors.weightKg}
              unit="كجم"
            />
            <Input
              label="الطول (سم)"
              id="heightCm"
              name="heightCm"
              type="number"
              value={userData.heightCm}
              onChange={handleInputChange}
              placeholder="مثال: ١٧٥"
              error={errors.heightCm}
              unit="سم"
            />
          </div>
          <Select
            label="مستوى النشاط"
            id="activityLevel"
            name="activityLevel"
            value={userData.activityLevel}
            onChange={handleSelectChange}
            options={ACTIVITY_LEVEL_OPTIONS.map(opt => ({value: opt.value, label: opt.label}))}
            error={errors.activityLevel}
          />
          {errors.form && <p className="text-sm text-error text-center">{errors.form}</p>}
          <Button type="submit" variant="primary" fullWidth>
            احسب السعرات الحرارية والمغذيات
          </Button>
        </form>

        {results && (
          <section className="mt-10 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-semibold text-text-primary text-center mb-6">احتياجاتك التقديرية اليومية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResultCard
                title="سعرات الجسم الأساسية"
                value={results.bmr.toLocaleString('ar-EG', { maximumFractionDigits: 0})}
                unit="سعرة حرارية/يوم"
                descriptionComponent={
                  <InfoTooltip text="سعرات الجسم الأساسية هي عدد السعرات الحرارية التي يحتاجها جسمك لأداء وظائف البقاء الأساسية أثناء الراحة." />
                }
              />
              <ResultCard
                title="إجمالي إنفاق الطاقة اليومي (TDEE)"
                value={results.tdee.toLocaleString('ar-EG', { maximumFractionDigits: 0})}
                unit="سعرة حرارية/يوم"
                descriptionComponent={
                  <InfoTooltip text="إجمالي إنفاق الطاقة اليومي هو مجموع سعرات الجسم الأساسية والسعرات الحرارية المحروقة أثناء النشاط البدني والهضم. هذا هو هدفك اليومي من السعرات الحرارية للمحافظة على الوزن." />
                }
              />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
               <ResultCard
                title="البروتين"
                value={results.proteinGrams.toLocaleString('ar-EG', { maximumFractionDigits: 0})}
                unit="جرام/يوم"
                descriptionComponent={
                  <InfoTooltip text="البروتين ضروري لبناء وإصلاح الأنسجة، ويدعم وظائف المناعة وإنتاج الإنزيمات والهرمونات. (حسب نسبة ~٣٠٪ من TDEE)" />
                }
              />
              <ResultCard
                title="الكربوهيدرات"
                value={results.carbsGrams.toLocaleString('ar-EG', { maximumFractionDigits: 0})}
                unit="جرام/يوم"
                descriptionComponent={
                  <InfoTooltip text="الكربوهيدرات هي المصدر الرئيسي للطاقة للجسم والدماغ. اختر الكربوهيدرات المعقدة. (حسب نسبة ~٤٠٪ من TDEE)" />
                }
              />
              <ResultCard
                title="الدهون"
                value={results.fatsGrams.toLocaleString('ar-EG', { maximumFractionDigits: 0})}
                unit="جرام/يوم"
                descriptionComponent={
                  <InfoTooltip text="الدهون ضرورية لامتصاص الفيتامينات، إنتاج الهرمونات، وتوفير الطاقة. اختر الدهون الصحية. (حسب نسبة ~٣٠٪ من TDEE)" />
                }
              />
            </div>
             <div className="mt-6 p-4 bg-slate-800 rounded-lg text-center">
                <p className="text-text-secondary text-sm">
                    هذه تقديرات. قد تختلف الاحتياجات الفردية ونسب المغذيات الموصى بها. استشر أخصائي رعاية صحية أو تغذية للحصول على نصيحة شخصية.
                </p>
            </div>
          </section>
        )}
      </div>

      {/* Meal Suggester Section */}
      <div className="bg-card-bg p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl mt-10 animate-fade-in">
        <header className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-secondary">مقترح الوجبات الصحية</h2>
          <p className="text-text-secondary mt-2 text-sm sm:text-base">
            أدخل المكونات المتوفرة لديك، وسنقترح عليك بعض الوجبات الصحية.
          </p>
        </header>
        <div className="space-y-6">
          <TextArea
            label="المكونات المتوفرة لديك (افصل بينها بفاصلة أو سطر جديد)"
            id="ingredients"
            name="ingredients"
            value={ingredients}
            onChange={handleIngredientsChange}
            placeholder="مثال: دجاج، أرز، طماطم، بصل، زيت زيتون..."
            rows={4}
            error={mealSuggestionError && ingredients.trim() === '' ? mealSuggestionError : undefined}
          />
          <Button onClick={handleSuggestMeals} variant="secondary" fullWidth disabled={isSuggestingMeals}>
            {isSuggestingMeals ? <LoadingSpinner text="جاري اقتراح الوجبات..." /> : 'اقترح وجبات'}
          </Button>

          {mealSuggestionError && !isSuggestingMeals && (
            <p className="text-sm text-error text-center">{mealSuggestionError}</p>
          )}

          {suggestedMeals && suggestedMeals.length > 0 && (
            <section className="mt-8 space-y-4 animate-slide-up">
              <h3 className="text-xl font-semibold text-text-primary text-center mb-4">الوجبات المقترحة:</h3>
              {suggestedMeals.map((meal, index) => (
                <MealSuggestionCard 
                  key={index} 
                  meal={meal} 
                  onSelectMeal={handleOpenMealModal}
                />
              ))}
            </section>
          )}
        </div>
      </div>
      
      {/* Exercise Suggester Section - Conditionally rendered */}
      {results && (
        <div className="bg-card-bg p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl mt-10 animate-fade-in">
          <header className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-primary">اقتراحات التمارين الرياضية</h2>
            <p className="text-text-secondary mt-2 text-sm sm:text-base">
              اختر هدفك، وسنقترح عليك تمارين رياضية مناسبة لبياناتك.
            </p>
          </header>
          <div className="space-y-6">
            <Select
              label="ما هو هدفك الأساسي من التمرين؟"
              id="exerciseGoal"
              name="exerciseGoal"
              value={exerciseGoal}
              onChange={handleExerciseGoalChange}
              options={[{ value: '', label: 'اختر هدفًا...' }, ...EXERCISE_GOAL_OPTIONS]} // Add a default placeholder option
              error={exerciseSuggestionError && !exerciseGoal ? exerciseSuggestionError : undefined}
            />
            <Button 
              onClick={handleSuggestExercises} 
              variant="primary" 
              fullWidth 
              disabled={isSuggestingExercises || !exerciseGoal}
            >
              {isSuggestingExercises ? <LoadingSpinner text="جاري البحث عن تمارين..." /> : 'اقترح تمارين رياضية لي'}
            </Button>

            {exerciseSuggestionError && !isSuggestingExercises && (
              <p className="text-sm text-error text-center">{exerciseSuggestionError}</p>
            )}

            {suggestedExercises && suggestedExercises.length > 0 && (
              <section className="mt-8 space-y-4 animate-slide-up">
                <h3 className="text-xl font-semibold text-text-primary text-center mb-4">التمارين المقترحة:</h3>
                {suggestedExercises.map((exercise, index) => (
                  <ExerciseSuggestionCard key={index} exercise={exercise} />
                ))}
              </section>
            )}
             {suggestedExercises === null && !isSuggestingExercises && !exerciseSuggestionError && exerciseGoal && (
                <p className="text-text-secondary text-sm text-center mt-4">
                    اختر هدفك واضغط على الزر أعلاه للحصول على اقتراحات تمارين.
                </p>
            )}
          </div>
        </div>
      )}


       <footer className="text-center mt-8 mb-4 text-text-secondary text-xs">
        <p>&copy; {new Date().getFullYear()} حاسبة السعرات الحرارية ومقترح الوجبات والتمارين. للأغراض المعلوماتية فقط.</p>
      </footer>

      {/* Meal Detail Modal */}
      <MealDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseMealModal}
        mealName={selectedMealForDetail?.mealName || null}
      />
    </div>
  );
};

export default App;