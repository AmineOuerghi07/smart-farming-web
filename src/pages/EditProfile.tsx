import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserService } from "../services/userService";
import { CircleUser, Loader2, Camera, Save, Mail, Phone, MapPin, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

interface UserProfile {
  _id: string;
  fullname: string;
  email: string;
  phonenumber: string;
  address: string;
  image?: string;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { darkMode } = useTheme();
  
  const [formData, setFormData] = useState<UserProfile>({
    _id: '',
    fullname: '',
    email: '',
    phonenumber: '',
    address: '',
  });

  const { isAuthenticated } = useAuth();
  
  


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
          if (!token ) {

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



  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      setFetchLoading(true);
      try {
        if (!id) {
          throw new Error('User ID not found');
        }

        const userData = await UserService.getProfile(id);
        setFormData(userData);
        
        // Set image preview if available
        if (userData.image) {
          setImagePreview(`http://localhost:3000/uploads/${userData.image}`);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('fullname', formData.fullname);
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('phonenumber', formData.phonenumber);
      formDataToSend.append('address', formData.address);
      
      // Add file if selected
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput?.files?.[0]) {
        formDataToSend.append('file', fileInput.files[0]);
      }

      if (!id) {
        throw new Error('User ID not found');
      }

      const result = await UserService.updateProfile(id, formDataToSend);
      console.log('Profile updated successfully', result);
      
      // Redirect to profile page after successful update
      navigate('/profile');
      
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md mx-auto">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
          
          {/* Clean header with title */}
          <div className="pt-6 pb-2 text-center">
            <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Modifier votre profil
            </h1>
          </div>

          {/* Profile picture section */}
          <div className="flex justify-center mt-4 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-500 bg-white">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image"
                />
                <label
                  htmlFor="profile-image"
                  className="cursor-pointer block w-full h-full"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </label>
              </div>
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-green-500 p-1.5 rounded-full cursor-pointer shadow-md"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </label>
            </div>
          </div>

          {/* Form content */}
          <div className="px-6 pb-6">
            {/* Error message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            {fetchLoading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name field */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1.5`}>
                    Nom complet
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />
                    </div>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-2.5 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-800'
                      } border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none`}
                      required
                    />
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1.5`}>
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-2.5 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-800'
                      } border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none`}
                      required
                    />
                  </div>
                </div>

                {/* Phone & Address fields - Stack on mobile, side by side on tablet/desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1.5`}>
                      Téléphone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className={`h-5 w-5 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />
                      </div>
                      <input
                        type="tel"
                        name="phonenumber"
                        value={formData.phonenumber}
                        onChange={handleInputChange}
                        className={`w-full pl-10 p-2.5 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        } border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1.5`}>
                      Adresse
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className={`h-5 w-5 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full pl-10 p-2.5 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        } border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-2.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      'Sauvegarder'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;