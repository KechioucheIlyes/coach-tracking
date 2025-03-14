
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
        className="bg-orange-50 px-4 py-6 rounded-lg"
      >
        <DashboardHeader
          title="Entraînements"
          subtitle="Accédez à vos programmes d'entraînement"
          icon={<Dumbbell size={20} />}
          className="bg-white p-4 rounded-lg shadow-sm mb-6"
        />

        <Card className="p-6 text-center border-orange-200 shadow-sm">
          <p className="text-muted-foreground">
            Vos programmes d'entraînement seront bientôt disponibles.
          </p>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default Workouts;
