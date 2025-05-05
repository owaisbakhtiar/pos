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
  Vaccine, 
  PaginationData,
  VaccineFormData
} from '../../services/HealthRecordService';

// Define navigation type
type RootStackParamList = {
  Home: undefined;
  HealthRecords: undefined;
  ManageVaccines: undefined;
  Vaccination: undefined;
};

// Vaccine card component
const VaccineCard = ({ 
  vaccine, 
  onEdit, 
  onDelete 
}: { 
  vaccine: Vaccine; 
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <View style={styles.vaccineCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.vaccineName}>{vaccine.name}</Text>
        <View style={styles.dosesBadge}>
          <Text style={styles.dosesText}>{vaccine.doses} {vaccine.doses === 1 ? 'dose' : 'doses'}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Interval:</Text>
          <Text style={styles.detailValue}>
            {vaccine.intervalDays} {vaccine.intervalDays === 1 ? 'day' : 'days'} between doses
          </Text>
        </View>
        
        {vaccine.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description:</Text>
            <Text style={styles.descriptionValue}>{vaccine.description}</Text>
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
export default function ManageVaccinesScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // State
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
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
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
  const [savingVaccine, setSavingVaccine] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<VaccineFormData>({
    farm_id: 1, // Default farm ID, should come from context or settings
    name: '',
    doses: 1,
    interval_days: 21, // Default 21 days between doses
    description: '',
  });
  
  // Fetch vaccines from API when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchVaccines();
      
      return () => {
        // Clean up if needed
      };
    }, [])
  );
  
  // Fetch vaccines from API
  const fetchVaccines = async (page: number = 1, query: string = searchQuery) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await HealthRecordService.getVaccines(page, query);
      
      if (page === 1) {
        setVaccines(response.vaccines);
      } else {
        setVaccines(prevVaccines => [...prevVaccines, ...response.vaccines]);
      }
      
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      Alert.alert('Error', 'Failed to load vaccines. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };
  
  // Load more vaccines when reaching the end of the list
  const handleLoadMore = () => {
    if (
      !loadingMore && 
      pagination.current_page < pagination.total_pages
    ) {
      fetchVaccines(pagination.current_page + 1);
    }
  };
  
  // Search vaccines
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      fetchVaccines(1, '');
    } else {
      // Debounce search - only search after typing stops for 500ms
      const timeoutId = setTimeout(() => {
        fetchVaccines(1, query);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };
  
  // Refresh vaccines list (pull-to-refresh)
  const handleRefresh = () => {
    setRefreshing(true);
    fetchVaccines(1, searchQuery);
  };
  
  // Add new vaccine
  const handleAddNew = () => {
    setFormData({
      farm_id: 1,
      name: '',
      doses: 1,
      interval_days: 21,
      description: '',
    });
    
    setEditingVaccine(null);
    setModalVisible(true);
  };
  
  // Edit existing vaccine
  const handleEdit = (vaccine: Vaccine) => {
    setFormData({
      farm_id: vaccine.farmId,
      name: vaccine.name,
      doses: vaccine.doses,
      interval_days: vaccine.intervalDays,
      description: vaccine.description
    });
    
    setEditingVaccine(vaccine);
    setModalVisible(true);
  };
  
  // Handle form input changes
  const handleInputChange = (field: keyof VaccineFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Validate form
  const validateForm = () => {
    if (formData.name.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a vaccine name');
      return false;
    }
    
    if (formData.doses < 1) {
      Alert.alert('Validation Error', 'Number of doses must be at least 1');
      return false;
    }
    
    if (formData.interval_days < 0) {
      Alert.alert('Validation Error', 'Interval days cannot be negative');
      return false;
    }
    
    return true;
  };
  
  // Save vaccine (create or update)
  const saveVaccine = async () => {
    if (!validateForm()) return;
    
    setSavingVaccine(true);
    try {
      if (editingVaccine) {
        // Update existing vaccine
        await HealthRecordService.updateVaccine(editingVaccine.id, formData);
        Alert.alert('Success', 'Vaccine updated successfully');
      } else {
        // Create new vaccine
        await HealthRecordService.createVaccine(formData);
        Alert.alert('Success', 'Vaccine added successfully');
      }
      
      setModalVisible(false);
      fetchVaccines(1, searchQuery);
    } catch (error) {
      console.error('Error saving vaccine:', error);
      Alert.alert('Error', 'Failed to save vaccine. Please try again.');
    } finally {
      setSavingVaccine(false);
    }
  };
  
  // Delete vaccine
  const handleDelete = (vaccine: Vaccine) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${vaccine.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await HealthRecordService.deleteVaccine(vaccine.id);
              fetchVaccines(1, searchQuery);
              
              Alert.alert('Success', 'Vaccine deleted successfully');
            } catch (error) {
              console.error('Error deleting vaccine:', error);
              Alert.alert('Error', 'Failed to delete vaccine. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Render loading indicator
  if (loading && !refreshing && vaccines.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7367F0" />
        <Text style={styles.loadingText}>Loading vaccines...</Text>
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
          <Text style={styles.headerTitle}>Vaccines</Text>
          <Text style={styles.headerSubtitle}>
            {pagination.total} {pagination.total === 1 ? 'Vaccine' : 'Vaccines'}
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
            placeholder="Search vaccines..."
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
      
      {/* Vaccines list */}
      <FlatList
        data={vaccines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <VaccineCard
            vaccine={item}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.vaccinesList}
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
              <Ionicons name="medical-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'No vaccines found for your search' 
                  : 'No vaccines found. Add your first vaccine!'}
              </Text>
              <TouchableOpacity 
                style={styles.addEmptyButton}
                onPress={handleAddNew}
              >
                <Text style={styles.addEmptyText}>Add Vaccine</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
      
      {/* Add/Edit Vaccine Modal */}
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
                {editingVaccine ? 'Edit Vaccine' : 'Add Vaccine'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#3F4E6C" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Vaccine Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter vaccine name"
                />
              </View>
              
              {/* Doses */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Number of Doses *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.doses.toString()}
                  onChangeText={(value) => handleInputChange('doses', value)}
                  placeholder="Enter number of doses"
                  keyboardType="numeric"
                />
              </View>
              
              {/* Interval Days */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Days Between Doses</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.interval_days.toString()}
                  onChangeText={(value) => handleInputChange('interval_days', value)}
                  placeholder="Enter days between doses"
                  keyboardType="numeric"
                />
              </View>
              
              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholder="Enter description or important notes (optional)"
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
                disabled={savingVaccine}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={saveVaccine}
                disabled={savingVaccine}
              >
                {savingVaccine ? (
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
  vaccinesList: {
    padding: 16,
    paddingBottom: 80,
  },
  vaccineCard: {
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
  vaccineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
  },
  dosesBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dosesText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
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
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
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