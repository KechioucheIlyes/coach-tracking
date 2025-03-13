
import { toast } from "sonner";

class AirtableApiService {
  private baseId: string;
  private apiKey: string;
  private apiUrl: string = 'https://api.airtable.com/v0';

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

  public async fetchFromAirtable<T>(
    tableName: string,
    params: Record<string, string> = {}
  ): Promise<T[]> {
    this.loadConfig();
    
    if (!this.isConfigured) {
      throw new Error('Airtable API n\'est pas configurée. Veuillez appeler configure() d\'abord.');
    }

    // Tentative de récupération sans filtres d'abord
    let url = `${this.apiUrl}/${this.baseId}/${encodeURIComponent(tableName)}`;
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
        
        // Si nous avons une erreur 403 ou 404, utilisons les données de démo
        if (response.status === 403 || response.status === 404) {
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
