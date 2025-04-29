import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Text, Button } from "../../components/common";
import { colors } from "../../theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface FeedCalculationData {
  animalType: "Dairy Cow" | "Heifer" | "Calf";
  weight: string;
  milkProduction: string;
  pregnancyStage: "Not Pregnant" | "Early" | "Mid" | "Late";
  age: string;
}

interface FeedResult {
  dryMatter: number;
  protein: number;
  energy: number;
  feedComponents: {
    [key: string]: number;
  };
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

export default function FeedCalculatorScreen() {
  const [formData, setFormData] = useState<FeedCalculationData>({
    animalType: "Dairy Cow",
    weight: "",
    milkProduction: "",
    pregnancyStage: "Not Pregnant",
    age: "",
  });

  const [result, setResult] = useState<FeedResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const animalTypes = ["Dairy Cow", "Heifer", "Calf"];
  const pregnancyStages = ["Not Pregnant", "Early", "Mid", "Late"];

  const updateForm = (field: keyof FeedCalculationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateFeed = () => {
    // Validate form
    if (!formData.weight) {
      Alert.alert("Error", "Animal weight is required");
      return;
    }

    if (formData.animalType === "Dairy Cow" && !formData.milkProduction) {
      Alert.alert("Error", "Milk production is required for dairy cows");
      return;
    }

    const weight = parseFloat(formData.weight);
    const milkProduction = parseFloat(formData.milkProduction || "0");

    // Basic feed calculation formulas (simplified)
    let dryMatter = 0;
    let protein = 0;
    let energy = 0;
    const feedComponents: {[key: string]: number} = {};

    // Calculate based on animal type
    if (formData.animalType === "Dairy Cow") {
      // Basic formula: 2-3% of body weight + production needs
      dryMatter = (weight * 0.03) + (milkProduction * 0.3);
      protein = dryMatter * 0.16; // 16% protein for dairy cows
      energy = dryMatter * 10; // 10 MJ/kg of dry matter
      
      // Feed components
      feedComponents["Grass Silage"] = dryMatter * 0.4;
      feedComponents["Hay"] = dryMatter * 0.1;
      feedComponents["Concentrate"] = dryMatter * 0.3;
      feedComponents["Maize Silage"] = dryMatter * 0.2;
    } else if (formData.animalType === "Heifer") {
      // Heifers need about 2-2.2% of body weight
      dryMatter = weight * 0.022;
      protein = dryMatter * 0.12; // 12% protein
      energy = dryMatter * 9; // 9 MJ/kg

      feedComponents["Grass Silage"] = dryMatter * 0.5;
      feedComponents["Hay"] = dryMatter * 0.3;
      feedComponents["Concentrate"] = dryMatter * 0.2;
    } else {
      // Calves
      dryMatter = weight * 0.03;
      protein = dryMatter * 0.18; // 18% protein
      energy = dryMatter * 12; // 12 MJ/kg

      feedComponents["Milk/Milk Replacer"] = dryMatter * 0.6;
      feedComponents["Calf Starter"] = dryMatter * 0.3;
      feedComponents["Hay"] = dryMatter * 0.1;
    }

    // Adjust for pregnancy stage
    if (formData.pregnancyStage === "Late") {
      dryMatter *= 1.15; // 15% increase for late pregnancy
      protein *= 1.2; // 20% increase in protein
    } else if (formData.pregnancyStage === "Mid") {
      dryMatter *= 1.1; // 10% increase
      protein *= 1.1;
    }

    // Set results
    setResult({
      dryMatter: parseFloat(dryMatter.toFixed(2)),
      protein: parseFloat(protein.toFixed(2)),
      energy: parseFloat(energy.toFixed(2)),
      feedComponents: Object.fromEntries(
        Object.entries(feedComponents).map(([key, value]) => [key, parseFloat(value.toFixed(2))])
      )
    });

    setShowResults(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <View style={styles.backButton} />
        <Text style={styles.navbarTitle}>Feed Calculator</Text>
        <View style={styles.backButton} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>Animal Details</Text>
          
          <Dropdown
            label="Animal Type"
            value={formData.animalType}
            options={animalTypes}
            onSelect={(value) => updateForm('animalType', value as any)}
          />
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Weight (kg)*</Text>
            <TextInput
              style={styles.textInput}
              value={formData.weight}
              onChangeText={(text) => updateForm('weight', text)}
              keyboardType="numeric"
              placeholder="e.g. 500"
            />
          </View>
          
          {formData.animalType === "Dairy Cow" && (
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Milk Production (liters/day)*</Text>
              <TextInput
                style={styles.textInput}
                value={formData.milkProduction}
                onChangeText={(text) => updateForm('milkProduction', text)}
                keyboardType="numeric"
                placeholder="e.g. 25"
              />
            </View>
          )}
          
          <Dropdown
            label="Pregnancy Stage"
            value={formData.pregnancyStage}
            options={pregnancyStages}
            onSelect={(value) => updateForm('pregnancyStage', value as any)}
          />
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Age (months, optional)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.age}
              onChangeText={(text) => updateForm('age', text)}
              keyboardType="numeric"
              placeholder="e.g. 36"
            />
          </View>
          
          <View style={styles.formSection}>
            <TouchableOpacity 
              style={styles.calculateButton}
              onPress={calculateFeed}
            >
              <Text style={styles.calculateButtonText}>Calculate Feed Requirements</Text>
            </TouchableOpacity>
          </View>
          
          {showResults && result && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Feed Requirements</Text>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Dry Matter:</Text>
                <Text style={styles.resultValue}>{result.dryMatter} kg/day</Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Protein Requirement:</Text>
                <Text style={styles.resultValue}>{result.protein} kg/day</Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Energy Requirement:</Text>
                <Text style={styles.resultValue}>{result.energy} MJ/day</Text>
              </View>
              
              <Text style={styles.componentsTitle}>Recommended Feed Components</Text>
              
              {Object.entries(result.feedComponents).map(([feed, amount], index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultLabel}>{feed}:</Text>
                  <Text style={styles.resultValue}>{amount} kg/day</Text>
                </View>
              ))}
              
              <View style={styles.noteContainer}>
                <Ionicons name="information-circle-outline" size={20} color="#777" />
                <Text style={styles.noteText}>This is a basic estimation. Actual requirements may vary based on environmental conditions, breed, and individual animal needs.</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
  },
  navbarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
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
  calculateButton: {
    marginTop: 20,
    marginBottom: 20,
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
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 24,
    backgroundColor: '#F8F9FB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#3F4E6C',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultLabel: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
  componentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#3F4E6C',
  },
  noteContainer: {
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(124, 156, 255, 0.1)',
    padding: 10,
    borderRadius: 6,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
});
