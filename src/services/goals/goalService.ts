
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { Goal } from "../types/airtable.types";
import { mockGoals } from "../mocks/airtableMocks";

class GoalService {
  async getStudentGoals(studentId: string): Promise<Goal[]> {
    if (!AirtableApiService.isConfigured) {
      return this.getStudentGoalsMock(studentId);
    }
    
    try {
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const goals = await AirtableApiService.fetchFromAirtable<any>('Goals', { filterByFormula: formula });
      
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
    return mockGoals.filter(goal => goal.studentId === studentId);
  }
}

export default new GoalService();
