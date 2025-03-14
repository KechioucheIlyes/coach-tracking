
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  action?: ReactNode;
}

const DashboardHeader = ({
  title,
  subtitle,
  icon,
  className,
  action
}: DashboardHeaderProps) => {
  return (
    <div className={cn(
      "mb-8 flex flex-col space-y-3",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon && (
            <div className="mr-3 p-2 rounded-full bg-coach-100 text-coach-600">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
