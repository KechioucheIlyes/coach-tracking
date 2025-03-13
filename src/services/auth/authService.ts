
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { Student } from "../types/airtable.types";

class AuthService {
  // Identifiant de la table Élèves dans Airtable
  private tableId = "tbll5MlIcTSqCOLEJ";
  
  // Base ID pour les diagnostics
  private baseId = "app8673yjmXB3WcDT";

  // Authentication
  async verifyAccess(accessCode: string): Promise<Student | null> {
    // En mode démo ou développement, utiliser les données fictives
    if (!AirtableApiService.isConfigured) {
      console.log('Mode démo: utilisation de données fictives');
      return this.verifyAccessMock(accessCode);
    }
    
    try {
      console.log('Tentative de vérification avec le code:', accessCode);
      console.log('Informations de configuration Airtable:');
      console.log(`- Base ID: ${this.baseId}`);
      console.log(`- Table ID: ${this.tableId}`);
      console.log(`- API Key configurée: ${AirtableApiService.isApiKeyConfigured ? 'Oui' : 'Non'}`);
      
      // Tester la connectivité de base avec Airtable avant de tenter l'accès à la table
      const connectivityTest = await AirtableApiService.testConnectivity();
      console.log('Résultat du test de connectivité:', connectivityTest);
      
      if (!connectivityTest.success) {
        console.error('Échec du test de connectivité Airtable:', connectivityTest.error);
        console.warn('Connexion à Airtable impossible');
        return null;
      }
      
      // Essayons de récupérer les données avec des méthodes alternatives
      let eleves = await AirtableApiService.fetchTableById(this.tableId);
      
      // Si aucun élève n'est récupéré avec l'ID, essayons avec le nom
      if (!eleves || eleves.length === 0) {
        console.log('Tentative avec le nom de table "Élèves"');
        try {
          eleves = await AirtableApiService.fetchAllRecords('Élèves');
        } catch (err) {
          console.error('Erreur avec le nom Élèves:', err);
        }
      }
      
      console.log(`${eleves?.length || 0} élèves récupérés depuis Airtable`);
      
      if (eleves && eleves.length > 0) {
        // Rechercher un élève avec le code d'accès correspondant
        const matchingEleve = eleves.find((eleve: any) => {
          console.log('Vérification élève:', eleve.id, 'fields:', eleve.fields ? Object.keys(eleve.fields) : 'aucun champ');
          
          // Vérifier le champ code qui contient RECORD_ID()
          return (
            eleve.id === accessCode || 
            (eleve.fields && eleve.fields.code === accessCode) ||
            (eleve.fields && eleve.fields["code"] === accessCode) ||
            (eleve.fields && eleve.fields["fld2B3uc2SCCu3bhT"] === accessCode) ||
            (eleve.fields && eleve.id === accessCode) // Ajout d'une vérification supplémentaire
          );
        });
        
        if (matchingEleve) {
          console.log('Élève trouvé:', matchingEleve);
          
          // Extraire les champs selon la structure Airtable
          const fields = matchingEleve.fields || matchingEleve;
          
          // Construire un objet Student complet avec les détails supplémentaires
          return {
            id: matchingEleve.id,
            name: fields.Nom || fields["fldqgtzUUGEbyuvQF"] || fields.Name || fields.name || 'Élève',
            accessCode: accessCode,
            email: fields["E-mail"] || fields["fldiswtPGMq9yr6E3"] || fields.Email || fields.email || '',
            // Ajout des champs supplémentaires
            age: fields["Âge"] || fields["fld8Vw1HWTKEw4jn8"] || null,
            gender: fields["Sexe"] || fields["fld7XAznXJH1WtyMN"] || null,
            initialWeight: fields["Poids Initial"] || fields["fld82XocJlHxb7iIx"] || null,
            targetWeight: fields["Poids Cible"] || fields["fldTqxmxv8wPQnhTR"] || null,
            height: fields["Taille (cm)"] || fields["fldIqFArOG8ZQlSfU"] || null,
            profession: fields["Profession"] || fields["fldzKnvfv3YDkFzvg"] || null,
            medicalHistory: fields["Antécédents Médicaux & Sportifs"] || fields["fldJKFzBeLsOkelOn"] || null,
            activityLevel: fields["Niveau d'Activité"] || fields["fldzCNDy4Nl8T19lP"] || null,
            motivation: fields["Motivation"] || fields["fldKov8E7oDliEiCi"] || null,
            diet: fields["Régime Alimentaire"] || fields["fldo508yN3Ny9YIwm"] || null,
            eatingHabits: fields["Habitudes Alimentaires Spécifiques"] || fields["fld8KahK2SURAbaer"] || null,
            mealFrequency: fields["Fréquence de Repas"] || fields["fldo8qtXMMY5RW5TC"] || null,
            objectives: fields["Objectifs"] || fields["fld2rLbZsXv1ryqBZ"] || null,
            birthDate: fields["Date de naissance"] || fields["fldNFRFGZkFfZo712"] || null,
            status: fields["Statut"] || fields["fldIOn1hHf5zB762X"] || null,
            studentCode: fields["IDU Eleve"] || fields["fldcbSf4aqCxWXLCD"] || null,
          };
        } else {
          console.log('Aucun élève trouvé avec ce code dans la table Élèves');
          console.log('Codes vérifiés:', eleves.map((e: any) => ({ id: e.id, fields: e.fields ? Object.keys(e.fields) : [] })));
        }
      } else {
        console.warn('Aucun élève récupéré depuis Airtable, vérification des accès directs');
      }
      
      console.log('Aucun élève trouvé avec ce code après vérification');
      return null;
    } catch (error) {
      console.error('Error verifying access:', error);
      return null;
    }
  }

  // Version mock pour le développement
  private async verifyAccessMock(accessCode: string): Promise<Student | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return null; // Ne plus utiliser les codes de démo
  }
}

export default new AuthService();
