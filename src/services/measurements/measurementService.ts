
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
      // Use the Eleve field to filter measurements for this student
      const formula = encodeURIComponent(`FIND('${studentId}', {Élève}) > 0`);
      const measurements = await AirtableApiService.fetchFromAirtable<any>('Mesures', { filterByFormula: formula });
      
      return measurements.map(measurement => ({
        id: measurement.id,
        studentId: measurement["Élève"] ? measurement["Élève"][0] : studentId,
        date: measurement["Date de Mesure"],
        weight: Number(measurement["Poids"]) || 0,
        height: 0, // Height is usually constant and stored on student
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
        // Calculated fields from Airtable
        weightLost: measurement["Poids Perdu"] ? Number(measurement["Poids Perdu"]) : undefined,
        weightRemaining: measurement["Perte Restant"] ? Number(measurement["Perte Restant"]) : undefined,
      }));
    } catch (error) {
      console.error('Error getting measurements:', error);
      toast.error("Erreur lors de la récupération des mesures");
      return [];
    }
  }

  // Version mock pour le développement
  private async getStudentMeasurementsMock(studentId: string): Promise<Measurement[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMeasurements.filter(measurement => measurement.studentId === studentId);
  }
}

export default new MeasurementService();
