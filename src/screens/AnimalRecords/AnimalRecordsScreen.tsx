import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Text } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AnimalService, { Animal } from '../../services/AnimalService';

// Define navigation type
type RootStackParamList = {
  Home: undefined;
  AnimalRecords: undefined;
  AddAnimal: undefined;
  EditAnimal: { animalId: string };
};

// Animal card component
const AnimalCard = ({ 
  animal, 
  onPress, 
  onEdit, 
  onDelete 
}: { 
  animal: Animal; 
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <TouchableOpacity style={styles.animalCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.animalName}>{animal.name}</Text>
          <Text style={styles.tagId}>ID: {animal.tag_id}</Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: 
            animal.health_status === 'Healthy' ? '#34C759' : 
            animal.health_status === 'Sick' ? '#FF3B30' : 
            '#FF9500' // Under Treatment
        }]}>
          <Text style={styles.statusText}>{animal.health_status}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.animalImageContainer}>
          <View style={styles.animalImagePlaceholder}>
            <Ionicons name="paw-outline" size={30} color="#7367F0" />
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Breed:</Text>
            <Text style={styles.detailValue}>{animal.breed}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{animal.animal_type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gender:</Text>
            <Text style={styles.detailValue}>{animal.gender}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Born:</Text>
            <Text style={styles.detailValue}>{animal.date_of_birth}</Text>
          </View>
          {animal.lactation && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lactation:</Text>
              <Text style={styles.detailValue}>{animal.lactation}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={22} color="#7367F0" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Define filter options interface
interface FilterOption {
  label: string;
  value: string;
}

// Define filter options array
const filterOptions: FilterOption[] = [
  { label: 'All', value: '' },
  { label: 'Cow', value: 'Cow' },
  { label: 'Bull', value: 'Bull' },
  { label: 'Heifer', value: 'Heifer' },
  { label: 'Calf', value: 'Calf' },
];

// Filter component
const FilterSection = ({ onFilter, activeFilter }: { onFilter: (filter: string) => void, activeFilter: string }) => {
  return (
    <View style={styles.filterWrapper}>
      <Text style={styles.filterSectionLabel}>Filter by:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterScroll}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              filter.value === activeFilter && styles.filterButtonActive
            ]}
            onPress={() => onFilter(filter.value)}
          >
            <Text
              style={{
                ...styles.filterText,
                ...(filter.value === activeFilter ? styles.filterTextActive : {})
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Animal details modal
const AnimalDetailsModal = ({ 
  visible, 
  animal, 
  onClose 
}: { 
  visible: boolean; 
  animal: Animal | null;
  onClose: () => void;
}) => {
  if (!animal) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{animal.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#3F4E6C" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.animalProfileImage}>
              <Ionicons name="paw" size={64} color="#7367F0" />
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tag ID:</Text>
                <Text style={styles.infoValue}>{animal.tag_id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Animal Type:</Text>
                <Text style={styles.infoValue}>{animal.animal_type}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Breed:</Text>
                <Text style={styles.infoValue}>{animal.breed}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender:</Text>
                <Text style={styles.infoValue}>{animal.gender}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth:</Text>
                <Text style={styles.infoValue}>{animal.date_of_birth}</Text>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Health & Status</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Health Status:</Text>
                <View style={[styles.statusIndicator, 
                  animal.health_status === 'Healthy' 
                    ? { backgroundColor: '#34C759' } 
                    : animal.health_status === 'Sick' 
                      ? { backgroundColor: '#FF3B30' } 
                      : { backgroundColor: '#FF9500' }
                ]}>
                  <Text style={styles.statusIndicatorText}>{animal.health_status}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Shed Location:</Text>
                <Text style={styles.infoValue}>{animal.shed_location_id}</Text>
              </View>
              {animal.lactation && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lactation Status:</Text>
                  <Text style={styles.infoValue}>{animal.lactation}</Text>
                </View>
              )}
            </View>
            
            {animal.price && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Financial Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Price:</Text>
                  <Text style={styles.infoValue}>${animal.price}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButtonFull}>
                <Ionicons name="document-text-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>View Health Records</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonFull}>
                <Ionicons name="stats-chart-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Milk Production Data</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Main component
export default function AnimalRecordsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');
  
  // Fetch all animals on component mount
  useEffect(() => {
    fetchAnimals();
  }, []);
  
  // Apply search filter when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAnimals(animals);
    } else {
      // Use search functionality from animal service
      handleSearch(searchQuery);
    }
  }, [searchQuery, animals]);
  
  // Fetch animals from the API
  const fetchAnimals = async () => {
    setIsLoading(true);
    try {
      const data = await AnimalService.getAnimals();
      setAnimals(data);
      setFilteredAnimals(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch animals. Please try again later.');
      console.error('Error fetching animals:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle filtering by animal type
  const handleFilter = async (filter: string) => {
    setActiveFilter(filter);
    setIsLoading(true);
    try {
      if (filter === '') {
        // If no filter selected, show all animals
        const data = await AnimalService.getAnimals();
        setFilteredAnimals(data);
      } else {
        // Otherwise, filter animals by type
        const data = await AnimalService.getAnimalsByType(filter);
        setFilteredAnimals(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to filter animals. Please try again later.');
      console.error('Error filtering animals:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle search functionality
  const handleSearch = async (query: string) => {
    if (query.trim() === '') {
      setFilteredAnimals(animals);
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await AnimalService.searchAnimals(query);
      setFilteredAnimals(results);
    } catch (error) {
      console.error('Error searching animals:', error);
      // If search fails, do a local filter as fallback
      const filtered = animals.filter(animal => 
        animal.name.toLowerCase().includes(query.toLowerCase()) || 
        animal.tag_id.toLowerCase().includes(query.toLowerCase()) ||
        animal.breed.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAnimals(filtered);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnimals();
  };
  
  // View animal details
  const viewAnimalDetails = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsDetailsModalVisible(true);
  };
  
  // Edit animal
  const editAnimal = (animal: Animal) => {
    navigation.navigate('EditAnimal', { animalId: animal.id });
  };
  
  // Delete animal
  const deleteAnimal = (animal: Animal) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${animal.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await AnimalService.deleteAnimal(animal.id);
              // Remove the deleted animal from the list
              const updatedAnimals = animals.filter(a => a.id !== animal.id);
              setAnimals(updatedAnimals);
              setFilteredAnimals(updatedAnimals);
              Alert.alert('Success', `${animal.name} has been deleted.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete animal. Please try again later.');
              console.error('Error deleting animal:', error);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Add new animal
  const addNewAnimal = () => {
    navigation.navigate('AddAnimal');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#3F4E6C" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Animal Records</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addNewAnimal}
          >
            <Ionicons name="add-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, tag ID or breed..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#777" />
            </TouchableOpacity>
          )}
        </View>
        
        <FilterSection onFilter={handleFilter} activeFilter={activeFilter} />
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading animals...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAnimals}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <AnimalCard 
                animal={item} 
                onPress={() => viewAnimalDetails(item)}
                onEdit={() => editAnimal(item)}
                onDelete={() => deleteAnimal(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#7367F0"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="paw" size={64} color="#CCCCCC" />
                <Text style={styles.emptyText}>No animals found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || activeFilter 
                    ? "Try changing your search or filter"
                    : "Add animals to see them here"}
                </Text>
              </View>
            }
          />
        )}
      </View>
      
      <AnimalDetailsModal
        visible={isDetailsModalVisible}
        animal={selectedAnimal}
        onClose={() => setIsDetailsModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3F4E6C',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7367F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#7367F0",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  filterWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#7367F0',
    borderColor: '#7367F0',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  animalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  tagId: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  cardBody: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 12,
  },
  animalImageContainer: {
    marginRight: 16,
  },
  animalImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0EFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: 70,
    fontSize: 14,
    color: '#777',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#7367F0',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3F4E6C',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  animalProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0EFFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3F4E6C',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontSize: 14,
    color: '#777',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusIndicatorText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 16,
  },
  actionButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7367F0',
    borderRadius: 30,
    padding: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 