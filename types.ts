export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

// Using string enum for activity level names to easily match with select option values
export enum ActivityLevelName {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  SUPER_ACTIVE = 'super_active',
}

export interface ActivityLevelOption {
  value: ActivityLevelName;
  label: string;
  multiplier: number;
}

export interface UserData {
  age: string; // Keep as string for form input, parse to number for calculation
  gender: Gender;
  weightKg: string; // Keep as string for form input
  heightCm: string; // Keep as string for form input
  activityLevel: ActivityLevelName;
}

export interface CalculationData { // Used for passing to calculation functions
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
}


export interface CalculationResults {
  bmr: number;
  tdee: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

export interface MealSuggestion {
  mealName: string;
  description: string;
  estimatedCalories?: string;
  proteinGrams?: string; // e.g., "حوالي ٢٥ جرام بروتين"
  carbsGrams?: string;   // e.g., "حوالي ٤٥ جرام كربوهيدرات"
  fatsGrams?: string;    // e.g., "حوالي ١٥ جرام دهون"
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface DetailedMealRecipe {
  mealName: string;
  ingredients: Ingredient[];
  preparationSteps: string[];
  youtubeVideoId?: string; // Optional, might be added later or if found
}

// Types for Exercise Suggestions
export type ExerciseGoalValue = 'weightLoss' | 'muscleGain' | 'generalFitness' | 'endurance';

export interface ExerciseSuggestion {
  exerciseName: string;
  description: string;
  duration?: string; // e.g., "٣٠ دقيقة"
  intensity?: string; // e.g., "متوسطة", "منخفضة", "عالية"
  estimatedCaloriesBurned?: string; // e.g., "حوالي ٢٥٠ سعرة حرارية"
  animationUrl?: string | null; // URL for an animated GIF or short video
}

export interface SuggestExercisesParams {
  tdee: number;
  gender: Gender;
  age: number;
  currentActivityLevel: ActivityLevelName; // User's current general activity
  exerciseGoal: ExerciseGoalValue;
}