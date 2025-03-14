
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { Utensils } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MealPlan } from '@/services/types/airtable.types';
import AirtableService from '@/services/AirtableService';
import MealPlanView from '@/components/nutrition/MealPlanView';
import MealPlanHistoryTable from '@/components/nutrition/MealPlanHistoryTable';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Create a client
const queryClient = new QueryClient();

// Wrapper component with the query client
const NutritionContent = () => {
  const { student } = useStudent();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('latest');
  
  // Check if user is logged in
  useEffect(() => {
    if (!student) {
      navigate('/');
    }
  }, [student, navigate]);

  // Fetch meal plans data
  const { data: mealPlans = [], isLoading, error } = useQuery({
    queryKey: ['mealPlans', student?.id],
    queryFn: () => student ? AirtableService.getStudentMealPlans(student.id) : Promise.resolve([]),
    enabled: !!student,
  });

  // Sort meal plans by date (newest first)
  const sortedMealPlans = [...mealPlans].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get the latest meal plan
  const latestMealPlan = sortedMealPlans.length > 0 ? sortedMealPlans[0] : null;

  if (!student) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 pb-8 bg-red-50 rounded-lg"
    >
      <DashboardHeader
        title="Plan Alimentaire"
        subtitle="Suivez votre plan alimentaire personnalisé"
        icon={<Utensils size={20} className="text-red-500" />}
      />

      {isLoading ? (
        <Card className="p-6 mt-6 text-center border border-red-200 bg-red-50 shadow-sm">
          <p className="text-muted-foreground">Chargement du plan alimentaire...</p>
        </Card>
      ) : error ? (
        <Card className="p-6 mt-6 text-center border border-red-200 bg-red-50 shadow-sm">
          <p className="text-red-500">Erreur lors du chargement du plan alimentaire.</p>
        </Card>
      ) : mealPlans.length === 0 ? (
        <Card className="p-6 mt-6 text-center border border-red-200 bg-red-50 shadow-sm">
          <p className="text-muted-foreground">
            Votre plan alimentaire personnalisé sera bientôt disponible.
          </p>
        </Card>
      ) : (
        <div className="mt-6">
          <Tabs defaultValue="latest" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white">
              <TabsTrigger value="latest">Dernier plan</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>
            
            <TabsContent value="latest" className="pt-4">
              {latestMealPlan && <MealPlanView mealPlan={latestMealPlan} />}
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              <MealPlanHistoryTable mealPlans={sortedMealPlans} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </motion.div>
  );
};

// Main component that wraps the content with the QueryClientProvider
const Nutrition = () => {
  return (
    <Layout>
      <QueryClientProvider client={queryClient}>
        <NutritionContent />
      </QueryClientProvider>
    </Layout>
  );
};

export default Nutrition;
