import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Edit,
  Globe,
  LogOut,
  Mail,
  Phone,
  MapPin,
  User,
  Settings,
  Calendar,
  Camera,
  ChevronRight,
  Leaf
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://localhost:3000';

interface UserProfile {
  _id: string;
  fullname: string;
  email: string;
  phonenumber: string;
  address: string;
  image?: string;
  createdAt?: string;
}

interface Activity {
  date: string; // format ISO
  action: string; // ex: "a planté des pommes"
  crop?: string; // ex: "pommes"
  field?: string; // ex: "Champ Nord"
}

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { darkMode } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [regions, setRegions] = useState<any[]>([]);
  const [newDescriptions, setNewDescriptions] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<{ [regionId: string]: string }>({});
  const [appliedFilters, setAppliedFilters] = useState<{ [regionId: string]: string }>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [globalRegion, setGlobalRegion] = useState('');
  const [activityTab, setActivityTab] = useState<'todo' | 'history'>('todo');
  const [newActivityDate, setNewActivityDate] = useState('');
  const [debug, setDebug] = useState<string | null>(null);
  const [loadingActivityId, setLoadingActivityId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfileAndRegions = async () => {
      try {
        const token = localStorage.getItem('token');
        let userId = null;
        if (token) {
          userId = getUserIdFromToken(token);
          setDebug(`userId extrait du token: ${userId}`);
          if (userId) {
            try {
              const profileResponse = await axios.get(`${API_URL}/account/get-account/${userId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              setDebug(prev => prev + `\nRéponse backend: ${JSON.stringify(profileResponse.data)}`);
              if (profileResponse.data) {
                setUserProfile(profileResponse.data);
              } else {
                setError('Aucune donnée utilisateur trouvée.');
              }
            } catch (err: any) {
              setDebug(prev => prev + `\nErreur backend: ${err?.response?.data?.message || err.message}`);
              setError('Erreur lors de la récupération du profil utilisateur: ' + (err?.response?.data?.message || err.message));
            }
            // Récupérer toutes les régions de l'utilisateur
            try {
              const regionsResponse = await axios.get(`${API_URL}/lands/region/users/${userId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              if (regionsResponse.data) {
                setRegions(regionsResponse.data);
              }
            } catch (err: any) {
              // Si 404, on considère qu'il n'y a aucune région
              if (err.response && err.response.status === 404) {
                setRegions([]);
              } else {
                throw err;
              }
            }
          }
        }
        setLoading(false);
      } catch (error: any) {
        setError("Impossible de charger les régions: " + (error?.message || error));
        setLoading(false);
      }
    };
    fetchUserProfileAndRegions();
  }, [navigate]);

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

  // Confirmation avant déconnexion
  const handleLogout = async () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      } catch (err) {}
    }
  };

  const handleEditProfile = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const userId = getUserIdFromToken(token);
      if (userId) {
        navigate(`/profile/edit/${userId}`);
      }
    }
  };

  const handleChangeLanguage = () => {
    // à implémenter
  };

  const handleAddActivity = async (regionId: string, description: string) => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token!);
    if (!userId) return;

    try {
      await axios.post(
        `${API_URL}/lands/region/${regionId}/activity`,
        { 
          description, 
          date: newActivityDate ? new Date(newActivityDate).toISOString() : new Date().toISOString() 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setNewDescriptions({ ...newDescriptions, [regionId]: '' });
      setNewActivityDate('');

      // Rafraîchir la liste des régions
      const regionsResponse = await axios.get(`${API_URL}/lands/region/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (regionsResponse.data) {
        setRegions(regionsResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
      alert('Erreur lors de l\'ajout de l\'activité');
    }
  };

  const handleToggleDone = async (regionId: string, activityId: string, done: boolean) => {
    try {
      setLoadingActivityId(activityId);
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken(token!);
      if (!userId) {
        console.error('Identifiant utilisateur non trouvé');
        return;
      }

      // Utiliser l'API d'update activity en envoyant la description "Activité validée" 
      // lorsqu'une activité est marquée comme terminée
      await axios.put(
        `${API_URL}/lands/region/${regionId}/activity/${activityId}`, 
        { 
          description: done ? "Activité validée" : "À faire", 
          // Pas besoin d'envoyer la date car on ne la modifie pas
        }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Rafraîchir la liste des régions
      const regionsResponse = await axios.get(`${API_URL}/lands/region/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (regionsResponse.data) {
        setRegions(regionsResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
      alert('Erreur lors de la mise à jour de l\'activité. Veuillez réessayer.');
    } finally {
      setLoadingActivityId(null);
    }
  };

  const handleRemoveActivity = async (regionId: string, activityId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/lands/region/${regionId}/activity/${activityId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // Rafraîchir la liste des régions après suppression
      const userId = getUserIdFromToken(token!);
      if (userId) {
        const regionsResponse = await axios.get(`${API_URL}/lands/region/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (regionsResponse.data) setRegions(regionsResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert("Erreur lors de la suppression de l'activité");
    }
  };

  const handleRemoveLand = async (landId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette terre ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.delete(`${API_URL}/lands/${landId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Rafraîchir la liste des régions
      const userId = getUserIdFromToken(token);
      if (userId) {
        const regionsResponse = await axios.get(`${API_URL}/lands/region/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (regionsResponse.data) {
          setRegions(regionsResponse.data);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la terre:', error);
      alert('Erreur lors de la suppression de la terre');
    }
  };

  // Fonctions utilitaires pour la gestion des dates
  function isPast(dateString: string) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(dateString);
    d.setHours(0,0,0,0);
    return d < today;
  }

  function isTodayOrFuture(dateString: string) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(dateString);
    d.setHours(0,0,0,0);
    return d >= today;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (loading)
    return (
      <div className={`w-screen min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} py-8 px-2`}>
        <div className={`w-full max-w-2xl ${darkMode ? 'bg-white/10 backdrop-blur-lg border-white/20' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl p-8 flex flex-col items-center mx-auto border transition-all duration-300 hover:shadow-green-400/30 hover:scale-[1.01]`}>
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-green-500">Chargement du profil...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className={`w-screen min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} py-8 px-2`}>
        <div className={`${darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-100 border-red-400'} rounded-lg p-4 text-red-400 border`}>
          {error}
          {debug && (
            <pre className="mt-4 text-xs text-yellow-300 whitespace-pre-wrap">{debug}</pre>
          )}
        </div>
      </div>
    );

  return (
    <div className={`w-screen min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} py-12 px-4`}>
      <div className={`w-full max-w-3xl ${darkMode ? 'bg-gray-800 border-white/20' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl p-10 flex flex-col items-center mx-auto border transition-all duration-300 hover:shadow-green-400/30 relative`}>
        {/* Header Area avec icônes langue et déconnexion - repositionnés à l'intérieur de la carte */}
        <div className="absolute top-6 right-6 flex space-x-3 z-20">
          <button
            onClick={handleChangeLanguage}
            className={`p-2.5 rounded-full transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Changer la langue"
          >
            <Globe className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </button>
          <button
            onClick={handleLogout}
            className={`p-2.5 rounded-full transition-colors ${darkMode ? 'bg-gray-700 hover:bg-red-900/50' : 'bg-gray-100 hover:bg-red-100'}`}
            title="Déconnexion"
          >
            <LogOut className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
          </button>
        </div>
        {/* Cercle image profil, positionné en relatif */}
        <div className="mt-8 mb-6 z-10">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center border-4 border-green-500 shadow-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            {userProfile?.image ? (
              <img
                src={`${API_URL}/uploads/${userProfile.image}`}
                alt="Profil"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-20 h-20 text-green-500" />
            )}
          </div>
        </div>
        {/* Le reste de la carte commence ici, avec un padding-top pour laisser la place à l'image */}
        <div className="flex flex-col items-center w-full">
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile?.fullname}</h1>
          {userProfile?.createdAt && (
            <div className="flex items-center justify-center mt-1 mb-4 text-gray-400 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Membre depuis {new Date(userProfile.createdAt).toLocaleDateString()}
            </div>
          )}
          <div className="mt-4 mb-8">
            <button
              onClick={handleEditProfile}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-all text-lg font-medium"
            >
              <Edit className="h-5 w-5 inline mr-2" />
              Modifier le profil
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className={`border-t w-full mt-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-center">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-8 py-4 font-medium text-lg transition-colors ${
                activeTab === 'info'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-8 py-4 font-medium text-lg transition-colors ${
                activeTab === 'activity'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Activité
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="p-1 sm:p-1 w-full">
          {activeTab === 'info' && (
            <div className="space-y-9">
              <div className="grid grid-cols-1 gap-8 w-full">
                {/* Contact Info Card */}
                <div className={`rounded-xl p-10 w-full ${darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
                  <h3 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Coordonnées</h3>
                  <div className="space-y-8">
                    <div className="flex items-start">
                      <div className={`p-3 rounded-lg mr-6 ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                        <Mail className="text-green-400 h-6 w-6" />
                      </div>
                      <div>
                        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Email</p>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'} text-lg font-medium`}>{userProfile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className={`p-3 rounded-lg mr-6 ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                        <Phone className="text-green-400 h-6 w-6" />
                      </div>
                      <div>
                        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Téléphone</p>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'} text-lg font-medium`}>{userProfile?.phonenumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className={`p-3 rounded-lg mr-6 ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                        <MapPin className="text-green-400 h-6 w-6" />
                      </div>
                      <div>
                        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Adresse</p>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'} text-lg font-medium`}>{userProfile?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'activity' && (
            <div className={`${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-xl p-6 border`}>
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Activité agricole</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Voici l'historique de vos actions sur vos fermes.</p>
              {/* Onglets À faire / Historique */}
              <div className="flex gap-2 mb-6">
                <button
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activityTab === 'todo' 
                      ? 'bg-green-500 text-white' 
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActivityTab('todo')}
                >
                  À faire
                </button>
                <button
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activityTab === 'history' 
                      ? 'bg-green-500 text-white' 
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActivityTab('history')}
                >
                  Historique
                </button>
              </div>
              {/* Filtres globaux */}
              <div className="flex flex-col md:flex-row gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Rechercher une activité..."
                  value={globalFilter}
                  onChange={e => setGlobalFilter(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'border-gray-500 bg-gray-800 text-white focus:border-green-500' 
                      : 'border-gray-300 bg-white text-gray-800 focus:border-green-600'
                  } text-sm focus:ring-1 focus:ring-green-500 outline-none`}
                />
                <select
                  value={globalRegion}
                  onChange={e => setGlobalRegion(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'border-gray-500 bg-gray-800 text-white focus:border-green-500' 
                      : 'border-gray-300 bg-white text-gray-800 focus:border-green-600'
                  } text-sm focus:ring-1 focus:ring-green-500 outline-none`}
                >
                  <option value="">Toutes les régions</option>
                  {regions.map(r => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-6 space-y-8">
                {regions.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center min-h-[400px] bg-opacity-50 rounded-xl border border-dashed border-gray-300">
                    <img 
                      src="/assets/crop.png" 
                      alt="Aucune région" 
                      className="w-64 h-64 mx-auto mb-8"
                    />
                    <h3 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>
                      Aucune région trouvée
                    </h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 max-w-md mx-auto text-lg`}>
                      Vous n'avez pas encore créé de régions. Créez une région pour commencer à gérer vos cultures et suivre vos activités agricoles.
                    </p>
                    <button
                      onClick={() => navigate('/regions')}
                      className="bg-green-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-green-700 hover:scale-105 transition-all shadow-lg"
                    >
                      Créer une région
                    </button>
                  </div>
                ) : (
                  regions
                    .filter(region => !globalRegion || region._id === globalRegion)
                    .map((region: any) => {
                      let activities = region.activities || [];
                      // Filtrage global texte
                      if (globalFilter) {
                        activities = activities.filter((act: any) => act.description.toLowerCase().includes(globalFilter.toLowerCase()));
                      }
                      // Filtrage global région déjà appliqué au niveau des régions
                      const today = new Date();
                      const isToday = (isoDate?: string) => {
                        if (!isoDate) return false;
                        const d = new Date(isoDate);
                        return d.getFullYear() === today.getFullYear() &&
                               d.getMonth() === today.getMonth() &&
                               d.getDate() === today.getDate();
                      };
                      
                      // Type pour les activités
                      type ActivityType = {
                        _id: string;
                        description: string;
                        date: string;
                        done: boolean;
                      };
                      
                      // À faire : uniquement les non-faites avec dates présentes ou futures
                      const todo: ActivityType[] = activities.filter((act: any) => !act.done && act.date && isTodayOrFuture(act.date));
                      // Historique : uniquement les activités faites OU avec dates passées (qui ne sont pas dans todo)
                      const done: ActivityType[] = activities.filter((act: any) => {
                        // Soit l'activité est marquée comme faite
                        // Soit la date est passée et l'activité n'est pas faite
                        const isDoneOrPast = act.done || (act.date && isPast(act.date) && !act.done);
                        // On vérifie que l'activité n'est pas déjà dans la liste todo
                        const notInTodoList = !todo.some(t => t._id === act._id);
                        return isDoneOrPast && notInTodoList;
                      });
                      if (activityTab === 'todo' && todo.length === 0) return undefined;
                      if (activityTab === 'history' && done.length === 0) return undefined;
                      return (
                        <div key={region._id} className="mb-10">
                          <h4 className={`${darkMode ? 'text-green-400 border-green-500/30' : 'text-green-600 border-green-200'} font-semibold mb-4 text-lg flex items-center gap-2 border-b pb-2`}>
                            <Globe className="h-5 w-5" /> {region.name}
                          </h4>
                          <div className="space-y-6">
                            {activityTab === 'todo' && todo.length > 0 && (
                              <div>
                                <h5 className={`${darkMode ? 'text-white' : 'text-gray-800'} font-semibold mb-3 flex items-center gap-2`}>
                                  <div className="w-1 h-5 bg-yellow-400 rounded-full"></div>
                                  À faire
                                </h5>
                                <div className="space-y-3">
                                  {todo.map((act: any) => {
                                    console.log('ACTIVITY DATE:', act.date);
                                    return (
                                      <div 
                                        key={act._id} 
                                        className={`${
                                          darkMode
                                            ? 'bg-gray-800 border-gray-600 hover:bg-gray-750'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                        } border rounded-lg p-4 flex items-center gap-3 shadow-md transition-all duration-200 ${act.done ? 'opacity-70' : ''}`}
                                      >
                                        <Leaf className={`w-6 h-6 ${act.done ? 'text-green-400' : 'text-yellow-400'}`} />
                                        <div className="flex-1">
                                          <div className={`${
                                            act.done 
                                              ? 'line-through ' + (darkMode ? 'text-gray-300' : 'text-gray-500') 
                                              : darkMode ? 'text-white' : 'text-gray-800'
                                          } font-medium`}>
                                            {act.description}
                                          </div>
                                          {act.date && (
                                            <div className="text-xs text-gray-500 mt-1">
                                              {formatDate(act.date)}
                                            </div>
                                          )}
                                          <div className={`text-xs ${act.done ? 'text-green-400' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {act.done ? "Activité validée (aujourd'hui)" : 'À faire'}
                                          </div>
                                        </div>
                                        {!act.done && (
                                          <button
                                            className="ml-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors text-xs font-medium min-w-[60px]"
                                            onClick={() => handleToggleDone(region._id, act._id, true)}
                                            title="Marquer comme fait"
                                            disabled={loadingActivityId === act._id}
                                          >
                                            {loadingActivityId === act._id ? (
                                              <div className="flex items-center justify-center">
                                                <div className="w-3 h-3 border-t-2 border-r-2 border-white rounded-full animate-spin mr-1"></div>
                                                <span>...</span>
                                              </div>
                                            ) : (
                                              "Valider"
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {activityTab === 'history' && done.length > 0 && (
                              <div>
                                <h5 className={`${darkMode ? 'text-green-400' : 'text-green-600'} font-semibold mb-3 flex items-center gap-2`}>
                                  <div className="w-1 h-5 bg-green-400 rounded-full"></div>
                                  Historique
                                </h5>
                                <div className="space-y-3">
                                  {done.map((act: any) => (
                                    <div 
                                      key={act._id} 
                                      className={`${
                                        darkMode
                                          ? 'bg-gray-800 border-gray-600 hover:bg-gray-750 border-l-green-500'
                                          : 'bg-white border-gray-200 hover:bg-gray-50 border-l-green-600'
                                      } border-l-4 rounded-lg p-4 flex items-center gap-3 shadow-md transition-all duration-200`}
                                    >
                                      <Leaf className={`${darkMode ? 'text-green-400' : 'text-green-600'} w-6 h-6`} />
                                      <div className="flex-1">
                                        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} font-medium line-through`}>
                                          {act.description}
                                        </div>
                                        {act.date && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            {formatDate(act.date)}
                                          </div>
                                        )}
                                        <div className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                          Activité validée
                                        </div>
                                      </div>
                                      <div className={`${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'} text-xs py-1 px-2 rounded-md`}>
                                        TERMINÉ
                                      </div>
                                      <button
                                        className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-xs font-medium"
                                        onClick={() => handleRemoveActivity(region._id, act._id)}
                                        title="Supprimer cette activité"
                                      >
                                        Supprimer
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {activityTab === 'todo' && todo.length === 0 && (
                              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} italic text-center py-4`}>Aucune activité à faire</div>
                            )}
                            {activityTab === 'history' && done.length === 0 && (
                              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} italic text-center py-4`}>Aucune activité validée</div>
                            )}
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;