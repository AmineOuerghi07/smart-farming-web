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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [regions, setRegions] = useState<any[]>([]);
  const [newDescriptions, setNewDescriptions] = useState<Record<string, string>>({});

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `Membre depuis le ${date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;
  };

  useEffect(() => {
    const fetchUserProfileAndRegions = async () => {
      try {
        const token = localStorage.getItem('token');
        let userId = null;
        if (token) {
          userId = getUserIdFromToken(token);
          if (userId) {
            const profileResponse = await axios.get(`${API_URL}/account/get-account/${userId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (profileResponse.data) {
              setUserProfile(profileResponse.data);
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
      } catch (error) {
        setError("Impossible de charger les régions");
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
    await axios.post(`${API_URL}/lands/region/${regionId}/activity`, { description }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    setNewDescriptions({ ...newDescriptions, [regionId]: '' });
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
  };

  if (loading)
    return (
      <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2332] via-[#181e29] to-[#1a2332] py-8 px-2">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 flex flex-col items-center mx-auto border border-white/20 transition-all duration-300 hover:shadow-green-400/30 hover:scale-[1.01]">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-green-500">Chargement du profil...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2332] via-[#181e29] to-[#1a2332] py-8 px-2">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">{error}</div>
      </div>
    );

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2332] via-[#181e29] to-[#1a2332] py-8 px-2">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center mx-auto border border-white/20 transition-all duration-300 hover:shadow-green-400/30 hover:scale-[1.01]">
        {/* Header Area avec icônes langue et déconnexion */}
        <div className="absolute top-6 right-6 flex space-x-2 z-20">
          <button
            onClick={handleChangeLanguage}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            title="Changer la langue"
          >
            <Globe className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 bg-white/10 rounded-full hover:bg-red-500/50 transition-colors"
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5 text-white" />
          </button>
        </div>
        {/* Cercle image profil, positionné en relatif */}
        <div className="mt-8 mb-2 z-10">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-green-400 shadow-lg overflow-hidden">
            {userProfile?.image ? (
              <img
                src={`${API_URL}/uploads/${userProfile.image}`}
                alt="Profil"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-16 h-16 text-green-500" />
            )}
          </div>
        </div>
        {/* Le reste de la carte commence ici, avec un padding-top pour laisser la place à l'image */}
        <div className="flex flex-col items-center w-full">
          <h1 className="text-3xl font-bold text-white mt-2">{userProfile?.fullname}</h1>
          {userProfile?.createdAt && (
            <div className="flex items-center justify-center mt-1 text-gray-400 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {formatJoinDate(userProfile.createdAt)}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleEditProfile}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Edit className="h-4 w-4 inline mr-2" />
              Modifier le profil
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all">
              <Settings className="h-4 w-4 inline mr-2" />
              Paramètres
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="border-t border-gray-700 w-full mt-6">
          <div className="flex justify-center">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-8 py-4 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-8 py-4 font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white'
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Contact Info Card */}
                <div className="bg-gray-700/50 rounded-xl p-8 border border-gray-600 w-full">
                  <h3 className="text-xl font-semibold text-white mb-4">Coordonnées</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-green-500/20 p-2 rounded-lg mr-4">
                        <Mail className="text-green-400 h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white">{userProfile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-green-500/20 p-2 rounded-lg mr-4">
                        <Phone className="text-green-400 h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Téléphone</p>
                        <p className="text-white">{userProfile?.phonenumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-green-500/20 p-2 rounded-lg mr-4">
                        <MapPin className="text-green-400 h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Adresse</p>
                        <p className="text-white">{userProfile?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Quick Actions Card */}
                <div className="bg-gray-700/50 rounded-xl p-8 border border-gray-600 w-full">
                  <h3 className="text-xl font-semibold text-white mb-4">Actions rapides</h3>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-center bg-gray-600 hover:bg-gray-500 p-4 rounded-lg text-white transition-colors">
                      <Settings className="mr-3 h-5 w-5 text-green-400" />
                      Préférences de notification
                    </button>
                    <button className="w-full flex items-center justify-center bg-gray-600 hover:bg-gray-500 p-4 rounded-lg text-white transition-colors">
                      <Globe className="mr-3 h-5 w-5 text-green-400" />
                      Changer la langue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'activity' && (
            <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
              <h3 className="text-xl font-semibold text-white mb-4">Activité agricole</h3>
              <p className="text-gray-300 mb-6">Voici l'historique de vos actions sur vos fermes.</p>
              <div className="mt-6 space-y-8">
                {regions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Aucune activité ajoutée.</p>
                  </div>
                ) : (
                  regions.map((region: any) => (
                    <div key={region._id} className="mb-6">
                      <h4 className="text-green-400 font-semibold mb-2">{region.name}</h4>
                      {/* Liste des activités (pas de formulaire d'ajout ici) */}
                      <table className="w-full text-left">
                        <tbody>
                          {region.activities && region.activities.length > 0 ? (
                            region.activities.map((act: { description: string; done: boolean; _id: string }, idx: number) => (
                              <tr key={act._id}>
                                <td className="py-2 text-white">
                                  <input
                                    type="checkbox"
                                    checked={act.done}
                                    onChange={() => handleToggleDone(region._id, act._id, !act.done)}
                                    className="mr-2 accent-green-500"
                                  />
                                  <span className={act.done ? 'line-through text-green-500' : ''}>{act.description}</span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td className="text-gray-400 italic">Aucune activité</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))
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