
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { Calculation } from "../types/airtable.types";
import { mockCalculations } from "../mocks/airtableMocks";

class CalculationService {
  async getStudentCalculations(studentId: string): Promise<Calculation[]> {
    if (!AirtableApiService.isConfigured) {
      return this.getStudentCalculationsMock(studentId);
    }
    
    try {
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const calculations = await AirtableApiService.fetchFromAirtable<any>('Calculations', { filterByFormula: formula });
      
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
    return mockCalculations.filter(calculation => calculation.studentId === studentId);
  }
}

export default new CalculationService();
