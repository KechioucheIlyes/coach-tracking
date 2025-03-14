
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import AirtableService, { Calculation } from '../services/AirtableService';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { Calculator, Flame, BarChart3, Sandwich } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const Calculations = () => {
  const { student } = useStudent();
  const navigate = useNavigate();
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!student) {
      navigate('/');
      return;
    }
    
    const fetchCalculations = async () => {
      setIsLoading(true);
      try {
        const calculationsData = await AirtableService.getStudentCalculations(student.id);
        if (calculationsData.length > 0) {
          const sortedCalculations = calculationsData.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setCalculation(sortedCalculations[0]);
        }
      } catch (error) {
        console.error('Error fetching calculations:', error);
        toast.error("Erreur lors de la récupération des calculs");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCalculations();
  }, [student, navigate]);

  if (!student) return null;
  
  const macroData = calculation ? [
    { name: 'Protéines', value: calculation.protein, color: '#8B5CF6' },
    { name: 'Glucides', value: calculation.carbs, color: '#eab308' },
    { name: 'Lipides', value: calculation.fat, color: '#f97316' }
  ] : [];
  
  const calculateCalories = (protein: number, carbs: number, fat: number) => {
    return (protein * 4) + (carbs * 4) + (fat * 9);
  };
  
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 pb-8 bg-purple-50 rounded-lg"
      >
        <DashboardHeader
          title="Calculs Nutritionnels"
          subtitle="BMR, BCJ et macronutriments personnalisés"
          icon={<Calculator size={20} className="text-purple-500" />}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : !calculation ? (
          <Card className="p-6 mt-6 text-center border border-purple-200 bg-purple-50">
            <p className="text-muted-foreground">Aucun calcul nutritionnel disponible pour le moment.</p>
          </Card>
        ) : (
          <>
            <div className="mt-6 mb-4 glass-card p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-muted-foreground text-sm">
                Dernière mise à jour: {format(new Date(calculation.date), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Card className="overflow-hidden h-full border border-purple-200 bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flame className="h-5 w-5 mr-2 text-purple-500" />
                      Métabolisme de Base (BMR)
                    </CardTitle>
                    <CardDescription>
                      Calories nécessaires au repos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {formatNumber(calculation.bmr)} <span className="text-base font-normal text-gray-500">kcal</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Le métabolisme de base représente les calories dont votre corps a besoin pour maintenir ses fonctions vitales au repos.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="overflow-hidden h-full border border-purple-200 bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                      Besoin Calorique Journalier (BCJ)
                    </CardTitle>
                    <CardDescription>
                      Calories nécessaires avec activité
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {formatNumber(calculation.bcj)} <span className="text-base font-normal text-gray-500">kcal</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Le BCJ prend en compte votre niveau d'activité physique et représente la quantité de calories dont vous avez besoin quotidiennement.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8"
            >
              <Card className="border border-purple-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sandwich className="h-5 w-5 mr-2 text-purple-500" />
                    Répartition des macronutriments
                  </CardTitle>
                  <CardDescription>
                    Distribution recommandée des protéines, glucides et lipides
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2 h-64 mb-6 md:mb-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={macroData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {macroData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string) => [`${value}g`, name]}
                          contentStyle={{ 
                            background: 'white', 
                            border: '1px solid #f0f0f0',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 rounded-full bg-coach-500 mr-2"></div>
                          <h3 className="font-medium">Protéines</h3>
                        </div>
                        <div className="flex justify-between">
                          <span>{calculation.protein}g</span>
                          <span className="text-gray-500">{calculation.protein * 4} kcal</span>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                          <h3 className="font-medium">Glucides</h3>
                        </div>
                        <div className="flex justify-between">
                          <span>{calculation.carbs}g</span>
                          <span className="text-gray-500">{calculation.carbs * 4} kcal</span>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                          <h3 className="font-medium">Lipides</h3>
                        </div>
                        <div className="flex justify-between">
                          <span>{calculation.fat}g</span>
                          <span className="text-gray-500">{calculation.fat * 9} kcal</span>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-coach-50 text-coach-800">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>{calculateCalories(calculation.protein, calculation.carbs, calculation.fat)} kcal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="border border-purple-200 bg-white">
                <CardHeader>
                  <CardTitle>À quoi servent ces calculs ?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    <strong>Métabolisme de Base (BMR)</strong> : C'est la quantité d'énergie que votre corps dépense au repos pour maintenir ses fonctions vitales (respiration, circulation sanguine, etc.). Il est calculé en fonction de votre âge, poids, taille et sexe.
                  </p>
                  
                  <p>
                    <strong>Besoin Calorique Journalier (BCJ)</strong> : Il prend en compte votre BMR et y ajoute l'énergie dépensée par vos activités quotidiennes et l'exercice physique. C'est un indicateur de la quantité de calories que vous devriez consommer quotidiennement.
                  </p>
                  
                  <p>
                    <strong>Macronutriments</strong> : La répartition entre protéines, glucides et lipides est personnalisée en fonction de vos objectifs. Les protéines sont essentielles pour la construction musculaire, les glucides fournissent de l'énergie, et les lipides sont importants pour diverses fonctions hormonales et cellulaires.
                  </p>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-purple-800 border border-purple-200">
                    <p className="font-medium mb-1">Note importante :</p>
                    <p className="text-sm">Ces calculs sont des estimations basées sur des formules scientifiques, mais ils peuvent varier selon votre métabolisme individuel. Utilisez-les comme guide et ajustez en fonction de vos résultats réels.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </Layout>
  );
};

export default Calculations;
