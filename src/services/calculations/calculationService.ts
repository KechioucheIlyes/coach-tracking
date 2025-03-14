
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
      
      // Fix: Properly format the Airtable formula by using single quotes for field names with spaces
      const formula = encodeURIComponent(`{'Élève'} = '${studentId}'`);
      // Alternative formulas to try if the first one fails
      const formulas = [
        encodeURIComponent(`{'Élève'} = '${studentId}'`),
        encodeURIComponent(`{IDU Élève} = '${studentId}'`),
        encodeURIComponent(`{Élève} = '${studentId}'`),
        encodeURIComponent(`{StudentId} = '${studentId}'`)
      ];
      
      let calculations = [];
      let success = false;
      
      // Try each formula until one works
      for (const formulaToTry of formulas) {
        try {
          calculations = await AirtableApiService.fetchFromAirtable<any>('BCJ', { filterByFormula: formulaToTry });
          console.log(`Retrieved ${calculations.length} calculations using formula: ${decodeURIComponent(formulaToTry)}`);
          if (calculations.length > 0) {
            success = true;
            break;
          }
        } catch (error) {
          console.log(`Formula failed: ${decodeURIComponent(formulaToTry)}`);
          // Continue trying other formulas
        }
      }
      
      // If all formulas failed, try fetching all records and filter manually
      if (!success) {
        console.log("All formulas failed, trying to fetch all records");
        try {
          const allCalculations = await AirtableApiService.fetchFromAirtable<any>('BCJ', {});
          console.log(`Retrieved ${allCalculations.length} total calculations`);
          
          // Try to find the student ID in various possible field names
          calculations = allCalculations.filter(calc => 
            (calc.StudentId === studentId) || 
            (calc.Élève && calc.Élève.includes(studentId)) || 
            (calc["IDU Élève"] === studentId)
          );
          
          console.log(`Filtered to ${calculations.length} calculations for student ${studentId}`);
        } catch (error) {
          console.error("Error fetching all calculations:", error);
          // Fall back to mock data
          return this.getStudentCalculationsMock(studentId);
        }
      }
      
      return calculations.map(calculation => ({
        id: calculation.id,
        studentId: calculation.StudentId || calculation["IDU Élève"] || calculation.Élève || studentId,
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
