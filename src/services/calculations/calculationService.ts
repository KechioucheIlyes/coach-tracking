
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { Calculation } from "../types/airtable.types";
import { mockCalculations } from "../mocks/airtableMocks";

class CalculationService {
  async getStudentCalculations(studentId: string): Promise<Calculation[]> {
    if (!AirtableApiService.isConfigured) {
      console.log("Airtable not configured, using mock data");
      return this.getStudentCalculationsMock(studentId);
    }
    
    try {
      console.log(`Fetching calculations for student ${studentId}`);
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const calculations = await AirtableApiService.fetchFromAirtable<any>('BCJ', { filterByFormula: formula });
      
      console.log(`Retrieved ${calculations.length} calculations`);
      
      return calculations.map(calculation => ({
        id: calculation.id,
        studentId: calculation.StudentId || calculation.Élève || studentId,
        date: calculation.Date || calculation.Semaine,
        bmr: calculation.BMR || calculation["BMR (kcal)"] || 0,
        bcj: calculation.BCJ || calculation["BCJ (kcal)"] || 0,
        protein: calculation.Protein || calculation["Protéines (g)"] || 0,
        carbs: calculation.Carbs || calculation["Glucides (g)"] || 0,
        fat: calculation.Fat || calculation["Lipides (g)"] || 0,
        proteinKcal: calculation["Protéines (kcal)"] || 0,
        carbsKcal: calculation["Glucides (kcal)"] || 0,
        fatKcal: calculation["Lipides (kcal)"] || 0,
        proteinPercentage: calculation["Protéines (%)"] || 0,
        carbsPercentage: calculation["Glucides (%)"] || 0,
        fatPercentage: calculation["Lipides (%)"] || 0,
        totalGrams: calculation["Total (g)"] || 0,
        totalKcal: calculation["Total (kcal)"] || 0,
        objective: calculation["BCJ / Obj (kcal)"] || 0
      }));
    } catch (error) {
      console.error('Error getting calculations:', error);
      toast.error("Erreur lors de la récupération des calculs");
      return this.getStudentCalculationsMock(studentId);
    }
  }

  // Version mock pour le développement
  private async getStudentCalculationsMock(studentId: string): Promise<Calculation[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Using mock data for student ${studentId}`);
    return mockCalculations.filter(calculation => calculation.studentId === studentId);
  }
}

export default new CalculationService();
