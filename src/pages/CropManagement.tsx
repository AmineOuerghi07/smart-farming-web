import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { cropManagementService } from '../services/cropManagementService';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

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
  const { darkMode } = useTheme();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Extract available years and prepare data for the curve
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [comparisonData, setComparisonData] = useState<{
    selectedYear: number;
    selectedSeason: string;
    seasonLabel: string;
    previousYears: number[];
    yearlyData: {
      year: number;
      quantity: number;
      percentChange?: number;
      isHighest: boolean;
    }[];
  } | null>(null);

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
        
        // Si pas de token ou pas authentifié, afficher un message d'information sans rediriger
        if (!token || !isAuthenticated) {
          setErrorMessage("Bienvenue dans la gestion des cultures. Créez un compte pour commencer à suivre vos plantations.");
          setShowError(true);
          setLoading(false);
          return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
          setErrorMessage("Information sur le compte non disponible. Vous pouvez créer un compte pour accéder à toutes les fonctionnalités.");
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
          try {
            const regionPlants = await cropManagementService.getRegionPlants(region._id, token);
            if (regionPlants.length) {
              for (const plantData of regionPlants) {
                try {
                  const plantResponse = await axios.get<Plant>(
                    `${API_URL}/lands/plant/${plantData.plant}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  const plantDetails = plantResponse.data;
                  
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
                    plantingDate: plantDetails.plantingDate ? String(plantDetails.plantingDate) : undefined,
                    imageUrl: imageFileName ? `${API_URL}/uploads/plants/${imageFileName}` : '',
                  });
                } catch (e) {
                  console.error('Erreur lors de la récupération des détails de la plante:', e);
                  continue;
                }
              }
            }
          } catch (e) {
            console.error('Erreur lors de la récupération des plantes de la région:', e);
          }
        }
        
        setPlants(allPlants);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setErrorMessage('Erreur lors de la récupération des données. Veuillez réessayer.');
        setShowError(true);
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [isAuthenticated, navigate]);

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

  const SEASONS = [
    { id: "SPRING", label: "Printemps" },
    { id: "SUMMER", label: "Été" },
    { id: "AUTUMN", label: "Automne" },
    { id: "WINTER", label: "Hiver" }
  ];

  const seasonStats = SEASONS.map(season => {
    // On additionne la quantité de toutes les plantes qui ont cette saison ET qui ont été plantées dans l'année sélectionnée
    const total = plants
      .filter(plant =>
        Array.isArray((plant as any).plantingSeasons) &&
        (plant as any).plantingSeasons.includes(season.id) &&
        plant.plantingDate &&
        selectedYear !== undefined &&
        new Date(plant.plantingDate).getFullYear() === selectedYear
      )
      .reduce((sum, plant) => sum + (plant.quantity || 0), 0);
    return {
      saison: season.label,
      rendement: total
    };
  });

  // Ajoutons une fonction pour actualiser les données lorsque l'année change
  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    // Si d'autres actions sont nécessaires lors du changement d'année, elles peuvent être ajoutées ici
  };

  const handleSeasonClick = (seasonId: string, seasonLabel: string) => {
    if (!selectedYear || years.length <= 1) return;
    
    // Récupérer les données pour la saison et l'année sélectionnées
    const currentYearData = plants
      .filter(plant =>
        Array.isArray((plant as any).plantingSeasons) &&
        (plant as any).plantingSeasons.includes(seasonId) &&
        plant.plantingDate &&
        new Date(plant.plantingDate).getFullYear() === selectedYear
      )
      .reduce((sum, plant) => sum + (plant.quantity || 0), 0);
    
    // Récupérer les données des années précédentes (jusqu'à 3)
    const previousYears = years
      .filter(year => year !== selectedYear)
      .sort((a, b) => b - a)
      .slice(0, 3);
    
    type YearData = {
      year: number;
      quantity: number;
      percentChange?: number;
      isHighest: boolean;
    };
    
    const yearlyData: YearData[] = [
      // Année sélectionnée
      {
        year: selectedYear,
        quantity: currentYearData,
        isHighest: true, // Valeur temporaire qui sera mise à jour
      },
      // Années précédentes
      ...previousYears.map(year => {
        const yearData = plants
          .filter(plant =>
            Array.isArray((plant as any).plantingSeasons) &&
            (plant as any).plantingSeasons.includes(seasonId) &&
            plant.plantingDate &&
            new Date(plant.plantingDate).getFullYear() === year
          )
          .reduce((sum, plant) => sum + (plant.quantity || 0), 0);
          
        return {
          year,
          quantity: yearData,
          isHighest: false, // Valeur temporaire qui sera mise à jour
        };
      })
    ];
    
    // Trouver l'année avec la quantité la plus élevée
    const maxQuantity = Math.max(...yearlyData.map(d => d.quantity));
    yearlyData.forEach(data => {
      data.isHighest = data.quantity > 0 && data.quantity === maxQuantity;
    });
    
    // Calculer les pourcentages de changement par rapport à l'année précédente
    for (let i = yearlyData.length - 1; i > 0; i--) {
      const current = yearlyData[i-1] as { year: number; quantity: number; percentChange?: number; isHighest: boolean };
      const previous = yearlyData[i];
      
      if (previous.quantity > 0) {
        current.percentChange = Math.round(((current.quantity - previous.quantity) / previous.quantity) * 100);
      }
    }
    
    setComparisonData({
      selectedYear,
      selectedSeason: seasonId,
      seasonLabel,
      previousYears,
      yearlyData
    });
    
    setShowComparisonDialog(true);
  };

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
              src="/assets/crop.png" 
              alt="Agriculture Illustration" 
              className="w-64 h-64 mx-auto mb-4"
            />
          </div>
          <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'} mb-4`}>Bienvenue dans l'agriculture intelligente</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 max-w-md mx-auto`}>
            {errorMessage}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {errorMessage.includes('Bienvenue') && (
            <button
              onClick={() => navigate('/login')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
                se connecter
               
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
            {errorMessage.includes('Information sur le compte') && (
              <button
                onClick={() => navigate('/login')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Se connecter
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} px-6 py-3 rounded-lg hover:opacity-90 transition-colors`}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} min-h-screen`}>
        <div className="flex justify-between items-center mb-8">
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

  const getSeasonsColor = (seasonId: string) => {
    switch (seasonId) {
      case 'SPRING': return darkMode ? 'bg-green-500' : 'bg-green-600';
      case 'SUMMER': return darkMode ? 'bg-yellow-500' : 'bg-yellow-600';
      case 'AUTUMN': return darkMode ? 'bg-orange-500' : 'bg-orange-600';
      case 'WINTER': return darkMode ? 'bg-blue-500' : 'bg-blue-600';
      default: return darkMode ? 'bg-gray-500' : 'bg-gray-600';
    }
  };

  const getSeasonsHexColor = (seasonId: string, isDark: boolean) => {
    switch (seasonId) {
      case 'SPRING': return isDark ? '#22c55e' : '#16a34a';
      case 'SUMMER': return isDark ? '#eab308' : '#ca8a04';
      case 'AUTUMN': return isDark ? '#f97316' : '#ea580c';
      case 'WINTER': return isDark ? '#3b82f6' : '#2563eb';
      default: return isDark ? '#6b7280' : '#4b5563';
    }
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Gestion des Cultures</h1>
          
          {years.length > 0 && (
            <div className="flex items-center bg-opacity-70 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-sm 
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}">
              <label className={`mr-2 ${darkMode ? 'text-green-400' : 'text-green-700'} font-medium`}>Année :</label>
              <select
                value={selectedYear}
                onChange={e => handleYearChange(Number(e.target.value))}
                className={`p-2 rounded text-sm font-medium ${darkMode ? 'bg-gray-700 text-green-400 border-gray-600' : 'bg-gray-100 text-green-700 border-gray-300'} border focus:ring-2 focus:ring-green-500`}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Affichage des cultures par saison - Section principale */}
        <div className="mb-8">
          <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Cultures par Saison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["SPRING", "SUMMER", "AUTUMN", "WINTER"].map(season => {
              const seasonPlants = plants.filter(
                plant => Array.isArray((plant as any).plantingSeasons) && 
                (plant as any).plantingSeasons.includes(season) &&
                plant.plantingDate &&
                selectedYear !== undefined &&
                new Date(plant.plantingDate).getFullYear() === selectedYear
              );
              const seasonLabel = season === "SPRING" ? "Printemps" : season === "SUMMER" ? "Été" : season === "AUTUMN" ? "Automne" : "Hiver";
              const color = season === "SPRING"
                ? "bg-green-100 border-green-500 text-green-800"
                : season === "SUMMER"
                ? "bg-yellow-100 border-yellow-500 text-yellow-800"
                : season === "AUTUMN"
                ? "bg-orange-100 border-orange-500 text-orange-800"
                : "bg-blue-100 border-blue-500 text-blue-800";
              
              const icon = season === "SPRING" 
                ? "🌱" 
                : season === "SUMMER" 
                ? "☀️" 
                : season === "AUTUMN" 
                ? "🍂" 
                : "❄️";
              
              return (
                <div key={season} className={`rounded-lg p-4 border-2 shadow-md ${color}`}>
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <span className="mr-2 text-xl">{icon}</span> {seasonLabel}
                  </h3>
                  {seasonPlants.length === 0 ? (
                    <p className="text-gray-500 italic">Aucune culture pour cette saison.</p>
                  ) : (
                    <ul className="space-y-2">
                      {seasonPlants.map(plant => (
                        <li key={plant._id} className="flex items-center border-b pb-2">
                          <span className="font-semibold">{plant.name}</span>
                          <span className="ml-auto bg-white px-2 py-1 rounded text-sm">
                            {plant.quantity || 0} plants
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4 text-right">
                    <span className="text-sm font-semibold">
                      Total: {seasonPlants.reduce((sum, p) => sum + (p.quantity || 0), 0)} plants
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rendement par année */}
        {years.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md mb-8`}>
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                Rendement par Saison
              </h2>
            </div>
            <div className={`text-center mb-3 py-2 px-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-green-50 border-green-200 text-green-800'}`}>
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="font-medium">Touchez les barres pour comparer avec les années précédentes</span>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seasonStats} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis dataKey="saison" stroke={darkMode ? '#e2e8f0' : '#374151'} />
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
                    formatter={(value) => [`${value} plants`, 'Quantité']}
                  />
                  <Bar 
                    dataKey="rendement" 
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => {
                      // Trouver l'ID de la saison à partir du label
                      const season = SEASONS.find(s => s.label === data.saison);
                      if (season) {
                        handleSeasonClick(season.id, season.label);
                      }
                    }}
                    cursor="pointer"
                  >
                    {seasonStats.map((entry, index) => {
                      const colors = [
                        darkMode ? '#4ade80' : '#22c55e', // Spring
                        darkMode ? '#facc15' : '#eab308', // Summer
                        darkMode ? '#f97316' : '#ea580c', // Autumn 
                        darkMode ? '#60a5fa' : '#3b82f6'  // Winter
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRID avec Régions et Tableau de performance */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Section Mes Régions - Version compact et scrollable */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 xl:col-span-1`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Mes Régions</h2>
              <span className={`text-sm px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {regions.length} région{regions.length > 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Scrollable container */}
            <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
              {regions.map(region => (
                <div 
                  key={region._id} 
                  className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg p-3 transition-colors`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>{region.name}</h3>
                    <div className={`h-2 w-2 rounded-full ${region.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  
                  <div className="flex justify-between text-xs mb-2">
                    <span>{plants.filter(p => p.regionId === region._id).length} plantes</span>
                    <span>Total: {plants.filter(p => p.regionId === region._id).reduce((sum, p) => sum + (p.quantity || 0), 0)} plants</span>
                  </div>
                  
                  {/* Top 3 plantes de la région */}
                  {plants.filter(p => p.regionId === region._id).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {plants.filter(p => p.regionId === region._id)
                        .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
                        .slice(0, 3)
                        .map(plant => (
                          <span 
                            key={plant._id}
                            className={`inline-block px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
                          >
                            {plant.name} ({plant.quantity})
                          </span>
                        ))
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Tableau d'analyse - Performance des cultures */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 xl:col-span-2`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analyse des Cultures</h2>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-b sticky top-0`}>
                  <tr>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-center">Meilleures Saisons</th>
                    <th className="px-4 py-2 text-center">Total planté</th>
                    <th className="px-4 py-2 text-center">Répartition</th>
                    <th className="px-4 py-2 text-center">Dernière plantation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupedPlants
                    .map(plant => {
                      // Filtrer les plantes par année sélectionnée
                      const plantsByYear = plants.filter(p => 
                        p.name === plant.name && 
                        p.plantingDate && 
                        selectedYear !== undefined &&
                        new Date(p.plantingDate).getFullYear() === selectedYear
                      );
                      
                      // Calculer la quantité totale pour cette plante dans l'année sélectionnée
                      const quantityInSelectedYear = plantsByYear.reduce((sum, p) => sum + (p.quantity || 0), 0);
                      
                      // Ne pas afficher les plantes qui n'ont pas été plantées dans l'année sélectionnée
                      if (quantityInSelectedYear === 0) return null;
                      
                      // Trouver la dernière plantation de ce type dans l'année sélectionnée
                      const lastPlanted = plantsByYear
                        .sort((a, b) => 
                          new Date(b.plantingDate || '').getTime() - 
                          new Date(a.plantingDate || '').getTime()
                        )[0];
                      
                      // Nombre total de régions où cette plante est présente dans l'année sélectionnée
                      const regionsCount = new Set(
                        plantsByYear.map(p => p.regionId)
                      ).size;
                      
                      // Pourcentage du total des plantes dans l'année sélectionnée
                      const totalPlantsInYear = plants
                        .filter(p => p.plantingDate && selectedYear !== undefined && new Date(p.plantingDate).getFullYear() === selectedYear)
                        .reduce((sum, p) => sum + (p.quantity || 0), 0);
                        
                      const percentage = totalPlantsInYear > 0 
                        ? Math.round((quantityInSelectedYear / totalPlantsInYear) * 100) 
                        : 0;
                      
                      return (
                        <tr key={plant._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <img 
                                src={plant.imageUrl} 
                                alt={plant.name}
                                className="w-8 h-8 mr-2 rounded-full object-cover"
                                onError={e => (e.currentTarget.src = '/assets/empty-crops.png')}
                              />
                              <span className="font-medium">{plant.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {(plant as any).plantingSeasons && Array.isArray((plant as any).plantingSeasons) ? (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {(plant as any).plantingSeasons.map((season: string) => (
                                  <span
                                    key={season}
                                    className={`inline-block w-2 h-2 rounded-full ${
                                      season === "SPRING"
                                        ? "bg-green-500"
                                        : season === "SUMMER"
                                        ? "bg-yellow-500"
                                        : season === "AUTUMN"
                                        ? "bg-orange-500"
                                        : "bg-blue-500"
                                    }`}
                                    title={season === "SPRING"
                                      ? "Printemps"
                                      : season === "SUMMER"
                                      ? "Été"
                                      : season === "AUTUMN"
                                      ? "Automne"
                                      : "Hiver"}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center font-semibold">
                            {quantityInSelectedYear}
                            <span className="text-xs ml-1 text-gray-500">
                              ({regionsCount} {regionsCount > 1 ? 'régions' : 'région'})
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-center mt-1">{percentage}%</div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {lastPlanted?.plantingDate 
                              ? new Date(lastPlanted.plantingDate).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: '2-digit'})
                              : '-'
                            }
                          </td>
                        </tr>
                      );
                    })
                    .filter(Boolean)
                    .sort((a, b) => {
                      if (!a || !b) return 0;
                      // @ts-ignore - Ces propriétés existent bien dans les composants React générés
                      const valA = a.props.children[2].props.children[0];
                      // @ts-ignore
                      const valB = b.props.children[2].props.children[0];
                      return valB - valA;
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialogue de comparaison par saison */}
      {showComparisonDialog && comparisonData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowComparisonDialog(false)}
        >
          <div 
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl border p-6 max-w-2xl w-full`}
            onClick={(e) => e.stopPropagation()} // Empêcher la fermeture quand on clique sur le dialogue
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Analyse du rendement : {comparisonData.seasonLabel}
              </h3>
              <button 
                onClick={() => setShowComparisonDialog(false)}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                aria-label="Fermer"
              >
                <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border ${darkMode ? 'border-gray-600' : 'border-green-200'}`}>
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${getSeasonsColor(comparisonData.selectedSeason)}`}></div>
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {comparisonData.seasonLabel} {comparisonData.selectedYear}
                </h4>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Comparaison du rendement avec les années précédentes
              </p>
            </div>
            
            {/* Graphique ou visualisation */}
            <div className="h-[250px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData.yearlyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis type="number" stroke={darkMode ? '#e2e8f0' : '#374151'} />
                  <YAxis 
                    dataKey="year" 
                    type="category" 
                    stroke={darkMode ? '#e2e8f0' : '#374151'} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                      color: darkMode ? '#e2e8f0' : '#374151',
                      borderRadius: '8px',
                      padding: '10px',
                      border: 'none',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value} plants`, 'Nombre de plants']}
                  />
                  <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                    {comparisonData.yearlyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.year === comparisonData.selectedYear 
                          ? getSeasonsHexColor(comparisonData.selectedSeason, darkMode) 
                          : darkMode ? '#6b7280' : '#d1d5db'} 
                        stroke={entry.isHighest ? (darkMode ? '#10b981' : '#047857') : undefined}
                        strokeWidth={entry.isHighest ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Tableau récapitulatif */}
            <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 mb-6`}>
              <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Évolution de la production</h4>
              
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={`text-left py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Année</th>
                    <th className={`text-right py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plants</th>
                    <th className={`text-right py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Évolution</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.yearlyData.map((data, index) => (
                    <tr key={data.year} className={`${darkMode ? 'border-gray-600' : 'border-gray-200'} ${index === 0 ? 'border-t-2 border-t-green-500' : 'border-t'}`}>
                      <td className={`py-3 ${
                        data.year === comparisonData.selectedYear
                          ? `font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`
                          : darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {data.year}
                        {data.isHighest && <span className="ml-2 text-yellow-400">★</span>}
                      </td>
                      <td className={`py-3 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {data.quantity}
                      </td>
                      <td className={`py-3 text-right`}>
                        {data.percentChange !== undefined ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            data.percentChange > 0
                              ? darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                              : data.percentChange < 0
                                ? darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800'
                                : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {data.percentChange > 0 ? '+' : ''}{data.percentChange}%
                          </span>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Analyse et recommandations */}
            <div className={`${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-green-50 border-green-100'} border rounded-lg p-4 mb-6`}>
              <h5 className={`text-md font-medium ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`}>Analyse</h5>
              
              {comparisonData.yearlyData[0].quantity === 0 ? (
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Aucune production enregistrée pour {comparisonData.seasonLabel} {comparisonData.selectedYear}.
                </p>
              ) : comparisonData.yearlyData[0].percentChange !== undefined ? (
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {comparisonData.yearlyData[0].percentChange > 20 ? (
                    <>Forte augmentation de <span className="font-semibold text-green-500">+{comparisonData.yearlyData[0].percentChange}%</span> par rapport à l'an dernier.</>
                  ) : comparisonData.yearlyData[0].percentChange > 0 ? (
                    <>Légère amélioration de <span className="font-semibold text-green-500">+{comparisonData.yearlyData[0].percentChange}%</span> par rapport à l'an dernier.</>
                  ) : comparisonData.yearlyData[0].percentChange < -20 ? (
                    <>Baisse significative de <span className="font-semibold text-red-500">{comparisonData.yearlyData[0].percentChange}%</span> par rapport à l'an dernier.</>
                  ) : comparisonData.yearlyData[0].percentChange < 0 ? (
                    <>Légère baisse de <span className="font-semibold text-red-500">{comparisonData.yearlyData[0].percentChange}%</span> par rapport à l'an dernier.</>
                  ) : (
                    <>Production stable par rapport à l'an dernier.</>
                  )}
                </p>
              ) : (
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Première année de production pour {comparisonData.seasonLabel}.
                </p>
              )}
            </div>
              
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setShowComparisonDialog(false)}
                className={`${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} px-5 py-2 rounded-lg font-medium transition-colors`}
              >
                Annuler
              </button>
              
              <button
                onClick={() => setShowComparisonDialog(false)}
                className={`${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white px-5 py-2 rounded-lg font-medium transition-colors`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropManagement;