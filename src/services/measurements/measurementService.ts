
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { Measurement } from "../types/airtable.types";
import { mockMeasurements } from "../mocks/airtableMocks";

class MeasurementService {
  async getStudentMeasurements(studentId: string): Promise<Measurement[]> {
    if (!AirtableApiService.isConfigured) {
      return this.getStudentMeasurementsMock(studentId);
    }
    
    try {
      // Utiliser la formule Airtable avec le format exact pour le champ Élève
      const formula = `{Élève}='${studentId}'`;
      console.log("Formule utilisée:", formula);
      
      const measurements = await AirtableApiService.fetchFromAirtable<any>('Mesures', { 
        filterByFormula: formula 
      });
      
      console.log("Mesures récupérées:", measurements);
      
      // Trier les mesures par date (de la plus récente à la plus ancienne)
      const sortedMeasurements = measurements
        .map(measurement => ({
          id: measurement.id,
          studentId: measurement["Élève"] ? measurement["Élève"][0] : studentId,
          date: measurement["Date de Mesure"],
          weight: Number(measurement["Poids"]) || 0,
          height: 0, // La taille est généralement constante et stockée sur l'étudiant
          bodyFat: measurement["Masse Grasse (%)"] ? Number(measurement["Masse Grasse (%)"]) : undefined,
          musclePercentage: measurement["Masse Musulaire"] ? Number(measurement["Masse Musulaire"]) : undefined,
          water: measurement["Eau"] ? Number(measurement["Eau"]) : undefined,
          visceralFat: measurement["Graisse Viscérale"] ? Number(measurement["Graisse Viscérale"]) : undefined,
          thighCircumferenceLeft: measurement["Tour de Cuisses G"] ? Number(measurement["Tour de Cuisses G"]) : undefined,
          thighCircumferenceRight: measurement["Tour de Cuisses D"] ? Number(measurement["Tour de Cuisses D"]) : undefined,
          hipCircumference: measurement["Tour de Hanches"] ? Number(measurement["Tour de Hanches"]) : undefined,
          waistCircumference: measurement["Tour de Taille"] ? Number(measurement["Tour de Taille"]) : undefined,
          chestCircumference: measurement["Tour de Poitrine"] ? Number(measurement["Tour de Poitrine"]) : undefined,
          armCircumferenceLeft: measurement["Tour de Bras G"] ? Number(measurement["Tour de Bras G"]) : undefined,
          armCircumferenceRight: measurement["Tour de Bras D"] ? Number(measurement["Tour de Bras D"]) : undefined,
          // Champs calculés depuis Airtable
          weightLost: measurement["Poids Perdu"] ? Number(measurement["Poids Perdu"]) : undefined,
          weightRemaining: measurement["Perte Restant"] ? Number(measurement["Perte Restant"]) : undefined,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return sortedMeasurements;
    } catch (error) {
      console.error('Error getting measurements:', error);
      toast.error("Erreur lors de la récupération des mesures");
      
      // En cas d'erreur, essayons avec une autre approche de requête
      try {
        console.log("Tentative avec une approche alternative");
        // Récupérer toutes les mesures puis filtrer côté client
        const allMeasurements = await AirtableApiService.fetchAllRecords('Mesures');
        console.log("Toutes les mesures:", allMeasurements);
        
        if (allMeasurements && allMeasurements.length > 0) {
          // Filtrer les mesures de l'étudiant
          const filteredMeasurements = allMeasurements
            .filter(m => {
              if (!m["Élève"]) return false;
              // Vérifier si le champ Élève contient l'ID de l'étudiant (peut être un tableau)
              if (Array.isArray(m["Élève"])) {
                return m["Élève"].includes(studentId);
              }
              return m["Élève"] === studentId;
            })
            .map(measurement => ({
              id: measurement.id,
              studentId: studentId,
              date: measurement["Date de Mesure"],
              weight: Number(measurement["Poids"]) || 0,
              height: 0,
              bodyFat: measurement["Masse Grasse (%)"] ? Number(measurement["Masse Grasse (%)"]) : undefined,
              musclePercentage: measurement["Masse Musulaire"] ? Number(measurement["Masse Musulaire"]) : undefined,
              water: measurement["Eau"] ? Number(measurement["Eau"]) : undefined,
              visceralFat: measurement["Graisse Viscérale"] ? Number(measurement["Graisse Viscérale"]) : undefined,
              thighCircumferenceLeft: measurement["Tour de Cuisses G"] ? Number(measurement["Tour de Cuisses G"]) : undefined,
              thighCircumferenceRight: measurement["Tour de Cuisses D"] ? Number(measurement["Tour de Cuisses D"]) : undefined,
              hipCircumference: measurement["Tour de Hanches"] ? Number(measurement["Tour de Hanches"]) : undefined,
              waistCircumference: measurement["Tour de Taille"] ? Number(measurement["Tour de Taille"]) : undefined,
              chestCircumference: measurement["Tour de Poitrine"] ? Number(measurement["Tour de Poitrine"]) : undefined,
              armCircumferenceLeft: measurement["Tour de Bras G"] ? Number(measurement["Tour de Bras G"]) : undefined,
              armCircumferenceRight: measurement["Tour de Bras D"] ? Number(measurement["Tour de Bras D"]) : undefined,
              weightLost: measurement["Poids Perdu"] ? Number(measurement["Poids Perdu"]) : undefined,
              weightRemaining: measurement["Perte Restant"] ? Number(measurement["Perte Restant"]) : undefined,
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          console.log("Mesures filtrées:", filteredMeasurements);
          return filteredMeasurements;
        }
      } catch (fallbackError) {
        console.error('Erreur avec l\'approche alternative:', fallbackError);
      }
      
      // Si toutes les tentatives échouent, utiliser les données de test
      console.log("Utilisation des données de test");
      return this.getStudentMeasurementsMock(studentId);
    }
  }

  // Version mock pour le développement
  private async getStudentMeasurementsMock(studentId: string): Promise<Measurement[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMeasurements.filter(measurement => measurement.studentId === studentId);
  }
}

export default new MeasurementService();
