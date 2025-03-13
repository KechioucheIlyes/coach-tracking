
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Login = () => {
  const { student, accessCode, setAccessCode, login, isLoading } = useStudent();
  const navigate = useNavigate();
  
  // If student is already logged in, redirect to dashboard
  useEffect(() => {
    if (student) {
      navigate('/dashboard');
    }
  }, [student, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast.error("Veuillez saisir un code d'accès");
      return;
    }
    
    // En mode démonstration, vous pouvez utiliser 'access123'
    await login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coach-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 md:p-10 w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-coach-100 rounded-2xl flex items-center justify-center mb-4">
              <svg 
                className="w-8 h-8 text-coach-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Espace Personnel</h1>
            <p className="text-muted-foreground text-sm">
              Accédez à votre suivi personnalisé
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="accessCode" 
                className="block text-sm font-medium text-gray-700"
              >
                Code d'accès
              </label>
              <Input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Entrez votre code d'accès"
                className="w-full"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Utilisez le code fourni par votre coach (pour la démo: access123)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-coach-600 hover:bg-coach-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Connexion en cours..." : "Accéder à mon espace"}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>Besoin d'aide ? Contactez votre coach.</p>
            <p className="mt-1">© {new Date().getFullYear()} Coach Sportif</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
