import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/common';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import HealthRecordService, { HealthRecord } from '../../services/HealthRecordService';

// Define route parameter type
type RootStackParamList = {
  Home: undefined;
  HealthRecords: undefined;
  AddHealthRecord: undefined;
  EditHealthRecord: { recordId: number };
  HealthRecordDetail: { recordId: number };
  ManageVeterinarians: undefined;
  ManageVaccines: undefined;
};

export default function HealthRecordDetailScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'HealthRecordDetail'>>();
  const { recordId } = route.params;

  // State
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Fetch record data
  useEffect(() => {
    fetchRecord();
  }, [recordId]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const data = await HealthRecordService.getHealthRecord(recordId);
      setRecord(data);
    } catch (error) {
      console.error('Error fetching health record:', error);
      Alert.alert('Error', 'Failed to load health record details');
    } finally {
      setLoading(false);
    }
  };

  // Delete record
  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this health record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await HealthRecordService.deleteHealthRecord(recordId);
              Alert.alert('Success', 'Health record deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting health record:', error);
              Alert.alert('Error', 'Failed to delete health record');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Edit record
  const handleEdit = () => {
    navigation.navigate('EditHealthRecord', { recordId });
  };

  // View image in full screen
  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7367F0" />
        <Text style={styles.loadingText}>Loading health record...</Text>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Record not found</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonErrorText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3F4E6C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Record Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={22} color="#3F4E6C" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { 
            backgroundColor: 
              record.status === 'Healthy' ? '#34C759' : 
              record.status === 'Sick' ? '#FF3B30' : 
              '#FF9500' // Under Treatment
          }]}>
            <Text style={styles.statusText}>{record.status}</Text>
          </View>
          <Text style={styles.recordDate}>{record.date}</Text>
        </View>
        
        {/* Animal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animal Information</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Animal:</Text>
              <Text style={styles.infoValue}>{record.animal?.name || `Animal ID: ${record.animalId}`}</Text>
            </View>
            {record.animal?.breed && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Breed:</Text>
                <Text style={styles.infoValue}>{record.animal.breed}</Text>
              </View>
            )}
            {record.animal?.tag_id && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tag ID:</Text>
                <Text style={styles.infoValue}>{record.animal.tag_id}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Health Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Diagnosis:</Text>
              <Text style={styles.infoValue}>{record.diagnosis}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Treatment:</Text>
              <Text style={styles.infoValue}>{record.treatment}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Next Checkup:</Text>
              <Text style={styles.infoValue}>{record.next_checkup_date}</Text>
            </View>
            {record.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.infoLabel}>Notes:</Text>
                <Text style={styles.notesText}>{record.notes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Images */}
        {record.images && record.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images</Text>
            <View style={styles.imagesGrid}>
              {record.images.map((imageUrl, index) => (
                <TouchableOpacity 
                  key={`img-${index}`} 
                  style={styles.imageContainer}
                  onPress={() => handleImagePress(imageUrl)}
                >
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.image}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Veterinarian Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veterinarian</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValue}>{record.veterinarian_id}</Text>
            </View>
            {/* Additional veterinarian info could be shown here if available in the record */}
          </View>
        </View>

        {/* Created/Updated Timestamps */}
        <View style={styles.timestamps}>
          <Text style={styles.timestampText}>Created: {record.createdAt}</Text>
          <Text style={styles.timestampText}>Updated: {record.updatedAt}</Text>
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeModalButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close-circle" size={36} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3F4E6C',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordDate: {
    fontSize: 16,
    color: '#7A869A',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
    marginBottom: 12,
  },
  sectionContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 15,
    color: '#7A869A',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    color: '#3F4E6C',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 15,
    color: '#3F4E6C',
    marginTop: 4,
    lineHeight: 22,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  timestamps: {
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  timestampText: {
    fontSize: 12,
    color: '#7A869A',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#3F4E6C',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#3F4E6C',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButtonError: {
    backgroundColor: '#7367F0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonErrorText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
}); 