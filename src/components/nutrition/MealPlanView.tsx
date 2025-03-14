
import { MealPlan } from "@/services/types/airtable.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MealPlanViewProps {
  mealPlan: MealPlan;
}

const MealPlanView = ({ mealPlan }: MealPlanViewProps) => {
  // Group meals by type
  const mealsByType = mealPlan.meals.reduce((acc, meal) => {
    if (!acc[meal.type]) {
      acc[meal.type] = [];
    }
    acc[meal.type].push(meal);
    return acc;
  }, {} as Record<string, typeof mealPlan.meals>);

  // Order meal types
  const mealTypeOrder = ["breakfast", "lunch", "snack", "dinner"];
  
  // Format meal type for display
  const formatMealType = (type: string) => {
    switch (type) {
      case "breakfast": return "Petit Déjeuner";
      case "lunch": return "Déjeuner";
      case "snack": return "Collation";
      case "dinner": return "Dîner";
      default: return type;
    }
  };

  // Calculate total macros for a meal
  const calculateMealMacros = (items: typeof mealPlan.meals[0]['items']) => {
    return items.reduce((totals, item) => {
      return {
        calories: totals.calories + (item.calories || 0),
        protein: totals.protein + (item.protein || 0),
        carbs: totals.carbs + (item.carbs || 0),
        fat: totals.fat + (item.fat || 0),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Plan du {format(new Date(mealPlan.date), 'dd MMMM yyyy', { locale: fr })}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(mealsByType)
          .sort((a, b) => 
            mealTypeOrder.indexOf(a) - mealTypeOrder.indexOf(b)
          )
          .map(mealType => (
            <Card key={mealType} className="overflow-hidden border-red-200 shadow-sm">
              <CardHeader className="bg-red-100 pb-2">
                <CardTitle className="text-lg">{formatMealType(mealType)}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {mealsByType[mealType].map(meal => (
                    meal.items.map((item, itemIndex) => (
                      <div key={`${meal.id}-${itemIndex}`} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.quantity}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">{item.calories || 0} kcal</p>
                            <p className="text-muted-foreground">
                              P: {item.protein || 0}g • C: {item.carbs || 0}g • L: {item.fat || 0}g
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ))}
                </div>

                {mealsByType[mealType].length > 0 && (
                  <div className="bg-red-50 p-4 border-t border-red-200">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total</span>
                      <span>
                        {calculateMealMacros(mealsByType[mealType].flatMap(m => m.items)).calories} kcal
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Macronutriments</span>
                      <span>
                        P: {calculateMealMacros(mealsByType[mealType].flatMap(m => m.items)).protein}g •
                        C: {calculateMealMacros(mealsByType[mealType].flatMap(m => m.items)).carbs}g •
                        L: {calculateMealMacros(mealsByType[mealType].flatMap(m => m.items)).fat}g
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      <Card className="border-red-200 shadow-sm bg-red-50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Total journalier</p>
              <p className="text-2xl font-bold">
                {mealPlan.meals.flatMap(m => m.items).reduce((sum, item) => sum + (item.calories || 0), 0)} kcal
              </p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-sm font-medium text-red-600">Protéines</p>
                <p className="text-xl">
                  {mealPlan.meals.flatMap(m => m.items).reduce((sum, item) => sum + (item.protein || 0), 0)}g
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-600">Glucides</p>
                <p className="text-xl">
                  {mealPlan.meals.flatMap(m => m.items).reduce((sum, item) => sum + (item.carbs || 0), 0)}g
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Lipides</p>
                <p className="text-xl">
                  {mealPlan.meals.flatMap(m => m.items).reduce((sum, item) => sum + (item.fat || 0), 0)}g
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanView;
