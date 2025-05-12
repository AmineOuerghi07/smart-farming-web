import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const { darkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left side - Dark with leaves - Full width on mobile, half on desktop */}
      <div className="w-full md:w-1/2 bg-[#0B3424] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[300px] md:min-h-screen">
        {/* Plant image background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/plant.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        
        {/* Top content - moved down slightly with adjusted margins */}
        <div className="relative z-10 mt-4 md:mt-8">
          <div className="flex items-center gap-2 mb-6 md:mb-12">
            <img src="/assets/logo.jpg" className="h-8" alt="Logo" />
            <span className="text-white text-xl font-medium">Smart Farm</span>
          </div>

          <div className="mt-4 md:mt-16">
            <h1 className="text-3xl md:text-5xl text-white font-bold mb-4 md:mb-6">Welcome Back!</h1>
            <p className="text-gray-300 text-base md:text-lg max-w-md leading-relaxed">
              Smart Farm helps you efficiently manage your agricultural regions. Our innovative platform provides real-time monitoring and expert guidance to optimize your farm's productivity.
            </p>
          </div>
        </div>

        {/* Google button properly centered vertically and horizontally - Hidden on mobile */}
        <div className="relative z-10 hidden md:flex items-center justify-center w-full mb-16">
          <button 
            onClick={() => {/* Handle Google login */}} 
            className="flex items-center justify-center gap-3 bg-white py-3 px-6 rounded-lg w-80 hover:bg-gray-50 transition-all duration-300 shadow-lg"
          >
            <img src="/assets/google.png" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">Login with Google</span>
          </button>
        </div>
      </div>

      {/* Right side - White with form - Full width on mobile, half on desktop */}
      <div className={`w-full md:w-1/2 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 md:p-12 flex items-center justify-center relative transition-colors duration-300`}>
        {/* Repositioned decorative image - Hidden on mobile */}
        <div className="absolute bottom-1 right-1 max-w-xs max-h-70 overflow-hidden opacity-40 z-0 hidden md:block">
          <img 
            src="/assets/fleura.png" 
            alt="Decorative leaves" 
            className="w-50"
          />
        </div>
        
        {/* Google button on mobile only */}
        <div className="relative z-10 flex md:hidden items-center justify-center w-full mb-6 mt-4">
          <button 
            onClick={() => {/* Handle Google login */}} 
            className="flex items-center justify-center gap-3 bg-white py-3 px-6 rounded-lg w-full max-w-xs hover:bg-gray-50 transition-all duration-300 shadow-lg"
          >
            <img src="/assets/google.png" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">Login with Google</span>
          </button>
        </div>
        
        <div className="w-full max-w-md z-10 relative">
          <div className="mb-6 md:mb-8">
            <h2 className={`${darkMode ? 'text-green-400' : 'text-[#0B3424]'} text-xl md:text-2xl font-semibold transition-colors duration-300`}>Please Enter Your Login Details</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} mt-2 transition-colors duration-300`}>Access your Smart Farm dashboard</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-1">
              <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'} text-sm font-medium transition-colors duration-300`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#0B3424] focus:border-transparent transition-all duration-300`}
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'} text-sm font-medium transition-colors duration-300`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#0B3424] focus:border-transparent transition-all duration-300`}
                  required
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                >
                  {showPassword ? 
                    <EyeOff size={20} className="animate-fadeIn" /> : 
                    <Eye size={20} className="animate-fadeIn" />
                  }
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[#0B3424]"
                />
                <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className={`text-sm ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-[#0B3424] hover:text-[#0B3424]/80'} hover:underline transition-colors`}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B3424] text-white py-3 rounded-lg hover:bg-[#0B3424]/90 transform active:scale-98 transition-all duration-300 shadow-md"
            >
              Login to Dashboard
            </button>
          </form>

          <div className={`mt-6 md:mt-8 text-center ${darkMode ? 'bg-gray-700' : 'bg-white'} p-2 rounded-lg transition-colors duration-300`}>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
              Don't have an account?{' '}
              <Link to="/register" className={`${darkMode ? 'text-green-400' : 'text-[#0B3424]'} hover:underline font-medium transition-colors duration-300`}>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;