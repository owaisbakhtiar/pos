import api from './api';

export interface Animal {
  id: number;
  name: string;
  tag_number: string | null;
  animal_type: string;
}

export interface BreedingRecord {
  id: number;
  female_id: number;
  male_id: number;
  femaleAnimal: Animal;
  maleAnimal: Animal;
  breeding_date: string;
  expected_delivery_date: string;
  breeding_method: 'AI' | 'natural';
  status: 'pending' | 'confirmed' | 'successful' | 'unsuccessful';
  pregnancy_check_date: string | null;
  actual_delivery_date: string | null;
  offspring_count: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BreedingFormData {
  female_id: number;
  male_id: number;
  breeding_date: string;
  expected_delivery_date: string;
  breeding_method: 'AI' | 'natural';
  status?: 'pending' | 'confirmed' | 'successful' | 'unsuccessful';
  pregnancy_check_date?: string | null;
  actual_delivery_date?: string | null;
  offspring_count?: number | null;
  notes?: string;
}

export interface PaginationData {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface BreedingResponse {
  success: boolean;
  message: string;
  data: {
    data: BreedingRecord[];
    pagination: PaginationData;
  };
}

export interface SingleBreedingResponse {
  success: boolean;
  message: string;
  data: BreedingRecord;
}

class BreedingService {
  // Get all breeding records with pagination
  async getBreedingRecords(page: number = 1, search: string = '', status: string = ''): Promise<{ records: BreedingRecord[], pagination: PaginationData }> {
    try {
      let url = `/v1/livestock/reproduction/breeding-records?page=${page}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (status) {
        url += `&status=${encodeURIComponent(status)}`;
      }
      
      console.log('Fetching breeding records with URL:', url);
      const response = await api.get<any>(url);
      
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      
      // Handle different possible API response structures
      let records: BreedingRecord[] = [];
      let pagination: PaginationData = {
        total: 0,
        count: 0,
        per_page: 10,
        current_page: 1,
        total_pages: 1
      };
      
      if (response.data && response.data.data) {
        // First structure: response.data.data.data[]
        if (Array.isArray(response.data.data.data)) {
          records = response.data.data.data;
          pagination = response.data.data.pagination || pagination;
        } 
        // Second possible structure: response.data.data[]
        else if (Array.isArray(response.data.data)) {
          records = response.data.data;
          if (response.data.pagination) {
            pagination = response.data.pagination;
          }
        }
        // Third possibility: direct array
        else if (response.data.data.records && Array.isArray(response.data.data.records)) {
          records = response.data.data.records;
          pagination = response.data.data.pagination || pagination;
        }
      }
      
      console.log('Extracted records:', records);
      console.log('Extracted pagination:', pagination);
      
      return {
        records,
        pagination
      };
    } catch (error) {
      console.error('Error fetching breeding records:', error);
      throw error;
    }
  }
  
  // Get a specific breeding record by ID
  async getBreedingRecord(id: number): Promise<BreedingRecord> {
    try {
      const response = await api.get<SingleBreedingResponse>(`/v1/livestock/reproduction/breeding-records/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching breeding record ${id}:`, error);
      throw error;
    }
  }
  
  // Create a new breeding record
  async createBreedingRecord(data: BreedingFormData): Promise<BreedingRecord> {
    try {
      const response = await api.post<SingleBreedingResponse>('/v1/livestock/reproduction/breeding-records', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating breeding record:', error);
      throw error;
    }
  }
  
  // Update an existing breeding record
  async updateBreedingRecord(id: number, data: BreedingFormData): Promise<BreedingRecord> {
    try {
      const response = await api.put<SingleBreedingResponse>(`/v1/livestock/reproduction/breeding-records/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating breeding record ${id}:`, error);
      throw error;
    }
  }
  
  // Delete a breeding record
  async deleteBreedingRecord(id: number): Promise<void> {
    try {
      await api.delete(`/v1/livestock/reproduction/breeding-records/${id}`);
    } catch (error) {
      console.error(`Error deleting breeding record ${id}:`, error);
      throw error;
    }
  }
}

export default new BreedingService(); 