
import { ReactNode, useState, useEffect } from 'react';
import { 
  FileText, 
  Ruler, 
  Calculator, 
  Dumbbell, 
  Utensils, 
  Settings, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  icon: typeof FileText;
  path: string;
}

const Layout = ({ children }: LayoutProps) => {
  const { student, logout } = useStudent();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when changing pages
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation items
  const navItems: NavItem[] = [
    { label: 'Profil & Objectifs', icon: FileText, path: '/profile' },
    { label: 'Mesures', icon: Ruler, path: '/measurements' },
    { label: 'Calculs Nutritionnels', icon: Calculator, path: '/calculations' },
    { label: 'Entraînements', icon: Dumbbell, path: '/workouts' },
    { label: 'Plan Alimentaire', icon: Utensils, path: '/nutrition' },
  ];

  // Check if path is active
  const isActive = (path: string) => location.pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Variants for animations
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { 
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  if (!student) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white shadow-glass-card"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-800" />
        ) : (
          <Menu className="h-6 w-6 text-gray-800" />
        )}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || screenWidth >= 768) && (
          <motion.aside
            initial={screenWidth < 768 ? "closed" : undefined}
            animate={screenWidth < 768 ? (isMobileMenuOpen ? "open" : "closed") : undefined}
            variants={screenWidth < 768 ? sidebarVariants : undefined}
            exit={screenWidth < 768 ? "closed" : undefined}
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-glass-strong md:static",
              screenWidth >= 768 ? "flex flex-col" : "overflow-y-auto"
            )}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Coach sportif</h2>
              <p className="text-sm text-gray-500 mt-1">Espace personnel</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  variants={screenWidth < 768 ? itemVariants : undefined}
                  initial={screenWidth < 768 ? "closed" : undefined}
                  animate={screenWidth < 768 ? "open" : undefined}
                  custom={index}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-gray-100",
                      isActive(item.path)
                        ? "bg-coach-50 text-coach-600 font-medium"
                        : "text-gray-600"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 mr-3",
                      isActive(item.path) ? "text-coach-500" : "text-gray-500"
                    )} />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-coach-100 text-coach-600 flex items-center justify-center font-semibold">
                  {student.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-xs text-gray-500">Accès étudiant</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                <span>Déconnexion</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn(
        "flex-1 p-4 md:p-6 transition-all duration-300",
        screenWidth >= 768 ? "ml-0" : isMobileMenuOpen ? "ml-0" : "ml-0"
      )}>
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Layout;
