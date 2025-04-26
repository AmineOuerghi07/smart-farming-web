import { useState, useEffect } from "react";
import { Activity, User, CheckSquare, Leaf, Calendar, Cloud, Clock, AlertTriangle, Check, Tractor, Sun, Wind } from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import MetricRow from "../components/MetricRow";
import StatusMessage from "../components/StatusMessage";
import { WeatherService } from "../services/weatherService";
import axios from "axios";

const API_URL = 'http://localhost:3000';

// Weather Card Component
const WeatherCard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string>('Tunis');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const fetchWeather = async () => {
      try {
        if (!isMounted) return;
        
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Get city name from coordinates
        const cityData = await WeatherService.getCityFromCoords(
          position.coords.latitude,
          position.coords.longitude
        );

        if (!isMounted) return;

        if (cityData && cityData.city) {
          setCity(cityData.city);
          
          // Get weather data
          const data = await WeatherService.getWeather(cityData.city);
          if (!isMounted) return;

          if (data) {
            setWeatherData(data);
            setError(null);
          } else {
            // Si null (à cause du délai), réessayer dans 5 secondes
            retryTimeout = setTimeout(fetchWeather, 5000);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de la localisation:', err);
        if (!isMounted) return;

        // En cas d'erreur, utiliser Tunis comme ville par défaut
        try {
          const data = await WeatherService.getWeather('Tunis');
          if (!isMounted) return;
          
          if (data) {
            setWeatherData(data);
            setError(null);
          } else {
            // Si null (à cause du délai), réessayer dans 5 secondes
            retryTimeout = setTimeout(fetchWeather, 5000);
          }
        } catch (weatherErr) {
          if (!isMounted) return;
          setError("Failed to load weather data");
          console.error(weatherErr);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  if (error) return <StatusMessage message={error} color="text-red-400" />;
  if (isLoading || !weatherData) return <StatusMessage message="Loading weather data..." />;

  return (
    <DashboardCard title={`Weather in ${city}`} icon={Cloud}>
      <MetricRow icon={Sun} label="Temperature" value={`${weatherData.temperature}`} iconColor="text-yellow-400" />
      <MetricRow icon={Cloud} label="Humidity" value={`${weatherData.humidity}`} iconColor="text-blue-400" />
      <MetricRow icon={Wind} label="Wind Speed" value={`${weatherData.windSpeed}`} iconColor="text-gray-400" />
      <StatusMessage message={weatherData.advice} />
    </DashboardCard>
  );
};

// Equipment Card Component
const EquipmentCard: React.FC = () => (
  <DashboardCard title="Equipment Status" icon={Tractor}>
    <MetricRow icon={Check} label="Active Tractors" value="3/5" iconColor="text-green-400" />
    <MetricRow icon={Clock} label="Hours Today" value="12.5 hrs" iconColor="text-yellow-400" />
    <MetricRow icon={AlertTriangle} label="Maintenance Due" value="2 vehicles" iconColor="text-red-400" />
    <StatusMessage message="Scheduled maintenance: Tractor #2 tomorrow" color="text-yellow-400" />
  </DashboardCard>
);

// Crop Card Component
const CropCard: React.FC = () => (
  <DashboardCard title="Crop Status" icon={Leaf}>
    <MetricRow icon={Leaf} label="Active Fields" value="12/15" iconColor="text-green-400" />
    <MetricRow icon={Calendar} label="Next Harvest" value="3 days" iconColor="text-blue-400" />
    <MetricRow icon={Cloud} label="Irrigation" value="Active (2/12)" iconColor="text-blue-400" />
    <StatusMessage message="Wheat fields ready for harvest next week" />
  </DashboardCard>
);

export default function DashboardPage() {
  const [metrics] = useState([
    { label: "Total Users", value: "1,200", icon: User },
    { label: "Active Sessions", value: "230", icon: Activity },
    { label: "System Health", value: "Operational", icon: CheckSquare },
  ]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [taskSuccess, setTaskSuccess] = useState("");

  useEffect(() => {
    // Charger les régions de l'utilisateur connecté
    const fetchRegions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const userId = getUserIdFromToken(token);
        if (!userId) return;
        const regionsResponse = await axios.get(`${API_URL}/lands/region/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (regionsResponse.data) {
          setRegions(regionsResponse.data);
        }
      } catch (e) {
        setRegions([]);
      }
    };
    fetchRegions();
  }, []);

  const getUserIdFromToken = (token: string): string | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      const { id } = JSON.parse(jsonPayload);
      return id;
    } catch (error) {
      return null;
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskLoading(true);
    setTaskError("");
    setTaskSuccess("");
    try {
      if (!selectedRegion || !taskDescription) {
        setTaskError("Veuillez sélectionner une région et saisir une description.");
        setTaskLoading(false);
        return;
      }
      console.log('selectedRegion:', selectedRegion, 'taskDescription:', taskDescription);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/lands/region/${selectedRegion}/activity`,
        { description: taskDescription },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setTaskSuccess("Tâche ajoutée !");
      setTaskDescription("");
      setSelectedRegion("");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setTaskError(err.response.data?.message || "Erreur lors de l'ajout de la tâche.");
      } else {
        setTaskError("Erreur lors de l'ajout de la tâche.");
      }
    } finally {
      setTaskLoading(false);
    }
  };

  const handleToggleDone = async (regionId: string, activityId: string, done: boolean) => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token!);
    if (!userId) return;
    await axios.put(`${API_URL}/lands/region/${regionId}/activity/${activityId}/done`, { done }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    // Rafraîchir la liste des régions...
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 p-8 flex justify-center">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <div className="mb-8 flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-green-500">Overview of system activity and performance</p>
          </div>
          <button
            className="ml-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all font-medium"
            onClick={() => setShowTaskModal(true)}
          >
            Ajouter une tâche
          </button>
        </div>

        {/* Modal d'ajout de tâche */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
                onClick={() => { setShowTaskModal(false); setTaskError(""); setTaskSuccess(""); }}
              >×</button>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Ajouter une tâche</h2>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                  <select
                    className="w-full p-2 border rounded-lg text-green-600 dark:text-green-400 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-400 focus:border-green-500"
                    value={selectedRegion}
                    onChange={e => setSelectedRegion(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner une région</option>
                    {regions.map(region => (
                      <option key={region._id} value={region._id}>{region.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-green-600 dark:text-green-400 bg-white dark:bg-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-green-500"
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                    required
                  />
                </div>
                {taskError && <div className="text-red-500 text-sm">{taskError}</div>}
                {taskSuccess && <div className="text-green-600 text-sm">{taskSuccess}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    onClick={() => setShowTaskModal(false)}
                    disabled={taskLoading}
                  >Annuler</button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                    disabled={taskLoading}
                  >{taskLoading ? 'Ajout...' : 'Ajouter'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => (
            <DashboardCard key={metric.label} title={metric.label} icon={metric.icon}>
              <MetricRow icon={metric.icon} label={metric.label} value={metric.value} />
            </DashboardCard>
          ))}
        </div>

       
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <WeatherCard />
              <EquipmentCard />
              <CropCard />
            </div>
       

        {/* Recent Activity Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">Recent Activity</h2>
          <StatusMessage message="User JohnDoe logged in." />
          <StatusMessage message="System update applied successfully." />
          <StatusMessage message="New user registered: JaneSmith." />
        </div>
      </div>
    </div>
  );
}
