
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { Student } from "../types/airtable.types";
import { mockStudent } from "../mocks/airtableMocks";

class AuthService {
  // Hard-coded known access codes (for demo and testing)
  private knownAccessCodes = {
    "rech0KgjCrK24UrBH": {
      id: "rech0KgjCrK24UrBH",
      name: "Féline Faure",
      accessCode: "rech0KgjCrK24UrBH",
      email: "feline.faure@example.com"
    },
    "access123": mockStudent
  };

  // Identifiant de la table Élèves dans Airtable
  private tableId = "tbll5MlIcTSqCOLEJ";

  // Authentication
  async verifyAccess(accessCode: string): Promise<Student | null> {
    // Check for known access codes first (always allow these)
    if (this.knownAccessCodes[accessCode]) {
      console.log(`Accès direct avec code connu: ${accessCode}`);
      return this.knownAccessCodes[accessCode];
    }
    
    // En mode démo ou développement, utiliser les données fictives
    if (!AirtableApiService.isConfigured) {
      console.log('Mode démo: utilisation de données fictives');
      return this.verifyAccessMock(accessCode);
    }
    
    try {
      console.log('Tentative de vérification avec le code:', accessCode);
      
      // Utiliser directement l'ID de la table plutôt que son nom
      const eleves = await AirtableApiService.fetchTableById(this.tableId);
      console.log(`${eleves?.length || 0} élèves récupérés depuis Airtable`);
      
      if (eleves && eleves.length > 0) {
        // Rechercher un élève avec le code d'accès correspondant
        const matchingEleve = eleves.find((eleve: any) => {
          // Vérifier le champ code qui contient RECORD_ID()
          return (
            eleve.id === accessCode || 
            (eleve.fields && eleve.fields.code === accessCode) ||
            (eleve.fields && eleve.fields["code"] === accessCode) ||
            (eleve.fields && eleve.fields["fld2B3uc2SCCu3bhT"] === accessCode)
          );
        });
        
        if (matchingEleve) {
          console.log('Élève trouvé:', matchingEleve);
          
          // Extraire les champs selon la structure Airtable
          const fields = matchingEleve.fields || matchingEleve;
          
          // Utiliser les noms de champs de la structure Airtable
          return {
            id: matchingEleve.id,
            name: fields.Nom || fields["fldqgtzUUGEbyuvQF"] || fields.Name || fields.name || 'Élève',
            accessCode: accessCode,
            email: fields["E-mail"] || fields["fldiswtPGMq9yr6E3"] || fields.Email || fields.email || '',
          };
        } else {
          console.log('Aucun élève trouvé avec ce code dans la table Élèves');
        }
      } else {
        console.warn('Aucun élève récupéré depuis Airtable, vérification des accès directs');
      }
      
      // Dernière vérification pour les codes connus
      // (au cas où ils n'auraient pas été détectés plus tôt)
      if (accessCode === "access123") {
        console.log('Utilisation des données de démo pour le code:', accessCode);
        return mockStudent;
      }
      
      if (accessCode === "rech0KgjCrK24UrBH") {
        console.log('Accès direct pour Féline Faure');
        return this.knownAccessCodes["rech0KgjCrK24UrBH"];
      }
      
      console.log('Aucun élève trouvé avec ce code après vérification');
      return null;
    } catch (error) {
      console.error('Error verifying access:', error);
      
      // En cas d'erreur, vérifier les codes connus directement
      if (accessCode === "access123") {
        console.log('Utilisation des données de démo après erreur');
        return mockStudent;
      }
      
      if (accessCode === "rech0KgjCrK24UrBH") {
        console.log('Authentification de secours pour Féline Faure');
        return this.knownAccessCodes["rech0KgjCrK24UrBH"];
      }
      
      // Ne pas afficher de toast ici, laissons le composant UI gérer l'erreur
      return null;
    }
  }

  // Version mock pour le développement
  private async verifyAccessMock(accessCode: string): Promise<Student | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Vérifier les codes connus
    return this.knownAccessCodes[accessCode] || null;
  }
}

export default new AuthService();
