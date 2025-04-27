import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmpassword: '',
    phonenumber: '',
    address: ''
  });
  const [error, setError] = useState('');
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

    if (formData.password !== formData.confirmpassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await register(formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="w-1/2 bg-white p-12 flex items-center justify-center relative">
        <div className="absolute bottom-0 left-0">
          <img 
            src="/assets/green.jpg" 
            alt="Decorative leaves" 
            className="w-64"
          />
        </div>

        <div className="relative z-10 mt-8">
        <div className="flex items-center gap-2 mb-8">
            <img src="/assets/logo.jpg" className="h-8" alt="Logo" />
            <span className="text-[#0B3424] text-xl font-medium">Smart Farm</span>
          </div>

          <div className="mb-8">
            <h2 className="text-[#0B3424] text-2xl font-semibold">Create Account</h2>
            <p className="text-gray-500 mt-2">Join Smart Farm and start managing your farm intelligently</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error === 'Les mots de passe ne correspondent pas' ? 'Passwords do not match' : 'Registration error'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3424] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3424] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3424] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmpassword"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3424] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phonenumber"
                value={formData.phonenumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3424] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3424] focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B3424] text-white py-3 rounded-lg hover:bg-[#0B3424]/90 transform active:scale-98 transition-all duration-300 shadow-md mt-6"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0B3424] hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="w-1/2 bg-[#0B3424] relative overflow-hidden flex">
        <div className="absolute inset-0">
          <img 
            src="/assets/plant.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-50"
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