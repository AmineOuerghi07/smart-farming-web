import { useEffect, useState } from "react";
import { MapPin, Sun, Cloud, CloudRain, Wind, Droplets, CloudLightning, CloudDrizzle, Moon } from "lucide-react";
import { WeatherService } from "../services/weatherService";
import { useTheme } from '../context/ThemeContext';




interface WeatherData {
  city: string; // Kept for compatibility, but not used in UI
  temperature: string;
  weather: string;
  humidity: string;
  precipitation: string;
  soilCondition: string;
  advice: string;
  windSpeed: string;
  visibility: string;
  sunrise: string;
  sunset: string;
  feelsLike: string;
  uvIndex: string;
  uvDescription: string;
}

interface Forecast {
  day: string;
  temperature: string;
  condition: string;
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const { darkMode } = useTheme()


  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      if (navigator.geolocation) {
        setLocationLoading(true);
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });

          const { latitude, longitude } = position.coords;
          console.log('📍 Coordinates:', { latitude, longitude });

          if (isMounted) {
            setCoords({ lat: latitude, lon: longitude });
          }
        } catch (err) {
          console.error("Error retrieving location:", err);
          if (isMounted) {
            setError("Unable to retrieve your location. Please enable location services or try again.");
          }
        } finally {
          if (isMounted) {
            setLocationLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setError("Geolocation is not supported by your browser. Please use a browser that supports geolocation.");
          setLocationLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!coords) {
        console.log('📍 No coordinates defined, skipping fetch');
        return;
      }

      try {
        console.log('🔄 Starting weather data fetch for coordinates:', coords);
        setLoading(true);
        setError(null);

        console.log('📤 Sending API requests...');

        const weatherData = await WeatherService.getWeatherByCoordinates(coords.lat, coords.lon);
        console.log('📥 Weather data received:', weatherData);
        
        if (isMounted && weatherData) {
          setWeather(weatherData);
        } else if (isMounted) {
          console.warn('Aucune donnée météo reçue du serveur');
          setError("Impossible de récupérer les données météo. Veuillez réessayer plus tard.");
          return;
        }

        try {
          const forecastData = await WeatherService.getForecastByCoordinates(coords.lat, coords.lon);
          if (isMounted) {
            setForecast(forecastData || []);
          }
        } catch (forecastErr) {
          console.error('❌ Error fetching forecast:', forecastErr);
          if (isMounted) {
            setForecast([]);
          }
        }

        console.log('✅ Data updated successfully');
      } catch (err) {
        console.error('❌ Detailed error:', err);
        console.error('📝 Stack trace:', err instanceof Error ? err.stack : 'No stack trace');
        if (isMounted) {
          setError("Erreur lors de la récupération des données météo. Veuillez vérifier votre connexion internet et réessayer.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('🏁 Finished data fetch');
        }
      }
    };

    if (coords) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [coords]);

  const getWeatherIcon = (condition: string | undefined) => {
    if (!condition) {
      return <Cloud className="w-16 h-16 text-gray-400 animate-float" />;
    }

    const conditionLower = condition.toLowerCase();
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;

    switch (conditionLower) {
      case 'clear':
        if (isNight) {
          return (
            <div className="relative">
              <Moon className="w-16 h-16 text-gray-300 animate-pulse-slow" />
              <div className="absolute top-1 left-6">
                <div className="w-2 h-2 rounded-full bg-blue-200 animate-twinkle" style={{ animationDelay: "0.3s" }} />
              </div>
              <div className="absolute top-4 left-12">
                <div className="w-1 h-1 rounded-full bg-blue-200 animate-twinkle" style={{ animationDelay: "0.7s" }} />
              </div>
              <div className="absolute top-8 left-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-twinkle" style={{ animationDelay: "1.1s" }} />
              </div>
            </div>
          );
        }
        return (
          <div className="relative">
            <Sun className="w-16 h-16 text-yellow-400 animate-sun" />
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="w-16 h-16 rounded-full bg-yellow-400/20 animate-pulse-slow" />
            </div>
          </div>
        );

      case 'clouds':
      case 'scattered clouds':
      case 'broken clouds':
      case 'few clouds':
      case 'cloudy':
        return (
          <div className="relative">
            <div className="absolute top-0 left-0 animate-float" style={{ animationDelay: "0.5s" }}>
              <Cloud className="w-8 h-8 text-gray-400" />
            </div>
            <div className="absolute top-8 left-2 animate-float-delayed">
              <Cloud className="w-10 h-10 text-gray-500" />
            </div>
            <div className="absolute top-4 left-10 animate-float" style={{ animationDelay: "1s" }}>
              <Cloud className="w-12 h-12 text-gray-300" />
            </div>
          </div>
        );

      case 'rain':
      case 'light rain':
      case 'moderate rain':
      case 'heavy intensity rain':
        return (
          <div className="relative w-16 h-16">
            <Cloud className="w-16 h-16 text-gray-400 animate-float" />
            <div className="absolute top-10 left-4">
              <div className="w-1 h-4 rounded-full bg-blue-400 animate-rain-drop" />
            </div>
            <div className="absolute top-10 left-8">
              <div className="w-1 h-4 rounded-full bg-blue-400 animate-rain-drop-delayed" />
            </div>
            <div className="absolute top-10 left-12">
              <div className="w-1 h-4 rounded-full bg-blue-400 animate-rain-drop-delayed-2" />
            </div>
          </div>
        );

      case 'thunderstorm':
      case 'thunderstorm with light rain':
      case 'thunderstorm with rain':
        return (
          <div className="relative w-16 h-16">
            <Cloud className="w-16 h-16 text-gray-700 animate-float" />
            <div className="absolute top-6 left-8">
              <div className="w-6 h-8 text-purple-400 animate-flash">
                <CloudLightning className="w-6 h-8 text-purple-400" />
              </div>
            </div>
            <div className="absolute top-10 left-6">
              <div className="w-1 h-4 rounded-full bg-blue-400 animate-rain-drop" />
            </div>
            <div className="absolute top-10 left-10">
              <div className="w-1 h-4 rounded-full bg-blue-400 animate-rain-drop-delayed" />
            </div>
          </div>
        );

      case 'drizzle':
      case 'light intensity drizzle':
      case 'mist':
        return (
          <div className="relative w-16 h-16">
            <Cloud className="w-16 h-16 text-gray-400 animate-float" />
            <div className="absolute top-10 left-5">
              <div className="w-0.5 h-2 rounded-full bg-blue-300 animate-drizzle" />
            </div>
            <div className="absolute top-10 left-8">
              <div className="w-0.5 h-2 rounded-full bg-blue-300 animate-drizzle-delayed" />
            </div>
            <div className="absolute top-10 left-11">
              <div className="w-0.5 h-2 rounded-full bg-blue-300 animate-drizzle" style={{ animationDelay: "0.6s" }} />
            </div>
          </div>
        );

      case 'snow':
      case 'light snow':
      case 'heavy snow':
        return (
          <div className="relative w-16 h-16">
            <Cloud className="w-16 h-16 text-gray-400 animate-float" />
            <div className="absolute top-10 left-4">
              <div className="w-2 h-2 rounded-full bg-gray-100 animate-snow" />
            </div>
            <div className="absolute top-10 left-8">
              <div className="w-2 h-2 rounded-full bg-gray-100 animate-snow-delayed" />
            </div>
            <div className="absolute top-10 left-12">
              <div className="w-2 h-2 rounded-full bg-gray-100 animate-snow-delayed-2" />
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-16 h-16">
            <Cloud className="w-16 h-16 text-gray-400 animate-float" />
          </div>
        );
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getWeatherGradient = (condition: string | undefined) => {
    if (!condition) return "from-gray-900 to-gray-800";

    const conditionLower = condition.toLowerCase();
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;

    if (isNight) return "from-gray-900 via-blue-950 to-gray-900";

    switch (conditionLower) {
      case 'clear':
        return "from-blue-900 via-blue-800 to-blue-700";
      case 'clouds':
      case 'scattered clouds':
      case 'broken clouds':
      case 'few clouds':
      case 'cloudy':
        return "from-gray-800 via-slate-800 to-gray-700";
      case 'rain':
      case 'light rain':
      case 'moderate rain':
      case 'heavy intensity rain':
        return "from-blue-950 via-slate-900 to-blue-900";
      case 'thunderstorm':
      case 'thunderstorm with light rain':
      case 'thunderstorm with rain':
        return "from-purple-950 via-gray-900 to-purple-900";
      case 'drizzle':
      case 'light intensity drizzle':
      case 'mist':
        return "from-teal-950 via-slate-900 to-teal-900";
      case 'snow':
      case 'light snow':
      case 'heavy snow':
        return "from-indigo-950 via-slate-900 to-indigo-900";
      default:
        return "from-gray-900 to-gray-800";
    }
  };

  if (locationLoading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-blue-50'}`}>
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
          <MapPin className="text-green-500 absolute inset-0 m-auto w-8 h-8" />
        </div>
        <p className="text-green-400 mt-6 text-xl font-medium">Detecting your location...</p>
        <p className="text-gray-500 mt-2">Please allow location access when prompted</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-blue-50'} p-6`}>
        <CloudRain className="w-20 h-20 text-red-400 mb-6" />
        <div className="text-red-400 text-xl mb-4 text-center">{error}</div>
        <button
          onClick={() => {
            setError(null);
            setLocationLoading(true);
            setCoords(null);
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg shadow-green-900/30"
        >
          Try again
        </button>
      </div>
    );
  }

  if (loading && coords) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-blue-50'}`}>
        <div className="animate-spin-slow">
          <Sun className="w-16 h-16 text-yellow-400" />
        </div>
        <p className="text-blue-400 mt-6 text-xl font-medium">Loading weather data...</p>
        <p className="text-gray-500 mt-2">This will just take a moment</p>
      
      </div>
    );
  }

  if (!weather) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-blue-50'}`}>
        <div className={`text-xl mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Waiting for weather data...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white' : 'bg-gradient-to-b from-blue-50 via-white to-gray-100 text-gray-800'}`}>
      <div className="w-full h-full max-w-7xl mx-auto px-4 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-8">
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} bg-gradient-to-r ${darkMode ? 'from-green-400 via-blue-300 to-green-400' : 'from-green-600 via-blue-500 to-green-600'} bg-clip-text text-transparent animate-pulse-slow`}>
              {getTimeOfDay()}!
            </h1>
            <p className={`text-lg md:text-xl mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Optimize Your Farm Operations with Real-Time Insights
            </p>
          </div>
        </div>

        {/* Location and Weather */}
        <div className="p-4 md:p-8">
          <div className="flex items-center mb-8">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full border shadow-lg backdrop-blur-sm ${darkMode ? 'bg-green-900/30 border-green-600/30 shadow-green-900/20' : 'bg-green-100 border-green-300 shadow-green-200/50'}`}>
                <MapPin className={`w-6 h-6 animate-pulse ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-2xl font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.city || 'Votre position'}</span>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            {/* Current Weather */}
            <div className={`bg-gradient-to-br ${darkMode ? getWeatherGradient(weather.weather) : 'from-blue-50 via-white to-blue-100'} rounded-2xl p-6 md:p-10 shadow-lg ${darkMode ? 'shadow-black/30 border-gray-800/40' : 'shadow-gray-200/50 border-gray-200'} border backdrop-blur-sm transition-all duration-500 hover:shadow-xl group`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex flex-col">
                    <span className={`text-6xl md:text-8xl font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-green-300 transition-all duration-500 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {weather.temperature}
                    </span>
                    <div className="flex flex-col md:flex-row md:items-baseline gap-2 mt-3">
                      <p className={`text-xl md:text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{weather.weather}</p>
                      <p className={`hidden md:block text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/</p>
                      <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Feels like {weather.feelsLike}</p>
                    </div>
                  </div>
                </div>
                <div className="transform transition-transform duration-500 group-hover:scale-125 p-4">
                  {getWeatherIcon(weather.weather)}
                </div>
              </div>
            </div>

            {/* Weather Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className={`rounded-xl p-6 md:p-8 shadow-lg border backdrop-blur-sm transition-all duration-300 ${darkMode ? 'bg-gray-900/70 border-gray-800/40 hover:bg-gray-800/70' : 'bg-white/80 border-gray-200 hover:bg-white'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-2 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <Wind className={`w-6 h-6 animate-spin-slow ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <span className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Wind Status</span>
                </div>
                <p className={`text-3xl md:text-4xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.windSpeed}</p>
                <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Updated now</p>
              </div>

              <div className={`rounded-xl p-6 md:p-8 shadow-lg border backdrop-blur-sm transition-all duration-300 ${darkMode ? 'bg-gray-900/70 border-gray-800/40 hover:bg-gray-800/70' : 'bg-white/80 border-gray-200 hover:bg-white'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-2 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <Droplets className={`w-6 h-6 animate-bounce ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} style={{ animationDuration: "3s" }} />
                  </div>
                  <span className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Humidity</span>
                </div>
                <p className={`text-3xl md:text-4xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.humidity}</p>
                <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Humidity is good</p>
              </div>
            </div>
          </div>

          {/* Additional Weather Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mt-6 md:mt-10">
            <div className={`rounded-xl p-6 md:p-8 shadow-lg border backdrop-blur-sm transition-all duration-300 ${darkMode ? 'bg-gray-900/70 border-gray-800/40 hover:bg-gray-800/70' : 'bg-white/80 border-gray-200 hover:bg-white'}`}>
              <p className={`text-xl mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>UV Index</p>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl md:text-4xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.uvIndex}</p>
                  <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>UV</p>
                </div>
                <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{weather.uvDescription || 'N/A'}</p>
              </div>
            </div>

            <div className={`rounded-xl p-6 md:p-8 shadow-lg border backdrop-blur-sm transition-all duration-300 ${darkMode ? 'bg-gray-900/70 border-gray-800/40 hover:bg-gray-800/70' : 'bg-white/80 border-gray-200 hover:bg-white'}`}>
              <p className={`text-xl mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Visibility</p>
              <p className={`text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.visibility}</p>
              <p className={`text-lg mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Updated now</p>
            </div>

            <div className={`rounded-xl p-6 md:p-8 shadow-lg border backdrop-blur-sm transition-all duration-300 group ${darkMode ? 'bg-gray-900/70 border-gray-800/40 hover:bg-gray-800/70' : 'bg-white/80 border-gray-200 hover:bg-white'}`}>
              <p className={`text-xl mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sunrise</p>
              <div className="flex items-center gap-2">
                <div className="text-yellow-500 group-hover:animate-sun">
                  <Sun className="w-6 h-6" />
                </div>
                <p className={`text-2xl md:text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.sunrise}</p>
              </div>
            </div>

            <div className={`rounded-xl p-6 md:p-8 shadow-lg border backdrop-blur-sm transition-all duration-300 group ${darkMode ? 'bg-gray-900/70 border-gray-800/40 hover:bg-gray-800/70' : 'bg-white/80 border-gray-200 hover:bg-white'}`}>
              <p className={`text-xl mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sunset</p>
              <div className="flex items-center gap-2">
                <div className="text-orange-500 group-hover:animate-pulse">
                  <Moon className="w-6 h-6" />
                </div>
                <p className={`text-2xl md:text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weather.sunset}</p>
              </div>
            </div>
          </div>

          {/* Forecast */}
          {forecast.length > 0 && (
            <div className="mt-10">
              <h2 className={`text-2xl md:text-3xl font-semibold mb-6 md:mb-8 pl-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  {forecast.length} Day Forecast
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
                {forecast.map((day, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-6 md:p-8 shadow-lg border backdrop-blur-sm flex flex-col items-center transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gray-900/70 border-gray-800/40 hover:bg-gray-800/70' : 'bg-white/80 border-gray-200 hover:bg-white'}`}
                  >
                    <div className="mb-2 h-16">
                      {getWeatherIcon(day.condition)}
                    </div>
                    <p className={`text-xl font-medium mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{day.day}</p>
                    <p className={`text-lg mt-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{day.temperature}</p>
                    <p className={`mt-1 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{day.condition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add global styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(-3px); }
          50% { transform: translateY(2px); }
        }

        @keyframes rain-drop {
          0% { transform: translateY(-10px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }

        @keyframes rain-drop-delayed {
          0% { transform: translateY(-10px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }

        @keyframes rain-drop-delayed-2 {
          0% { transform: translateY(-10px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }

        @keyframes flash {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 1; }
        }

        @keyframes drizzle {
          0% { transform: translateY(-5px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(5px); opacity: 0; }
        }

        @keyframes drizzle-delayed {
          0% { transform: translateY(-5px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(5px); opacity: 0; }
        }

        @keyframes shine {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -10; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.95); opacity: 0.8; }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
        }

        .animate-rain-drop {
          animation: rain-drop 1.5s linear infinite;
        }

        .animate-rain-drop-delayed {
          animation: rain-drop-delayed 1.5s linear infinite;
          animation-delay: 0.2s;
        }

        .animate-rain-drop-delayed-2 {
          animation: rain-drop-delayed-2 1.5s linear infinite;
          animation-delay: 0.4s;
        }

        .animate-flash {
          animation: flash 2s ease-out infinite;
        }

        .animate-drizzle {
          animation: drizzle 1.2s linear infinite;
        }

        .animate-drizzle-delayed {
          animation: drizzle-delayed 1.2s linear infinite;
          animation-delay: 0.3s;
        }

        .animate-shine {
          animation: shine 3s linear infinite;
        }

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes snow {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(10px) rotate(360deg); opacity: 0; }
        }

        @keyframes snow-delayed {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(10px) rotate(360deg); opacity: 0; }
        }

        @keyframes snow-delayed-2 {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(10px) rotate(360deg); opacity: 0; }
        }

        .animate-snow {
          animation: snow 2s linear infinite;
        }

        .animate-snow-delayed {
          animation: snow-delayed 2s linear infinite;
          animation-delay: 0.3s;
        }

        .animate-snow-delayed-2 {
          animation: snow-delayed-2 2s linear infinite;
          animation-delay: 0.6s;
        }

        @keyframes cloud-move {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }

        @keyframes sun-shine {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .animate-cloud {
          animation: cloud-move 4s ease-in-out infinite;
        }

        .animate-sun {
          animation: sun-shine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}