
import { Student, Goal, Measurement, Calculation, Workout, MealPlan } from '../types/airtable.types';

// Mock student data - now empty as we've removed the demo codes
export const mockStudent: Student = {
  id: '',
  name: '',
  accessCode: '',
  email: '',
  code: '' // Added missing required field
};

// Mock goals data
export const mockGoals: Goal[] = [
  {
    id: '1',
    studentId: '1',
    date: '2023-12-31', // Required field from Goal interface
    weight: 0, // Required field from Goal interface
    bodyFat: 0, // Required field from Goal interface
    muscleMass: 0, // Required field from Goal interface
    objective: '', // Required field from Goal interface
    description: 'Perdre 5kg',
    targetDate: '2023-12-31',
    status: 'in-progress'
  },
  {
    id: '2',
    studentId: '1',
    date: '2023-12-31', // Required field from Goal interface
    weight: 0, // Required field from Goal interface
    bodyFat: 0, // Required field from Goal interface
    muscleMass: 0, // Required field from Goal interface
    objective: '', // Required field from Goal interface
    description: 'Courir un semi-marathon',
    targetDate: '2024-03-15',
    status: 'pending'
  }
];

// Mock measurements data
export const mockMeasurements: Measurement[] = [
  {
    id: '1',
    studentId: '1',
    date: '2023-10-01',
    weight: 83,
    height: 182,
    waist: 0, // Required field
    hips: 0, // Required field
    chest: 0, // Required field
    arm: 0, // Required field
    thigh: 0, // Required field
    calf: 0, // Required field
    bodyFat: 18,
    musclePercentage: 40
  },
  {
    id: '2',
    studentId: '1',
    date: '2023-11-01',
    weight: 81.5,
    height: 182,
    waist: 0, // Required field
    hips: 0, // Required field
    chest: 0, // Required field
    arm: 0, // Required field
    thigh: 0, // Required field
    calf: 0, // Required field
    bodyFat: 17.5,
    musclePercentage: 41
  },
  {
    id: '3',
    studentId: '1',
    date: '2023-12-01',
    weight: 80,
    height: 182,
    waist: 0, // Required field
    hips: 0, // Required field
    chest: 0, // Required field
    arm: 0, // Required field
    thigh: 0, // Required field
    calf: 0, // Required field
    bodyFat: 16.8,
    musclePercentage: 42
  }
];

// Mock calculations data
export const mockCalculations: Calculation[] = [
  {
    id: '1',
    studentId: '1',
    date: '2023-12-01',
    bmr: 1800,
    bcj: 2400,
    protein: 160,
    carbs: 240,
    fat: 80,
    proteinKcal: 640, // Adding missing required fields
    carbsKcal: 960,
    fatKcal: 720,
    proteinPercentage: 25,
    carbsPercentage: 50,
    fatPercentage: 25,
    totalGrams: 480,
    totalKcal: 2320,
    objective: 2400
  }
];

// Mock workouts data
export const mockWorkouts: Workout[] = [
  {
    id: '1',
    studentId: '1',
    date: '2023-12-05',
    name: 'Entraînement Jambes', // Required field
    type: 'Jambes', // Required field
    duration: 60, // Required field
    caloriesBurned: 400, // Required field
    title: 'Entraînement Jambes',
    description: 'Focus sur les quadriceps et ischio-jambiers',
    exercises: [
      {
        id: '1',
        name: 'Squat',
        sets: 4,
        reps: 10,
        rest: 90,
        notes: 'Augmenter le poids progressivement'
      },
      {
        id: '2',
        name: 'Presse à cuisse',
        sets: 3,
        reps: 12,
        rest: 60
      },
      {
        id: '3',
        name: 'Extension des jambes',
        sets: 3,
        reps: 15,
        rest: 60
      }
    ]
  },
  {
    id: '2',
    studentId: '1',
    date: '2023-12-07',
    name: 'Entraînement Haut du Corps', // Required field
    type: 'Haut du corps', // Required field
    duration: 65, // Required field
    caloriesBurned: 350, // Required field
    title: 'Entraînement Haut du Corps',
    description: 'Pectoraux, épaules et triceps',
    exercises: [
      {
        id: '1',
        name: 'Développé couché',
        sets: 4,
        reps: 8,
        rest: 90
      },
      {
        id: '2',
        name: 'Élévations latérales',
        sets: 3,
        reps: 12,
        rest: 60
      },
      {
        id: '3',
        name: 'Dips',
        sets: 3,
        reps: 10,
        rest: 60
      }
    ]
  }
];

// Mock meal plans data
export const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    studentId: '1',
    date: '2023-12-05',
    name: 'Plan alimentaire semaine 1', // Required field
    calories: 2200, // Required field
    protein: 150, // Required field
    carbs: 220, // Required field
    fat: 60, // Required field
    ingredients: 'Voir chaque repas', // Required field
    instructions: 'Suivre le plan pour chaque repas', // Required field
    meals: [
      {
        id: '1',
        type: 'breakfast',
        items: [
          {
            id: '1',
            name: 'Flocons d\'avoine',
            quantity: '80g',
            calories: 300,
            protein: 10,
            carbs: 50,
            fat: 5
          },
          {
            id: '2',
            name: 'Protéine whey',
            quantity: '30g',
            calories: 120,
            protein: 24,
            carbs: 3,
            fat: 1
          }
        ]
      },
      {
        id: '2',
        type: 'lunch',
        items: [
          {
            id: '1',
            name: 'Poulet grillé',
            quantity: '150g',
            calories: 250,
            protein: 45,
            carbs: 0,
            fat: 8
          },
          {
            id: '2',
            name: 'Riz complet',
            quantity: '100g',
            calories: 130,
            protein: 3,
            carbs: 28,
            fat: 1
          },
          {
            id: '3',
            name: 'Légumes variés',
            quantity: '150g',
            calories: 80,
            protein: 3,
            carbs: 15,
            fat: 0
          }
        ]
      }
    ]
  }
];
