
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader';
import { Dumbbell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AirtableService from '@/services/AirtableService';
import { Workout } from '@/services/types/airtable.types';
import WorkoutCard from '@/components/workouts/WorkoutCard';
import WorkoutHistoryTable from '@/components/workouts/WorkoutHistoryTable';
import { Skeleton } from '@/components/ui/skeleton';

const Workouts = () => {
  const { student } = useStudent();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is logged in
  useEffect(() => {
    if (!student) {
      navigate('/');
    } else {
      fetchWorkouts();
    }
  }, [student, navigate]);

  const fetchWorkouts = async () => {
    if (student) {
      setIsLoading(true);
      try {
        const fetchedWorkouts = await AirtableService.getStudentWorkouts(student.id);
        setWorkouts(fetchedWorkouts);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get the most recent workout (already sorted in the service)
  const latestWorkout = workouts.length > 0 ? workouts[0] : null;
  // Get the rest of the workouts for history
  const workoutHistory = workouts.slice(1);

  if (!student) return null;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 pb-8 bg-orange-50 rounded-lg"
      >
        <DashboardHeader
          title="Entraînements"
          subtitle="Accédez à vos programmes d'entraînement"
          icon={<Dumbbell size={20} className="text-orange-500" />}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        )}

        {/* No workouts state */}
        {!isLoading && workouts.length === 0 && (
          <Card className="p-6 mt-6 text-center border border-orange-200 bg-orange-50 shadow-sm">
            <p className="text-muted-foreground">
              Aucun entraînement disponible pour le moment.
            </p>
          </Card>
        )}

        {/* Latest workout */}
        {!isLoading && latestWorkout && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Dernier entraînement</h2>
            <WorkoutCard workout={latestWorkout} />
          </div>
        )}

        {/* Workout history */}
        {!isLoading && workoutHistory.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Historique des entraînements</h2>
            <WorkoutHistoryTable workouts={workoutHistory} />
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Workouts;
