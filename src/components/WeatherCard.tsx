import React from 'react';
import { Sun, Cloud, CloudRain, Wind, Droplets } from 'lucide-react';

interface WeatherCardProps {
  city: string;
  temperature: string;
  condition: string;
  date: string;
  feelsLike: string;
  windStatus: {
    speed: string;
    time: string;
  };
  humidity: {
    value: string;
    status: string;
  };
  uvIndex: {
    value: string;
    status: string;
  };
  visibility: {
    value: string;
    time: string;
  };
  sunrise: string;
  sunset: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  city,
  temperature,
  condition,
  date,
  feelsLike,
  windStatus,
  humidity,
  uvIndex,
  visibility,
  sunrise,
  sunset,
}) => {
  const getWeatherIcon = () => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-16 h-16 text-yellow-400" />;
      case 'cloudy':
        return <Cloud className="w-16 h-16 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="w-16 h-16 text-blue-400" />;
      default:
        return <Sun className="w-16 h-16 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{city}</h2>
          <p className="text-gray-500">{date}</p>
        </div>
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-5xl font-bold text-gray-800">{temperature}</span>
              <p className="text-gray-600 mt-2">{condition}</p>
              <p className="text-sm text-gray-500 mt-1">Feels like {feelsLike}</p>
            </div>
            {getWeatherIcon()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-blue-500" />
              <span className="text-gray-600 text-sm">Wind Status</span>
            </div>
            <p className="text-2xl font-semibold text-gray-800">{windStatus.speed}</p>
            <p className="text-sm text-gray-500">{windStatus.time}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="text-gray-600 text-sm">Humidity</span>
            </div>
            <p className="text-2xl font-semibold text-gray-800">{humidity.value}</p>
            <p className="text-sm text-gray-500">{humidity.status}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm mb-2">UV Index</p>
          <p className="text-xl font-semibold text-gray-800">{uvIndex.value}</p>
          <p className="text-sm text-gray-500">{uvIndex.status}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm mb-2">Visibility</p>
          <p className="text-xl font-semibold text-gray-800">{visibility.value}</p>
          <p className="text-sm text-gray-500">{visibility.time}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm mb-2">Sunrise</p>
          <p className="text-xl font-semibold text-gray-800">{sunrise}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm mb-2">Sunset</p>
          <p className="text-xl font-semibold text-gray-800">{sunset}</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard; 