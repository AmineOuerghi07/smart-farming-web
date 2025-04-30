import axios from 'axios';

interface Plant {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
}

interface Land {
  _id: string;
  name: string;
  regions: string[];
}

interface Region {
  _id: string;
  name: string;
  surface: number;
  land: Land;
  plants: {
    plant: string; // ID de la plante
    quantity: number;
    _id: string;
    plantingDate: Date;
  }[];
}

interface YieldStats {
  // Define the structure of the YieldStats interface
}

class CropManagementService {
  private baseUrl = 'http://localhost:3000';

  async getUserRegions(userId: string, token: string) {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${this.baseUrl}/lands/region/users/${userId}`, config);
    return response.data; // tableau de régions
  }

  async getUserPlants(userId: string, token: string): Promise<{
    plants: (Plant & { quantity: number; regionId: string; regionName: string; landName?: string; plantingDate?: string })[];
  }> {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Récupérer toutes les régions de l'utilisateur
      const regions = await this.getUserRegions(userId, token);
      if (!regions?.length) {
        return { plants: [] };
      }
      const plants: any[] = [];
      for (const region of regions) {
        if (region.plants?.length) {
          for (const plantData of region.plants) {
            // Récupérer les infos détaillées de la plante
            let plantDetails: Plant = { _id: '', name: '', imageUrl: '', description: '' };
            try {
              const plantResponse = await axios.get<Plant>(
                `${this.baseUrl}/lands/plant/${plantData.plant}`,
                config
              );
              plantDetails = plantResponse.data;
            } catch (e) {
              // Si la plante n'existe plus, on ignore
              continue;
            }
            plants.push({
              ...plantDetails,
              quantity: plantData.quantity,
              regionId: region._id,
              regionName: region.name,
              plantingDate: plantData.plantingDate ? String(plantData.plantingDate) : undefined,
              imageUrl: plantDetails.imageUrl?.startsWith('http')
                ? plantDetails.imageUrl
                : `${this.baseUrl}/assets/${plantDetails.imageUrl}`
            });
          }
        }
      }
      return { plants };
    } catch (error) {
      console.error('Erreur détaillée:', error);
      if (axios.isAxiosError(error)) {
        console.error('Erreur Axios:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  }

  // If you still need individual plant data
  async getPlantDetails(plantId: string, token: string): Promise<Plant> {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get<Plant>(
        `${this.baseUrl}/lands/plant/${plantId}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching plant details:', error);
      throw error;
    }
  }

  async getYieldStats(userId: string, token: string): Promise<YieldStats[]> {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get<YieldStats[]>(
        `${this.baseUrl}/lands/yield-stats/${userId}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching yield stats:', error);
      throw error;
    }
  }

  async getRegionPlants(regionId: string, token: string) {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${this.baseUrl}/lands/region/${regionId}`, config);
    return response.data?.plants || [];
  }
}

export const cropManagementService = new CropManagementService();