import { Gender, CalculationData } from '../types';

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation.
 * @param data - User data including age, gender, weight (kg), and height (cm).
 * @returns The calculated BMR in calories.
 */
export const calculateBMR = (data: CalculationData): number => {
  const { age, gender, weightKg, heightCm } = data;

  if (gender === Gender.MALE) {
    // BMR = (10 * weight in kg) + (6.25 * height in cm) - (5 * age in years) + 5
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    // BMR = (10 * weight in kg) + (6.25 * height in cm) - (5 * age in years) - 161
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 * @param bmr - Basal Metabolic Rate.
 * @param activityMultiplier - Multiplier based on activity level.
 * @returns The calculated TDEE in calories.
 */
export const calculateTDEE = (bmr: number, activityMultiplier: number): number => {
  return bmr * activityMultiplier;
};

/**
 * Calculates macronutrient distribution based on TDEE.
 * Assumes common ratios: 40% Carbs, 30% Protein, 30% Fat.
 * Protein: 4 calories per gram
 * Carbs: 4 calories per gram
 * Fat: 9 calories per gram
 * @param tdee - Total Daily Energy Expenditure.
 * @returns An object containing recommended grams of protein, carbs, and fats.
 */
export const calculateMacronutrients = (tdee: number): { proteinGrams: number; carbsGrams: number; fatsGrams: number } => {
  const caloriesFromCarbs = tdee * 0.40;
  const caloriesFromProtein = tdee * 0.30;
  const caloriesFromFats = tdee * 0.30;

  const carbsGrams = Math.round(caloriesFromCarbs / 4);
  const proteinGrams = Math.round(caloriesFromProtein / 4);
  const fatsGrams = Math.round(caloriesFromFats / 9);

  return { proteinGrams, carbsGrams, fatsGrams };
};