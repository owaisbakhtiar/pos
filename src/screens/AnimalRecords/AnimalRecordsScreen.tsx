import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  Image,
} from 'react-native-safe-area-context';
import { Text } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import AnimalService, { Animal, PaginationData } from '../../services/AnimalService';

// Define navigation type
type RootStackParamList = {
  Home: undefined;
  AnimalRecords: undefined;
  AddAnimal: undefined;
  EditAnimal: { animalId: number };
  AnimalDetail: { animalId: number };
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
          {animal.image_path ? (
            <Image 
              source={{ uri: animal.image_path }} 
              style={styles.animalImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.animalImagePlaceholder}>
              <Ionicons name="paw-outline" size={30} color="#7367F0" />
            </View>
          )}
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
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [milkRecords, setMilkRecords] = useState<any[]>([]);
  
  useEffect(() => {
    if (animal && visible) {
      fetchAnimalDetails();
    }
  }, [animal, visible]);
  
  const fetchAnimalDetails = async () => {
    if (!animal) return;
    
    setLoadingDetails(true);
    try {
      // Fetch health records and milk production data in parallel
      const [healthData, milkData] = await Promise.all([
        AnimalService.getAnimalHealthRecords(animal.id),
        animal.animal_type === 'Cow' && animal.gender === 'Female' 
          ? AnimalService.getMilkProductionData(animal.id) 
          : Promise.resolve([])
      ]);
      
      setHealthRecords(healthData);
      setMilkRecords(milkData);
    } catch (error) {
      console.error('Error fetching animal details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };
  
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
              {animal.image_path ? (
                <Image 
                  source={{ uri: animal.image_path }} 
                  style={styles.detailImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="paw" size={64} color="#7367F0" />
                </View>
              )}
            </View>
            
            <View style={styles.badgeContainer}>
              <View style={[styles.statusBadge, { 
                backgroundColor: 
                  animal.health_status === 'Healthy' ? '#34C759' : 
                  animal.health_status === 'Sick' ? '#FF3B30' : 
                  '#FF9500' // Under Treatment
              }]}>
                <Text style={styles.statusText}>{animal.health_status}</Text>
              </View>
              
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{animal.animal_type}</Text>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tag ID:</Text>
                <Text style={styles.infoValue}>{animal.tag_id}</Text>
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
                <Text style={styles.infoLabel}>Born:</Text>
                <Text style={styles.infoValue}>{animal.date_of_birth}</Text>
              </View>
              {animal.price && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Price:</Text>
                  <Text style={styles.infoValue}>${animal.price}</Text>
                </View>
              )}
              {animal.lactation && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lactation:</Text>
                  <Text style={styles.infoValue}>{animal.lactation}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Location Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Shed ID:</Text>
                <Text style={styles.infoValue}>{animal.shed_location_id}</Text>
              </View>
              {animal.location && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location:</Text>
                  <Text style={styles.infoValue}>{animal.location}</Text>
                </View>
              )}
            </View>
            
            {/* Health records section */}
            {healthRecords.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Health Records</Text>
                  {healthRecords.map((record, index) => (
                    <View key={record.id} style={styles.recordCard}>
                      <View style={styles.recordHeader}>
                        <Text style={styles.recordDate}>{record.date}</Text>
                        <Text style={styles.recordTitle}>{record.condition}</Text>
                      </View>
                      <View style={styles.recordBody}>
                        <Text style={styles.recordLabel}>Treatment:</Text>
                        <Text style={styles.recordValue}>{record.treatment}</Text>
                      </View>
                      <Text style={styles.recordNotes}>{record.notes}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            
            {/* Milk production section (only for female cows) */}
            {milkRecords.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Milk Production</Text>
                  {milkRecords.map((record, index) => (
                    <View key={index} style={styles.recordCard}>
                      <Text style={styles.recordDate}>{record.date}</Text>
                      <View style={styles.milkDataContainer}>
                        <View style={styles.milkDataItem}>
                          <Text style={styles.milkDataLabel}>Morning</Text>
                          <Text style={styles.milkDataValue}>{record.morning} L</Text>
                        </View>
                        <View style={styles.milkDataItem}>
                          <Text style={styles.milkDataLabel}>Evening</Text>
                          <Text style={styles.milkDataValue}>{record.evening} L</Text>
                        </View>
                        <View style={styles.milkDataItem}>
                          <Text style={styles.milkDataLabel}>Total</Text>
                          <Text style={[styles.milkDataValue, styles.milkTotal]}>{record.total} L</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
            
            {/* Record creation/update info */}
            <View style={styles.infoSection}>
              <Text style={styles.timestampText}>
                Created: {new Date(animal.created_at).toLocaleDateString()}
              </Text>
              <Text style={styles.timestampText}>
                Last Updated: {new Date(animal.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.footerButton}
              onPress={onClose}
            >
              <Text style={styles.footerButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1
  });
  
  // Fetch animals from API when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchAnimals();
      
      return () => {
        // Clean up if needed
      };
    }, [])
  );
  
  // Fetch animals from API
  const fetchAnimals = async (page: number = 1, filter: string = activeFilter, query: string = searchQuery) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await AnimalService.getAnimals(page, query, filter);
      
      if (page === 1) {
        setAnimals(response.animals);
        setFilteredAnimals(response.animals);
      } else {
        setAnimals(prevAnimals => [...prevAnimals, ...response.animals]);
        setFilteredAnimals(prevAnimals => [...prevAnimals, ...response.animals]);
      }
      
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching animals:', error);
      Alert.alert('Error', 'Failed to load animals. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };
  
  // Load more animals when reaching the end of the list
  const handleLoadMore = () => {
    if (
      !loadingMore && 
      pagination.current_page < pagination.total_pages
    ) {
      fetchAnimals(pagination.current_page + 1);
    }
  };
  
  // Filter animals by type
  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    fetchAnimals(1, filter, searchQuery);
  };
  
  // Search animals
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      fetchAnimals(1, activeFilter, '');
    } else {
      // Debounce search - only search after typing stops for 500ms
      const timeoutId = setTimeout(() => {
        fetchAnimals(1, activeFilter, query);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };
  
  // Refresh animals list (pull-to-refresh)
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnimals(1, activeFilter, searchQuery);
  };
  
  // View animal details
  const viewAnimalDetails = (animal: Animal) => {
    navigation.navigate('AnimalDetail' as never, { animalId: animal.id } as never);
  };
  
  // Navigate to edit animal screen
  const editAnimal = (animal: Animal) => {
    navigation.navigate('EditAnimal', { animalId: animal.id });
  };
  
  // Delete animal
  const deleteAnimal = (animal: Animal) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${animal.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await AnimalService.deleteAnimal(animal.id);
              fetchAnimals(1, activeFilter, searchQuery);
              
              Alert.alert('Success', 'Animal deleted successfully');
            } catch (error) {
              console.error('Error deleting animal:', error);
              Alert.alert('Error', 'Failed to delete animal. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Navigate to add animal screen
  const addNewAnimal = () => {
    navigation.navigate('AddAnimal');
  };
  
  // Render loading indicator
  if (loading && !refreshing && animals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7367F0" />
        <Text style={styles.loadingText}>Loading animals...</Text>
      </View>
    );
  }
  
  // Render footer for FlatList (loading indicator for pagination)
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#7367F0" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3F4E6C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Animal Records</Text>
          <Text style={styles.headerSubtitle}>
            {pagination.total} {pagination.total === 1 ? 'Animal' : 'Animals'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addNewAnimal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#7367F0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search animals..."
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => handleSearch('')}
              style={styles.clearSearch}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Filter section */}
      <FilterSection onFilter={handleFilter} activeFilter={activeFilter} />
      
      {/* Animal list */}
      <FlatList
        data={filteredAnimals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AnimalCard
            animal={item}
            onPress={() => viewAnimalDetails(item)}
            onEdit={() => editAnimal(item)}
            onDelete={() => deleteAnimal(item)}
          />
        )}
        contentContainerStyle={styles.animalList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#7367F0']}
            tintColor="#7367F0"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyList}>
              <Ionicons name="alert-circle-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'No animals found for your search' 
                  : activeFilter 
                    ? `No ${activeFilter.toLowerCase()} animals found` 
                    : 'No animals found. Add your first animal!'}
              </Text>
              <TouchableOpacity 
                style={styles.addEmptyButton}
                onPress={addNewAnimal}
              >
                <Text style={styles.addEmptyText}>Add Animal</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
      
      {/* Animal Details Modal */}
      <AnimalDetailsModal
        visible={modalVisible}
        animal={selectedAnimal}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3F4E6C',
    marginLeft: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7A869A',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#7367F0',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  searchBarContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E9EDF5',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#3F4E6C',
    height: 40,
  },
  clearSearch: {
    padding: 4,
  },
  filterWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3F4E6C',
    marginLeft: 16,
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E9EDF5',
  },
  filterButtonActive: {
    backgroundColor: '#7367F0',
    borderColor: '#7367F0',
  },
  filterText: {
    fontSize: 14,
    color: '#3F4E6C',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  animalList: {
    padding: 16,
    paddingBottom: 80,
  },
  animalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
  },
  tagId: {
    fontSize: 14,
    color: '#7A869A',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBody: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  animalImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  animalImage: {
    width: '100%',
    height: '100%',
  },
  animalImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9EDF5',
  },
  detailsContainer: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 70,
    fontSize: 14,
    color: '#7A869A',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#3F4E6C',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    padding: 4,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#3F4E6C',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#3F4E6C',
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#7A869A',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addEmptyButton: {
    backgroundColor: '#7367F0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addEmptyText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7A869A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
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
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9EDF5',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#7367F0',
    marginLeft: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3F4E6C',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 15,
    color: '#7A869A',
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    color: '#3F4E6C',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 16,
  },
  recordCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#7367F0',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 14,
    color: '#7A869A',
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F4E6C',
  },
  recordBody: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  recordLabel: {
    width: 80,
    fontSize: 14,
    color: '#7A869A',
  },
  recordValue: {
    flex: 1,
    fontSize: 14,
    color: '#3F4E6C',
  },
  recordNotes: {
    fontSize: 14,
    color: '#3F4E6C',
    fontStyle: 'italic',
    marginTop: 4,
  },
  milkDataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  milkDataItem: {
    alignItems: 'center',
    flex: 1,
  },
  milkDataLabel: {
    fontSize: 12,
    color: '#7A869A',
    marginBottom: 4,
  },
  milkDataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F4E6C',
  },
  milkTotal: {
    color: '#7367F0',
  },
  timestampText: {
    fontSize: 12,
    color: '#7A869A',
    marginTop: 4,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    alignItems: 'center',
  },
  footerButton: {
    backgroundColor: '#7367F0',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    padding: 4,
  },
}); 