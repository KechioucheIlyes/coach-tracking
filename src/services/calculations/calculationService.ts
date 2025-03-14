
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
      
      // Étape 1: Récupérer le nom de l'élève depuis la table Élèves
      const studentName = await this.getStudentName(studentId);
      console.log(`Nom d'élève récupéré: ${studentName || "Non trouvé"}`);
      
      if (studentName) {
        // Étape 2: Utiliser le nom pour filtrer les calculs avec la formule {Élève}='Nom'
        try {
          console.log(`Trying with formula: {Élève}='${studentName}'`);
          const formula = encodeURIComponent(`{Élève}='${studentName}'`);
          const calculationsWithName = await AirtableApiService.fetchFromAirtable<any>('BCJ', { 
            filterByFormula: formula 
          });
          
          if (calculationsWithName.length > 0) {
            console.log(`Found ${calculationsWithName.length} calculations using student name formula`);
            return this.mapCalculations(calculationsWithName, studentId);
          }
        } catch (error) {
          console.log("Student name formula failed, trying other methods");
        }
      }
      
      // Première tentative : récupérer tous les enregistrements et filtrer côté client
      try {
        console.log("Fetching all BCJ records and filtering client-side");
        const allCalculations = await AirtableApiService.fetchFromAirtable<any>('BCJ', {});
        console.log(`Retrieved ${allCalculations.length} total calculations`);
        
        // Filtrer manuellement en vérifiant tous les formats possibles de référence à l'élève
        const calculations = allCalculations.filter(calc => {
          // Vérifier si Élève est un tableau d'IDs (cas le plus courant dans Airtable)
          if (Array.isArray(calc.Élève) && calc.Élève.includes(studentId)) {
            return true;
          }
          
          // Vérifier si IDU Élève est un tableau et contient l'ID
          if (Array.isArray(calc["IDU Élève"]) && calc["IDU Élève"].includes(studentId)) {
            return true;
          }
          
          // Si on a récupéré le nom de l'élève, vérifier aussi par nom
          if (studentName) {
            if (calc.Élève === studentName) return true;
            if (Array.isArray(calc.Élève) && calc.Élève.includes(studentName)) return true;
          }
          
          // Autres vérifications (champs exacts ou contient)
          return (calc.StudentId === studentId) || 
                 (typeof calc.Élève === 'string' && calc.Élève.includes(studentId)) || 
                 (typeof calc["IDU Élève"] === 'string' && calc["IDU Élève"] === studentId);
        });
        
        console.log(`Filtered to ${calculations.length} calculations for student ${studentId}`);
        
        if (calculations.length > 0) {
          return this.mapCalculations(calculations, studentId);
        }
      } catch (error) {
        console.error("Error fetching all records:", error);
        // Continuer avec d'autres méthodes si celle-ci échoue
      }
      
      // Deuxième tentative : essayer avec la formule FIND() qui est plus robuste pour les champs de type lien
      try {
        console.log("Trying with FIND() formula");
        const formula = encodeURIComponent(`FIND("${studentId}", {IDU Élève})`);
        const calculationsWithFind = await AirtableApiService.fetchFromAirtable<any>('BCJ', { 
          filterByFormula: formula 
        });
        
        if (calculationsWithFind.length > 0) {
          console.log(`Found ${calculationsWithFind.length} calculations using FIND formula`);
          return this.mapCalculations(calculationsWithFind, studentId);
        }
      } catch (error) {
        console.log("FIND formula failed, trying other methods");
        // Continuer avec d'autres méthodes si celle-ci échoue
      }
      
      // Troisième tentative : essayer avec des formules alternatives
      // Qui sont plus susceptibles de fonctionner avec les champs de type lien
      const formulas = [
        encodeURIComponent(`RECORD_ID()="${studentId}"`),
        encodeURIComponent(`OR(SEARCH("${studentId}", {Élève}), SEARCH("${studentId}", {IDU Élève}))`),
        encodeURIComponent(`OR({IDU Élève}="${studentId}", {Élève}="${studentId}")`)
      ];
      
      let calculations = [];
      
      // Essayer chaque formule jusqu'à ce qu'une fonctionne
      for (const formulaToTry of formulas) {
        try {
          console.log(`Trying formula: ${decodeURIComponent(formulaToTry)}`);
          calculations = await AirtableApiService.fetchFromAirtable<any>('BCJ', { 
            filterByFormula: formulaToTry 
          });
          
          if (calculations.length > 0) {
            console.log(`Found ${calculations.length} calculations with formula`);
            return this.mapCalculations(calculations, studentId);
          }
        } catch (error) {
          console.log(`Formula failed: ${decodeURIComponent(formulaToTry)}`);
          // Continuer avec la formule suivante
        }
      }
      
      // Dernière tentative : utiliser une méthode générique sans filtre
      console.log("All formulas failed, falling back to mock data");
      return this.getStudentCalculationsMock(studentId);
    } catch (error) {
      console.error('Error getting calculations:', error);
      toast.error("Erreur lors de la récupération des calculs");
      return this.getStudentCalculationsMock(studentId);
    }
  }
  
  // Méthode pour récupérer le nom de l'élève depuis la table Élèves
  private async getStudentName(studentId: string): Promise<string | null> {
    try {
      // Tenter de récupérer les données de l'élève depuis la table Élèves
      const students = await AirtableApiService.fetchFromAirtable<any>('Élèves', {
        filterByFormula: encodeURIComponent(`{IDU}="${studentId}"`)
      });
      
      if (students.length > 0) {
        // Récupérer le nom de l'élève (peut être dans différents champs selon la structure)
        const student = students[0];
        const name = student.Nom || student.Name || student.nom || student.name;
        
        if (name) {
          console.log(`Found student name: ${name}`);
          return name;
        }
      }
      
      // Essayer avec la table sans accents
      const studentsAlt = await AirtableApiService.fetchFromAirtable<any>('Eleves', {
        filterByFormula: encodeURIComponent(`{IDU}="${studentId}"`)
      });
      
      if (studentsAlt.length > 0) {
        const student = studentsAlt[0];
        const name = student.Nom || student.Name || student.nom || student.name;
        
        if (name) {
          console.log(`Found student name from Eleves table: ${name}`);
          return name;
        }
      }
      
      console.log("Could not find student name");
      return null;
    } catch (error) {
      console.error('Error fetching student name:', error);
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
