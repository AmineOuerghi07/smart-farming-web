import React from "react";
import { useTheme } from '../context/ThemeContext';

interface StatusMessageProps {
    message: string;
    color?: string;
  }
// Status Message Component
const StatusMessage: React.FC<StatusMessageProps> = ({ message, color }) => {
  const { darkMode } = useTheme();
  
  const defaultColor = darkMode ? 'text-green-400' : 'text-green-600';
  
  return (
    <div className={`mt-2 text-sm ${color || defaultColor}`}>
      {message}
    </div>
  );
}

export default StatusMessage