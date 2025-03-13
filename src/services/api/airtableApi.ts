
import { toast } from "sonner";

class AirtableApiService {
  private baseId: string;
  private apiKey: string;
  private apiUrl: string = 'https://api.airtable.com/v0';
  private maxRetries: number = 2;

  constructor() {
    // Configuration par défaut avec le token fourni
    this.baseId = 'app4LDBPHMVKbzSHj';
    this.apiKey = 'patonRA3u98xVvNJJ.44366f3f6572bd769aec8dffe17938b09061205356fe11f092f35a21c171973b';
  }

  public configure(baseId: string, apiKey: string) {
    this.baseId = baseId;
    this.apiKey = apiKey;
    localStorage.setItem('airtable_base_id', baseId);
    localStorage.setItem('airtable_api_key', apiKey);
  }

  public get isConfigured(): boolean {
    return Boolean(this.baseId && this.apiKey);
  }

  private loadConfig() {
    if (!this.isConfigured) {
      const baseId = localStorage.getItem('airtable_base_id');
      const apiKey = localStorage.getItem('airtable_api_key');
      if (baseId && apiKey) {
        this.baseId = baseId;
        this.apiKey = apiKey;
      }
    }
  }

  // Nouvelle méthode pour récupérer tous les enregistrements d'une table
  public async fetchAllRecords(tableName: string, retryCount: number = 0): Promise<any[]> {
    this.loadConfig();
    
    if (!this.isConfigured) {
      throw new Error('Airtable API n\'est pas configurée. Veuillez appeler configure() d\'abord.');
    }

    console.log(`Tentative de récupération de tous les enregistrements de la table ${tableName}`);
    
    // Tentatives de noms de table alternatifs en cas d'échec
    const tableNames = [tableName];
    
    // Si le nom de la table contient des accents, ajouter une version sans accents
    if (tableName.normalize("NFD").replace(/[\u0300-\u036f]/g, "") !== tableName) {
      tableNames.push(tableName.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    }
    
    // Ajouter des variantes pour "Élèves" car c'est la table principale
    if (tableName === "Élèves") {
      tableNames.push("Eleves", "Students", "Users");
    }
    
    // Tentative avec chaque nom de table possible
    for (const name of tableNames) {
      try {
        console.log(`Tentative avec le nom de table: ${name}`);
        const encodedTableName = encodeURIComponent(name);
        const url = `${this.apiUrl}/${this.baseId}/${encodedTableName}`;
        
        console.log('URL de requête:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`Réponse pour ${name}:`, response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Données récupérées pour ${name}:`, data);
          
          if (data && data.records) {
            return data.records;
          }
          return [];
        }
        
        console.warn(`Échec pour la table ${name}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.error(`Erreur pour la table ${name}:`, error);
      }
    }
    
    // Si toutes les tentatives ont échoué et que nous n'avons pas dépassé le nombre maximal de tentatives
    if (retryCount < this.maxRetries) {
      console.log(`Nouvelle tentative ${retryCount + 1}/${this.maxRetries} dans 1s...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.fetchAllRecords(tableName, retryCount + 1);
    }
    
    console.error(`Toutes les tentatives ont échoué pour la table ${tableName}`);
    return [];
  }

  public async fetchFromAirtable<T>(
    tableName: string,
    params: Record<string, string> = {},
    retryCount: number = 0
  ): Promise<T[]> {
    this.loadConfig();
    
    if (!this.isConfigured) {
      throw new Error('Airtable API n\'est pas configurée. Veuillez appeler configure() d\'abord.');
    }

    // Encoder correctement le nom de la table (important pour les noms avec accents comme "Élèves")
    const encodedTableName = encodeURIComponent(tableName);
    
    // Construire l'URL de base
    let url = `${this.apiUrl}/${this.baseId}/${encodedTableName}`;
    console.log('URL Airtable:', url);

    // Ajout des paramètres de requête si fournis
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        queryParams.append(key, value);
      }
      url += `?${queryParams.toString()}`;
    }

    console.log('URL complète de requête:', url);
    
    try {
      // Vérifier si nous devrions simuler un succès pour tester
      const simulateSuccess = localStorage.getItem('simulate_airtable_success') === 'true';
      if (simulateSuccess) {
        console.log('Simulation d\'une réponse Airtable réussie');
        return [];
      }
      
      // Tenter de récupérer les données
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Statut de la réponse:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur API Airtable:', errorText);
        
        // Si nous avons une erreur 403 (Forbidden) ou 404 (Not Found)
        if (response.status === 403 || response.status === 404) {
          if (retryCount < this.maxRetries) {
            // Attendre un peu avant de réessayer avec un autre nom de table
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`Tentative ${retryCount + 1}/${this.maxRetries} échouée pour la table ${tableName}`);
            
            // Pour la première tentative, essayons avec le nom de table sans accents
            if (retryCount === 0 && tableName === 'Élèves') {
              console.log('Tentative avec le nom de table sans accents: Eleves');
              return this.fetchFromAirtable<T>('Eleves', params, retryCount + 1);
            }
            
            return [];
          }
          
          console.log('Problème d\'accès à Airtable, utilisation des données fictives');
          return [];
        }
        
        throw new Error(`Erreur Airtable: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Données brutes reçues:', data);
      
      // Transformation de la réponse Airtable en notre format
      if (data && data.records) {
        const records = data.records.map((record: any) => ({
          id: record.id,
          ...record.fields,
        }));
        console.log('Données transformées:', records);
        return records;
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des données Airtable:', error);
      
      // Tenter une nouvelle requête avec un délai si nous n'avons pas dépassé le nombre maximal de tentatives
      if (retryCount < this.maxRetries) {
        console.log(`Tentative ${retryCount + 1}/${this.maxRetries} échouée, nouvelle tentative dans 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchFromAirtable<T>(tableName, params, retryCount + 1);
      }
      
      // Ne pas afficher de toast ici car nous voulons une expérience utilisateur plus fluide
      // Nous allons gérer l'erreur au niveau du service appelant
      throw error;
    }
  }

  public async useMockData<T>(mockData: T[]): Promise<T[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData;
  }
}

export default new AirtableApiService();
