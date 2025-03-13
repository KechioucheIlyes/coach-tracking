
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

    let url = `${this.apiUrl}/${this.baseId}/${tableName}`;

    // Ajout des paramètres de requête
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        queryParams.append(key, value);
      }
      url += `?${queryParams.toString()}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur Airtable: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformation de la réponse Airtable en notre format
      return data.records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des données Airtable:', error);
      toast.error("Erreur lors de la récupération des données");
      throw error;
    }
  }

  public async useMockData<T>(mockData: T[]): Promise<T[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData;
  }
}

export default new AirtableApiService();
