import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { LucideIcon } from 'lucide-react';

// Types and Interfaces
interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

// Card Component
const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon: Icon, children }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300`}>
      <h2 className={`text-xl mb-4 font-bold flex items-center gap-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
        <Icon size={24} /> {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
// Metric Row Component

