// Animal interfaces
export interface Animal {
  id: number;
  tag_id: string;
  shed_location_id: number;
  name: string;
  date_of_birth: string;
  breed: string;
  animal_type: string;
  gender: string;
  health_status: string;
  location: string | null;
  price?: string;
  lactation?: string;
  image_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnimalCreateRequest {
  name: string;
  tag_id: string;
  date_of_birth: string;
  breed: string;
  animal_type: string;
  gender: string;
  health_status: string;
  price?: string;
  lactation?: string;
  shed_location_id: string;
  image_path?: string;
}

export interface AnimalUpdateRequest {
  name?: string;
  tag_id?: string;
  date_of_birth?: string;
  breed?: string;
  animal_type?: string;
  gender?: string;
  health_status?: string;
  price?: string;
  lactation?: string;
  shed_location_id?: string;
  image_path?: string;
}

// Pagination interface from API
export interface PaginationData {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

// API Response interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    pagination: PaginationData;
  };
}

// Single Item API Response interface
export interface SingleApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

import api from './api';

// Service class for animal-related API calls
class AnimalService {
  // Base API endpoint for livestock animals
  private baseUrl = '/v1/livestock/animals';

  // Get all animals with optional search and filters
  async getAnimals(
    page: number = 1,
    search: string = '',
    animalType: string = '',
    healthStatus: string = '',
    gender: string = ''
  ): Promise<{ animals: Animal[], pagination: PaginationData }> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (search) params.append('search', search);
      if (animalType) params.append('animal_type', animalType);
      if (healthStatus) params.append('health_status', healthStatus);
      if (gender) params.append('gender', gender);
      
      const response = await api.get<ApiResponse<Animal>>(`${this.baseUrl}?${params.toString()}`);
      
      return {
        animals: response.data.data.data,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      console.error('Error fetching animals:', error);
      throw error;
    }
  }

  // Get animal by ID
  async getAnimalById(id: number): Promise<Animal> {
    try {
      const response = await api.get<SingleApiResponse<Animal>>(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching animal with ID ${id}:`, error);
      throw error;
    }
  }

  // Create new animal
  async createAnimal(animalData: AnimalCreateRequest): Promise<Animal> {
    try {
      const response = await api.post<SingleApiResponse<Animal>>(this.baseUrl, animalData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating animal:', error);
      throw error;
    }
  }

  // Update animal
  async updateAnimal(id: number, animalData: AnimalUpdateRequest): Promise<Animal> {
    try {
      const response = await api.put<SingleApiResponse<Animal>>(`${this.baseUrl}/${id}`, animalData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating animal with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete animal
  async deleteAnimal(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting animal with ID ${id}:`, error);
      throw error;
    }
  }

  // Filter animals by type
  async getAnimalsByType(type: string): Promise<Animal[]> {
    try {
      const { animals } = await this.getAnimals(1, '', type);
      return animals;
    } catch (error) {
      console.error(`Error fetching animals by type ${type}:`, error);
      throw error;
    }
  }

  // Search animals by query
  async searchAnimals(query: string): Promise<Animal[]> {
    try {
      const { animals } = await this.getAnimals(1, query);
      return animals;
    } catch (error) {
      console.error(`Error searching animals with query "${query}":`, error);
      throw error;
    }
  }

  // Get health records for an animal - this would be a separate API endpoint in the real app
  async getAnimalHealthRecords(animalId: number): Promise<any[]> {
    try {
      // This would call a real API endpoint for health records
      // For now, returning mock data
      return [
        {
          id: 1,
          date: '2023-01-15',
          condition: 'Routine Checkup',
          treatment: 'None',
          notes: 'Animal in good health'
        },
        {
          id: 2,
          date: '2023-03-20',
          condition: 'Vaccination',
          treatment: 'FMD Vaccine',
          notes: 'Regular vaccination program'
        }
      ];
    } catch (error) {
      console.error(`Error fetching health records for animal ID ${animalId}:`, error);
      throw error;
    }
  }

  // Get milk production data for an animal - this would be a separate API endpoint in the real app
  async getMilkProductionData(animalId: number): Promise<any[]> {
    try {
      // This would call a real API endpoint for milk production data
      // For now, returning mock data
      return [
        { date: '2023-04-01', morning: 12.5, evening: 10.2, total: 22.7 },
        { date: '2023-04-02', morning: 13.1, evening: 11.0, total: 24.1 },
        { date: '2023-04-03', morning: 12.8, evening: 10.5, total: 23.3 },
      ];
    } catch (error) {
      console.error(`Error fetching milk production data for animal ID ${animalId}:`, error);
      throw error;
    }
  }
}

export default new AnimalService(); 