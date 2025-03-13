
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { Student } from "../types/airtable.types";
import { mockStudent } from "../mocks/airtableMocks";

class AuthService {
  // Authentication
  async verifyAccess(accessCode: string): Promise<Student | null> {
    // En mode démo ou développement, utiliser les données fictives
    if (!AirtableApiService.isConfigured) {
      console.warn('Mode démo: utilisation de données fictives');
      return this.verifyAccessMock(accessCode);
    }
    
    try {
      console.log('Tentative de vérification avec le code:', accessCode);
      
      // Définir plusieurs noms de table possibles à essayer
      const tableNames = ['Eleves', 'Students', 'Étudiants', 'Élèves', 'Student'];
      
      let student = null;
      
      // Tester chaque nom de table jusqu'à trouver le bon
      for (const tableName of tableNames) {
        try {
          console.log(`Essai avec la table: ${tableName}`);
          const students = await AirtableApiService.fetchFromAirtable<any>(tableName);
          
          if (students && students.length > 0) {
            console.log(`Table ${tableName} trouvée avec ${students.length} enregistrements`);
            
            // Vérifier plusieurs champs possibles pour le code d'accès
            const possibleCodeFields = ['code', 'Code', 'accessCode', 'AccessCode', 'access_code', 'access_Code'];
            
            // Chercher l'étudiant avec le bon code d'accès, en testant tous les champs possibles
            const matchingStudent = students.find((s: any) => {
              return possibleCodeFields.some(field => s[field] === accessCode);
            });
            
            if (matchingStudent) {
              console.log('Étudiant trouvé:', matchingStudent);
              
              // Déterminer les champs à utiliser pour les données
              const nameField = matchingStudent.Name || matchingStudent.name || matchingStudent.nom || '';
              const emailField = matchingStudent.Email || matchingStudent.email || matchingStudent.courriel || '';
              
              // Déterminer quel champ de code a été utilisé
              const usedCodeField = possibleCodeFields.find(field => matchingStudent[field] === accessCode) || 'code';
              
              student = {
                id: matchingStudent.id,
                name: nameField,
                accessCode: matchingStudent[usedCodeField] || '',
                email: emailField,
              };
              
              break; // Sortir de la boucle, nous avons trouvé l'étudiant
            }
          }
        } catch (error) {
          console.warn(`Échec avec la table ${tableName}:`, error);
          // Continuer avec la table suivante
        }
      }
      
      if (student) {
        return student;
      }
      
      console.log('Aucun étudiant trouvé avec ce code après avoir essayé toutes les tables');
      
      // Si l'étudiant n'est pas trouvé mais que le code correspond à notre démo, utiliser les données fictives
      if (accessCode === mockStudent.accessCode) {
        console.log('Utilisation des données de démo pour le code:', accessCode);
        return mockStudent;
      }
      
      return null;
    } catch (error) {
      console.error('Error verifying access:', error);
      toast.error("Erreur lors de la vérification de l'accès");
      
      // En cas d'erreur générale, si le code correspond à la démo, on retourne les données fictives
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
