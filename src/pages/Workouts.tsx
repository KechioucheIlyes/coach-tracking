
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { Dumbbell } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Workouts = () => {
  const { student } = useStudent();
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    if (!student) {
      navigate('/');
    }
  }, [student, navigate]);

  if (!student) return null;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardHeader
          title="Entraînements"
          subtitle="Accédez à vos programmes d'entraînement"
          icon={<Dumbbell size={20} className="text-orange-500" />}
        />

        <Card className="p-6 text-center border border-orange-200 bg-orange-50 shadow-sm">
          <p className="text-muted-foreground">
            Vos programmes d'entraînement seront bientôt disponibles.
          </p>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default Workouts;
