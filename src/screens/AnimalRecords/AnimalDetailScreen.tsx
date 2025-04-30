import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text, Button } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AnimalService, { Animal } from '../../services/AnimalService';

// Define the route params type
type AnimalDetailRouteProp = RouteProp<{
  AnimalDetail: {
    animalId: number;
  };
}, 'AnimalDetail'>;

export default function AnimalDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<AnimalDetailRouteProp>();
  const { animalId } = route.params;
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [milkRecords, setMilkRecords] = useState<any[]>([]);
  
  useEffect(() => {
    fetchAnimalDetails();
  }, [animalId]);
  
  const fetchAnimalDetails = async () => {
    setLoading(true);
    try {
      // Fetch animal data
      const animalData = await AnimalService.getAnimalById(animalId);
      setAnimal(animalData);
      
      // Fetch health records and milk production data in parallel
      const [healthData, milkData] = await Promise.all([
        AnimalService.getAnimalHealthRecords(animalId),
        animalData.animal_type === 'Cow' && animalData.gender === 'Female' 
          ? AnimalService.getMilkProductionData(animalId) 
          : Promise.resolve([])
      ]);
      
      setHealthRecords(healthData);
      setMilkRecords(milkData);
    } catch (error) {
      console.error('Error fetching animal details:', error);
      Alert.alert('Error', 'Failed to load animal details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnimalDetails();
  };
  
  const handleEdit = () => {
    if (animal) {
      navigation.navigate('EditAnimal' as never, { animalId: animal.id } as never);
    }
  };
  
  const handleDelete = () => {
    if (!animal) return;
    
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
              Alert.alert('Success', 'Animal deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting animal:', error);
              Alert.alert('Error', 'Failed to delete animal. Please try again.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7367F0" />
        <Text style={styles.loadingText}>Loading animal details...</Text>
      </View>
    );
  }
  
  if (!animal) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Animal not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.goBackButton}
          variant="primary"
        />
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
        <Text style={styles.headerTitle}>{animal.name}</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color="#3F4E6C" />
        </TouchableOpacity>
      </View>
      
      {/* Main content */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#7367F0']}
            tintColor="#7367F0"
          />
        }
      >
        {/* Animal Image */}
        <View style={styles.animalImageContainer}>
          {animal.image_path ? (
            <Image 
              source={{ uri: animal.image_path }} 
              style={styles.animalImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="paw" size={64} color="#7367F0" />
            </View>
          )}
        </View>
        
        {/* Status badges */}
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
          
          <View style={styles.genderBadge}>
            <Ionicons 
              name={animal.gender === 'Male' ? 'male' : 'female'} 
              size={14} 
              color="#FFFFFF" 
            />
            <Text style={styles.genderText}>{animal.gender}</Text>
          </View>
        </View>
        
        {/* Basic info card */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Basic Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tag ID:</Text>
            <Text style={styles.infoValue}>{animal.tag_id}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Breed:</Text>
            <Text style={styles.infoValue}>{animal.breed}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth:</Text>
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
        
        {/* Location info card */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Location</Text>
          </View>
          
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
        
        {/* Health records card */}
        {healthRecords.length > 0 && (
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Health Records</Text>
            </View>
            
            {healthRecords.map((record) => (
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
            
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>View All Health Records</Text>
              <Ionicons name="chevron-forward" size={16} color="#7367F0" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Milk production card */}
        {milkRecords.length > 0 && (
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Milk Production</Text>
            </View>
            
            {milkRecords.slice(0, 3).map((record, index) => (
              <View key={index} style={styles.milkRecord}>
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
                    <Text style={[styles.milkDataValue, styles.milkTotal]}>
                      {record.total} L
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            
            {milkRecords.length > 3 && (
              <TouchableOpacity style={styles.viewMoreButton}>
                <Text style={styles.viewMoreText}>View All Milk Records</Text>
                <Ionicons name="chevron-forward" size={16} color="#7367F0" />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Date info */}
        <View style={styles.dateInfoContainer}>
          <Text style={styles.dateInfoText}>
            Created: {new Date(animal.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.dateInfoText}>
            Last Updated: {new Date(animal.updated_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
      
      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Delete Animal"
          onPress={handleDelete}
          style={styles.deleteButton}
          variant="outline"
          textStyle={styles.deleteButtonText}
        />
        <Button
          title="Edit Animal"
          onPress={handleEdit}
          style={styles.editButtonLarge}
          variant="primary"
        />
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  animalImageContainer: {
    height: 250,
    width: '100%',
    backgroundColor: '#E9EDF5',
  },
  animalImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#7367F0',
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  genderBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#0A84FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3F4E6C',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: '#7A869A',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#3F4E6C',
    fontWeight: '500',
  },
  recordCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#7367F0',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 12,
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
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#7367F0',
    fontWeight: '500',
    marginRight: 4,
  },
  milkRecord: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
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
  dateInfoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  dateInfoText: {
    fontSize: 12,
    color: '#7A869A',
    marginBottom: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  deleteButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  editButtonLarge: {
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3F4E6C',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#3F4E6C',
    marginTop: 16,
    marginBottom: 32,
  },
  goBackButton: {
    width: 200,
  },
}); 