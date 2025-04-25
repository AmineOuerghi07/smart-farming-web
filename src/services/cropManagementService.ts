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
  }[];
}

class CropManagementService {
  private baseUrl = 'http://localhost:3000';

  async getUserPlants(userId: string, token: string): Promise<{
    plants: (Plant & { quantity: number; regionId: string; regionName: string; landName: string })[];
  }> {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // 1. Récupérer les terres de l'utilisateur
      console.log('Récupération des terres pour l\'utilisateur:', userId);
      const landsResponse = await axios.get<Land[]>(
        `${this.baseUrl}/lands/users/${userId}`,
        config
      );

      if (!landsResponse.data?.length) {
        console.log('Aucune terre trouvée pour cet utilisateur');
        return { plants: [] };
      }

      // 2. Pour chaque terre, récupérer ses régions
      const plants = [];
      for (const land of landsResponse.data) {
        console.log('Récupération des régions pour la terre:', land._id);
        
        // Récupérer les détails de chaque région
        for (const regionId of land.regions) {
          const regionResponse = await axios.get<Region>(
            `${this.baseUrl}/lands/region/${regionId}`,
            config
          );

          const region = regionResponse.data;
          console.log('Détails de la région:', region);

          // 3. Pour chaque plante dans la région, récupérer ses détails
          if (region.plants?.length) {
            for (const plantData of region.plants) {
              const plantResponse = await axios.get<Plant>(
                `${this.baseUrl}/lands/plant/${plantData.plant}`,
                config
              );

              plants.push({
                ...plantResponse.data,
                quantity: plantData.quantity,
                regionId: region._id,
                regionName: region.name,
                landName: land.name,
                imageUrl: plantResponse.data.imageUrl.startsWith('http') 
                  ? plantResponse.data.imageUrl 
                  : `${this.baseUrl}/assets/${plantResponse.data.imageUrl}`
              });
            }
          }
        }
      }

      console.log('Plantes finales:', plants);
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
}

export const cropManagementService = new CropManagementService();