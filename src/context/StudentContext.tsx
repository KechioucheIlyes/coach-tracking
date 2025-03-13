
import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AirtableService, { Student } from '../services/AirtableService';

interface StudentContextType {
  student: Student | null;
  isLoading: boolean;
  accessCode: string;
  setAccessCode: (code: string) => void;
  login: (code?: string) => Promise<boolean>;
  logout: () => void;
  isAirtableConfigured: boolean;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [accessCode, setAccessCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAirtableConfigured, setIsAirtableConfigured] = useState<boolean>(true); // Pré-configuré maintenant
  const navigate = useNavigate();

  // Vérifier la configuration d'Airtable et la session sauvegardée
  useEffect(() => {
    // La configuration est maintenant définie par défaut dans le service
    setIsAirtableConfigured(true);
    
    const savedAccessCode = localStorage.getItem('accessCode');
    if (savedAccessCode) {
      setAccessCode(savedAccessCode);
      login(savedAccessCode);
    }
  }, []);

  const login = async (code?: string) => {
    setIsLoading(true);
    const codeToUse = code || accessCode;
    
    try {
      const studentData = await AirtableService.verifyAccess(codeToUse);
      
      if (studentData) {
        setStudent(studentData);
        localStorage.setItem('accessCode', codeToUse);
        toast.success(`Bienvenue, ${studentData.name} !`);
        navigate('/dashboard');
        return true;
      } else {
        toast.error("Code d'accès invalide");
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Erreur lors de la connexion");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setStudent(null);
    setAccessCode('');
    localStorage.removeItem('accessCode');
    navigate('/');
    toast.success('Déconnexion réussie');
  };

  return (
    <StudentContext.Provider value={{
      student,
      isLoading,
      accessCode,
      setAccessCode,
      login,
      logout,
      isAirtableConfigured
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
