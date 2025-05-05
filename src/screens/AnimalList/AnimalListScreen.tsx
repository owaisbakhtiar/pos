import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native-safe-area-context';
import { Text } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Mock data for animal list
const mockAnimals = [
  {
    id: '1',
    tag_id: 'TAG001',
    breed: 'Holstein',
    animal_type: 'Cow',
    gender: 'female',
    health_status: 'Healthy',
    date_of_birth: '2020-01-01',
    shed_location_id: '1',
  },
  {
    id: '2',
    tag_id: 'TAG002',
    breed: 'Jersey',
    animal_type: 'Cow',
    gender: 'female',
    health_status: 'Healthy',
    date_of_birth: '2021-05-15',
    shed_location_id: '2',
  },
  {
    id: '3',
    tag_id: 'TAG003',
    breed: 'Angus',
    animal_type: 'Bull',
    gender: 'male',
    health_status: 'Under Treatment',
    date_of_birth: '2019-11-20',
    shed_location_id: '3',
  },
  {
    id: '4',
    tag_id: 'TAG004',
    breed: 'Hereford',
    animal_type: 'Cow',
    gender: 'female',
    health_status: 'Healthy',
    date_of_birth: '2022-03-10',
    shed_location_id: '1',
  },
  {
    id: '5',
    tag_id: 'TAG005',
    breed: 'Brahman',
    animal_type: 'Calf',
    gender: 'male',
    health_status: 'Healthy',
    date_of_birth: '2023-07-05',
    shed_location_id: '2',
  },
];

// Animal item component for the list
const AnimalItem = ({ animal, onPress }: { animal: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.animalItem} onPress={onPress}>
    <View style={styles.animalImageContainer}>
      <View style={styles.animalImagePlaceholder}>
        <Ionicons name="paw-outline" size={24} color="#7367F0" />
      </View>
    </View>
    <View style={styles.animalInfo}>
      <View style={styles.animalHeader}>
        <Text style={styles.animalTagId}>{animal.tag_id}</Text>
        <View style={[styles.statusBadge, 
            { backgroundColor: animal.health_status === 'Healthy' ? '#34C759' : 
                animal.health_status === 'Under Treatment' ? '#FF9500' : '#FF3B30' }]}>
          <Text style={styles.statusText}>{animal.health_status}</Text>
        </View>
      </View>
      <Text style={styles.animalBreed}>{animal.breed}</Text>
      <View style={styles.animalDetails}>
        <Text style={styles.animalDetail}>{animal.animal_type}</Text>
        <Text style={styles.animalDetail}>{animal.gender}</Text>
        <Text style={styles.animalDetail}>Shed: {animal.shed_location_id}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.moreButton}>
      <Ionicons name="ellipsis-vertical" size={20} color="#777" />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function AnimalListScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [animals, setAnimals] = useState(mockAnimals);
  const [filteredAnimals, setFilteredAnimals] = useState(mockAnimals);
  const [loading, setLoading] = useState(false);

  // Filter animals when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAnimals(animals);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = animals.filter(
        animal => 
          animal.tag_id.toLowerCase().includes(query) ||
          animal.breed.toLowerCase().includes(query) ||
          animal.animal_type.toLowerCase().includes(query)
      );
      setFilteredAnimals(filtered);
    }
  }, [searchQuery, animals]);

  // Handle new animal addition
  const addNewAnimal = (newAnimal: any) => {
    setAnimals(prevAnimals => [...prevAnimals, { id: Date.now().toString(), ...newAnimal }]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navbar}>
          <Text style={styles.navbarTitle}>Animal List</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('Register' as never)}
          >
            <Ionicons name="add-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search animals..."
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
        
        {loading ? (
          <ActivityIndicator size="large" color="#7367F0" style={styles.loader} />
        ) : (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>All Animals</Text>
              <Text style={styles.listCount}>{filteredAnimals.length} animals</Text>
            </View>
            
            <FlatList
              data={filteredAnimals}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <AnimalItem 
                  animal={item} 
                  onPress={() => console.log('View animal details', item.id)} 
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="paw" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyText}>No animals found</Text>
                  <Text style={styles.emptySubtext}>
                    {searchQuery ? 'Try a different search term' : 'Add animals to see them here'}
                  </Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3F4E6C',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  navbarTitle: {
    color: 'white',
    fontSize: 20,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 16,
    height: 48,
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listCount: {
    fontSize: 14,
    color: '#777',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  animalItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  animalImageContainer: {
    marginRight: 12,
  },
  animalImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0EFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animalInfo: {
    flex: 1,
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  animalTagId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  animalBreed: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  animalDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  animalDetail: {
    fontSize: 12,
    color: '#777',
    marginRight: 12,
  },
  moreButton: {
    padding: 4,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 