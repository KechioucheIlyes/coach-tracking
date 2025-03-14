
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { Workout } from "../types/airtable.types";
import { mockWorkouts } from "../mocks/airtableMocks";

class WorkoutService {
  async getStudentWorkouts(studentId: string): Promise<Workout[]> {
    if (!AirtableApiService.isConfigured) {
      return this.getStudentWorkoutsMock(studentId);
    }
    
    try {
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const workouts = await AirtableApiService.fetchFromAirtable<any>('Workouts', { filterByFormula: formula });
      
      return workouts.map(workout => ({
        id: workout.id,
        studentId: workout.StudentId,
        date: workout.Date,
        name: workout.Name || workout.Title || "Entraînement", // Required field
        type: workout.Type || "Standard", // Required field
        duration: workout.Duration || 0, // Required field
        caloriesBurned: workout.CaloriesBurned || 0, // Required field
        title: workout.Title,
        description: workout.Description,
        exercises: workout.Exercises?.map(exercise => ({
          id: exercise.id,
          name: exercise.Name,
          sets: exercise.Sets,
          reps: exercise.Reps,
          rest: exercise.Rest,
          notes: exercise.Notes,
        })) || [],
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
    return mockWorkouts.filter(workout => workout.studentId === studentId);
  }
}

export default new WorkoutService();
