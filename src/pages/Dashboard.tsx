import { useState, useEffect } from "react";
import { Activity, User, CheckSquare, Leaf, Calendar, Cloud, Clock, AlertTriangle, Check, Tractor, Sun, Wind } from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import MetricRow from "../components/MetricRow";
import StatusMessage from "../components/StatusMessage";
import { WeatherService } from "../services/weatherService";
import axios from "axios";
import { PowerBIEmbed } from 'powerbi-client-react';
import { models, Report } from 'powerbi-client';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const API_URL = 'http://localhost:3000';

// Weather Card Component
const WeatherCard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
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


  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const fetchWeather = async () => {
      try {
        if (!isMounted) return;
        // Obtenir la position de l'utilisateur
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        // Appeler le backend avec les coordonnées
        const data = await WeatherService.getWeatherByCoordinates(latitude, longitude);
        if (!isMounted) return;
        if (data) {
          setWeatherData(data);
          setError(null);
        } else {
          retryTimeout = setTimeout(fetchWeather, 5000);
        }
      } catch (err) {
        setError("Impossible de récupérer la météo.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchWeather();
    return () => { isMounted = false; if (retryTimeout) clearTimeout(retryTimeout); };
  }, []);

  if (error) return <StatusMessage message={error} color="text-red-400" />;
  if (isLoading || !weatherData) return <StatusMessage message="Chargement des données météo..." />;

  return (
    <DashboardCard title={`Météo - ${weatherData.city || 'Votre position'}`} icon={Cloud}>
      <MetricRow icon={Sun} label="Température" value={`${weatherData.temperature}`} iconColor="text-yellow-400" />
      <MetricRow icon={Cloud} label="Humidité" value={`${weatherData.humidity}`} iconColor="text-blue-400" />
      <MetricRow icon={Wind} label="Vent" value={`${weatherData.windSpeed}`} iconColor="text-gray-400" />
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
  const { darkMode } = useTheme();
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
  const [report, setReport] = useState<Report>();
  const [taskDate, setTaskDate] = useState('');

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
          let data : any = regionsResponse.data;
          setRegions(data);
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
        { description: taskDescription, date: new Date(taskDate).toISOString() },
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
      setTaskDate('');
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
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} w-full min-h-screen p-8 flex justify-center`}>
      <div className="w-full max-w-6xl">

        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>
          <div className="flex justify-center items-center w-full h-[90vh] bg-gray-900">
            <div className="w-[95%] h-[95%]">
              <PowerBIEmbed
                embedConfig={{
                  type: 'report',
                  id: '4be6380a-b3b9-4d2a-87b5-c8790649196a',
                  embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=4be6380a-b3b9-4d2a-87b5-c8790649196a&groupId=4fc768a7-e9be-44c9-8cda-27fad8373a4f&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLU5PUlRILUVVUk9QRS1JLVBSSU1BUlktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7InVzYWdlTWV0cmljc1ZOZXh0Ijp0cnVlfX0%3d',
                  accessToken: "H4sIAAAAAAAEAC2Tx66rWAJF_-VOaYl4ALf0BodgsjE5zMg5GDCpVP_et0s1X4OttbT_-nknVz8l-c9_f8ioyYXQakCbx5qoI5fd5MHV4uvEzcNR9S8mQeGqa8-FR-SIJgamnV6ipONBX5LGN16kGip8cz6M46ZrE1UYxfBtHgYh9V6ySGVaerTPgJ_KYHwKNzzGbZMx7UG-bdvQxNaOo1KYNLEk6fpmcBF_GJgHFIF91qfrYKVIVXxmfbISxY3w8jkjFapiNqoQPuwBb0ZFfaI2IdVFs5pSy16vKbvKlvqaljCFnVHo8n1vsvWeK_2lc42IkwNzeIrL4wwgAT5xeKZIWaVgTaKCy_se652EeCaybYkQaN9tvXlXArNwgbAn0VcTbJkEz8iMxrbut71DkV5dB3i2ZXAnfKknizUG0Wv0Wyb6CveSIOseBstNXC-_DuJ1KT9lOT7vQ_LO-enh-4eqFevEQNCEnxoX0d9BcT-RhNihIUkA2pNQC4tMwX1AOldOk3oXb23JJkQ_sx1l5YQJga1cwYqDIQkwvq_YJDCcet-lvgrBMGfYUh82kjaCiDtmyOaFYtmVGfPhXX82N8r3wvzMKkHH06lZEcZSxBNgW2B1ETsF9WBuYdd-KscDuqfu6wh0eZBpbG7ZF12PwUBTs6w815rVLq6K4450LdD1tUk5eecJMH4IT3izHlajdGuIKXZ1MSd0SaG8kQ8QiqJTBkkoI-s8IDVYWNl-IkvIzIptedn93A1qC9c3rEYeGC02DwrNBYcdAdVPezPwJeCYtN85hD3VbWBHhnFipuMwwJ2CLQXaHYI3_MI9nxMPog8OBRRi3ysy6uvEasuFvdh62bwvp5w2AvQGLyshhX_-_Pznh1-ueZu04vq9iUmG--MmNkMx_VtqmkNTU4S2oWRtI-uejvIth-8yuC_IieGGnTgTpPi1IKyfjDOoA8MYybt-wmBrzz03rJs5fCqFLzRMbymfU_hojrlsK6BIrZGvTeJhr2zTm0z31q2CbI-S7UXQzKu9CcbikMq332VaN3Q2aZHGOn2MfJMphRrlwj7-hr7eUjKxU77Aq9gFrbFPH5jgi0JHH2jIyyi1omIm6rzus0r0rUjgyFGrb-nHg0zcj07VMusx2tfDVYXPKB4L4QndGZHOkrp7wrti_-XErcQZbpufge9994eEFjeb-VioZAql43DVqKggrGGWkAN-Ak69XeqI0FilqUZ2qkH8V_M118Wi-L-WNUFMiF7daoLLRfwzPKEd49Y_lNNUY7J9l-IXK8sy6U3W8-SNSrr87mXSJehLy5a-Y97ueL7EKr0-2KCRX02OtFwn5_IZrI4vi9tVrUCECSfTirBnJK2m94uDY9YjwjphNVjAQ1woJi_zciQhKQasfXsbJVSTAk_nw8zvvXw9VTj5p2uD7AYezK2bitAk5SGLKyAVY4tLcRNL0Nj0ZkGSH2O3I_7oMtKhNgKrSO5lmQwTcYwZiT3DF41xjNTaVlG4-m0XfwzTSdjf2szA1mwlztMl9bm1hqpw4HDSW34xlmYKsaJxMdq5NE0bcCxQirWhUF-35fMO0JeBNYrt8zzI0QoDPlLGj4et9ylI07e9mi9_iPX8XWdIUlmtSv5f89__A1GrxC8aBgAA.eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLU5PUlRILUVVUk9QRS1JLVBSSU1BUlktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJleHAiOjE3NDQ3NzcwMzEsImFsbG93QWNjZXNzT3ZlclB1YmxpY0ludGVybmV0Ijp0cnVlfQ==",
                  tokenType: models.TokenType.Embed,
                  settings: {
                    panes: {
                      filters: {
                        expanded: false,
                        visible: false
                      },
                      pageNavigation: {
                        visible: false,
                      },
                    },
                    background: models.BackgroundType.Transparent,
                  }
                }}
                eventHandlers={
                  new Map([
                    ['loaded', function () { console.log('Report loaded'); }],
                    ['rendered', function () { console.log('Report rendered'); }],
                    ['visualClicked', () => console.log('visual clicked')],
                    ['pageChanged', (event) => console.log(event)],
                  ])
                }
                cssClassName="w-full h-full"
                getEmbeddedComponent={(embeddedReport) => {
                  setReport(embeddedReport as Report);
                }}
              />
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-8 flex items-center gap-4">
          <div>
            <p className={`${darkMode ? 'text-green-500' : 'text-green-600'}`}>Overview of system activity and performance</p>
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
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-xl shadow-lg p-8 w-full max-w-md relative`}>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
                onClick={() => { setShowTaskModal(false); setTaskError(""); setTaskSuccess(""); }}
              >×</button>
              <h2 className="text-xl font-bold mb-4">Ajouter une tâche</h2>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Région</label>
                  <select
                    className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:ring-2 focus:ring-green-400 focus:border-green-500`}
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
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Description</label>
                  <input
                    type="text"
                    className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-green-500`}
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Date de l'activité</label>
                  <input
                    type="date"
                    className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:ring-2 focus:ring-green-400 focus:border-green-500`}
                    value={taskDate}
                    onChange={e => setTaskDate(e.target.value)}
                    required
                  />
                </div>
                {taskError && <div className="text-red-500 text-sm">{taskError}</div>}
                {taskSuccess && <div className="text-green-600 text-sm">{taskSuccess}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} rounded-lg`}
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

      </div>
    </div>
  );
}
