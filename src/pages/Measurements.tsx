
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import AirtableService, { Measurement, Goal } from '../services/AirtableService';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { Ruler, Target, CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown, ArrowRight, Scale, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, compareDesc } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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
          compareDesc(new Date(a.date), new Date(b.date))
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
  const calculateDifference = (current: number | undefined, previous: number | undefined) => {
    if (current === undefined || previous === undefined) return { value: '-', isPositive: false, isNeutral: true };
    
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
  
  // Prepare data for weight chart (in chronological order for the chart)
  const weightChartData = [...measurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: format(new Date(m.date), 'dd/MM/yy', { locale: fr }),
      fullDate: m.date,
      weight: m.weight,
    }));
    
  // Prepare data for body composition chart (in chronological order for the chart)
  const bodyCompositionChartData = [...measurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: format(new Date(m.date), 'dd/MM/yy', { locale: fr }),
      fullDate: m.date,
      bodyFat: m.bodyFat || 0,
      muscle: m.musclePercentage || 0,
      water: m.water || 0,
    }))
    .filter(data => data.bodyFat > 0 || data.muscle > 0);
    
  // Prepare data for measurements chart (in chronological order for the chart)
  const measurementsChartData = [...measurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: format(new Date(m.date), 'dd/MM/yy', { locale: fr }),
      fullDate: m.date,
      waist: m.waistCircumference || 0,
      hip: m.hipCircumference || 0,
      chest: m.chestCircumference || 0,
    }))
    .filter(data => data.waist > 0 || data.hip > 0 || data.chest > 0);
  
  // Helper function to format dates on the UI
  const formatMeasurementDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

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
                      Dernière mesure: {latestMeasurement ? formatMeasurementDate(latestMeasurement.date) : 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {latestMeasurement ? (
                      <>
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
                        
                        {latestMeasurement.weightLost !== undefined && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-sm text-gray-500">Poids perdu depuis le début</div>
                            <div className="font-semibold text-xl">
                              {Math.abs(latestMeasurement.weightLost).toFixed(1)} kg
                            </div>
                          </div>
                        )}
                        
                        {latestMeasurement.weightRemaining !== undefined && (
                          <div className="mt-2">
                            <div className="text-sm text-gray-500">Restant pour atteindre l'objectif</div>
                            <div className="font-semibold text-xl">
                              {Math.abs(latestMeasurement.weightRemaining).toFixed(1)} kg
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-gray-500">Données non disponibles</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="md:col-span-2"
              >
                <Card className="overflow-hidden h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-coach-500" />
                      Composition corporelle
                    </CardTitle>
                    <CardDescription>
                      Dernière mesure: {latestMeasurement ? formatMeasurementDate(latestMeasurement.date) : 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {latestMeasurement?.bodyFat !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Masse grasse</h3>
                          <p className="text-xl font-semibold">
                            {latestMeasurement.bodyFat}
                            <span className="text-base font-normal text-gray-500">%</span>
                          </p>
                          
                          {previousMeasurement?.bodyFat !== undefined && (
                            <div className="flex items-center text-xs">
                              {(() => {
                                const diff = calculateDifference(latestMeasurement.bodyFat, previousMeasurement.bodyFat);
                                return (
                                  <>
                                    {diff.isNeutral ? (
                                      <ArrowRight className="h-3 w-3 mr-1 text-gray-500" />
                                    ) : diff.isPositive ? (
                                      <ChevronUp className="h-3 w-3 mr-1 text-red-500" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3 mr-1 text-green-500" />
                                    )}
                                    <span 
                                      className={diff.isNeutral ? 'text-gray-500' : (diff.isPositive ? 'text-red-500' : 'text-green-500')}
                                    >
                                      {diff.value}%
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {latestMeasurement?.musclePercentage !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Masse musculaire</h3>
                          <p className="text-xl font-semibold">
                            {latestMeasurement.musclePercentage}
                            <span className="text-base font-normal text-gray-500">%</span>
                          </p>
                          
                          {previousMeasurement?.musclePercentage !== undefined && (
                            <div className="flex items-center text-xs">
                              {(() => {
                                const diff = calculateDifference(latestMeasurement.musclePercentage, previousMeasurement.musclePercentage);
                                return (
                                  <>
                                    {diff.isNeutral ? (
                                      <ArrowRight className="h-3 w-3 mr-1 text-gray-500" />
                                    ) : diff.isPositive ? (
                                      <ChevronUp className="h-3 w-3 mr-1 text-green-500" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3 mr-1 text-red-500" />
                                    )}
                                    <span 
                                      className={diff.isNeutral ? 'text-gray-500' : (diff.isPositive ? 'text-green-500' : 'text-red-500')}
                                    >
                                      {diff.value}%
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {latestMeasurement?.water !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Eau</h3>
                          <p className="text-xl font-semibold">
                            {latestMeasurement.water}
                            <span className="text-base font-normal text-gray-500">%</span>
                          </p>
                          
                          {previousMeasurement?.water !== undefined && (
                            <div className="flex items-center text-xs">
                              {(() => {
                                const diff = calculateDifference(latestMeasurement.water, previousMeasurement.water);
                                return (
                                  <>
                                    {diff.isNeutral ? (
                                      <ArrowRight className="h-3 w-3 mr-1 text-gray-500" />
                                    ) : diff.isPositive ? (
                                      <ChevronUp className="h-3 w-3 mr-1 text-blue-500" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3 mr-1 text-orange-500" />
                                    )}
                                    <span 
                                      className={diff.isNeutral ? 'text-gray-500' : (diff.isPositive ? 'text-blue-500' : 'text-orange-500')}
                                    >
                                      {diff.value}%
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Weight Evolution Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
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
                    {weightChartData.length > 0 ? (
                      <ChartContainer 
                        className="w-full"
                        config={{
                          weight: { label: "Poids", color: "#0ea5e9" },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={weightChartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }} 
                              tickLine={false}
                              axisLine={{ stroke: '#f0f0f0' }}
                            />
                            <YAxis 
                              domain={['auto', 'auto']} 
                              tick={{ fontSize: 12 }} 
                              tickLine={false}
                              axisLine={{ stroke: '#f0f0f0' }}
                            />
                            <ChartTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                      <div className="font-medium">{formatMeasurementDate(data.fullDate)}</div>
                                      <div className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{data.weight} kg</span> de poids
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="weight" 
                              stroke="var(--color-weight, #0ea5e9)" 
                              strokeWidth={2} 
                              dot={{ r: 4, strokeWidth: 2, fill: 'white' }} 
                              activeDot={{ r: 6, strokeWidth: 0, fill: "#0ea5e9" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex justify-center items-center h-full">
                        <span className="text-muted-foreground">Pas assez de données pour afficher un graphique</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Body Composition Chart */}
            {bodyCompositionChartData.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mb-8"
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Composition corporelle</CardTitle>
                    <CardDescription>
                      Évolution de votre composition corporelle au fil du temps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ChartContainer 
                        className="w-full"
                        config={{
                          bodyFat: { label: "Masse grasse", color: "#ef4444" },
                          muscle: { label: "Masse musculaire", color: "#22c55e" },
                          water: { label: "Eau", color: "#0ea5e9" },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={bodyCompositionChartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }} 
                              tickLine={false}
                              axisLine={{ stroke: '#f0f0f0' }}
                            />
                            <YAxis 
                              domain={['auto', 'auto']} 
                              tick={{ fontSize: 12 }} 
                              tickLine={false}
                              axisLine={{ stroke: '#f0f0f0' }}
                            />
                            <ChartTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                      <div className="font-medium">{formatMeasurementDate(data.fullDate)}</div>
                                      {data.bodyFat > 0 && (
                                        <div className="grid grid-flow-col items-center gap-1 text-sm text-muted-foreground">
                                          <div className="h-2 w-2 rounded-full bg-red-500" />
                                          <span className="font-medium text-foreground">{data.bodyFat}%</span> de masse grasse
                                        </div>
                                      )}
                                      {data.muscle > 0 && (
                                        <div className="grid grid-flow-col items-center gap-1 text-sm text-muted-foreground">
                                          <div className="h-2 w-2 rounded-full bg-green-500" />
                                          <span className="font-medium text-foreground">{data.muscle}%</span> de masse musculaire
                                        </div>
                                      )}
                                      {data.water > 0 && (
                                        <div className="grid grid-flow-col items-center gap-1 text-sm text-muted-foreground">
                                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                                          <span className="font-medium text-foreground">{data.water}%</span> d'eau
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend />
                            {bodyCompositionChartData.some(d => d.bodyFat > 0) && (
                              <Line 
                                type="monotone" 
                                dataKey="bodyFat" 
                                name="Masse grasse"
                                stroke="var(--color-bodyFat, #ef4444)" 
                                strokeWidth={2} 
                                dot={{ r: 4, strokeWidth: 2, fill: 'white' }} 
                                activeDot={{ r: 6, strokeWidth: 0, fill: "#ef4444" }}
                              />
                            )}
                            {bodyCompositionChartData.some(d => d.muscle > 0) && (
                              <Line 
                                type="monotone" 
                                dataKey="muscle" 
                                name="Masse musculaire"
                                stroke="var(--color-muscle, #22c55e)" 
                                strokeWidth={2} 
                                dot={{ r: 4, strokeWidth: 2, fill: 'white' }} 
                                activeDot={{ r: 6, strokeWidth: 0, fill: "#22c55e" }}
                              />
                            )}
                            {bodyCompositionChartData.some(d => d.water > 0) && (
                              <Line 
                                type="monotone" 
                                dataKey="water" 
                                name="Eau"
                                stroke="var(--color-water, #0ea5e9)" 
                                strokeWidth={2} 
                                dot={{ r: 4, strokeWidth: 2, fill: 'white' }} 
                                activeDot={{ r: 6, strokeWidth: 0, fill: "#0ea5e9" }}
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Measurement History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Historique des mesures</h2>
                <p className="text-muted-foreground">Toutes vos mesures enregistrées, triées par date décroissante</p>
              </div>
              
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Poids (kg)</TableHead>
                        <TableHead>Masse grasse (%)</TableHead>
                        <TableHead>Masse musculaire (%)</TableHead>
                        <TableHead>Tour de taille (cm)</TableHead>
                        <TableHead>Tour de hanches (cm)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {measurements.map((measurement) => (
                        <TableRow key={measurement.id}>
                          <TableCell className="font-medium">{formatMeasurementDate(measurement.date)}</TableCell>
                          <TableCell>{measurement.weight}</TableCell>
                          <TableCell>{measurement.bodyFat || '-'}</TableCell>
                          <TableCell>{measurement.musclePercentage || '-'}</TableCell>
                          <TableCell>{measurement.waistCircumference || '-'}</TableCell>
                          <TableCell>{measurement.hipCircumference || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </Layout>
  );
};

export default Measurements;
