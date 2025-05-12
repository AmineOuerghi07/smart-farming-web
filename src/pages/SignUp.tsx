import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmpassword: '',
    phonenumber: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmpassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
      setLoading(false);
    }
  };

  const inputClasses = `w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300
    ${darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'}`;

  const labelClasses = `block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left side - Form - Full width on mobile, half on desktop */}
      <div className={`w-full md:w-1/2 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 md:p-12 flex items-center justify-center relative`}>
        {/* Decorative image - Hidden on small screens */}
        {!darkMode && (
          <div className="absolute bottom-0 left-0 hidden md:block">
            <img 
              src="/assets/green.jpg" 
              alt="Decorative leaves" 
              className="w-64 opacity-40"
            />
          </div>
        )}

        <div className="relative z-10 w-full max-w-md mx-auto py-8">
          <div className="flex items-center gap-2 mb-6">
            <img src="/assets/logo.jpg" className="h-8" alt="Logo" />
            <span className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-[#0B3424]'}`}>Smart Farm</span>
          </div>

          <div className="mb-6">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-[#0B3424]'}`}>Create Account</h2>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Join Smart Farm and start managing your farm intelligently
            </p>
          </div>

          {error && (
            <div className={`mb-4 p-3 ${darkMode ? 'bg-red-900/50 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg text-red-600 text-sm animate-fadeIn`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClasses}>Full Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className={labelClasses}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className={labelClasses}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClasses}>Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmpassword"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Phone and Address in a grid on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Phone Number</label>
                <input
                  type="tel"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg transform active:scale-98 transition-all duration-300 shadow-md flex items-center justify-center mt-6
                ${darkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-[#0B3424] hover:bg-[#0B3424]/90 text-white'}
                ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className={`mt-6 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <p>
              Already have an account?{' '}
              <Link 
                to="/login" 
                className={`font-medium ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-[#0B3424] hover:text-[#0B3424]/80'} hover:underline`}
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image - Hidden on mobile, visible on desktop */}
      <div className={`hidden md:flex w-full md:w-1/2 ${darkMode ? 'bg-gray-900' : 'bg-[#0B3424]'} relative overflow-hidden`}>
        <div className="absolute inset-0">
          <img 
            src="/assets/plant.jpg" 
            alt="Background" 
            className={`w-full h-full object-cover ${darkMode ? 'opacity-30' : 'opacity-50'}`}
          />
        </div>
        <div className="relative z-10 p-12 flex items-center">
          <div>
            <h1 className="text-white text-4xl font-bold mb-4">Welcome to Smart Farm</h1>
            <p className="text-gray-300 text-lg max-w-md leading-relaxed">
              Join our community of smart farmers and optimize your agricultural production with our innovative region management solutions. Monitor, analyze, and improve your farm's performance in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 