import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Text, Button } from "../../components/common";
import { colors } from "../../theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';

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

interface VaccinationFormData {
  animal_id: string;
  vaccine_id: string;
  date_given: Date;
  next_due_date: Date;
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

const VaccinationItem = ({ item, onPress }: { item: VaccinationRecord; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.recordItem} onPress={onPress}>
      <View style={styles.recordHeader}>
        <View style={styles.vaccineInfo}>
          <Text style={styles.vaccineName}>Animal ID: {item.animal_id}</Text>
          <Text style={styles.vaccineType}>Vaccine ID: {item.vaccine_id}</Text>
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
    </TouchableOpacity>
  );
};

export default function VaccinationScreen() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([
    {
      id: "1",
      animal_id: 1,
      vaccine_id: 1,
      date_given: "2023-01-01",
      next_due_date: "2023-04-01",
      administered_by: "Dr. John Smith",
      batch_number: "BT2023001",
      notes: "Animal showed no adverse reactions"
    },
    {
      id: "2",
      animal_id: 2,
      vaccine_id: 3,
      date_given: "2023-02-15",
      next_due_date: "2023-08-15",
      administered_by: "Dr. Sarah Johnson",
      batch_number: "BT2023045",
      notes: "Mild swelling at injection site for 24hrs"
    }
  ]);
  
  const [formData, setFormData] = useState<VaccinationFormData>({
    animal_id: "",
    vaccine_id: "",
    date_given: new Date(),
    next_due_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    administered_by: "",
    batch_number: "",
    notes: ""
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNextDueDatePicker, setShowNextDueDatePicker] = useState(false);
  
  // Mock data for dropdowns
  const animalOptions = ["1 - Holstein (TAG001)", "2 - Jersey (TAG002)", "3 - Angus (TAG003)"];
  const vaccineOptions = ["1 - FMD Vaccine", "2 - Brucellosis Vaccine", "3 - BQ Vaccine", "4 - Anthrax Vaccine"];
  
  const updateForm = (field: keyof VaccinationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = () => {
    // Basic validation
    if (!formData.animal_id || !formData.vaccine_id || !formData.administered_by || !formData.batch_number) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    
    // Create new vaccination record
    const newVaccination: VaccinationRecord = {
      id: Date.now().toString(),
      animal_id: parseInt(formData.animal_id.split(' ')[0]),
      vaccine_id: parseInt(formData.vaccine_id.split(' ')[0]),
      date_given: formatDate(formData.date_given),
      next_due_date: formatDate(formData.next_due_date),
      administered_by: formData.administered_by,
      batch_number: formData.batch_number,
      notes: formData.notes
    };
    
    // Add to vaccinations list
    setVaccinations(prev => [newVaccination, ...prev]);
    
    // Close form and reset
    setShowAddForm(false);
    setFormData({
      animal_id: "",
      vaccine_id: "",
      date_given: new Date(),
      next_due_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      administered_by: "",
      batch_number: "",
      notes: ""
    });
    
    Alert.alert("Success", "Vaccination record added successfully");
  };
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.date_given;
    setShowDatePicker(Platform.OS === 'ios');
    updateForm('date_given', currentDate);
    
    // Also update the next due date to be 3 months later by default
    const nextDueDate = new Date(currentDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 3);
    updateForm('next_due_date', nextDueDate);
  };
  
  const handleNextDueDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.next_due_date;
    setShowNextDueDatePicker(Platform.OS === 'ios');
    updateForm('next_due_date', currentDate);
  };
  
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };
  
  const showNextDueDatePickerModal = () => {
    setShowNextDueDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>Vaccination Records</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={vaccinations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <VaccinationItem 
            item={item} 
            onPress={() => console.log('View vaccination details', item.id)} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medkit-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No vaccination records found</Text>
            <Text style={styles.emptySubtext}>
              Add vaccination records to track animal health
            </Text>
          </View>
        }
      />
      
      {/* Add Vaccination Form Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <View style={styles.modalNavbar}>
              <TouchableOpacity 
                onPress={() => setShowAddForm(false)}
                style={styles.backButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.navbarTitle}>Add Vaccination</Text>
              <View style={{ width: 40 }} />
            </View>
            
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              <Dropdown
                label="Animal*"
                value={formData.animal_id}
                options={animalOptions}
                onSelect={(value) => updateForm('animal_id', value)}
              />
              
              <Dropdown
                label="Vaccine*"
                value={formData.vaccine_id}
                options={vaccineOptions}
                onSelect={(value) => updateForm('vaccine_id', value)}
              />
              
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Date Given*</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={showDatePickerModal}
                >
                  <Text>{formatDate(formData.date_given)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#777" />
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={formData.date_given}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Next Due Date*</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={showNextDueDatePickerModal}
                >
                  <Text>{formatDate(formData.next_due_date)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#777" />
                </TouchableOpacity>
                
                {showNextDueDatePicker && (
                  <DateTimePicker
                    testID="nextDueDatePicker"
                    value={formData.next_due_date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleNextDueDateChange}
                  />
                )}
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Administered By*</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.administered_by}
                  onChangeText={(text) => updateForm('administered_by', text)}
                  placeholder="e.g. Dr. John Smith"
                />
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Batch Number*</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.batch_number}
                  onChangeText={(text) => updateForm('batch_number', text)}
                  placeholder="e.g. BT2023001"
                />
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => updateForm('notes', text)}
                  placeholder="Enter any additional notes..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.formSection}>
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Save Vaccination Record</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3F4E6C',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  modalNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3F4E6C',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  navbarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  recordItem: {
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vaccineType: {
    fontSize: 14,
    color: '#666',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  nextDueLabel: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 4,
  },
  recordDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
    color: '#777',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  formSection: {
    marginBottom: 16,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  dropdownTrigger: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  dropdownValue: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
    zIndex: 10,
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 30,
    height: 56,
    backgroundColor: '#7468F0',
    shadowColor: "#7468F0",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});
