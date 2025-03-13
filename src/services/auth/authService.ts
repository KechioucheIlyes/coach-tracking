
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
  
  // Base ID pour les diagnostics
  private baseId = "app8673yjmXB3WcDT";

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
      console.log('Informations de configuration Airtable:');
      console.log(`- Base ID: ${this.baseId}`);
      console.log(`- Table ID: ${this.tableId}`);
      console.log(`- API Key configurée: ${AirtableApiService.isApiKeyConfigured ? 'Oui' : 'Non'}`);
      
      // Tester la connectivité de base avec Airtable avant de tenter l'accès à la table
      const connectivityTest = await AirtableApiService.testConnectivity();
      console.log('Résultat du test de connectivité:', connectivityTest);
      
      if (!connectivityTest.success) {
        console.error('Échec du test de connectivité Airtable:', connectivityTest.error);
        
        // En cas d'échec, vérifier les données de démonstration
        if (accessCode === "access123" || accessCode === "rech0KgjCrK24UrBH") {
          console.log('Utilisation des données de démonstration après échec de connectivité Airtable');
          return this.knownAccessCodes[accessCode] || null;
        }
        
        // Afficher un message d'erreur pour aider au débogage
        console.warn('Connexion à Airtable impossible, utilisez les codes de démo: access123 ou rech0KgjCrK24UrBH');
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
          
          // Utiliser les noms de champs de la structure Airtable
          return {
            id: matchingEleve.id,
            name: fields.Nom || fields["fldqgtzUUGEbyuvQF"] || fields.Name || fields.name || 'Élève',
            accessCode: accessCode,
            email: fields["E-mail"] || fields["fldiswtPGMq9yr6E3"] || fields.Email || fields.email || '',
          };
        } else {
          console.log('Aucun élève trouvé avec ce code dans la table Élèves');
          console.log('Codes vérifiés:', eleves.map((e: any) => ({ id: e.id, fields: e.fields ? Object.keys(e.fields) : [] })));
        }
      } else {
        console.warn('Aucun élève récupéré depuis Airtable, vérification des accès directs');
      }
      
      // Dernière vérification pour les codes connus
      if (this.knownAccessCodes[accessCode]) {
        console.log('Utilisation des données de démo pour le code:', accessCode);
        return this.knownAccessCodes[accessCode];
      }
      
      console.log('Aucun élève trouvé avec ce code après vérification');
      return null;
    } catch (error) {
      console.error('Error verifying access:', error);
      
      // En cas d'erreur, vérifier les codes connus directement
      if (this.knownAccessCodes[accessCode]) {
        console.log('Utilisation des données de démo après erreur');
        return this.knownAccessCodes[accessCode];
      }
      
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
