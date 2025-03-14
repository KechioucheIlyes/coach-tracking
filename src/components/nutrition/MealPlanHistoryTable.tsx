
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { MealPlan } from "@/services/types/airtable.types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import MealPlanView from "./MealPlanView";

interface MealPlanHistoryTableProps {
  mealPlans: MealPlan[];
}

const MealPlanHistoryTable = ({ mealPlans }: MealPlanHistoryTableProps) => {
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  
  // Calculate total calories for a meal plan
  const calculateTotalCalories = (mealPlan: MealPlan) => {
    return mealPlan.meals.flatMap(m => m.items).reduce((sum, item) => sum + (item.calories || 0), 0);
  };

  // Count total number of meals in a meal plan
  const countMeals = (mealPlan: MealPlan) => {
    return new Set(mealPlan.meals.map(meal => meal.type)).size;
  };
  
  return (
    <div className="space-y-6">
      {selectedMealPlan && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              className="text-red-600 hover:text-red-700 p-0 h-auto"
              onClick={() => setSelectedMealPlan(null)}
            >
              <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
              <span>Retour à l'historique</span>
            </Button>
          </div>
          <MealPlanView mealPlan={selectedMealPlan} />
        </div>
      )}
      
      {!selectedMealPlan && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Date</TableHead>
                <TableHead>Repas</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mealPlans.map((mealPlan) => (
                <TableRow key={mealPlan.id}>
                  <TableCell className="font-medium">
                    {format(new Date(mealPlan.date), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>{countMeals(mealPlan)}</TableCell>
                  <TableCell>{calculateTotalCalories(mealPlan)} kcal</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setSelectedMealPlan(mealPlan)}
                    >
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MealPlanHistoryTable;
