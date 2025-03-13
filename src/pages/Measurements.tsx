
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import AirtableService, { Measurement, Goal } from '../services/AirtableService';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { Ruler, Target, CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown, ArrowRight, Scale, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

const Measurements = () => {
  const { student } = useStudent();
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  
  // Check if user is logged in
  useEffect(() => {
    if (!student) {
      navigate('/');
      return;
    }
    
    const fetchMeasurements = async () => {
      setIsLoading(true);
      try {
        const measurementsData = await AirtableService.getStudentMeasurements(student.id);
        // Sort by date (newest first)
        setMeasurements(measurementsData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      } catch (error) {
        console.error('Error fetching measurements:', error);
        toast.error("Erreur lors de la récupération des mesures");
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchGoals = async () => {
      setIsLoadingGoals(true);
      try {
        const goalsData = await AirtableService.getStudentGoals(student.id);
        setGoals(goalsData);
      } catch (error) {
        console.error('Error fetching goals:', error);
        toast.error("Erreur lors de la récupération des objectifs");
      } finally {
        setIsLoadingGoals(false);
      }
    };
    
    fetchMeasurements();
    fetchGoals();
  }, [student, navigate]);

  if (!student) return null;
  
  // Get latest measurement
  const latestMeasurement = measurements[0];
  
  // Get previous measurement for comparison
  const previousMeasurement = measurements[1];
  
  // Calculate differences for trend indicators
  const calculateDifference = (current: number, previous: number) => {
    const diff = current - previous;
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive: diff > 0,
      isNeutral: diff === 0
    };
  };
  
  // Calculate goal progress
  const completedGoals = goals.filter(goal => goal.status === 'achieved').length;
  const totalGoals = goals.length;
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  
  // Prepare data for charts
  const chartData = [...measurements].reverse().map(m => ({
    date: format(new Date(m.date), 'dd/MM', { locale: fr }),
    weight: m.weight,
    bodyFat: m.bodyFat || 0,
    muscle: m.musclePercentage || 0
  }));

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardHeader
          title="Mesures"
          subtitle="Suivez l'évolution de vos mesures corporelles"
          icon={<Ruler size={20} />}
          backLink="/dashboard"
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coach-600"></div>
          </div>
        ) : measurements.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Aucune mesure enregistrée pour le moment.</p>
          </Card>
        ) : (
          <>
            {/* Progression des objectifs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-8"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-coach-500" />
                    Progression des objectifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingGoals ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coach-600"></div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Progression</span>
                          <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                          <span>Objectifs atteints: {completedGoals}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          <span>Objectifs en cours: {goals.filter(g => g.status === 'in-progress').length}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                          <span>Objectifs à venir: {goals.filter(g => g.status === 'pending').length}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Latest Measurements Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="overflow-hidden h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Scale className="h-5 w-5 mr-2 text-coach-500" />
                      Poids
                    </CardTitle>
                    <CardDescription>
                      Dernière mesure: {format(new Date(latestMeasurement.date), 'dd MMMM yyyy', { locale: fr })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {latestMeasurement.weight} <span className="text-base font-normal text-gray-500">kg</span>
                    </div>
                    
                    {previousMeasurement && (
                      <div className="flex items-center text-sm">
                        {(() => {
                          const diff = calculateDifference(latestMeasurement.weight, previousMeasurement.weight);
                          return (
                            <>
                              {diff.isNeutral ? (
                                <ArrowRight className="h-4 w-4 mr-1 text-gray-500" />
                              ) : diff.isPositive ? (
                                <ChevronUp className="h-4 w-4 mr-1 text-red-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 mr-1 text-green-500" />
                              )}
                              <span 
                                className={diff.isNeutral ? 'text-gray-500' : (diff.isPositive ? 'text-red-500' : 'text-green-500')}
                              >
                                {diff.value} kg depuis la dernière mesure
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="overflow-hidden h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Ruler className="h-5 w-5 mr-2 text-coach-500" />
                      Taille
                    </CardTitle>
                    <CardDescription>
                      Dernière mesure: {format(new Date(latestMeasurement.date), 'dd MMMM yyyy', { locale: fr })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {latestMeasurement.height} <span className="text-base font-normal text-gray-500">cm</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      <span>Mesure de référence</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {latestMeasurement.bodyFat && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Card className="overflow-hidden h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        Masse grasse
                      </CardTitle>
                      <CardDescription>
                        Dernière mesure: {format(new Date(latestMeasurement.date), 'dd MMMM yyyy', { locale: fr })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">
                        {latestMeasurement.bodyFat} <span className="text-base font-normal text-gray-500">%</span>
                      </div>
                      
                      {previousMeasurement && previousMeasurement.bodyFat && (
                        <div className="flex items-center text-sm">
                          {(() => {
                            const diff = calculateDifference(latestMeasurement.bodyFat!, previousMeasurement.bodyFat!);
                            return (
                              <>
                                {diff.isNeutral ? (
                                  <ArrowRight className="h-4 w-4 mr-1 text-gray-500" />
                                ) : diff.isPositive ? (
                                  <ChevronUp className="h-4 w-4 mr-1 text-red-500" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 mr-1 text-green-500" />
                                )}
                                <span 
                                  className={diff.isNeutral ? 'text-gray-500' : (diff.isPositive ? 'text-red-500' : 'text-green-500')}
                                >
                                  {diff.value}% depuis la dernière mesure
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Weight Evolution Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mb-8"
            >
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Évolution du poids</CardTitle>
                  <CardDescription>
                    Historique de l'évolution de votre poids sur la période
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                          axisLine={{ stroke: '#f0f0f0' }}
                        />
                        <YAxis 
                          domain={['dataMin - 2', 'dataMax + 2']} 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                          axisLine={{ stroke: '#f0f0f0' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'white', 
                            border: '1px solid #f0f0f0',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                          }}
                          formatter={(value: number) => [`${value} kg`, 'Poids']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#0ea5e9" 
                          strokeWidth={2} 
                          dot={{ r: 4, strokeWidth: 2, fill: 'white' }} 
                          activeDot={{ r: 6, strokeWidth: 0, fill: '#0ea5e9' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Measurement History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Historique des mesures</h2>
                <p className="text-muted-foreground">Toutes vos mesures enregistrées</p>
              </div>
              
              <div className="space-y-4">
                {measurements.map((measurement, index) => (
                  <Card key={measurement.id} className="overflow-hidden animated-card-hover">
                    <CardContent className="p-6">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold">
                            {format(new Date(measurement.date), 'dd MMMM yyyy', { locale: fr })}
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Poids</p>
                            <p className="font-medium">{measurement.weight} kg</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Taille</p>
                            <p className="font-medium">{measurement.height} cm</p>
                          </div>
                          
                          {measurement.bodyFat && (
                            <div>
                              <p className="text-sm text-gray-500">Masse grasse</p>
                              <p className="font-medium">{measurement.bodyFat}%</p>
                            </div>
                          )}
                          
                          {measurement.musclePercentage && (
                            <div>
                              <p className="text-sm text-gray-500">Masse musculaire</p>
                              <p className="font-medium">{measurement.musclePercentage}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </Layout>
  );
};

export default Measurements;
