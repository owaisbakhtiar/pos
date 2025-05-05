import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native-safe-area-context';
import { Text } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import HealthRecordService, { 
  Veterinarian, 
  PaginationData,
  VeterinarianFormData
} from '../../services/HealthRecordService';

// Define navigation type
type RootStackParamList = {
  Home: undefined;
  HealthRecords: undefined;
  ManageVeterinarians: undefined;
  AddHealthRecord: undefined;
};

// Veterinarian card component
const VeterinarianCard = ({ 
  vet, 
  onEdit, 
  onDelete 
}: { 
  vet: Veterinarian; 
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <View style={styles.veterinarianCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.veterinarianName}>{vet.name}</Text>
        {vet.specialty && (
          <View style={styles.specialtyBadge}>
            <Text style={styles.specialtyText}>{vet.specialty}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#7A869A" />
          <Text style={styles.detailValue}>{vet.contactNumber}</Text>
        </View>
        
        {vet.email && (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#7A869A" />
            <Text style={styles.detailValue}>{vet.email}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#7A869A" />
          <Text style={styles.detailValue}>{vet.address}</Text>
        </View>
        
        {vet.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Specialization:</Text>
            <Text style={styles.descriptionValue}>{vet.description}</Text>
          </View>
        )}
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
    </View>
  );
};

// Main component
export default function ManageVeterinariansScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // State
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1
  });
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVet, setEditingVet] = useState<Veterinarian | null>(null);
  const [savingVet, setSavingVet] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<VeterinarianFormData>({
    farm_id: 1, // Default farm ID, should come from context or settings
    name: '',
    address: '',
    contact_number: '',
    description: '',
    license_number: '',
    specialty: '',
    email: '',
  });
  
  // Fetch veterinarians from API when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchVeterinarians();
      
      return () => {
        // Clean up if needed
      };
    }, [])
  );
  
  // Fetch veterinarians from API
  const fetchVeterinarians = async (page: number = 1, query: string = searchQuery) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await HealthRecordService.getVeterinarians(page, query);
      
      if (page === 1) {
        setVeterinarians(response.vets);
      } else {
        setVeterinarians(prevVets => [...prevVets, ...response.vets]);
      }
      
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      Alert.alert('Error', 'Failed to load veterinarians. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };
  
  // Load more vets when reaching the end of the list
  const handleLoadMore = () => {
    if (
      !loadingMore && 
      pagination.current_page < pagination.total_pages
    ) {
      fetchVeterinarians(pagination.current_page + 1);
    }
  };
  
  // Search vets
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      fetchVeterinarians(1, '');
    } else {
      // Debounce search - only search after typing stops for 500ms
      const timeoutId = setTimeout(() => {
        fetchVeterinarians(1, query);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };
  
  // Refresh vets list (pull-to-refresh)
  const handleRefresh = () => {
    setRefreshing(true);
    fetchVeterinarians(1, searchQuery);
  };
  
  // Open add vet modal
  const handleAddNew = () => {
    setFormData({
      farm_id: 1, // Default farm ID, should come from context or settings
      name: '',
      address: '',
      contact_number: '',
      description: '',
      license_number: '',
      specialty: '',
      email: '',
    });
    setEditingVet(null);
    setModalVisible(true);
  };
  
  // Open edit vet modal
  const handleEdit = (vet: Veterinarian) => {
    setFormData({
      farm_id: vet.farmId,
      name: vet.name,
      address: vet.address,
      contact_number: vet.contactNumber,
      description: vet.description,
      license_number: vet.licenseNumber || '',
      specialty: vet.specialty || '',
      email: vet.email || '',
    });
    setEditingVet(vet);
    setModalVisible(true);
  };
  
  // Handle form input changes
  const handleInputChange = (field: keyof VeterinarianFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Validate form
  const validateForm = () => {
    if (formData.name.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a name');
      return false;
    }
    
    if (formData.contact_number.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a contact number');
      return false;
    }
    
    if (formData.address.trim() === '') {
      Alert.alert('Validation Error', 'Please enter an address');
      return false;
    }
    
    return true;
  };
  
  // Save veterinarian (create or update)
  const saveVeterinarian = async () => {
    if (!validateForm()) return;
    
    setSavingVet(true);
    try {
      if (editingVet) {
        // Update existing vet
        await HealthRecordService.updateVeterinarian(editingVet.id, formData);
        Alert.alert('Success', 'Veterinarian updated successfully');
      } else {
        // Create new vet
        await HealthRecordService.createVeterinarian(formData);
        Alert.alert('Success', 'Veterinarian added successfully');
      }
      
      setModalVisible(false);
      fetchVeterinarians(1, searchQuery);
    } catch (error) {
      console.error('Error saving veterinarian:', error);
      Alert.alert('Error', 'Failed to save veterinarian. Please try again.');
    } finally {
      setSavingVet(false);
    }
  };
  
  // Delete veterinarian
  const handleDelete = (vet: Veterinarian) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${vet.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await HealthRecordService.deleteVeterinarian(vet.id);
              fetchVeterinarians(1, searchQuery);
              
              Alert.alert('Success', 'Veterinarian deleted successfully');
            } catch (error) {
              console.error('Error deleting veterinarian:', error);
              Alert.alert('Error', 'Failed to delete veterinarian. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Render loading indicator
  if (loading && !refreshing && veterinarians.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7367F0" />
        <Text style={styles.loadingText}>Loading veterinarians...</Text>
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
          <Text style={styles.headerTitle}>Veterinarians</Text>
          <Text style={styles.headerSubtitle}>
            {pagination.total} {pagination.total === 1 ? 'Veterinarian' : 'Veterinarians'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#7367F0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search veterinarians..."
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
      
      {/* Veterinarians list */}
      <FlatList
        data={veterinarians}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <VeterinarianCard
            vet={item}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.veterinariansList}
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
              <Ionicons name="medkit-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'No veterinarians found for your search' 
                  : 'No veterinarians found. Add your first veterinarian!'}
              </Text>
              <TouchableOpacity 
                style={styles.addEmptyButton}
                onPress={handleAddNew}
              >
                <Text style={styles.addEmptyText}>Add Veterinarian</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
      
      {/* Add/Edit Veterinarian Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingVet ? 'Edit Veterinarian' : 'Add Veterinarian'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#3F4E6C" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter veterinarian name"
                />
              </View>
              
              {/* Contact Number */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Contact Number *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.contact_number}
                  onChangeText={(value) => handleInputChange('contact_number', value)}
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                />
              </View>
              
              {/* Email */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Enter email address (optional)"
                  keyboardType="email-address"
                />
              </View>
              
              {/* License Number */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>License Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.license_number}
                  onChangeText={(value) => handleInputChange('license_number', value)}
                  placeholder="Enter license number (optional)"
                />
              </View>
              
              {/* Specialty */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Specialty</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.specialty}
                  onChangeText={(value) => handleInputChange('specialty', value)}
                  placeholder="Enter specialty (optional)"
                />
              </View>
              
              {/* Address */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  placeholder="Enter address"
                  multiline
                />
              </View>
              
              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholder="Enter description or specialization details (optional)"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
                disabled={savingVet}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={saveVeterinarian}
                disabled={savingVet}
              >
                {savingVet ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    marginLeft: 8,
  },
  backButton: {
    padding: 4,
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
  veterinariansList: {
    padding: 16,
    paddingBottom: 80,
  },
  veterinarianCard: {
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
  veterinarianName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
  },
  specialtyBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#3F4E6C',
    marginLeft: 8,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    color: '#7A869A',
    marginBottom: 4,
  },
  descriptionValue: {
    fontSize: 14,
    color: '#3F4E6C',
    lineHeight: 20,
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
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: '#3F4E6C',
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E9EDF5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#3F4E6C',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#3F4E6C',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#7367F0',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
}); 