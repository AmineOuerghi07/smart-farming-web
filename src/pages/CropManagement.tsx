import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { cropManagementService } from '../services/cropManagementService';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface Plant {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
  quantity?: number;
  regionName?: string;
  regionId?: string;
  __v?: number;
  plantingDate?: string;
}

interface GroupedPlant extends Plant {
  regions: string[];
  quantity: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  regions: string;
}

interface Region {
  _id: string;
  name: string;
  isConnected: boolean;
}

// Enhanced color scheme for dark/light mode compatibility
const COLORS = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6'];
const DARK_COLORS = ['#60a5fa', '#4ade80', '#fcd34d', '#f87171', '#c084fc'];

const CropManagement: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Extract available years and prepare data for the curve
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

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
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !isAuthenticated) {
          setErrorMessage('Session expirée. Veuillez vous reconnecter.');
          setShowError(true);
          setLoading(false);
          return;
        }
        const userId = getUserIdFromToken(token);
        if (!userId) {
          setErrorMessage('Erreur de session. Veuillez vous reconnecter.');
          setShowError(true);
          setLoading(false);
          return;
        }
        // Récupérer toutes les régions de l'utilisateur
        const userRegions = await cropManagementService.getUserRegions(userId, token);
        
        if (userRegions.length === 0) {
          setErrorMessage("Vous n'avez pas encore créé de régions. Créez une région pour commencer à gérer vos cultures.");
          setShowError(true);
          setLoading(false);
          return;
        }
        
        setRegions(userRegions);
        // Pour chaque région, récupérer ses plantes
        let allPlants: Plant[] = [];
        for (const region of userRegions) {
          const regionPlants = await cropManagementService.getRegionPlants(region._id, token);
          if (regionPlants.length) {
            for (const plantData of regionPlants) {
              let plantDetails: Plant = { _id: '', name: '', imageUrl: '', description: '' };
              try {
                const plantResponse = await axios.get<Plant>(
                  `${API_URL}/lands/plant/${plantData.plant}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                plantDetails = plantResponse.data;
              } catch (e) {
                continue;
              }
              // Correction de l'URL de l'image
              let imageFileName = '';
              if (plantDetails.imageUrl) {
                imageFileName = plantDetails.imageUrl.split('/').pop() || '';
              }
              allPlants.push({
                ...plantDetails,
                quantity: plantData.quantity,
                regionId: region._id,
                regionName: region.name,
                plantingDate: plantData.plantingDate ? String(plantData.plantingDate) : undefined,
                imageUrl: imageFileName ? `${API_URL}/uploads/plants/${imageFileName}` : '',
              });
            }
          }
        }
        setPlants(allPlants);
        setLoading(false);
      } catch (error) {
        setErrorMessage('Erreur lors de la récupération des données');
        setShowError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, navigate]);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Extraction des années et préparation des données pour la courbe
  const allPlantings = plants.filter(p => !!p.plantingDate);
  const years = Array.from(
    new Set(
      allPlantings
        .map(p => new Date(p.plantingDate as string).getFullYear())
    )
  ).sort((a, b) => b - a);
  
  // Initialiser selectedYear si non défini
  useEffect(() => {
    if (years.length > 0 && selectedYear === undefined) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);
  
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
  ];
  
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const total = allPlantings
      .filter(p => {
        if (!p.plantingDate || selectedYear === undefined) return false;
        const date = new Date(p.plantingDate as string);
        return date.getFullYear() === selectedYear && date.getMonth() + 1 === month;
      })
      .reduce((sum, p) => sum + (p.quantity || 0), 0);
    return {
      mois: months[i],
      rendement: total
    };
  });

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (showError) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} min-h-screen`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Gestion des Cultures</h1>
         
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg text-center max-w-2xl mx-auto`}>
          <div className="mb-6">
            <img 
              src="/assets/empty-crops.png" 
              alt="Aucune culture" 
              className="w-32 h-32 mx-auto mb-4"
            />
          </div>
          <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'} mb-3`}>Information</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            {errorMessage}
          </p>
          {errorMessage.includes('Session') && (
            <button
              onClick={() => navigate('/login')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Se connecter
            </button>
          )}
          {errorMessage.includes('régions') && (
            <button
              onClick={() => navigate('/regions')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Créer une région
            </button>
          )}
        </div>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} min-h-screen`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Gestion des Cultures</h1>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {darkMode ? 'Mode Clair' : 'Mode Sombre'}
          </button>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg text-center`}>
          <div className="mb-4">
            <img 
              src="/assets/empty-crops.png" 
              alt="Aucune culture" 
              className="w-32 h-32 mx-auto mb-4"
            />
          </div>
          <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'} mb-2`}>Aucune culture trouvée</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            Vous n'avez pas encore de cultures enregistrées. Commencez par ajouter vos premières cultures pour suivre leur croissance.
          </p>
          <button
            onClick={() => navigate('/add-crop')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Ajouter une culture
          </button>
        </div>
      </div>
    );
  }

  const regionStats = {
    connected: regions.filter(r => r.isConnected).length,
    notConnected: regions.filter(r => !r.isConnected).length
  };

  // Regrouper les plantes par nom
  const groupedPlants = plants.reduce<GroupedPlant[]>((acc, plant) => {
    const existingPlant = acc.find(p => p.name === plant.name);
    if (existingPlant) {
      existingPlant.quantity = (existingPlant.quantity || 0) + (plant.quantity || 0);
      existingPlant.regions = [...existingPlant.regions, plant.regionName].filter((r): r is string => !!r);
      return acc;
    }
    return [...acc, { 
      ...plant, 
      regions: [plant.regionName].filter((r): r is string => !!r),
      quantity: plant.quantity || 0 
    }];
  }, []);

  // Générer dynamiquement les cultures par mois à partir des données
  function getMonthlyCrops(plants: Plant[]) {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    // Regrouper par année/mois
    const cropsByMonth: { [key: string]: { [crop: string]: number } } = {};
    plants.forEach(plant => {
      if (!plant.plantingDate) return;
      const date = new Date(plant.plantingDate);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-indexed
      const key = `${months[month]} '${year.toString().slice(-2)}`;
      if (!cropsByMonth[key]) cropsByMonth[key] = {};
      cropsByMonth[key][plant.name] = (cropsByMonth[key][plant.name] || 0) + (plant.quantity || 0);
    });
    // Transformer en tableau pour l'affichage
    return Object.entries(cropsByMonth).map(([month, crops]) => {
      const total = Object.values(crops).reduce((a, b) => a + b, 0);
      return {
        month,
        crops: Object.entries(crops).map(([name, value]) => ({
          name,
          value,
          percent: total > 0 ? Math.round((value / total) * 100) : 0
        }))
      };
    });
  }
  const monthlyCrops = getMonthlyCrops(plants);

  // Préparer les données pour le graphique
  const chartData: ChartDataItem[] = groupedPlants.map(plant => ({
    name: plant.name && plant.name !== 'undefined' ? plant.name : 'Inconnu',
    value: plant.quantity,
    regions: Array.from(new Set(plant.regions)).join(', ')
  }));

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Gestion des Cultures</h1>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 flex flex-col items-start transition-colors duration-300`}>
    <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'} mb-4`}>Répartition des Plantes</h2>
    <div className="w-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
            outerRadius={100}
            innerRadius={50}
            paddingAngle={3}
            dataKey="value"
            isAnimationActive={true} // <<< animation active
            animationBegin={0} // <<< start immediately
            animationDuration={1500} // <<< smooth animation duration (1.5s)
            animationEasing="ease-out" // <<< smooth end
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={darkMode ? DARK_COLORS[index % DARK_COLORS.length] : COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
              color: darkMode ? '#e2e8f0' : '#374151',
              borderRadius: '8px',
              padding: '10px',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            formatter={(value, name, props) => {
              const numericValue = Number(value);
              const total = chartData.reduce((sum, item) => sum + Number(item.value), 0);
              const percent = total > 0 ? ((numericValue / total) * 100).toFixed(0) : '0';
              return [`${numericValue} (${percent}%)`, name];
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ marginTop: 20 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>




          {/* État des Régions */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg transition-colors duration-300`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>État des Régions</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={[
                    { name: 'Régions Connectées', value: regionStats.connected },
                    { name: 'Régions Non Connectées', value: regionStats.notConnected }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis dataKey="name" stroke={darkMode ? '#e2e8f0' : '#374151'} />
                  <YAxis stroke={darkMode ? '#e2e8f0' : '#374151'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                      color: darkMode ? '#e2e8f0' : '#374151',
                      borderRadius: '8px',
                      padding: '10px',
                      border: 'none',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value} régions`, 'Nombre']}
                  />
                  <Legend wrapperStyle={{ color: darkMode ? '#e2e8f0' : '#374151' }} />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  >
                    {[
                      <Cell key="cell-0" fill={darkMode ? '#4ade80' : '#00C49F'} />,
                      <Cell key="cell-1" fill={darkMode ? '#f87171' : '#FF8042'} />
                    ]}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Nouvelle section : Affichage par région */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {regions.map(region => (
            <div 
              key={region._id} 
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow p-3 mb-2 flex flex-col border transition-colors duration-300`}
            >
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-1 truncate`}>{region.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${region.isConnected 
                  ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') 
                  : (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')}`}>
                  {region.isConnected ? 'Connectée' : 'Non Connectée'}
                </span>
              </div>
              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-1 flex-1`}>
                {plants.filter(p => p.regionId === region._id).length === 0 ? (
                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} italic text-xs py-4`}>Aucune plante dans cette région.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {plants.filter(p => p.regionId === region._id).map(plant => (
                      <div 
                        key={plant._id} 
                        className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-2 shadow-sm transition-colors duration-300`}
                      >
                        <img
                          src={plant.imageUrl}
                          alt={plant.name}
                          className={`w-10 h-10 object-contain rounded border ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}
                          onError={e => (e.currentTarget.src = '/assets/empty-crops.png')}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} text-sm truncate`}>{plant.name}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Quantité : {plant.quantity}</div>
                          {plant.plantingDate && (
                            <div className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                              Plantée le {new Date(plant.plantingDate).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {monthlyCrops.map((monthData) => (
            <div
              key={monthData.month}
              className={`rounded-2xl p-6 shadow-lg transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}
            >
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{monthData.month}</h3>
              {monthData.crops.map(crop => (
                <div key={crop.name} className="mb-3">
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{crop.name}</span>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {crop.value} <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>({crop.percent}%)</span>
                    </span>
                  </div>
                  <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mt-1`}>
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${crop.percent}%`,
                        background: darkMode 
                          ? 'linear-gradient(90deg, #4ade80 0%, #34d399 100%)'
                          : 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Sélecteur d'année et courbe d'évolution */}
        {years.length > 0 && (
          <>
            <div className={`mb-6 flex flex-wrap gap-4 items-center ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md`}>
              <label className={`${darkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>Année :</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className={`p-2 rounded ${darkMode ? 'bg-gray-700 text-green-400 border-gray-600' : 'bg-gray-200 text-green-700 border-gray-300'} border`}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg mt-8 transition-colors duration-300`}>
              <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                Évolution des plantations ({selectedYear})
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                    <XAxis dataKey="mois" stroke={darkMode ? '#e2e8f0' : '#374151'} />
                    <YAxis stroke={darkMode ? '#e2e8f0' : '#374151'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                        color: darkMode ? '#e2e8f0' : '#374151',
                        borderRadius: '8px',
                        padding: '10px',
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rendement" 
                      stroke={darkMode ? "#4ade80" : "#4ade80"} 
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 1, fill: darkMode ? "#4ade80" : "#4ade80" }}
                      activeDot={{ r: 6, stroke: darkMode ? "#34d399" : "#22c55e", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CropManagement;