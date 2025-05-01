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
} from "react-native";
import { Text, Button } from "../../components/common";
import { colors } from "../../theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation, NavigationProp } from "@react-navigation/native";
import VaccinationService, { Vaccination, VaccinationFormData, PaginationData } from "../../services/VaccinationService";
import AnimalService, { Animal } from "../../services/AnimalService";
import HealthRecordService, { Vaccine } from "../../services/HealthRecordService";
import { Picker } from "@react-native-picker/picker";

// Define navigation type
type RootStackParamList = {
  Home: undefined;
  Vaccination: undefined;
  ManageVaccines: undefined;
};

// Form data interface
interface VaccinationForm {
  animal_id: number;
  vaccine_id: number;
  date_given: Date;
  next_due_date: Date;
  administered_by: string;
  batch_number: string;
  notes: string;
}

interface VaccinationRecord {
  id: string;
  animal_id: number;
  vaccine_id: number;
  date_given: string;
  next_due_date: string;
  administered_by: string;
  batch_number: string;
  notes: string;
}

// Dropdown component for form selects
const Dropdown = ({ 
  label, 
  value, 
  options, 
  onSelect 
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  onSelect: (value: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.formSection}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.dropdownTrigger} 
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.dropdownValue}>{value || `Select ${label}`}</Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#777" 
        />
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const VaccinationItem = ({ item, onPress, onEdit, onDelete }: { 
  item: Vaccination; 
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <TouchableOpacity style={styles.recordItem} onPress={onPress}>
      <View style={styles.recordHeader}>
        <View style={styles.vaccineInfo}>
          <Text style={styles.vaccineName}>{item.animal?.name || `Animal #${item.animal_id}`}</Text>
          <Text style={styles.vaccineType}>{item.vaccine?.name || `Vaccine #${item.vaccine_id}`}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{item.date_given}</Text>
          <Text style={styles.nextDueLabel}>Next Due: {item.next_due_date}</Text>
        </View>
      </View>
      
      <View style={styles.recordDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Administered by:</Text>
          <Text style={styles.detailValue}>{item.administered_by}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Batch Number:</Text>
          <Text style={styles.detailValue}>{item.batch_number}</Text>
        </View>
        
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
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

export default function VaccinationScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // State for vaccination records
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
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
  
  // State for form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<VaccinationForm>({
    animal_id: 0,
    vaccine_id: 0,
    date_given: new Date(),
    next_due_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    administered_by: "",
    batch_number: "",
    notes: ""
  });
  
  // State for picker components
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNextDueDatePicker, setShowNextDueDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<'date_given' | 'next_due_date'>('date_given');
  
  // State for dropdown options
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [savingVaccination, setSavingVaccination] = useState(false);
  
  // Fetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchVaccinations();
      fetchAnimals();
      fetchVaccines();
      
      return () => {
        // Cleanup if needed
      };
    }, [])
  );
  
  // Fetch vaccinations from API
  const fetchVaccinations = async (page: number = 1) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await VaccinationService.getVaccinations(page);
      
      if (page === 1) {
        setVaccinations(response.vaccinations);
      } else {
        setVaccinations(prev => [...prev, ...response.vaccinations]);
      }
      
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      Alert.alert('Error', 'Failed to load vaccination records. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };
  
  // Fetch animals
  const fetchAnimals = async () => {
    try {
      const response = await AnimalService.getAnimals(1, '', '');
      setAnimals(response.animals);
    } catch (error) {
      console.error('Error fetching animals:', error);
      Alert.alert('Error', 'Failed to load animals. Please try again.');
    }
  };
  
  // Fetch vaccines
  const fetchVaccines = async () => {
    try {
      const response = await HealthRecordService.getVaccines(1, '');
      setVaccines(response.vaccines);
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      Alert.alert('Error', 'Failed to load vaccines. Please try again.');
    }
  };
  
  // Format date for API
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Handle form input changes
  const updateForm = (field: keyof VaccinationForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle date picker changes
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    setShowNextDueDatePicker(false);
    
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [currentDateField]: selectedDate
      }));
    }
  };
  
  // Show date picker for a specific field
  const showDatePickerModal = (field: 'date_given' | 'next_due_date') => {
    setCurrentDateField(field);
    if (field === 'date_given') {
      setShowDatePicker(true);
    } else {
      setShowNextDueDatePicker(true);
    }
  };
  
  // Pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchVaccinations(1);
  };
  
  // Load more data when reaching end of list
  const handleLoadMore = () => {
    if (!loadingMore && pagination.current_page < pagination.total_pages) {
      fetchVaccinations(pagination.current_page + 1);
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    if (formData.animal_id === 0) {
      Alert.alert('Validation Error', 'Please select an animal');
      return false;
    }
    
    if (formData.vaccine_id === 0) {
      Alert.alert('Validation Error', 'Please select a vaccine');
      return false;
    }
    
    if (formData.administered_by.trim() === '') {
      Alert.alert('Validation Error', 'Please enter who administered the vaccine');
      return false;
    }
    
    if (formData.batch_number.trim() === '') {
      Alert.alert('Validation Error', 'Please enter the batch number');
      return false;
    }
    
    return true;
  };
  
  // Submit vaccination record
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSavingVaccination(true);
    try {
      // Prepare data for API
      const vaccinationData: VaccinationFormData = {
        animal_id: formData.animal_id,
        vaccine_id: formData.vaccine_id,
        date_given: formatDate(formData.date_given),
        next_due_date: formatDate(formData.next_due_date),
        administered_by: formData.administered_by,
        batch_number: formData.batch_number,
        notes: formData.notes
      };
      
      await VaccinationService.createVaccination(vaccinationData);
      Alert.alert('Success', 'Vaccination record created successfully');
      
      // Reset form and refresh list
      setShowAddForm(false);
      fetchVaccinations(1);
      
      // Reset form data
      setFormData({
        animal_id: 0,
        vaccine_id: 0,
        date_given: new Date(),
        next_due_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        administered_by: "",
        batch_number: "",
        notes: ""
      });
    } catch (error) {
      console.error('Error saving vaccination record:', error);
      Alert.alert('Error', 'Failed to save vaccination record. Please try again.');
    } finally {
      setSavingVaccination(false);
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
  if (loading && !refreshing && vaccinations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vaccination records...</Text>
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
          <Text style={styles.headerTitle}>Vaccinations</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.manageButton} 
            onPress={() => navigation.navigate('ManageVaccines')}
          >
            <Text style={styles.manageButtonText}>Manage Vaccines</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Vaccinations List */}
      <FlatList
        data={vaccinations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <VaccinationItem
            item={item}
            onPress={() => {
              // View details functionality
              console.log('View vaccination details:', item.id);
            }}
            onEdit={() => {
              // Edit functionality
              console.log('Edit vaccination:', item.id);
              // Here you would navigate to edit screen or show edit modal
            }}
            onDelete={() => {
              // Delete functionality
              Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete this vaccination record?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        setLoading(true);
                        await VaccinationService.deleteVaccination(item.id);
                        fetchVaccinations(1);
                        Alert.alert('Success', 'Vaccination record deleted successfully');
                      } catch (error) {
                        console.error('Error deleting vaccination:', error);
                        Alert.alert('Error', 'Failed to delete vaccination. Please try again.');
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
        contentContainerStyle={vaccinations.length === 0 ? styles.emptyListContainer : styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="medical" size={64} color="#7A869A" />
              <Text style={styles.emptyStateText}>No vaccination records found</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setShowAddForm(true)}
              >
                <Text style={styles.emptyStateButtonText}>Add Vaccination Record</Text>
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
      
      {/* Add Vaccination Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddForm(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Vaccination Record</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Animal Selection */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Animal *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.animal_id}
                    onValueChange={(value) => updateForm('animal_id', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select an animal" value={0} color="#999" />
                    {animals.map((animal) => (
                      <Picker.Item
                        key={animal.id}
                        label={`${animal.name} (${animal.tag_id || 'No Tag'})`}
                        value={animal.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              
              {/* Vaccine Selection */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Vaccine *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.vaccine_id}
                    onValueChange={(value) => updateForm('vaccine_id', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a vaccine" value={0} color="#999" />
                    {vaccines.map((vaccine) => (
                      <Picker.Item
                        key={vaccine.id}
                        label={`${vaccine.name} (${vaccine.doses} doses, ${vaccine.intervalDays} days interval)`}
                        value={vaccine.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              
              {/* Date Given */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Date Given *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => showDatePickerModal('date_given')}
                >
                  <Text style={styles.dateText}>{formatDate(formData.date_given)}</Text>
                  <Ionicons name="calendar" size={22} color={colors.primary} />
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.date_given}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              {/* Next Due Date */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Next Due Date *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => showDatePickerModal('next_due_date')}
                >
                  <Text style={styles.dateText}>{formatDate(formData.next_due_date)}</Text>
                  <Ionicons name="calendar" size={22} color={colors.primary} />
                </TouchableOpacity>
                
                {showNextDueDatePicker && (
                  <DateTimePicker
                    value={formData.next_due_date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              {/* Administered By */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Administered By *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.administered_by}
                  onChangeText={(text) => updateForm('administered_by', text)}
                  placeholder="Name of veterinarian"
                />
              </View>
              
              {/* Batch Number */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Batch Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.batch_number}
                  onChangeText={(text) => updateForm('batch_number', text)}
                  placeholder="Vaccine batch number"
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
                disabled={savingVaccination}
              >
                {savingVaccination ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Vaccination Record</Text>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  manageButton: {
    backgroundColor: "#7367F0",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  manageButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
  vaccineInfo: {
    flex: 2,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3F4E6C",
  },
  vaccineType: {
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
  addButton: {
    backgroundColor: "#7367F0",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EDF5",
    borderRadius: 8,
    padding: 12,
  },
  dropdownValue: {
    fontSize: 16,
    color: "#3F4E6C",
  },
  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EDF5",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#3F4E6C",
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
});
