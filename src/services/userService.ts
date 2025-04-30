import axios from 'axios';

const BASE_URL = 'http://localhost:3000/account';

interface UserProfile {
  _id: string;
  fullname: string;
  email: string;
  phonenumber: string;
  address: string;
  image?: string;
}

export class UserService {
  static async getProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await axios.get(`${BASE_URL}/get-account/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  static async updateProfile(userId: string, userData: FormData): Promise<UserProfile> {
    try {
      console.log('Starting profile update...', { userId });
      
      if (!userId) {
        console.error('No user ID provided');
        throw new Error('ID utilisateur requis');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        throw new Error('Token non trouvé');
      }

      console.log('Sending update request to server...');
      const startTime = Date.now();
      
      const response = await axios.put(`${BASE_URL}/update/${userId}`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const endTime = Date.now();
      console.log(`Update request completed in ${endTime - startTime}ms`);

      if (!response.data) {
        console.error('Invalid server response:', response);
        throw new Error('Réponse invalide du serveur');
      }

      console.log('Update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update error details:', {
        error,
        isAxiosError: axios.isAxiosError(error),
        response: axios.isAxiosError(error) ? error.response : null,
        status: axios.isAxiosError(error) ? error.response?.status : null
      });
      
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      }
      throw error;
    }
  }
} 