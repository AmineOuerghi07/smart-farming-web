import { useTheme } from '../context/ThemeContext';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }
  

  const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    const { darkMode } = useTheme();
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg p-6 max-w-md w-full mx-4 z-10 transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={onClose}
              className={`ml-auto p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
            >
              <X size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };
  
  export default Modal;
  
