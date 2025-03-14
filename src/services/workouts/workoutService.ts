
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { Exercise, Workout } from "../types/airtable.types";
import { mockWorkouts } from "../mocks/airtableMocks";

class WorkoutService {
  async getStudentWorkouts(studentId: string): Promise<Workout[]> {
    if (!AirtableApiService.isConfigured) {
      return this.getStudentWorkoutsMock(studentId);
    }
    
    try {
      // Utiliser une formule de filtrage simplifiée sans caractères spéciaux
      // au lieu de: const formula = encodeURIComponent(`{Élève} = '${studentId}'`);
      const formula = `FIND('${studentId}', {Élève})`;
      
      // Essayer d'obtenir les données d'entraînement
      console.log(`Tentative de récupérer les workouts avec la formule: ${formula}`);
      
      const workoutsRaw = await AirtableApiService.fetchFromAirtable('Workout', { 
        filterByFormula: formula 
      });
      
      console.log('Données workouts brutes reçues:', workoutsRaw);
      
      // Group workouts by week, day, and block
      const workoutGroups = new Map<string, any[]>();
      
      workoutsRaw.forEach((workout: any) => {
        const key = `${workout.Semaine}-${workout.Jour}-${workout.Bloc}`;
        if (!workoutGroups.has(key)) {
          workoutGroups.set(key, []);
        }
        workoutGroups.get(key)?.push(workout);
      });
      
      // Format each group into a workout with exercises
      const workouts: Workout[] = [];
      
      workoutGroups.forEach((exercises, key) => {
        if (exercises.length > 0) {
          const firstExercise = exercises[0];
          
          const workout: Workout = {
            id: key,
            studentId: studentId,
            week: firstExercise.Semaine,
            day: firstExercise.Jour,
            block: firstExercise.Bloc,
            part: firstExercise.Partie,
            exercises: exercises.map(ex => ({
              id: ex.id,
              name: ex.Exercice,
              format: ex['Format de Travail'],
              rest: ex.Rest,
              weight: ex['Charge (Kg)'],
              notes: ex.Notes
            }))
          };
          
          workouts.push(workout);
        }
      });
      
      // Sort workouts by date (week), with most recent first
      return workouts.sort((a, b) => {
        // Parse dates and compare them
        const dateA = new Date(a.week);
        const dateB = new Date(b.week);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting workouts:', error);
      toast.error("Erreur lors de la récupération des entraînements");
      return this.getStudentWorkoutsMock(studentId);
    }
  }

  // Mock version for development
  private async getStudentWorkoutsMock(studentId: string): Promise<Workout[]> {
    console.log('Utilisation des données mock pour les workouts');
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockWorkouts.filter(workout => workout.studentId === studentId);
  }
}

export default new WorkoutService();
