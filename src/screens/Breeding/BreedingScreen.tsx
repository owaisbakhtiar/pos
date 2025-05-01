import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextStyle,
} from "react-native";
import { Text, Button } from "../../components/common";
import { colors } from "../../theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation, NavigationProp } from "@react-navigation/native";
import BreedingService, { BreedingRecord, BreedingFormData, PaginationData } from "../../services/BreedingService";
import AnimalService, { Animal } from "../../services/AnimalService";
import { Picker } from "@react-native-picker/picker";

// Define navigation type
type RootStackParamList = {
  Home: undefined;
  Breeding: undefined;
};

// Form data interface
interface BreedingForm {
  female_id: number;
  male_id: number;
  breeding_date: Date;
  expected_delivery_date: Date;
  breeding_method: 'AI' | 'natural';
  status: 'pending' | 'confirmed' | 'successful' | 'unsuccessful';
  pregnancy_check_date: Date | null;
  actual_delivery_date: Date | null;
  offspring_count: number | null;
  notes: string;
}

// Breeding record item component
const BreedingRecordItem = ({ item, onPress, onEdit, onDelete }: { 
  item: BreedingRecord; 
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <TouchableOpacity style={styles.recordItem} onPress={onPress}>
    <View style={styles.recordHeader}>
      <View style={styles.breedingInfo}>
        <Text style={styles.animalName}>
          {item.femaleAnimal?.name || `Female #${item.female_id}`}
        </Text>
        <Text style={styles.animalPair}>
          ✕ {item.maleAnimal?.name || `Male #${item.male_id}`}
        </Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{item.breeding_date || 'No date'}</Text>
        <Text style={styles.nextDueLabel}>Due: {item.expected_delivery_date || 'Not set'}</Text>
      </View>
    </View>
    
    <View style={styles.recordDetails}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Method:</Text>
        <Text style={styles.detailValue}>{item.breeding_method || 'Not specified'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status:</Text>
        <Text 
          style={{
            ...styles.statusText,
            ...(item.status === 'successful' ? styles.successStatus :
              item.status === 'confirmed' ? styles.confirmedStatus :
              item.status === 'unsuccessful' ? styles.unsuccessfulStatus :
              styles.pendingStatus)
          }}
        >
          {item.status || 'pending'}
        </Text>
      </View>
      
      {item.pregnancy_check_date && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pregnancy Check:</Text>
          <Text style={styles.detailValue}>{item.pregnancy_check_date}</Text>
        </View>
      )}
      
      {item.actual_delivery_date && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Actual Delivery:</Text>
          <Text style={styles.detailValue}>{item.actual_delivery_date}</Text>
        </View>
      )}
      
      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
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
  </TouchableOpacity>
);

