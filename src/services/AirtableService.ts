
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

// Configuration Airtable
class AirtableService {
  private baseId: string;
  private apiKey: string;
  private apiUrl: string = 'https://api.airtable.com/v0';

  constructor() {
    // Configuration par défaut avec le token fourni
    this.baseId = 'app4LDBPHMVKbzSHj';
    this.apiKey = 'patonRA3u98xVvNJJ.44366f3f6572bd769aec8dffe17938b09061205356fe11f092f35a21c171973b';
  }

  // Méthode pour configurer l'API Airtable
  public configure(baseId: string, apiKey: string) {
    this.baseId = baseId;
    this.apiKey = apiKey;
    localStorage.setItem('airtable_base_id', baseId);
    localStorage.setItem('airtable_api_key', apiKey);
  }

  // Vérification de la configuration
  private get isConfigured(): boolean {
    return Boolean(this.baseId && this.apiKey);
  }

  // Chargement des configurations depuis localStorage
  private loadConfig() {
    if (!this.isConfigured) {
      const baseId = localStorage.getItem('airtable_base_id');
      const apiKey = localStorage.getItem('airtable_api_key');
      if (baseId && apiKey) {
        this.baseId = baseId;
        this.apiKey = apiKey;
      }
    }
  }

  // Méthode générique pour les requêtes Airtable
  private async fetchFromAirtable<T>(
    tableName: string,
    params: Record<string, string> = {}
  ): Promise<T[]> {
    this.loadConfig();
    
    if (!this.isConfigured) {
      throw new Error('Airtable API n\'est pas configurée. Veuillez appeler configure() d\'abord.');
    }

    let url = `${this.apiUrl}/${this.baseId}/${tableName}`;

    // Ajout des paramètres de requête
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        queryParams.append(key, value);
      }
      url += `?${queryParams.toString()}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur Airtable: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformation de la réponse Airtable en notre format
      return data.records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des données Airtable:', error);
      toast.error("Erreur lors de la récupération des données");
      throw error;
    }
  }

  // Méthode pour utiliser les données fictives en cas de non-configuration
  private async useMockData<T>(mockData: T[]): Promise<T[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData;
  }

  // Authentication
  async verifyAccess(accessCode: string): Promise<Student | null> {
    this.loadConfig();
    
    if (!this.isConfigured) {
      // Utilisation des données fictives en mode démo/développement
      console.warn('Mode démo: utilisation de données fictives');
      return this.verifyAccessMock(accessCode);
    }
    
    try {
      // Filtre pour trouver l'étudiant avec le code d'accès spécifié
      const formula = encodeURIComponent(`{AccessCode} = '${accessCode}'`);
      const students = await this.fetchFromAirtable<any>('Students', { filterByFormula: formula });
      
      if (students && students.length > 0) {
        const student = students[0];
        return {
          id: student.id,
          name: student.Name,
          accessCode: student.AccessCode,
          email: student.Email,
        };
      }
      return null;
    } catch (error) {
      console.error('Error verifying access:', error);
      toast.error("Erreur lors de la vérification de l'accès");
      return null;
    }
  }

  // Version mock pour le développement
  private async verifyAccessMock(accessCode: string): Promise<Student | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Données de test
    const mockStudent: Student = {
      id: '1',
      name: 'Thomas Dubois',
      accessCode: 'access123',
      email: 'thomas@example.com'
    };
    
    if (accessCode === mockStudent.accessCode) {
      return mockStudent;
    }
    return null;
  }

  // Goals
  async getStudentGoals(studentId: string): Promise<Goal[]> {
    this.loadConfig();
    
    if (!this.isConfigured) {
      return this.getStudentGoalsMock(studentId);
    }
    
    try {
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const goals = await this.fetchFromAirtable<any>('Goals', { filterByFormula: formula });
      
      return goals.map(goal => ({
        id: goal.id,
        studentId: goal.StudentId,
        description: goal.Description,
        targetDate: goal.TargetDate,
        status: goal.Status.toLowerCase() as 'pending' | 'in-progress' | 'achieved',
      }));
    } catch (error) {
      console.error('Error getting goals:', error);
      toast.error("Erreur lors de la récupération des objectifs");
      return [];
    }
  }
  
  // Version mock pour le développement
  private async getStudentGoalsMock(studentId: string): Promise<Goal[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Données de test
    const mockGoals: Goal[] = [
      {
        id: '1',
        studentId: '1',
        description: 'Perdre 5kg',
        targetDate: '2023-12-31',
        status: 'in-progress'
      },
      {
        id: '2',
        studentId: '1',
        description: 'Courir un semi-marathon',
        targetDate: '2024-03-15',
        status: 'pending'
      }
    ];
    
    return mockGoals.filter(goal => goal.studentId === studentId);
  }

  // Measurements
  async getStudentMeasurements(studentId: string): Promise<Measurement[]> {
    this.loadConfig();
    
    if (!this.isConfigured) {
      return this.getStudentMeasurementsMock(studentId);
    }
    
    try {
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const measurements = await this.fetchFromAirtable<any>('Measurements', { filterByFormula: formula });
      
      return measurements.map(measurement => ({
        id: measurement.id,
        studentId: measurement.StudentId,
        date: measurement.Date,
        weight: Number(measurement.Weight),
        height: Number(measurement.Height),
        bodyFat: measurement.BodyFat ? Number(measurement.BodyFat) : undefined,
        musclePercentage: measurement.MusclePercentage ? Number(measurement.MusclePercentage) : undefined,
      }));
    } catch (error) {
      console.error('Error getting measurements:', error);
      toast.error("Erreur lors de la récupération des mesures");
      return [];
    }
  }

  // Version mock pour le développement
  private async getStudentMeasurementsMock(studentId: string): Promise<Measurement[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Données de test
    const mockMeasurements: Measurement[] = [
      {
        id: '1',
        studentId: '1',
        date: '2023-10-01',
        weight: 83,
        height: 182,
        bodyFat: 18,
        musclePercentage: 40
      },
      {
        id: '2',
        studentId: '1',
        date: '2023-11-01',
        weight: 81.5,
        height: 182,
        bodyFat: 17.5,
        musclePercentage: 41
      },
      {
        id: '3',
        studentId: '1',
        date: '2023-12-01',
        weight: 80,
        height: 182,
        bodyFat: 16.8,
        musclePercentage: 42
      }
    ];
    
    return mockMeasurements.filter(measurement => measurement.studentId === studentId);
  }

  // Calculations
  async getStudentCalculations(studentId: string): Promise<Calculation[]> {
    this.loadConfig();
    
    if (!this.isConfigured) {
      return this.getStudentCalculationsMock(studentId);
    }
    
    try {
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const calculations = await this.fetchFromAirtable<any>('Calculations', { filterByFormula: formula });
      
      return calculations.map(calculation => ({
        id: calculation.id,
        studentId: calculation.StudentId,
        date: calculation.Date,
        bmr: calculation.BMR,
        bcj: calculation.BCJ,
        protein: calculation.Protein,
        carbs: calculation.Carbs,
        fat: calculation.Fat,
      }));
    } catch (error) {
      console.error('Error getting calculations:', error);
      toast.error("Erreur lors de la récupération des calculs");
      return [];
    }
  }

  // Version mock pour le développement
  private async getStudentCalculationsMock(studentId: string): Promise<Calculation[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Données de test
    const mockCalculations: Calculation[] = [
      {
        id: '1',
        studentId: '1',
        date: '2023-12-01',
        bmr: 1800,
        bcj: 2400,
        protein: 160,
        carbs: 240,
        fat: 80
      }
    ];
    
    return mockCalculations.filter(calculation => calculation.studentId === studentId);
  }

  // Workouts
  async getStudentWorkouts(studentId: string): Promise<Workout[]> {
    this.loadConfig();
    
    if (!this.isConfigured) {
      return this.getStudentWorkoutsMock(studentId);
    }
    
    try {
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const workouts = await this.fetchFromAirtable<any>('Workouts', { filterByFormula: formula });
      
      return workouts.map(workout => ({
        id: workout.id,
        studentId: workout.StudentId,
        date: workout.Date,
        title: workout.Title,
        description: workout.Description,
        exercises: workout.Exercises.map(exercise => ({
          id: exercise.id,
          name: exercise.Name,
          sets: exercise.Sets,
          reps: exercise.Reps,
          rest: exercise.Rest,
          notes: exercise.Notes,
        })),
      }));
    } catch (error) {
      console.error('Error getting workouts:', error);
      toast.error("Erreur lors de la récupération des entraînements");
      return [];
    }
  }

  // Version mock pour le développement
  private async getStudentWorkoutsMock(studentId: string): Promise<Workout[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Données de test
    const mockWorkouts: Workout[] = [
      {
        id: '1',
        studentId: '1',
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
        studentId: '1',
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
    
    return mockWorkouts.filter(workout => workout.studentId === studentId);
  }

  // Meal Plans
  async getStudentMealPlans(studentId: string): Promise<MealPlan[]> {
    this.loadConfig();
    
    if (!this.isConfigured) {
      return this.getStudentMealPlansMock(studentId);
    }
    
    try {
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const mealPlans = await this.fetchFromAirtable<any>('MealPlans', { filterByFormula: formula });
      
      return mealPlans.map(mealPlan => ({
        id: mealPlan.id,
        studentId: mealPlan.StudentId,
        date: mealPlan.Date,
        meals: mealPlan.Meals.map(meal => ({
          id: meal.id,
          type: meal.Type,
          items: meal.Items.map(item => ({
            id: item.id,
            name: item.Name,
            quantity: item.Quantity,
            calories: item.Calories,
            protein: item.Protein,
            carbs: item.Carbs,
            fat: item.Fat,
          })),
        })),
      }));
    } catch (error) {
      console.error('Error getting meal plans:', error);
      toast.error("Erreur lors de la récupération des plans alimentaires");
      return [];
    }
  }

  // Version mock pour le développement
  private async getStudentMealPlansMock(studentId: string): Promise<MealPlan[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Données de test
    const mockMealPlans: MealPlan[] = [
      {
        id: '1',
        studentId: '1',
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
    
    return mockMealPlans.filter(mealPlan => mealPlan.studentId === studentId);
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
