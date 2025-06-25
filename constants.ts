import { Gender, ActivityLevelOption, ActivityLevelName, ExerciseGoalValue } from './types';

export const GENDER_OPTIONS: Array<{ value: Gender; label: string }> = [
  { value: Gender.MALE, label: 'ذكر' },
  { value: Gender.FEMALE, label: 'أنثى' },
];

export const ACTIVITY_LEVEL_OPTIONS: Array<ActivityLevelOption> = [
  { value: ActivityLevelName.SEDENTARY, label: 'خامل (قليل أو بدون تمارين)', multiplier: 1.2 },
  { value: ActivityLevelName.LIGHTLY_ACTIVE, label: 'نشاط خفيف (تمارين خفيفة/رياضة ١-٣ أيام/أسبوع)', multiplier: 1.375 },
  { value: ActivityLevelName.MODERATELY_ACTIVE, label: 'نشاط معتدل (تمارين معتدلة/رياضة ٣-٥ أيام/أسبوع)', multiplier: 1.55 },
  { value: ActivityLevelName.VERY_ACTIVE, label: 'نشيط جدًا (تمارين شاقة/رياضة ٦-٧ أيام/أسبوع)', multiplier: 1.725 },
  { value: ActivityLevelName.SUPER_ACTIVE, label: 'نشيط للغاية (تمارين شاقة جدًا/رياضة وعمل بدني أو تدريب مضاعف)', multiplier: 1.9 },
];

export const EXERCISE_GOAL_OPTIONS: Array<{ value: ExerciseGoalValue; label: string }> = [
  { value: 'weightLoss', label: 'فقدان الوزن' },
  { value: 'muscleGain', label: 'بناء العضلات' },
  { value: 'generalFitness', label: 'تحسين اللياقة العامة' },
  { value: 'endurance', label: 'زيادة القدرة على التحمل' },
];