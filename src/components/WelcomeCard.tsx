import React from 'react';


// Custom type for Lucide icons
type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

// Types and Interfaces
interface WelcomeCardProps {
  title: string;
  icon: IconComponent;
  children: React.ReactNode;
}






// Card Component
const WelcomeCard: React.FC<WelcomeCardProps> = ({ title, icon: Icon, children }) => 
{
    return(
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <h2 className="text-xl mb-4 font-bold flex items-center gap-2 text-green-400">
      <Icon /> {title}
    </h2>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);
}

export default WelcomeCard;