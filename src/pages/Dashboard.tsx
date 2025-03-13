
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import { useIsMobile } from '../hooks/use-mobile';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Ruler, 
  Calculator, 
  Dumbbell, 
  Utensils, 
  Settings,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { student, logout, isAirtableConfigured } = useStudent();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Check if user is logged in
  useEffect(() => {
    if (!student) {
      navigate('/');
    }
  }, [student, navigate]);

  if (!student) return null;
  
  const menuItems = [
    {
      title: 'Profil & Objectifs',
      description: 'Consultez votre fiche bilan et vos objectifs',
      icon: <FileText size={24} />,
      href: '/profile',
      color: 'bg-blue-500'
    },
    {
      title: 'Mesures',
      description: 'Suivez l\'évolution de vos mesures corporelles',
      icon: <Ruler size={24} />,
      href: '/measurements',
      color: 'bg-green-500'
    },
    {
      title: 'Calculs Nutritionnels',
      description: 'BMR, BCJ et macronutriments personnalisés',
      icon: <Calculator size={24} />,
      href: '/calculations',
      color: 'bg-purple-500'
    },
    {
      title: 'Entraînements',
      description: 'Accédez à vos programmes d\'entraînement',
      icon: <Dumbbell size={24} />,
      href: '/workouts',
      color: 'bg-orange-500'
    },
    {
      title: 'Plan Alimentaire',
      description: 'Suivez votre plan alimentaire personnalisé',
      icon: <Utensils size={24} />,
      href: '/nutrition',
      color: 'bg-red-500'
    },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bienvenue, {student.name}</h1>
            <p className="text-muted-foreground">
              Accédez à votre espace personnel pour suivre vos progrès
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {!isAirtableConfigured && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="font-medium text-yellow-800">Connectez votre base Airtable</p>
                <p className="text-sm text-yellow-700">
                  Configurez votre base Airtable pour accéder à vos données réelles
                </p>
              </div>
              <Button 
                className="bg-yellow-600 hover:bg-yellow-700 text-white w-full md:w-auto"
                onClick={() => navigate('/airtable-config')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurer Airtable
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow overflow-hidden animated-card">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center text-white mb-4`}>
                    {item.icon}
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    className="w-full bg-coach-500 hover:bg-coach-600 text-white" 
                    onClick={() => navigate(item.href)}
                  >
                    Accéder
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
