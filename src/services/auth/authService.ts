
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
      console.log('Tentative de vérification avec le code:', accessCode);
      
      // Testons avec un nom de table plus simple, sans accents
      const tableName = 'Eleves'; // "Élèves" pourrait causer des problèmes d'encodage
      
      // Filtre pour trouver l'étudiant avec le code d'accès spécifié
      const formula = encodeURIComponent(`{code} = '${accessCode}'`);
      console.log('Formule de filtrage:', formula);
      
      // Essayons sans filtre d'abord pour voir si nous pouvons accéder à la table
      const students = await AirtableApiService.fetchFromAirtable<any>(tableName);
      console.log('Résultat de la requête:', students);
      
      // Si nous avons des résultats, filtrons manuellement
      if (students && students.length > 0) {
        // Trouver l'étudiant avec le code correspondant
        const student = students.find((s: any) => s.code === accessCode);
        
        if (student) {
          console.log('Étudiant trouvé:', student);
          
          return {
            id: student.id,
            name: student.Name || student.name || '',
            accessCode: student.code || '',
            email: student.Email || student.email || '',
          };
        }
      }
      
      console.log('Aucun étudiant trouvé avec ce code');
      // Si nous arrivons ici, nous n'avons pas trouvé d'étudiant ou la requête a échoué
      // Utilisons les données de démo temporairement
      if (accessCode === mockStudent.accessCode) {
        console.log('Utilisation des données de démo pour le code:', accessCode);
        return mockStudent;
      }
      
      return null;
    } catch (error) {
      console.error('Error verifying access:', error);
      toast.error("Erreur lors de la vérification de l'accès");
      
      // En cas d'erreur, essayons avec les données de démo pour permettre l'accès
      if (accessCode === mockStudent.accessCode) {
        console.log('Fallback vers les données de démo après erreur');
        return mockStudent;
      }
      
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
