import { useState } from 'react';
import { Menu, ShoppingCart, Sun, Moon } from 'lucide-react';
import Drawer from './components/Drawer';
import { Outlet } from 'react-router';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className={`w-full ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'} min-h-screen transition-colors duration-300`}>
      <nav className={`${darkMode ? 'bg-green-700' : 'bg-green-600'} p-4 flex justify-between items-center shadow-lg transition-colors duration-300`}>
        <div className="flex items-center gap-4">
          <a
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-2 hover:bg-green-800 rounded-lg transition-colors cursor-pointer"
          >
            <Menu size={24} color='white' />
          </a>
          <h1 className="text-xl font-semi-bold text-white">Farm Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg hover:bg-green-800 transition-colors`}
            title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {darkMode ? <Sun size={20} color="white" /> : <Moon size={20} color="white" />}
          </button>
          <a href='/ShoppingCart' className="flex items-center space-x-4 hover:bg-green-800 p-2 rounded-lg transition-colors">
            <div className="p-2 relative">
              <ShoppingCart size={24} color="white" />
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">0</span>
            </div>
            <span className="text-white">0.000 DT</span>
          </a>
        </div>
      </nav>
      <div className="flex">
        <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        <Outlet />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;