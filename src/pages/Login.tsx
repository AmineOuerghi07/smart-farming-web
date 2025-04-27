import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

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
    <div className="flex min-h-screen">
      {/* Left side - Dark with leaves */}
      <div className="w-1/2 bg-[#0B3424] p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Plant image background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/plant.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        
        {/* Top content - moved down slightly with adjusted margins */}
        <div className="relative z-10 mt-8">
          <div className="flex items-center gap-2 mb-12">
            <img src="/assets/logo.jpg" className="h-8" alt="Logo" />
            <span className="text-white text-xl font-medium">Smart Farm</span>
          </div>

          <div className="mt-16">
            <h1 className="text-white text-5xl font-bold mb-6">Welcome Back!</h1>
            <p className="text-gray-300 text-lg max-w-md leading-relaxed">
              Smart Farm helps you efficiently manage your agricultural regions. Our innovative platform provides real-time monitoring and expert guidance to optimize your farm's productivity.
            </p>
          </div>
        </div>

        {/* Google button properly centered vertically and horizontally */}
        <div className="relative z-10 flex items-center justify-center w-full mb-16">
          <button 
            onClick={() => {/* Handle Google login */}} 
            className="flex items-center justify-center gap-3 bg-white py-3 px-6 rounded-lg w-80 hover:bg-gray-50 transition-all duration-300 shadow-lg"
          >
            <img src="/assets/google.png" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">Login with Google</span>
          </button>
        </div>
      </div>

      {/* Right side - White with form */}
      <div className="w-1/2 bg-white p-12 flex items-center justify-center relative">
        {/* Repositioned decorative image */}
        <div className="absolute bottom-0 right-0 max-w-xs max-h-48 overflow-hidden opacity-40 z-0">
          <img 
            src="/assets/green.jpg" 
            alt="Decorative leaves" 
            className="w-64"
          />
        </div>
        
        <div className="w-full max-w-md z-10 relative">
          <div className="mb-8">
            <h2 className="text-[#0B3424] text-2xl font-semibold">Please Enter Your Login Details</h2>
            <p className="text-gray-500 mt-2">Access your Smart Farm dashboard</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-gray-700 text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3424] focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-gray-700 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3424] focus:border-transparent transition-all duration-300"
                  required
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? 
                    <EyeOff size={20} className="animate-fadeIn" /> : 
                    <Eye size={20} className="animate-fadeIn" />
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[#0B3424]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-[#0B3424] hover:text-[#0B3424]/80 hover:underline transition-colors">
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

          <div className="mt-8 text-center bg-white p-2 rounded-lg">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#0B3424] hover:underline font-medium">
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