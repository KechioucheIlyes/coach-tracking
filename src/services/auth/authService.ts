
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { Student } from "../types/airtable.types";
import { mockStudent } from "../mocks/airtableMocks";

class AuthService {
  // Authentication
  async verifyAccess(accessCode: string): Promise<Student | null> {
    if (!AirtableApiService.isConfigured) {
      // Utilisation des données fictives en mode démo/développement
      console.warn('Mode démo: utilisation de données fictives');
      return this.verifyAccessMock(accessCode);
    }
    
    try {
      // Filtre pour trouver l'étudiant avec le code d'accès spécifié
      // Utilisation de la colonne "code" au lieu de "AccessCode"
      const formula = encodeURIComponent(`{code} = '${accessCode}'`);
      const students = await AirtableApiService.fetchFromAirtable<any>('Élèves', { filterByFormula: formula });
      
      if (students && students.length > 0) {
        const student = students[0];
        return {
          id: student.id,
          name: student.Name,
          accessCode: student.code,
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
    
    if (accessCode === mockStudent.accessCode) {
      return mockStudent;
    }
    return null;
  }
}

export default new AuthService();
