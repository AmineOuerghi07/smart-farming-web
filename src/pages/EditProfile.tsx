import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserService } from "../services/userService";
import { CircleUser, Loader2, Camera, Save, Sun, Moon } from "lucide-react";
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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} py-12 flex items-center justify-center transition-colors duration-300`}>
      <div className="max-w-2xl w-full px-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl overflow-hidden transition-colors duration-300`}>
          {/* Header with button and title */}
          <div className="relative h-28 bg-gradient-to-r from-green-600 to-green-500">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-center items-center">
              <h1 className="text-xl font-semibold text-white">Edit Profile</h1>
            </div>
            
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden shadow-lg bg-gray-700">
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
                  <div className="w-full h-full flex items-center justify-center">
                    <CircleUser className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </label>
            </div>
          </div>

          {/* Form content centered with more top padding for larger image */}
          <div className="pt-20 px-8 pb-8">
            {/* Error message */}
            {error && (
              <div className="mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-md">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}
            
            {fetchLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile data...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'} border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'} border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors`}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleInputChange}
                      className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'} border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'} border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors`}
                      required
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
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