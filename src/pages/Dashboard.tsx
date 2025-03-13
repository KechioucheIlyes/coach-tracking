
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { Home, FileText, Ruler, Calculator, Dumbbell, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickLinkProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  delay: number;
}

const QuickLink = ({ title, description, icon, to, delay }: QuickLinkProps) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 + 0.2, duration: 0.5 }}
    >
      <Card 
        className="h-full overflow-hidden animated-card-hover cursor-pointer" 
        onClick={() => navigate(to)}
      >
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-coach-100 text-coach-600 mr-4">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const { student } = useStudent();
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    if (!student) {
      navigate('/');
    }
  }, [student, navigate]);

  // Quick access links for the dashboard
  const quickLinks = [
    {
      title: 'Profil & Objectifs',
      description: 'Consultez vos objectifs et votre progression',
      icon: <FileText size={20} />,
      to: '/profile',
    },
    {
      title: 'Mesures',
      description: 'Suivez l\'évolution de vos mesures corporelles',
      icon: <Ruler size={20} />,
      to: '/measurements',
    },
    {
      title: 'Calculs Nutritionnels',
      description: 'BMR, BCJ et macronutriments personnalisés',
      icon: <Calculator size={20} />,
      to: '/calculations',
    },
    {
      title: 'Entraînements',
      description: 'Accédez à vos programmes d\'entraînement',
      icon: <Dumbbell size={20} />,
      to: '/workouts',
    },
    {
      title: 'Plan Alimentaire',
      description: 'Suivez votre plan alimentaire personnalisé',
      icon: <Utensils size={20} />,
      to: '/nutrition',
    },
  ];

  if (!student) return null;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardHeader
          title={`Bonjour, ${student.name}`}
          subtitle="Bienvenue dans votre espace personnel"
          icon={<Home size={20} />}
        />

        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-card p-6 mb-8">
              <h2 className="text-lg font-semibold mb-2">Votre progression</h2>
              <p className="text-muted-foreground">
                Tout votre programme et suivi personnalisé en un seul endroit.
                Consultez vos objectifs, suivez vos mesures et accédez à votre plan d'entraînement et nutritionnel.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {quickLinks.map((link, index) => (
              <QuickLink
                key={link.title}
                title={link.title}
                description={link.description}
                icon={link.icon}
                to={link.to}
                delay={index}
              />
            ))}
          </div>
        </section>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
