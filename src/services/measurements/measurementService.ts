
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
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const measurements = await AirtableApiService.fetchFromAirtable<any>('Measurements', { filterByFormula: formula });
      
      return measurements.map(measurement => ({
        id: measurement.id,
        studentId: measurement.StudentId,
        date: measurement.Date,
        weight: Number(measurement.Weight),
        height: Number(measurement.Height),
        bodyFat: measurement.BodyFat ? Number(measurement.BodyFat) : undefined,
        musclePercentage: measurement.MusclePercentage ? Number(measurement.MusclePercentage) : undefined,
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
