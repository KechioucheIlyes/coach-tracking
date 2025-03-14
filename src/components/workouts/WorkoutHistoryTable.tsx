
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Workout } from "@/services/types/airtable.types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import WorkoutCard from "./WorkoutCard";

interface WorkoutHistoryTableProps {
  workouts: Workout[];
}

const WorkoutHistoryTable = ({ workouts }: WorkoutHistoryTableProps) => {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  
  return (
    <div className="space-y-6">
      {selectedWorkout && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              className="text-orange-600 hover:text-orange-700 p-0 h-auto"
              onClick={() => setSelectedWorkout(null)}
            >
              <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
              <span>Retour à l'historique</span>
            </Button>
          </div>
          <WorkoutCard workout={selectedWorkout} />
        </div>
      )}
      
      {!selectedWorkout && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Semaine</TableHead>
                <TableHead>Bloc</TableHead>
                <TableHead>Jour</TableHead>
                <TableHead>Partie</TableHead>
                <TableHead>Exercices</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workouts.map((workout) => (
                <TableRow key={workout.id}>
                  <TableCell className="font-medium">
                    {format(new Date(workout.week), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>{workout.block}</TableCell>
                  <TableCell>{workout.day}</TableCell>
                  <TableCell>{workout.part}</TableCell>
                  <TableCell>{workout.exercises.length}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-orange-600 hover:text-orange-700"
                      onClick={() => setSelectedWorkout(workout)}
                    >
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default WorkoutHistoryTable;
