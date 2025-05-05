import React, { createContext, useState, useContext, useEffect } from 'react';

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: true,
  toggleDarkMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Récupérer la préférence de l'utilisateur depuis le localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme !== null ? JSON.parse(savedTheme) : true; // Par défaut en mode sombre
  });

  // Sauvegarder les préférences lorsqu'elles changent
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Appliquer le thème au document entier
    document.documentElement.classList.toggle('dark', darkMode);
    
    // Appliquer les couleurs de fond et de texte à tout le document
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('bg-gray-900', 'text-white');
      document.body.classList.remove('bg-gray-100', 'text-gray-800');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.add('bg-gray-100', 'text-gray-800');
      document.body.classList.remove('bg-gray-900', 'text-white');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useTheme = () => useContext(ThemeContext);
