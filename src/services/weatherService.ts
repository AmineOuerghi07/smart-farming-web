import axios from 'axios';

const BASE_URL = 'http://localhost:3000/weather';

interface WeatherData {
  city: string;
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
  isFallback?: boolean;
  originalCoords?: { lat: number; lon: number };
  usedCity?: string;
}

interface Forecast {
  day: string;
  temperature: string;
  condition: string;
}

export class WeatherService {
  private static baseUrl = BASE_URL;
  private static geoUrl = 'https://api.openweathermap.org/geo/1.0';
  private static apiKey = 'f56277b8a7f619a6c0acfab85da42d89';
  private static lastRequestTime: number = 0;
  private static readonly REQUEST_INTERVAL = 5000; // 5 secondes entre les requêtes

  static async getWeather(city: string): Promise<WeatherData | null> {
    const now = Date.now();
    if (now - this.lastRequestTime < this.REQUEST_INTERVAL) {
      console.log('⏳ [WeatherService] Attente entre les requêtes...');
      await new Promise(resolve => setTimeout(resolve, this.REQUEST_INTERVAL));
      return this.getWeather(city);
    }

    try {
      const url = `${this.baseUrl}?city=${encodeURIComponent(city)}`;
      console.log('🔗 [WeatherService] URL:', url);
      
      this.lastRequestTime = now;
      const response = await axios.get<WeatherData>(url);
      if (!response.data) {
        throw new Error('Aucune donnée météo reçue');
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ [WeatherService] Erreur:', error);
      if (error.response) {
        console.error('📝 Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      // Si la ville n'est pas Tunis et qu'il y a une erreur, essayer avec Tunis
      if (city.toLowerCase() !== 'tunis') {
        console.log('🔄 [WeatherService] Tentative avec Tunis comme fallback');
        return this.getWeather('Tunis');
      }
      
      return null;
    }
  }

  static async getHumidityDetails(lat: number, lon: number) {
    try {
      const url = `${this.baseUrl}/humidity-details?lat=${lat}&lon=${lon}`;
      console.log('🔗 [WeatherService] URL:', url);
      
      const response = await axios.get(url);
      if (!response.data) {
        throw new Error('Aucune donnée d\'humidité reçue');
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ [WeatherService] Erreur:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des données d\'humidité');
    }
  }

  static async getForecast(city: string) {
    try {
      const url = `${this.baseUrl}/forecast?city=${encodeURIComponent(city)}`;
      console.log('🔗 [WeatherService] URL:', url);
      
      const response = await axios.get(url);
      if (!response.data) {
        throw new Error('Aucune donnée de prévision reçue');
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ [WeatherService] Erreur:', error);
      if (error.response) {
        console.error('📝 Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des prévisions');
    }
  }

  static async getCityFromCoords(latitude: number, longitude: number) {
    const now = Date.now();
    if (now - this.lastRequestTime < this.REQUEST_INTERVAL) {
      console.log('⏳ [WeatherService] Attente entre les requêtes...');
      return { city: 'Tunis' };
    }

    try {
      const url = `${this.baseUrl}/city-from-coords?lat=${latitude}&lon=${longitude}`;
      console.log('🔗 [WeatherService] URL:', url);
      
      this.lastRequestTime = now;
      const response = await axios.get(url);
      
      if (!response.data) {
        console.log('⚠️ [WeatherService] Aucune donnée de ville reçue');
        return { city: 'Tunis' };
      }
      
      // Extraire le nom de la ville du format "ville:tunisia"
      let cityName = response.data;
      if (typeof cityName === 'string' && cityName.includes(':')) {
        cityName = cityName.split(':')[0].trim();
      }
      
      // Vérifier si le nom de la ville contient des caractères non-latins
      if (!cityName || /[^\u0000-\u007F]/.test(cityName)) {
        console.log('⚠️ [WeatherService] Nom de ville non-latin détecté, utilisation de Tunis');
        return { city: 'Tunis' };
      }
      
      console.log('🏙️ [WeatherService] Ville extraite:', cityName);
      return { city: cityName };
    } catch (error: any) {
      console.error('❌ [WeatherService] Erreur:', error);
      return { city: 'Tunis' };
    }
  }

  static async getCoordsFromCity(city: string): Promise<{ lat: number; lon: number }> {
    try {
      const url = `${this.geoUrl}/direct?q=${encodeURIComponent(city)},tn&limit=1&appid=${this.apiKey}`;
      console.log('🔗 [WeatherService] Geocoding URL:', url);
      
      const response = await axios.get(url);
      if (response.data && response.data.length > 0) {
        return { lat: response.data[0].lat, lon: response.data[0].lon };
      }
      throw new Error('Ville non trouvée');
    } catch (error: any) {
      console.error('❌ [WeatherService] Erreur lors de la géolocalisation:', error);
      return { lat: 36.8065, lon: 10.1815 }; // Fallback to Tunis coordinates
    }
  }
}