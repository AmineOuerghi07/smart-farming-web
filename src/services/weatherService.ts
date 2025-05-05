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
  private static lastRequestTime: number = 0;
  private static readonly REQUEST_INTERVAL = 5000; // 5 seconds between requests
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_BASE_DELAY = 2000; // 2 seconds base delay for retries

  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static async withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    if (now - this.lastRequestTime < this.REQUEST_INTERVAL) {
      console.log('⏳ [WeatherService] Waiting between requests...');
      await this.delay(this.REQUEST_INTERVAL - (now - this.lastRequestTime));
    }
    this.lastRequestTime = Date.now();
    return fn();
  }

  private static async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.MAX_RETRIES,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await this.withRateLimit(fn);
    } catch (error: any) {
      if (attempt >= retries || error.response?.status !== 429) {
        throw error;
      }
      const delay = this.RETRY_BASE_DELAY * Math.pow(2, attempt);
      console.log(`🔄 [WeatherService] Retrying after ${delay}ms (attempt ${attempt + 1}/${retries})`);
      await this.delay(delay);
      return this.withRetry(fn, retries, attempt + 1);
    }
  }

  static async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const url = `${this.baseUrl}/coordinates?lat=${lat}&lon=${lon}`;
      console.log('🔗 [WeatherService] URL:', url);

      const response = await this.withRetry(() =>
        axios.get<WeatherData>(url)
      );

      if (!response.data) {
        throw new Error('No weather data received');
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ [WeatherService] Error:', error);
      if (error.response) {
        console.error('📝 Error details:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      return null;
    }
  }

  static async getHumidityDetails(lat: number, lon: number) {
    try {
      const url = `${this.baseUrl}/humidity-details/coordinates?lat=${lat}&lon=${lon}`;
      console.log('🔗 [WeatherService] URL:', url);

      const response = await this.withRetry(() =>
        axios.get(url)
      );

      if (!response.data) {
        throw new Error('No humidity data received');
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ [WeatherService] Error:', error);
      throw new Error(error.response?.data?.message || 'Error fetching humidity data');
    }
  }

  static async getForecastByCoordinates(lat: number, lon: number) {
    try {
      const url = `${this.baseUrl}/forecast/coordinates?lat=${lat}&lon=${lon}`;
      console.log('🔗 [WeatherService] URL:', url);

      const response = await this.withRetry(() =>
        axios.get(url)
      );

      if (!response.data) {
        throw new Error('No forecast data received');
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ [WeatherService] Error:', error);
      if (error.response) {
        console.error('📝 Error details:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error(error.response?.data?.message || 'Error fetching forecast data');
    }
  }
}