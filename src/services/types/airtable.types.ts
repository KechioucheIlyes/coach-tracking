export interface Student {
  id: string;
  name: string;
  accessCode: string;
  email?: string;
  // Additional fields from Airtable
  age?: number;
  gender?: string;
  initialWeight?: number;
  targetWeight?: number;
  height?: number;
  profession?: string;
  medicalHistory?: string;
  activityLevel?: string;
  motivation?: string;
  diet?: string;
  eatingHabits?: string;
  mealFrequency?: string;
  objectives?: string;
  birthDate?: string;
  status?: string;
  studentCode?: string;
  // The objectives field is needed for display in the calculation page
  objective?: string; // Alternative field name that might be used in some places
}

export interface Goal {
  id: string;
  studentId: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'achieved';
  // Additional fields for weight goal
  initialWeight?: number;
  targetWeight?: number;
  currentWeight?: number;
  weightRemaining?: number;
  progressPercentage?: number;
}

export interface Measurement {
  id: string;
  studentId: string;
  date: string;
  weight: number;
  height: number;
  bodyFat?: number;
  musclePercentage?: number;
  // Additional fields from Airtable
  water?: number;
  visceralFat?: number;
  thighCircumferenceLeft?: number; 
  thighCircumferenceRight?: number;
  hipCircumference?: number;
  waistCircumference?: number;
  chestCircumference?: number;
  armCircumferenceLeft?: number;
  armCircumferenceRight?: number;
  // Calculated fields from Airtable
  weightLost?: number;
  weightRemaining?: number;
  // Added fields for weight progression
  initialWeight?: number;
  targetWeight?: number;
}

export interface Calculation {
  id: string;
  studentId: string;
  date: string;
  bmr: number;
  bcj: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinKcal?: number;
  carbsKcal?: number;
  fatKcal?: number;
  proteinPercentage?: number;
  carbsPercentage?: number;
  fatPercentage?: number;
  totalGrams?: number;
  totalKcal?: number;
  objective?: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  notes?: string;
}

export interface Workout {
  id: string;
  studentId: string;
  date: string;
  title: string;
  description?: string;
  exercises: Exercise[];
}

export interface MealItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealItem[];
}

export interface MealPlan {
  id: string;
  studentId: string;
  date: string;
  meals: Meal[];
}
