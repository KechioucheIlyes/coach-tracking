
import { toast } from "sonner";
import AirtableApiService from "../api/airtableApi";
import { MealPlan } from "../types/airtable.types";
import { mockMealPlans } from "../mocks/airtableMocks";

class MealPlanService {
  async getStudentMealPlans(studentId: string): Promise<MealPlan[]> {
    if (!AirtableApiService.isConfigured) {
      return this.getStudentMealPlansMock(studentId);
    }
    
    try {
      const formula = encodeURIComponent(`{StudentId} = '${studentId}'`);
      const mealPlans = await AirtableApiService.fetchFromAirtable<any>('MealPlans', { filterByFormula: formula });
      
      return mealPlans.map(mealPlan => ({
        id: mealPlan.id,
        studentId: mealPlan.StudentId,
        date: mealPlan.Date,
        name: mealPlan.Name || "Plan alimentaire", // Required field
        calories: mealPlan.Calories || 0, // Required field
        protein: mealPlan.Protein || 0, // Required field
        carbs: mealPlan.Carbs || 0, // Required field
        fat: mealPlan.Fat || 0, // Required field
        ingredients: mealPlan.Ingredients || "", // Required field
        instructions: mealPlan.Instructions || "", // Required field
        meals: mealPlan.Meals?.map(meal => ({
          id: meal.id,
          type: meal.Type,
          items: meal.Items?.map(item => ({
            id: item.id,
            name: item.Name,
            quantity: item.Quantity,
            calories: item.Calories,
            protein: item.Protein,
            carbs: item.Carbs,
            fat: item.Fat,
          })) || [],
        })) || [],
      }));
    } catch (error) {
      console.error('Error getting meal plans:', error);
      toast.error("Erreur lors de la récupération des plans alimentaires");
      return [];
    }
  }

  // Version mock pour le développement
  private async getStudentMealPlansMock(studentId: string): Promise<MealPlan[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMealPlans.filter(mealPlan => mealPlan.studentId === studentId);
  }
}

export default new MealPlanService();
