
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { 
  FileText, 
  User, 
  Weight, 
  Briefcase, 
  Activity, 
  Utensils, 
  CalendarDays 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Profile = () => {
  const { student } = useStudent();
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    if (!student) {
      navigate('/');
      return;
    }
  }, [student, navigate]);

  if (!student) return null;

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
                    <Utensils className="mr-2 h-5 w-5 text-coach-500" />
                    Profil Alimentaire
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-coach-500" />
                    Activité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.activityLevel && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Niveau d'activité</h3>
                      <p className="mt-1">{student.activityLevel}</p>
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
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Profile;
