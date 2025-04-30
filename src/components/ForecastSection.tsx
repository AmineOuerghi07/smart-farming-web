import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning } from 'lucide-react';

interface ForecastDay {
  day: string;
  temperature: string;
  condition: string;
}

interface ForecastSectionProps {
  forecast: ForecastDay[];
}

const ForecastSection: React.FC<ForecastSectionProps> = ({ forecast }) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-yellow-400" />;
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'stormy':
        return <CloudLightning className="w-8 h-8 text-purple-400" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">10 Day Forecast</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 flex flex-col items-center"
          >
            {getWeatherIcon(day.condition)}
            <p className="text-gray-800 font-medium mt-2">{day.day}</p>
            <p className="text-gray-600 text-sm">{day.temperature}</p>
            <p className="text-gray-500 text-xs">{day.condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastSection; 