import api from './api';

export interface HealthRecord {
  id: number;
  animalId: number;
  date: string;
  status: string;
  treatment: string;
  diagnosis: string;
  notes: string;
  next_checkup_date: string;
  veterinarian_id: number;
  animal: any | null;
  createdAt: string;
  updatedAt: string;
  images?: string[]; // Array of image URLs
}

export interface Veterinarian {
  id: number;
  farmId: number;
  name: string;
  licenseNumber: string | null;
  specialty: string | null;
  contactNumber: string;
  email: string | null;
  address: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface VeterinarianFormData {
  farm_id: number;
  name: string;
  address: string;
  contact_number: string;
  description: string;
  license_number?: string;
  specialty?: string;
  email?: string;
}

export interface Vaccine {
  id: number;
  farmId: number;
  name: string;
  doses: number;
  intervalDays: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaccineFormData {
  farm_id: number;
  name: string;
  doses: number;
  interval_days: number;
  description: string;
}

export interface PaginationData {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface HealthRecordFormData {
  animal_id: number;
  date: string;
  status: string;
  treatment: string;
  diagnosis: string;
  notes: string;
  next_checkup_date: string;
  veterinarian_id: number;
  images?: FormData; // For image uploads
}

class HealthRecordService {
  // Get all health records with pagination, search and filters
  async getHealthRecords(
    page: number = 1,
    search: string = '',
    animalId?: number
  ): Promise<{ records: HealthRecord[], pagination: PaginationData }> {
    try {
      let url = `/v1/livestock/health/records?page=${page}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (animalId) {
        url += `&animalId=${animalId}`;
      }
      
      const response = await api.get(url);
      
      return {
        records: response.data.data.data,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      console.error('Error fetching health records:', error);
      throw error;
    }
  }
  
  // Get a specific health record by ID
  async getHealthRecord(id: number): Promise<HealthRecord> {
    try {
      const response = await api.get(`/v1/livestock/health/records/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching health record:', error);
      throw error;
    }
  }
  
  // Create a new health record with image support
  async createHealthRecord(recordData: HealthRecordFormData): Promise<HealthRecord> {
    try {
      const hasImages = recordData.images && recordData.images.getAll('images').length > 0;
      
      // If there are images, use FormData for multipart/form-data request
      if (hasImages && recordData.images) {
        const formData = recordData.images;
        // Add other fields to formData
        Object.keys(recordData).forEach(key => {
          if (key !== 'images') {
            const value = recordData[key as keyof HealthRecordFormData];
            if (value !== undefined) {
              formData.append(key, String(value));
            }
          }
        });
        
        const response = await api.post('/v1/livestock/health/records', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.data;
      } else {
        // Regular JSON request without images
        const { images, ...dataWithoutImages } = recordData;
        const response = await api.post('/v1/livestock/health/records', dataWithoutImages);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error creating health record:', error);
      throw error;
    }
  }
  
  // Update an existing health record with image support
  async updateHealthRecord(
    id: number,
    recordData: Partial<HealthRecordFormData>
  ): Promise<HealthRecord> {
    try {
      const hasImages = recordData.images && recordData.images.getAll('images').length > 0;
      
      // If there are images, use FormData for multipart/form-data request
      if (hasImages && recordData.images) {
        const formData = recordData.images;
        // Add other fields to formData
        Object.keys(recordData).forEach(key => {
          if (key !== 'images') {
            const value = recordData[key as keyof HealthRecordFormData];
            if (value !== undefined) {
              formData.append(key, String(value));
            }
          }
        });
        
        const response = await api.put(`/v1/livestock/health/records/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.data;
      } else {
        // Regular JSON request without images
        const { images, ...dataWithoutImages } = recordData;
        const response = await api.put(`/v1/livestock/health/records/${id}`, dataWithoutImages);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error updating health record:', error);
      throw error;
    }
  }
  
  // Delete a health record
  async deleteHealthRecord(id: number): Promise<void> {
    try {
      await api.delete(`/v1/livestock/health/records/${id}`);
    } catch (error) {
      console.error('Error deleting health record:', error);
      throw error;
    }
  }
  
  // Delete a health record image
  async deleteHealthRecordImage(recordId: number, imageId: string): Promise<void> {
    try {
      await api.delete(`/v1/livestock/health/records/${recordId}/images/${imageId}`);
    } catch (error) {
      console.error('Error deleting health record image:', error);
      throw error;
    }
  }
  
  // Veterinarian Management
  // Get all veterinarians with pagination and search
  async getVeterinarians(page: number = 1, search: string = ''): Promise<{ vets: Veterinarian[], pagination: PaginationData }> {
    try {
      let url = `/v1/livestock/veterinarians?page=${page}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await api.get(url);
      
      return {
        vets: response.data.data.data,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      throw error;
    }
  }
  
  // Get a specific veterinarian by ID
  async getVeterinarian(id: number): Promise<Veterinarian> {
    try {
      const response = await api.get(`/v1/livestock/veterinarians/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching veterinarian:', error);
      throw error;
    }
  }
  
  // Create a new veterinarian
  async createVeterinarian(vetData: VeterinarianFormData): Promise<Veterinarian> {
    try {
      const response = await api.post('/v1/livestock/veterinarians', vetData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating veterinarian:', error);
      throw error;
    }
  }
  
  // Update an existing veterinarian
  async updateVeterinarian(id: number, vetData: Partial<VeterinarianFormData>): Promise<Veterinarian> {
    try {
      const response = await api.put(`/v1/livestock/veterinarians/${id}`, vetData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating veterinarian:', error);
      throw error;
    }
  }
  
  // Delete a veterinarian
  async deleteVeterinarian(id: number): Promise<void> {
    try {
      await api.delete(`/v1/livestock/veterinarians/${id}`);
    } catch (error) {
      console.error('Error deleting veterinarian:', error);
      throw error;
    }
  }
  
  // Vaccine Management
  // Get all vaccines with pagination and search
  async getVaccines(page: number = 1, search: string = ''): Promise<{ vaccines: Vaccine[], pagination: PaginationData }> {
    try {
      let url = `/v1/livestock/vaccines?page=${page}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await api.get(url);
      
      return {
        vaccines: response.data.data.data,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      throw error;
    }
  }
  
  // Get a specific vaccine by ID
  async getVaccine(id: number): Promise<Vaccine> {
    try {
      const response = await api.get(`/v1/livestock/vaccines/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching vaccine:', error);
      throw error;
    }
  }
  
  // Create a new vaccine
  async createVaccine(vaccineData: VaccineFormData): Promise<Vaccine> {
    try {
      const response = await api.post('/v1/livestock/vaccines', vaccineData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating vaccine:', error);
      throw error;
    }
  }
  
  // Update an existing vaccine
  async updateVaccine(id: number, vaccineData: Partial<VaccineFormData>): Promise<Vaccine> {
    try {
      const response = await api.put(`/v1/livestock/vaccines/${id}`, vaccineData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating vaccine:', error);
      throw error;
    }
  }
  
  // Delete a vaccine
  async deleteVaccine(id: number): Promise<void> {
    try {
      await api.delete(`/v1/livestock/vaccines/${id}`);
    } catch (error) {
      console.error('Error deleting vaccine:', error);
      throw error;
    }
  }
}

export default new HealthRecordService(); 