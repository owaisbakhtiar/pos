// Animal interfaces
export interface Animal {
  id: string;
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

// Mock data
const mockAnimals: Animal[] = [
  {
    id: '1',
    name: 'Bella',
    tag_id: 'COW001',
    date_of_birth: '2019-05-15',
    breed: 'Holstein',
    animal_type: 'Cow',
    gender: 'Female',
    health_status: 'Healthy',
    lactation: 'Active',
    shed_location_id: 'A1',
  },
  {
    id: '2',
    name: 'Duke',
    tag_id: 'BULL002',
    date_of_birth: '2018-03-20',
    breed: 'Angus',
    animal_type: 'Bull',
    gender: 'Male',
    health_status: 'Healthy',
    shed_location_id: 'B2',
  },
  {
    id: '3',
    name: 'Daisy',
    tag_id: 'COW003',
    date_of_birth: '2020-01-10',
    breed: 'Jersey',
    animal_type: 'Cow',
    gender: 'Female',
    health_status: 'Under Treatment',
    lactation: 'Active',
    shed_location_id: 'A3',
  },
  {
    id: '4',
    name: 'Luna',
    tag_id: 'HEIF004',
    date_of_birth: '2021-07-12',
    breed: 'Holstein',
    animal_type: 'Heifer',
    gender: 'Female',
    health_status: 'Healthy',
    shed_location_id: 'C1',
  },
  {
    id: '5',
    name: 'Max',
    tag_id: 'CALF005',
    date_of_birth: '2022-11-30',
    breed: 'Angus',
    animal_type: 'Calf',
    gender: 'Male',
    health_status: 'Sick',
    shed_location_id: 'D2',
  },
  {
    id: '6',
    name: 'Rosie',
    tag_id: 'COW006',
    date_of_birth: '2019-08-25',
    breed: 'Holstein',
    animal_type: 'Cow',
    gender: 'Female',
    health_status: 'Healthy',
    lactation: 'Dry',
    shed_location_id: 'A2',
    price: '1200'
  },
  {
    id: '7',
    name: 'Charlie',
    tag_id: 'BULL007',
    date_of_birth: '2018-06-14',
    breed: 'Brahman',
    animal_type: 'Bull',
    gender: 'Male',
    health_status: 'Healthy',
    shed_location_id: 'B1',
    price: '1500'
  },
];

// Service class for animal-related mock data
class AnimalService {
  // Get all animals
  async getAnimals(): Promise<Animal[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...mockAnimals];
  }

  // Get animal by ID
  async getAnimalById(id: string): Promise<Animal> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const animal = mockAnimals.find(a => a.id === id);
    if (!animal) {
      throw new Error(`Animal with ID ${id} not found`);
    }
    return {...animal};
  }

  // Create new animal
  async createAnimal(animalData: AnimalCreateRequest): Promise<Animal> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newAnimal: Animal = {
      id: `${mockAnimals.length + 1}`,
      ...animalData
    };
    mockAnimals.push(newAnimal);
    return {...newAnimal};
  }

  // Update animal
  async updateAnimal(id: string, animalData: AnimalUpdateRequest): Promise<Animal> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockAnimals.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Animal with ID ${id} not found`);
    }
    
    const updatedAnimal = {
      ...mockAnimals[index],
      ...animalData
    };
    
    mockAnimals[index] = updatedAnimal;
    return {...updatedAnimal};
  }

  // Delete animal
  async deleteAnimal(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockAnimals.findIndex(a => a.id === id);
    if (index !== -1) {
      mockAnimals.splice(index, 1);
    }
  }

  // Filter animals by type
  async getAnimalsByType(type: string): Promise<Animal[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAnimals.filter(animal => animal.animal_type === type);
  }

  // Search animals by query (name, tag_id, or breed)
  async searchAnimals(query: string): Promise<Animal[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const lowercaseQuery = query.toLowerCase();
    return mockAnimals.filter(animal => 
      animal.name.toLowerCase().includes(lowercaseQuery) || 
      animal.tag_id.toLowerCase().includes(lowercaseQuery) ||
      animal.breed.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get health records for an animal
  async getAnimalHealthRecords(animalId: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Mock health records
    return [
      {
        id: '1',
        date: '2023-01-15',
        condition: 'Routine Checkup',
        treatment: 'None',
        notes: 'Animal in good health'
      },
      {
        id: '2',
        date: '2023-03-20',
        condition: 'Vaccination',
        treatment: 'FMD Vaccine',
        notes: 'Regular vaccination program'
      }
    ];
  }

  // Get milk production data for an animal
  async getMilkProductionData(animalId: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Mock milk production data
    return [
      { date: '2023-04-01', morning: 12.5, evening: 10.2, total: 22.7 },
      { date: '2023-04-02', morning: 13.1, evening: 11.0, total: 24.1 },
      { date: '2023-04-03', morning: 12.8, evening: 10.5, total: 23.3 },
    ];
  }
}

export default new AnimalService(); 