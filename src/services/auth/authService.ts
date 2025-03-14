import AirtableApiService from "../api/airtableApi";
import { Student } from "../types/airtable.types";
import { toast } from "sonner";

class AuthService {
  async verifyAccess(accessCode: string): Promise<Student | null> {
    if (!AirtableApiService.isConfigured) {
      toast.error("Airtable n'est pas configuré.");
      return null;
    }

    try {
      const students = await AirtableApiService.fetchFromAirtable<any>('Élèves', {
        filterByFormula: `{Code d'accès}='${accessCode}'`
      });
      
      if (!students || students.length === 0) {
        return null;
      }

      const student = students[0];
      
      // Mapping to our Student type
      return {
        id: student.id || student["IDU Eleve"] || '',
        name: student.Nom || '',
        email: student.Email || '',
        code: student.code || '',
        accessCode: accessCode,
        objective: student.Objectifs || ''
      };
      
    } catch (error) {
      console.error('Error verifying access code:', error);
      toast.error("Erreur lors de la vérification du code d'accès.");
      return null;
    }
  }
}

export default new AuthService();
