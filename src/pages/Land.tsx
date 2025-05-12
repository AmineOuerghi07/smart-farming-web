import { useEffect, useState } from "react";
import { Earth, PlusCircle } from "lucide-react";
import Modal from "../components/Modal";
import DashboardCard from "../components/DashboardCard";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function Land() {

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  
  


    const getUserIdFromToken = (token: string): string | null => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const { id } = JSON.parse(jsonPayload);
        return id;
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        return null;
      }
    };
  
      

    useEffect(() => {
      const checkAuthAndFetchData = async () => {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          if (!token || !isAuthenticated) {

            setLoading(false);
            navigate('/login');
            return;
          }
  
          const userId = getUserIdFromToken(token);
          if (!userId) {

            setLoading(false);
            navigate('/login');
            return;
          }
        }catch (error) {
        console.error('Error checking authentication:', error);
        setLoading(false);
        navigate('/login');
      }
    };

    checkAuthAndFetchData();
  }, [isAuthenticated, navigate]);


  const { darkMode } = useTheme();
  const [lands, setLands] = useState([
    { id: 1, name: "Green Valley Farm", size: "50 acres", regions: 3 },
    { id: 2, name: "Sunset Orchards", size: "30 acres", regions: 2 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLand, setNewLand] = useState({ name: "", size: "", regions: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLand({ ...newLand, [e.target.name]: e.target.value });
  };

  const handleAddLand = () => {
    setLands([...lands, { ...newLand, id: lands.length + 1 }]);
    setNewLand({ name: "", size: "", regions: 0 });
    setIsModalOpen(false);
  };

  return (
    <div className={`w-full min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} p-4 flex flex-col items-center transition-colors duration-300`}>
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Lands</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 shadow-md hover:bg-green-600 transition-all duration-300"
          >
            <PlusCircle className="h-5 w-5" /> 
            <span>Add Land</span>
          </button>
        </div>

        {/* Land Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lands.map((land) => (
            <DashboardCard icon={Earth} key={land.id} title={land.name}>
              <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Size: {land.size}</p>
              <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Regions: {land.regions}</p>
            </DashboardCard>
          ))}
        </div>
      </div>

      {/* Add Land Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4">Add New Land</h2>
          <input
            type="text"
            name="name"
            value={newLand.name}
            onChange={handleChange}
            placeholder="Land Name"
            className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} mb-2`}
          />
          <input
            type="text"
            name="size"
            value={newLand.size}
            onChange={handleChange}
            placeholder="Size (e.g., 50 hectares)"
            className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} mb-2`}
          />
          <input
            type="number"
            name="regions"
            value={newLand.regions}
            onChange={handleChange}
            min="1"
            placeholder="Number of Regions"
            className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} mb-4`}
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className={`py-2 px-4 rounded-lg w-full sm:w-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            >
              Cancel
            </button>
            <button 
              onClick={handleAddLand} 
              className="bg-green-500 text-white px-4 py-2 rounded-lg w-full sm:w-auto hover:bg-green-600"
            >
              Add Land
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
