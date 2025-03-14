export interface Student {
  id: string;
  name: string;
  email?: string;
  code: string;
  accessCode: string;
  objective?: string;
}

export interface Goal {
  id: string;
  studentId: string;
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  objective: string;
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
}
