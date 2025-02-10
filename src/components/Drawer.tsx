import React, { ReactElement } from 'react';
import { 
  Home,
  Cloud,
  CircleUser,
  Settings,
  Proportions,
} from 'lucide-react';
import { NavLink } from 'react-router';


interface MenuItem {
    icon: ReactElement;
    label: string;
    route : string;
  }

  interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
  }

// Sidebar/Drawer Component
const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
    const menuItems: MenuItem[] = [
      { icon: <Home color='#05df72'/>, label: 'Home', route : "/" },
      { icon: <Proportions color='#05df72' />, label: 'Lands', route: "/land" },
      { icon: <Cloud color='#05df72'/>, label: 'Weather', route: "/weather" },
      {icon: <CircleUser color='#05df72' />, label: 'Profile', route: "/profile"},
      { icon: <Settings color='#05df72'/>, label: 'Settings', route: "/settings"}
    ];
  
    return (
      <div className={`
        ${isOpen ? 'w-64' : 'w-0'} 
        overflow-hidden
        bg-gray-800 
        min-h-screen 
        transition-all
        shadow-xl
      `}>
        <div className="p-4 flex flex-col gap-4">

          {menuItems.map(({ icon: Icon, label, route }) => (
            <NavLink to={route} 
              key={label}
              className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {Icon} <div className='text-white'>{label}</div>
            </NavLink>
          ))}

        </div>
      </div>
    );
  };
  
  export default Drawer