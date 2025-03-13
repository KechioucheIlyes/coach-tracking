
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
      // Debug: Afficher le code d'accès pour vérification
      console.log('Tentative de vérification avec le code:', accessCode);
      
      // Filtre pour trouver l'étudiant avec le code d'accès spécifié
      const formula = encodeURIComponent(`{code} = '${accessCode}'`);
      console.log('Formule de filtrage:', formula);
      
      const students = await AirtableApiService.fetchFromAirtable<any>('Élèves', { filterByFormula: formula });
      console.log('Résultat de la requête:', students);
      
      if (students && students.length > 0) {
        const student = students[0];
        console.log('Étudiant trouvé:', student);
        
        // Récupération des champs avec gestion des noms de champs exacts de votre table Airtable
        return {
          id: student.id,
          name: student.Name || student.name || '',
          accessCode: student.code || '',
          email: student.Email || student.email || '',
        };
      }
      console.log('Aucun étudiant trouvé avec ce code');
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
