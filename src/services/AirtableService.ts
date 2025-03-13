
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  accessCode: string;
  email?: string;
}

interface Goal {
  id: string;
  studentId: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'achieved';
}

interface Measurement {
  id: string;
  studentId: string;
  date: string;
  weight: number;
  height: number;
  bodyFat?: number;
  musclePercentage?: number;
}

interface Calculation {
  id: string;
  studentId: string;
  date: string;
  bmr: number;
  bcj: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  notes?: string;
}

interface Workout {
  id: string;
  studentId: string;
  date: string;
  title: string;
  description?: string;
  exercises: Exercise[];
}

interface MealItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealItem[];
}

interface MealPlan {
  id: string;
  studentId: string;
  date: string;
  meals: Meal[];
}

// This is a mock service that simulates Airtable functionality
// In a production app, you would use the Airtable API here
class AirtableService {
  private studentData: Map<string, Student> = new Map();
  private goalsData: Map<string, Goal[]> = new Map();
  private measurementsData: Map<string, Measurement[]> = new Map();
  private calculationsData: Map<string, Calculation[]> = new Map();
  private workoutsData: Map<string, Workout[]> = new Map();
  private mealPlansData: Map<string, MealPlan[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create a mock student
    const student: Student = {
      id: '1',
      name: 'Thomas Dubois',
      accessCode: 'access123',
      email: 'thomas@example.com'
    };
    this.studentData.set(student.accessCode, student);

    // Create mock goals
    const goals: Goal[] = [
      {
        id: '1',
        studentId: student.id,
        description: 'Perdre 5kg',
        targetDate: '2023-12-31',
        status: 'in-progress'
      },
      {
        id: '2',
        studentId: student.id,
        description: 'Courir un semi-marathon',
        targetDate: '2024-03-15',
        status: 'pending'
      }
    ];
    this.goalsData.set(student.id, goals);

    // Create mock measurements
    const measurements: Measurement[] = [
      {
        id: '1',
        studentId: student.id,
        date: '2023-10-01',
        weight: 83,
        height: 182,
        bodyFat: 18,
        musclePercentage: 40
      },
      {
        id: '2',
        studentId: student.id,
        date: '2023-11-01',
        weight: 81.5,
        height: 182,
        bodyFat: 17.5,
        musclePercentage: 41
      },
      {
        id: '3',
        studentId: student.id,
        date: '2023-12-01',
        weight: 80,
        height: 182,
        bodyFat: 16.8,
        musclePercentage: 42
      }
    ];
    this.measurementsData.set(student.id, measurements);

    // Create mock calculations
    const calculations: Calculation[] = [
      {
        id: '1',
        studentId: student.id,
        date: '2023-12-01',
        bmr: 1800,
        bcj: 2400,
        protein: 160,
        carbs: 240,
        fat: 80
      }
    ];
    this.calculationsData.set(student.id, calculations);

    // Create mock workouts
    const workouts: Workout[] = [
      {
        id: '1',
        studentId: student.id,
        date: '2023-12-05',
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
        studentId: student.id,
        date: '2023-12-07',
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
    this.workoutsData.set(student.id, workouts);

    // Create mock meal plans
    const mealPlans: MealPlan[] = [
      {
        id: '1',
        studentId: student.id,
        date: '2023-12-05',
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
    this.mealPlansData.set(student.id, mealPlans);
  }

  // Authentication
  async verifyAccess(accessCode: string): Promise<Student | null> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const student = this.studentData.get(accessCode);
      if (student) {
        return student;
      }
      return null;
    } catch (error) {
      console.error('Error verifying access:', error);
      toast.error("Erreur lors de la vérification de l'accès");
      return null;
    }
  }

  // Goals
  async getStudentGoals(studentId: string): Promise<Goal[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      return this.goalsData.get(studentId) || [];
    } catch (error) {
      console.error('Error getting goals:', error);
      toast.error("Erreur lors de la récupération des objectifs");
      return [];
    }
  }

  // Measurements
  async getStudentMeasurements(studentId: string): Promise<Measurement[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      return this.measurementsData.get(studentId) || [];
    } catch (error) {
      console.error('Error getting measurements:', error);
      toast.error("Erreur lors de la récupération des mesures");
      return [];
    }
  }

  // Calculations
  async getStudentCalculations(studentId: string): Promise<Calculation[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      return this.calculationsData.get(studentId) || [];
    } catch (error) {
      console.error('Error getting calculations:', error);
      toast.error("Erreur lors de la récupération des calculs");
      return [];
    }
  }

  // Workouts
  async getStudentWorkouts(studentId: string): Promise<Workout[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      return this.workoutsData.get(studentId) || [];
    } catch (error) {
      console.error('Error getting workouts:', error);
      toast.error("Erreur lors de la récupération des entraînements");
      return [];
    }
  }

  // Meal Plans
  async getStudentMealPlans(studentId: string): Promise<MealPlan[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      return this.mealPlansData.get(studentId) || [];
    } catch (error) {
      console.error('Error getting meal plans:', error);
      toast.error("Erreur lors de la récupération des plans alimentaires");
      return [];
    }
  }
}

export type { 
  Student, 
  Goal, 
  Measurement, 
  Calculation, 
  Exercise, 
  Workout, 
  MealItem, 
  Meal, 
  MealPlan 
};

export default new AirtableService();
