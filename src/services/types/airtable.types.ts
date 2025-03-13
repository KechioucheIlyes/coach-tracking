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
}

export interface Goal {
  id: string;
  studentId: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'achieved';
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
