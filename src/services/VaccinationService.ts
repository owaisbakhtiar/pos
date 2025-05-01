import api from './api';

export interface Vaccination {
  id: number;
  animal_id: number;
  vaccine_id: number;
  animal: {
    id: number;
    tag_number: string | null;
    name: string;
  };
  vaccine: {
    id: number;
    name: string;
    doses: number;
    interval_days: number;
  };
  date_given: string;
  next_due_date: string;
  administered_by: string;
  batch_number: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface VaccinationFormData {
  animal_id: number;
  vaccine_id: number;
  date_given: string;
  next_due_date: string;
  administered_by: string;
  batch_number: string;
  notes: string;
}

export interface PaginationData {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

class VaccinationService {
  // Get all vaccinations with pagination and optional filtering
  async getVaccinations(
    page: number = 1,
    animal_id?: number,
    vaccine_id?: number
  ): Promise<{ vaccinations: Vaccination[], pagination: PaginationData }> {
    try {
      let url = `/v1/livestock/vaccinations?page=${page}`;
      
      if (animal_id) {
        url += `&animal_id=${animal_id}`;
      }
      
      if (vaccine_id) {
        url += `&vaccine_id=${vaccine_id}`;
      }
      
      console.log(`Making API call to: ${url}`);
      const response = await api.get(url);
      console.log(`API response summary: ${response.data.success ? 'Success' : 'Failed'}`);
      
      if (!response.data || !response.data.data) {
        console.error('Missing data in vaccinations response');
        return { 
          vaccinations: [], 
          pagination: { 
            total: 0, 
            count: 0, 
            per_page: 10, 
            current_page: 1, 
            total_pages: 1 
          } 
        };
      }
      
      // Process received data
      const vaccinations = response.data.data.data || [];
      const pagination = response.data.data.pagination || {
        total: vaccinations.length,
        count: vaccinations.length,
        per_page: 10,
        current_page: 1,
        total_pages: 1
      };
      
      return {
        vaccinations,
        pagination
      };
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      throw error;
    }
  }
  
  // Get a specific vaccination by ID
  async getVaccination(id: number): Promise<Vaccination> {
    try {
      const response = await api.get(`/v1/livestock/vaccinations/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching vaccination ${id}:`, error);
      throw error;
    }
  }
  
  // Create a new vaccination record
  async createVaccination(vaccinationData: VaccinationFormData): Promise<Vaccination> {
    try {
      console.log('Creating vaccination with data:', JSON.stringify(vaccinationData));
      const response = await api.post('/v1/livestock/vaccinations', vaccinationData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating vaccination record:', error);
      throw error;
    }
  }
  
  // Update an existing vaccination
  async updateVaccination(id: number, vaccinationData: Partial<VaccinationFormData>): Promise<Vaccination> {
    try {
      const response = await api.put(`/v1/livestock/vaccinations/${id}`, vaccinationData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating vaccination ${id}:`, error);
      throw error;
    }
  }
  
  // Delete a vaccination record
  async deleteVaccination(id: number): Promise<void> {
    try {
      await api.delete(`/v1/livestock/vaccinations/${id}`);
    } catch (error) {
      console.error(`Error deleting vaccination ${id}:`, error);
      throw error;
    }
  }
}

export default new VaccinationService(); 