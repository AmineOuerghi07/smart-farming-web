import { useState } from "react";
import { Cloud, Sun, CloudRain, MapPin, Thermometer, Wind, Droplets, Calendar, Sunrise, Sunset, BarChart, CloudLightning, Snowflake, CloudFog } from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import MetricRow from "../components/MetricRow";

export default function Weather() {
    const [weather] = useState({
        location: "Tunis, Tunisia",
        temperature: "28°C",
        condition: "Sunny",
        humidity: "45%",
        windSpeed: "10 km/h",
        sunrise: "06:30 AM",
        sunset: "07:45 PM",
        airQuality: "Moderate",
        visibility: "10 km",
        pressure: "1015 hPa",
        uvIndex: "5 (Moderate)",
        icon: Sun,
      });
    
      const upcomingWeather = [
        { day: "Monday", temperature: "30°C", condition: "Sunny", icon: Sun },
        { day: "Tuesday", temperature: "27°C", condition: "Cloudy", icon: Cloud },
        { day: "Wednesday", temperature: "25°C", condition: "Rainy", icon: CloudRain },
        { day: "Thursday", temperature: "26°C", condition: "Partly Cloudy", icon: Cloud },
        { day: "Friday", temperature: "29°C", condition: "Sunny", icon: Sun },
        { day: "Saturday", temperature: "28°C", condition: "Stormy", icon: CloudLightning },
        { day: "Sunday", temperature: "26°C", condition: "Snowy", icon: Snowflake },
        { day: "Monday", temperature: "31°C", condition: "Foggy", icon: CloudFog },
        { day: "Tuesday", temperature: "30°C", condition: "Cloudy", icon: Cloud },
      ];
    
      return (
        <div className="w-full min-h-screen bg-gray-900 p-8 flex justify-center">
          <div className="w-full max-w-6xl">
            {/* Header Section */}
            <div className="mb-8 flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Weather</h1>
                <p className="text-green-500 flex items-center gap-2">
                  <MapPin /> {weather.location}
                </p>
              </div>
            </div>
    
            {/* Weather Overview */}
            <DashboardCard title="Current Weather" icon={weather.icon}>
              <div className="flex flex-col items-center justify-center text-white text-5xl font-bold mb-4">
                {weather.temperature}
                <p className="text-lg text-green-400">{weather.condition}</p>
              </div>
              <MetricRow icon={Wind} label="Wind Speed" value={weather.windSpeed} />
              <MetricRow icon={Droplets} label="Humidity" value={weather.humidity} />
              <MetricRow icon={Sunrise} label="Sunrise" value={weather.sunrise} />
              <MetricRow icon={Sunset} label="Sunset" value={weather.sunset} />
              <MetricRow icon={BarChart} label="Air Quality" value={weather.airQuality} />
              <MetricRow icon={Thermometer} label="Visibility" value={weather.visibility} />
              <MetricRow icon={Thermometer} label="Pressure" value={weather.pressure} />
              <MetricRow icon={Sun} label="UV Index" value={weather.uvIndex} />
            </DashboardCard>
    
            {/* Upcoming Weather Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
              <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <Calendar /> Upcoming Weather
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {upcomingWeather.map((day) => (
                  <div key={day.day} className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
                    <day.icon className="text-green-400 h-10 w-10 mb-2" />
                    <p className="text-lg font-semibold text-white">{day.day}</p>
                    <p className="text-sm text-gray-300">{day.temperature}, {day.condition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
}
