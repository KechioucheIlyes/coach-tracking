
export interface Student {
  id: string;
  name: string;
  email?: string;
  code: string;
  accessCode: string;
  objective?: string;
  // Add additional fields used in Profile.tsx
  status?: string;
  age?: number;
  gender?: string;
  birthDate?: string;
  profession?: string;
  initialWeight?: number;
  targetWeight?: number;
  height?: number;
  diet?: string;
  mealFrequency?: string;
  eatingHabits?: string;
  activityLevel?: string;
  medicalHistory?: string;
  motivation?: string;
}

export interface Goal {
  id: string;
  studentId: string;
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  objective: string;
  // Add additional fields used in the application
  description?: string;
  targetDate?: string;
  status?: 'pending' | 'in-progress' | 'achieved';
  initialWeight?: number;
  targetWeight?: number;
  currentWeight?: number;
  weightRemaining?: number;
  weightLost?: number;
}

export interface Measurement {
  id: string;
  studentId: string;
  date: string;
  weight: number;
  height: number;
  waist: number;
  hips: number;
  chest: number;
  arm: number;
  thigh: number;
  calf: number;
  // Add additional fields used in Measurements.tsx
  bodyFat?: number;
  musclePercentage?: number;
  water?: number;
  visceralFat?: number;
  weightLost?: number;
  weightRemaining?: number;
  initialWeight?: number;
  targetWeight?: number;
  thighCircumferenceLeft?: number;
  thighCircumferenceRight?: number;
  hipCircumference?: number;
  waistCircumference?: number;
  chestCircumference?: number;
  armCircumferenceLeft?: number;
  armCircumferenceRight?: number;
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
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
  totalGrams: number;
  totalKcal: number;
  objective: number;
}

export interface Workout {
  id: string;
  studentId: string;
  date: string;
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  // Add additional fields used in service
  title?: string;
  description?: string;
  exercises?: Array<{
    id: string;
    name: string;
    sets: number;
    reps: number;
    rest: number;
    notes?: string;
  }>;
}

export interface MealPlan {
  id: string;
  studentId: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string;
  instructions: string;
  // Add additional fields used in service
  meals?: Array<{
    id: string;
    type: string;
    items: Array<{
      id: string;
      name: string;
      quantity: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  }>;
}
