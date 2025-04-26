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
  __v?: number;
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CropManagement: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        console.log('Token récupéré:', token ? 'Présent' : 'Absent');
        
        if (!token || !isAuthenticated) {
          console.log('État authentification:', { token: !!token, isAuthenticated });
          setError('Session expirée');
          navigate('/login');
          return;
        }

        const userId = getUserIdFromToken(token);
        console.log('ID utilisateur extrait:', userId);

        if (!userId) {
          console.log('Échec extraction ID utilisateur du token');
          setError('Erreur de session');
          navigate('/login');
          return;
        }

        console.log('Début récupération des données...');
        const [plantsResponse, regionsResponse] = await Promise.all([
          cropManagementService.getUserPlants(userId, token),
          axios.get<Region[]>(`${API_URL}/lands/region/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        console.log('Données des plantes reçues:', plantsResponse.plants);
        console.log('URLs des images brutes:', plantsResponse.plants.map(p => ({ name: p.name, url: p.imageUrl })));
        console.log('URL de l\'API:', API_URL);
        
        // Formater les URLs des images correctement
        const plantsWithFormattedUrls = plantsResponse.plants.map(plant => {
          // Extraire uniquement le nom du fichier de l'URL
          const imageFileName = plant.imageUrl.split('/').pop();
          // Construire l'URL correcte pour le backend
          const formattedImageUrl = `${API_URL}/uploads/plants/${imageFileName}`;
          
          console.log(`Formatage URL pour ${plant.name}:`, {
            original: plant.imageUrl,
            formatted: formattedImageUrl,
            plantDetails: plant
          });
          
          return {
            ...plant,
            imageUrl: formattedImageUrl
          };
        });
        
        setPlants(plantsWithFormattedUrls);
        setRegions(regionsResponse.data.map((region: Region) => {
          const isConnected = plantsWithFormattedUrls.some(p => p.regionName === region.name);
          console.log(`Région ${region.name}: ${isConnected ? 'connectée' : 'non connectée'}`);
          return {
            ...region,
            isConnected
          };
        }));
        setLoading(false);
      } catch (error) {
        console.error('Erreur détaillée:', error);
        if (axios.isAxiosError(error)) {
          console.log('Erreur Axios:', {
            status: error.response?.status,
            message: error.response?.data,
            config: error.config
          });
        }
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          setError('Session expirée');
          navigate('/login');
        } else {
          setError('Erreur lors de la récupération des données');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement de vos cultures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Gestion des Cultures</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-2xl mx-auto">
          <div className="mb-6">
            <img 
              src="/assets/empty-crops.png" 
              alt="Aucune culture" 
              className="w-32 h-32 mx-auto mb-4"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Aucune culture trouvée</h2>
          <p className="text-gray-600">
            Vous n'avez pas encore de cultures enregistrées dans votre compte.
          </p>
        </div>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Gestion des Cultures</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="mb-4">
            <img 
              src="/assets/empty-crops.png" 
              alt="Aucune culture" 
              className="w-32 h-32 mx-auto mb-4"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Aucune culture trouvée</h2>
          <p className="text-gray-600 mb-6">
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

  // Préparer les données pour le graphique
  const chartData: ChartDataItem[] = groupedPlants.map(plant => ({
    name: plant.name,
    value: plant.quantity,
    regions: Array.from(new Set(plant.regions)).join(', ')
  }));

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Gestion des Cultures</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Graphique de Répartition des Plantes */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Répartition des Plantes</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 shadow rounded">
                        <p className="font-semibold">{data.name}</p>
                        <p>Quantité: {data.value}</p>
                        <p className="text-sm">Régions: {data.regions}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* État des Régions */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">État des Régions</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={[
                  { name: 'Régions Connectées', value: regionStats.connected },
                  { name: 'Régions Non Connectées', value: regionStats.notConnected }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    padding: '10px',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value} régions`, 'Nombre']}
                />
                <Legend />
                <Bar
                  dataKey="value"
                  fill="#00C49F"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                >
                  {[
                    <Cell key="cell-0" fill="#00C49F" />,
                    <Cell key="cell-1" fill="#FF8042" />
                  ]}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Catalogue des Plantes */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Catalogue des Plantes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {groupedPlants.map(plant => (
            <div key={plant.name} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="relative h-44">
                <img 
                  src={plant.imageUrl}
                  alt={plant.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.log(`Erreur chargement image pour ${plant.name}:`, {
                      urlTentée: target.src,
                      erreur: e,
                      imageUrl: plant.imageUrl,
                      originalUrl: plant.imageUrl
                    });
                    axios.get(plant.imageUrl, { 
                      responseType: 'blob',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Cache-Control': 'no-cache'
                      }
                    })
                    .then(response => {
                      const blobUrl = URL.createObjectURL(response.data);
                      target.src = blobUrl;
                    })
                    .catch(error => {
                      console.error(`Erreur serveur pour ${plant.name}:`, error);
                    });
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">{plant.name}</h3>
                {plant.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plant.description}</p>
                )}
                <div className="space-y-2 border-t pt-2">
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="font-medium mr-2">Quantité totale:</span>
                    {plant.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium mr-2">Régions:</span>
                    {Array.from(new Set(plant.regions)).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CropManagement; 