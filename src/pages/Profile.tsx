
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import AirtableService, { Goal } from '../services/AirtableService';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { 
  FileText, 
  Target, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Weight, 
  Ruler, 
  Briefcase, 
  HeartPulse, 
  Activity, 
  Flame, 
  Utensils, 
  CalendarDays 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const Profile = () => {
  const { student } = useStudent();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is logged in
  useEffect(() => {
    if (!student) {
      navigate('/');
      return;
    }
    
    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const goalsData = await AirtableService.getStudentGoals(student.id);
        setGoals(goalsData);
      } catch (error) {
        console.error('Error fetching goals:', error);
        toast.error("Erreur lors de la récupération des objectifs");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGoals();
  }, [student, navigate]);

  if (!student) return null;
  
  // Helper to determine goal status appearance
  const getGoalStatusInfo = (status: string) => {
    switch (status) {
      case 'achieved':
        return { 
          label: 'Atteint',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4 mr-1" />
        };
      case 'in-progress':
        return { 
          label: 'En cours',
          color: 'bg-blue-100 text-blue-800',
          icon: <Clock className="h-4 w-4 mr-1" />
        };
      case 'pending':
        return { 
          label: 'À venir',
          color: 'bg-orange-100 text-orange-800',
          icon: <AlertCircle className="h-4 w-4 mr-1" />
        };
      default:
        return { 
          label: 'Inconnu',
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="h-4 w-4 mr-1" />
        };
    }
  };

  // Calculate goal progress
  const completedGoals = goals.filter(goal => goal.status === 'achieved').length;
  const totalGoals = goals.length;
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non renseigné';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
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
          title="Profil & Objectifs"
          subtitle="Consultez votre fiche bilan et vos objectifs"
          icon={<FileText size={20} />}
          backLink="/dashboard"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="md:col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-coach-500" />
                  Informations Personnelles
                </CardTitle>
                {student.status && (
                  <Badge 
                    className={`${
                      student.status === 'Actif' ? 'bg-green-100 text-green-800' : 
                      student.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                      student.status === 'Pause' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    } ml-auto`}
                  >
                    {student.status}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-coach-100 text-coach-600 rounded-full flex items-center justify-center text-3xl font-semibold">
                      {student.name.charAt(0)}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                    <p className="mt-1">{student.name}</p>
                  </div>
                  
                  {student.studentCode && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Code élève</h3>
                      <p className="mt-1">{student.studentCode}</p>
                    </div>
                  )}
                  
                  {student.email && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1">{student.email}</p>
                    </div>
                  )}
                  
                  {student.age && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Âge</h3>
                      <p className="mt-1">{student.age} ans</p>
                    </div>
                  )}
                  
                  {student.gender && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Sexe</h3>
                      <p className="mt-1">{student.gender}</p>
                    </div>
                  )}
                  
                  {student.birthDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date de naissance</h3>
                      <p className="mt-1">{formatDate(student.birthDate)}</p>
                    </div>
                  )}
                  
                  {student.profession && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Profession</h3>
                      <p className="mt-1">{student.profession}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="md:col-span-2"
          >
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Weight className="mr-2 h-5 w-5 text-coach-500" />
                    Objectifs Physiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Poids initial</h3>
                      <p className="mt-1 text-xl font-semibold">{student.initialWeight || '-'} kg</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Poids cible</h3>
                      <p className="mt-1 text-xl font-semibold">{student.targetWeight || '-'} kg</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Taille</h3>
                      <p className="mt-1 text-xl font-semibold">{student.height || '-'} cm</p>
                    </div>
                  </div>
                  
                  {student.objectives && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500">Objectif principal</h3>
                      <Badge className="mt-1 bg-coach-100 text-coach-800">
                        {student.objectives}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-coach-500" />
                    Profil Alimentaire & Activité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.activityLevel && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Niveau d'activité</h3>
                        <p className="mt-1">{student.activityLevel}</p>
                      </div>
                    )}
                    
                    {student.diet && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Régime alimentaire</h3>
                        <p className="mt-1">{student.diet}</p>
                      </div>
                    )}
                    
                    {student.mealFrequency && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Fréquence de repas</h3>
                        <p className="mt-1">{student.mealFrequency}</p>
                      </div>
                    )}
                  </div>
                  
                  {student.eatingHabits && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Habitudes alimentaires</h3>
                      <p className="mt-1 text-sm">{student.eatingHabits}</p>
                    </div>
                  )}
                  
                  {student.medicalHistory && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Antécédents médicaux & sportifs</h3>
                      <p className="mt-1 text-sm">{student.medicalHistory}</p>
                    </div>
                  )}
                  
                  {student.motivation && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Motivation</h3>
                      <p className="mt-1 text-sm">{student.motivation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-coach-500" />
                    Progression des objectifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Mes objectifs</h2>
            <p className="text-muted-foreground">Liste de vos objectifs personnels</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coach-600"></div>
            </div>
          ) : goals.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Aucun objectif défini pour le moment.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {goals.map((goal, index) => {
                const statusInfo = getGoalStatusInfo(goal.status);
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                  >
                    <Card className="overflow-hidden animated-card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{goal.description}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Date cible: {format(new Date(goal.targetDate), 'dd MMMM yyyy', { locale: fr })}</span>
                            </div>
                          </div>
                          <Badge className={statusInfo.color + " flex items-center"}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </motion.div>
    </Layout>
  );
};

export default Profile;
