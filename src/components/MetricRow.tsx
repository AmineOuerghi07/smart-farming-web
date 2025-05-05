import { LucideIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MetricRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor?: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ icon: Icon, label, value, iconColor }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Icon className={iconColor || (darkMode ? 'text-green-400' : 'text-green-600')} size={18} />
        <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

export default MetricRow;