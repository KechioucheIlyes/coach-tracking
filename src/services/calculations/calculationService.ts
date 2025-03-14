
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
      
      // Première étape: récupérer le nom de l'élève à partir de son ID
      const studentName = await this.getStudentName(studentId);
      console.log(`Fetching calculations for student name: ${studentName}`);
      
      if (studentName) {
        // Utiliser le filtre suggéré par l'utilisateur avec le nom de l'élève
        const formula = encodeURIComponent(`{Élève}='${studentName}'`);
        console.log(`Using filter formula: ${decodeURIComponent(formula)}`);
        
        try {
          const calculations = await AirtableApiService.fetchFromAirtable<any>('BCJ', { filterByFormula: formula });
          console.log(`Retrieved ${calculations.length} calculations using name filter`);
          
          if (calculations.length > 0) {
            return this.mapCalculations(calculations, studentId);
          }
        } catch (error) {
          console.error("Error with name-based filter:", error);
          // Continuer avec les autres méthodes si celle-ci échoue
        }
      }
      
      // Si la méthode par nom échoue, essayer avec différentes formules basées sur l'ID
      const formulas = [
        encodeURIComponent(`{IDU Élève}='${studentId}'`),
        encodeURIComponent(`{StudentId}='${studentId}'`),
        encodeURIComponent(`{Élève}='${studentId}'`)
      ];
      
      let calculations = [];
      let success = false;
      
      // Essayer chaque formule jusqu'à ce qu'une fonctionne
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
          // Continuer avec la formule suivante
        }
      }
      
      // Si toutes les formules échouent, récupérer tous les enregistrements et filtrer manuellement
      if (!success) {
        console.log("All formulas failed, trying to fetch all records");
        try {
          const allCalculations = await AirtableApiService.fetchFromAirtable<any>('BCJ', {});
          console.log(`Retrieved ${allCalculations.length} total calculations`);
          
          // Filtrer manuellement avec différents champs possibles
          calculations = allCalculations.filter(calc => 
            (calc.StudentId === studentId) || 
            (calc.Élève && calc.Élève.includes(studentId)) || 
            (calc["IDU Élève"] === studentId) ||
            (studentName && calc.Élève && calc.Élève.includes(studentName))
          );
          
          console.log(`Filtered to ${calculations.length} calculations for student ${studentId}`);
        } catch (error) {
          console.error("Error fetching all calculations:", error);
          // En dernier recours, utiliser les données mock
          return this.getStudentCalculationsMock(studentId);
        }
      }
      
      return this.mapCalculations(calculations, studentId);
    } catch (error) {
      console.error('Error getting calculations:', error);
      toast.error("Erreur lors de la récupération des calculs");
      return this.getStudentCalculationsMock(studentId);
    }
  }

  // Méthode pour récupérer le nom de l'élève à partir de son ID
  private async getStudentName(studentId: string): Promise<string | null> {
    try {
      const students = await AirtableApiService.fetchFromAirtable<any>('Élèves', {
        filterByFormula: encodeURIComponent(`{ID}='${studentId}'`)
      });
      
      if (students && students.length > 0) {
        console.log(`Found student: ${students[0].Nom}`);
        return students[0].Nom;
      }
      
      // Essayer avec le champ code
      const studentsById = await AirtableApiService.fetchFromAirtable<any>('Élèves', {
        filterByFormula: encodeURIComponent(`{code}='${studentId}'`)
      });
      
      if (studentsById && studentsById.length > 0) {
        console.log(`Found student by code: ${studentsById[0].Nom}`);
        return studentsById[0].Nom;
      }
      
      console.log(`Could not find student name for ID: ${studentId}`);
      return null;
    } catch (error) {
      console.error("Error getting student name:", error);
      return null;
    }
  }
  
  // Méthode pour normaliser les données des calculs
  private mapCalculations(calculations: any[], studentId: string): Calculation[] {
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
  }

  // Version mock pour le développement
  private async getStudentCalculationsMock(studentId: string): Promise<Calculation[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Using mock data for student ${studentId}`);
    return mockCalculations.filter(calculation => calculation.studentId === studentId);
  }
}

export default new CalculationService();