export default function BreedingScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // State for breeding records
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1
  });
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BreedingRecord | null>(null);
  const [formData, setFormData] = useState<BreedingForm>({
    female_id: 0,
    male_id: 0,
    breeding_date: new Date(),
    expected_delivery_date: new Date(new Date().setDate(new Date().getDate() + 280)), // ~9 months
    breeding_method: 'AI',
    status: 'pending',
    pregnancy_check_date: null,
    actual_delivery_date: null,
    offspring_count: null,
    notes: ''
  });
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExpectedDatePicker, setShowExpectedDatePicker] = useState(false);
  const [showPregnancyCheckDatePicker, setShowPregnancyCheckDatePicker] = useState(false);
  const [showActualDeliveryDatePicker, setShowActualDeliveryDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<'breeding_date' | 'expected_delivery_date' | 'pregnancy_check_date' | 'actual_delivery_date'>('breeding_date');
  
  // Processing state
  const [savingBreeding, setSavingBreeding] = useState(false);
  
  // Fetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchBreedingRecords();
      fetchAnimals();
      
      return () => {
        // Cleanup if needed
      };
    }, [])
  );
  
  // Animals state
  const [femaleAnimals, setFemaleAnimals] = useState<Animal[]>([]);
  const [maleAnimals, setMaleAnimals] = useState<Animal[]>([]);
  
  // Add error state and handling
  const [error, setError] = useState<string | null>(null);
  
  // Fetch animals
  const fetchAnimals = async () => {
    try {
      const response = await AnimalService.getAnimals(1, '', '');
      
      // Ensure we have an array of animals
      const safeAnimals = response.animals || [];
      
      // Use optional chaining and nullish coalescing for safer filtering
      const females = safeAnimals.filter(animal => animal?.gender === 'female') || [];
      const males = safeAnimals.filter(animal => animal?.gender === 'male') || [];
      
      setFemaleAnimals(females);
      setMaleAnimals(males);
    } catch (error) {
      console.error('Error fetching animals:', error);
      Alert.alert('Error', 'Failed to load animals. Please try again.');
    }
  };
  
  // Fetch breeding records from API
  const fetchBreedingRecords = async (page: number = 1) => {
    if (page === 1) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await BreedingService.getBreedingRecords(page);
      
      // Ensure we have an array of records (handle potential undefined/null)
      const safeRecords = response.records || [];
      const safePagination = response.pagination || {
        total: 0,
        count: 0,
        per_page: 10,
        current_page: 1,
        total_pages: 1
      };
      
      if (page === 1) {
        setBreedingRecords(safeRecords);
      } else {
        setBreedingRecords(prev => [...prev, ...safeRecords]);
      }
      
      setPagination(safePagination);
    } catch (error) {
      console.error('Error fetching breeding records:', error);
      setError('Failed to load breeding records. Please try again.');
      Alert.alert('Error', 'Failed to load breeding records. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };
  
  // Format date for display in form
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  // Handle date picker changes
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    setShowExpectedDatePicker(false);
    setShowPregnancyCheckDatePicker(false);
    setShowActualDeliveryDatePicker(false);
    
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [currentDateField]: selectedDate
      }));
    }
  };
  
  // Show date picker for a specific field
  const showDatePickerModal = (field: 'breeding_date' | 'expected_delivery_date' | 'pregnancy_check_date' | 'actual_delivery_date') => {
    setCurrentDateField(field);
    if (field === 'breeding_date') {
      setShowDatePicker(true);
    } else if (field === 'expected_delivery_date') {
      setShowExpectedDatePicker(true);
    } else if (field === 'pregnancy_check_date') {
      setShowPregnancyCheckDatePicker(true);
    } else if (field === 'actual_delivery_date') {
      setShowActualDeliveryDatePicker(true);
    }
  };
  
  // Update form field
  const updateForm = (field: keyof BreedingForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Prepare record for editing
  const prepareEditRecord = (record: BreedingRecord) => {
    setEditingRecord(record);
    
    setFormData({
      female_id: record.female_id,
      male_id: record.male_id,
      breeding_date: new Date(record.breeding_date),
      expected_delivery_date: new Date(record.expected_delivery_date),
      breeding_method: record.breeding_method,
      status: record.status,
      pregnancy_check_date: record.pregnancy_check_date ? new Date(record.pregnancy_check_date) : null,
      actual_delivery_date: record.actual_delivery_date ? new Date(record.actual_delivery_date) : null,
      offspring_count: record.offspring_count,
      notes: record.notes || ''
    });
    
    setShowAddForm(true);
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      female_id: 0,
      male_id: 0,
      breeding_date: new Date(),
      expected_delivery_date: new Date(new Date().setDate(new Date().getDate() + 280)),
      breeding_method: 'AI',
      status: 'pending',
      pregnancy_check_date: null,
      actual_delivery_date: null,
      offspring_count: null,
      notes: ''
    });
    setEditingRecord(null);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (formData.female_id === 0) {
      Alert.alert('Error', 'Please select a female animal');
      return;
    }
    
    if (formData.male_id === 0) {
      Alert.alert('Error', 'Please select a male animal');
      return;
    }
    
    setSavingBreeding(true);
    
    try {
      // Prepare data for API
      const breedingData: BreedingFormData = {
        female_id: formData.female_id,
        male_id: formData.male_id,
        breeding_date: formatDate(formData.breeding_date),
        expected_delivery_date: formatDate(formData.expected_delivery_date),
        breeding_method: formData.breeding_method,
        status: formData.status,
        notes: formData.notes
      };
      
      if (formData.pregnancy_check_date) {
        breedingData.pregnancy_check_date = formatDate(formData.pregnancy_check_date);
      }
      
      if (formData.actual_delivery_date) {
        breedingData.actual_delivery_date = formatDate(formData.actual_delivery_date);
      }
      
      if (formData.offspring_count !== null) {
        breedingData.offspring_count = formData.offspring_count;
      }
      
      if (editingRecord) {
        // Update existing record
        await BreedingService.updateBreedingRecord(editingRecord.id, breedingData);
        Alert.alert('Success', 'Breeding record updated successfully');
      } else {
        // Create new record
        await BreedingService.createBreedingRecord(breedingData);
        Alert.alert('Success', 'Breeding record created successfully');
      }
      
      // Reset form and refresh list
      setShowAddForm(false);
      resetForm();
      fetchBreedingRecords(1);
    } catch (error) {
      console.error('Error saving breeding record:', error);
      Alert.alert('Error', 'Failed to save breeding record. Please try again.');
    } finally {
      setSavingBreeding(false);
    }
  };
  
  // Pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBreedingRecords(1);
  };
  
  // Load more data when reaching end of list
  const handleLoadMore = () => {
    if (!loadingMore && pagination.current_page < pagination.total_pages) {
      fetchBreedingRecords(pagination.current_page + 1);
    }
  };
  
  // Render footer (loading indicator for pagination)
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  // Show loading indicator while fetching initial data
  if (loading && !refreshing && breedingRecords.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading breeding records...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#3F4E6C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Breeding Records</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowAddForm(true);
          }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Breeding Records List */}
      <FlatList
        data={breedingRecords}
        keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
        renderItem={({ item }) => (
          <BreedingRecordItem
            item={item}
            onPress={() => {
              // View details functionality
              console.log('View breeding details:', item.id);
            }}
            onEdit={() => {
              // Edit functionality
              prepareEditRecord(item);
            }}
            onDelete={() => {
              // Delete functionality
              Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete this breeding record?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        setLoading(true);
                        await BreedingService.deleteBreedingRecord(item.id);
                        fetchBreedingRecords(1);
                        Alert.alert('Success', 'Breeding record deleted successfully');
                      } catch (error) {
                        console.error('Error deleting breeding record:', error);
                        Alert.alert('Error', 'Failed to delete breeding record. Please try again.');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }
                ]
              );
            }}
          />
        )}
        contentContainerStyle={breedingRecords.length === 0 ? styles.emptyListContainer : styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color="#7A869A" />
              <Text style={styles.emptyStateText}>
                {error ? error : "No breeding records found"}
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
              >
                <Text style={styles.emptyStateButtonText}>Add Breeding Record</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
      
      {/* Add/Edit Breeding Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddForm(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRecord ? 'Edit Breeding Record' : 'Add Breeding Record'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Female Animal Selection */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Female Animal *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.female_id}
                    onValueChange={(value) => updateForm('female_id', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select female animal" value={0} color="#999" />
                    {femaleAnimals.map((animal) => (
                      <Picker.Item
                        key={animal.id}
                        label={`${animal.name} (${animal.tag_id || 'No Tag'})`}
                        value={animal.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              
              {/* Male Animal Selection */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Male Animal *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.male_id}
                    onValueChange={(value) => updateForm('male_id', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select male animal" value={0} color="#999" />
                    {maleAnimals.map((animal) => (
                      <Picker.Item
                        key={animal.id}
                        label={`${animal.name} (${animal.tag_id || 'No Tag'})`}
                        value={animal.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              
              {/* Breeding Method */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Breeding Method *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.breeding_method}
                    onValueChange={(value) => updateForm('breeding_method', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="AI (Artificial Insemination)" value="AI" />
                    <Picker.Item label="Natural" value="natural" />
                  </Picker>
                </View>
              </View>
              
              {/* Breeding Date */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Breeding Date *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => showDatePickerModal('breeding_date')}
                >
                  <Text style={styles.dateText}>
                    {formatDate(formData.breeding_date)}
                  </Text>
                  <Ionicons name="calendar" size={22} color={colors.primary} />
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.breeding_date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              {/* Expected Delivery Date */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Expected Delivery Date *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => showDatePickerModal('expected_delivery_date')}
                >
                  <Text style={styles.dateText}>
                    {formatDate(formData.expected_delivery_date)}
                  </Text>
                  <Ionicons name="calendar" size={22} color={colors.primary} />
                </TouchableOpacity>
                
                {showExpectedDatePicker && (
                  <DateTimePicker
                    value={formData.expected_delivery_date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              {/* Status */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Status *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.status}
                    onValueChange={(value) => updateForm('status', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Pending" value="pending" />
                    <Picker.Item label="Confirmed" value="confirmed" />
                    <Picker.Item label="Successful" value="successful" />
                    <Picker.Item label="Unsuccessful" value="unsuccessful" />
                  </Picker>
                </View>
              </View>
              
              {/* Pregnancy Check Date (optional) */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Pregnancy Check Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => showDatePickerModal('pregnancy_check_date')}
                >
                  <Text style={styles.dateText}>
                    {formData.pregnancy_check_date ? formatDate(formData.pregnancy_check_date) : 'Not set'}
                  </Text>
                  <Ionicons name="calendar" size={22} color={colors.primary} />
                </TouchableOpacity>
                
                {showPregnancyCheckDatePicker && (
                  <DateTimePicker
                    value={formData.pregnancy_check_date || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              {/* Actual Delivery Date (optional) */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Actual Delivery Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => showDatePickerModal('actual_delivery_date')}
                >
                  <Text style={styles.dateText}>
                    {formData.actual_delivery_date ? formatDate(formData.actual_delivery_date) : 'Not set'}
                  </Text>
                  <Ionicons name="calendar" size={22} color={colors.primary} />
                </TouchableOpacity>
                
                {showActualDeliveryDatePicker && (
                  <DateTimePicker
                    value={formData.actual_delivery_date || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              {/* Offspring Count */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Offspring Count</Text>
                <TextInput
                  style={styles.input}
                  value={formData.offspring_count?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text.trim() === '' ? null : parseInt(text, 10);
                    updateForm('offspring_count', isNaN(value as number) ? null : value);
                  }}
                  placeholder="Number of offspring"
                  keyboardType="numeric"
                />
              </View>
              
              {/* Notes */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => updateForm('notes', text)}
                  placeholder="Additional observations or notes"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={savingBreeding}
              >
                {savingBreeding ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingRecord ? 'Update Breeding Record' : 'Save Breeding Record'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    elevation: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3F4E6C",
  },
  addButton: {
    backgroundColor: "#7367F0",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  recordItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  breedingInfo: {
    flex: 2,
  },
  animalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3F4E6C",
  },
  animalPair: {
    fontSize: 14,
    color: "#7A869A",
    marginTop: 2,
  },
  dateContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 14,
    color: "#7A869A",
  },
  nextDueLabel: {
    fontSize: 12,
    color: "#7367F0",
    marginTop: 2,
  },
  recordDetails: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#7A869A",
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: "#3F4E6C",
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  pendingStatus: {
    backgroundColor: '#FFF8E8',
    color: '#E9A100',
  },
  confirmedStatus: {
    backgroundColor: '#E8F5FE',
    color: '#0A84FF',
  },
  successStatus: {
    backgroundColor: '#E8FFF3',
    color: '#34C759',
  },
  unsuccessfulStatus: {
    backgroundColor: '#FFF1F0',
    color: '#FF3B30',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    color: "#7A869A",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#3F4E6C",
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#3F4E6C',
  },
  footerLoader: {
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    color: "#7A869A",
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
  },
  loadingText: {
    marginTop: 12,
    color: "#3F4E6C",
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#7A869A",
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: "#7367F0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3F4E6C",
  },
  modalBody: {
    padding: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3F4E6C",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EDF5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#3F4E6C",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EDF5",
    borderRadius: 8,
    padding: 12,
  },
  submitButton: {
    backgroundColor: "#7367F0",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 16,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EDF5",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
}); 