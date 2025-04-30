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
  Image,
} from 'react-native';
import { Text } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import HealthRecordService, { HealthRecord, PaginationData } from '../../services/HealthRecordService';
import AnimalService from '../../services/AnimalService';

// Define navigation type
type RootStackParamList = {
  Home: undefined;
  HealthRecords: undefined;
  AddHealthRecord: undefined;
  EditHealthRecord: { recordId: number };
  HealthRecordDetail: { recordId: number };
  ManageVeterinarians: undefined;
  ManageVaccines: undefined;
};

// Health Record card component
const HealthRecordCard = ({ 
  record, 
  onPress, 
  onEdit, 
  onDelete 
}: { 
  record: HealthRecord; 
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  // Check if record has images
  const hasImages = record.images && record.images.length > 0;
  
  return (
    <TouchableOpacity style={styles.recordCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.animalName}>{record.animal?.name || `Animal ID: ${record.animalId}`}</Text>
          <Text style={styles.recordDate}>{record.date}</Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: 
            record.status === 'Healthy' ? '#34C759' : 
            record.status === 'Sick' ? '#FF3B30' : 
            '#FF9500' // Under Treatment
        }]}>
          <Text style={styles.statusText}>{record.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        {/* Images preview if available */}
        {hasImages && record.images && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScrollView}
          >
            {record.images.map((imageUrl, index) => (
              <Image 
                key={`${record.id}-img-${index}`}
                source={{ uri: imageUrl }} 
                style={styles.recordImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Diagnosis:</Text>
            <Text style={styles.detailValue}>{record.diagnosis}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Treatment:</Text>
            <Text style={styles.detailValue}>{record.treatment}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Checkup:</Text>
            <Text style={styles.detailValue}>{record.next_checkup_date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>{record.notes}</Text>
          </View>
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
  { label: 'Healthy', value: 'Healthy' },
  { label: 'Sick', value: 'Sick' },
  { label: 'Under Treatment', value: 'Under Treatment' },
];

// Filter component
const FilterSection = ({ onFilter, activeFilter }: { onFilter: (filter: string) => void, activeFilter: string }) => {
  return (
    <View style={styles.filterWrapper}>
      <Text style={styles.filterSectionLabel}>Filter by Status:</Text>
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

// Main component
export default function HealthRecordsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1
  });
  
  // Fetch health records from API when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchHealthRecords();
      
      return () => {
        // Clean up if needed
      };
    }, [])
  );
  
  // Fetch health records from API
  const fetchHealthRecords = async (page: number = 1, filter: string = activeFilter, query: string = searchQuery) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await HealthRecordService.getHealthRecords(page, query);
      
      // Filter by status if needed
      let recordsData = response.records;
      if (filter) {
        recordsData = recordsData.filter(record => record.status === filter);
      }
      
      if (page === 1) {
        setRecords(recordsData);
        setFilteredRecords(recordsData);
      } else {
        setRecords(prevRecords => [...prevRecords, ...recordsData]);
        setFilteredRecords(prevRecords => [...prevRecords, ...recordsData]);
      }
      
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching health records:', error);
      Alert.alert('Error', 'Failed to load health records. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };
  
  // Load more records when reaching the end of the list
  const handleLoadMore = () => {
    if (
      !loadingMore && 
      pagination.current_page < pagination.total_pages
    ) {
      fetchHealthRecords(pagination.current_page + 1);
    }
  };
  
  // Filter records by status
  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === '') {
      // No filter - show all records
      setFilteredRecords(records);
    } else {
      // Apply filter
      const filtered = records.filter(record => record.status === filter);
      setFilteredRecords(filtered);
    }
  };
  
  // Search records
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      fetchHealthRecords(1, activeFilter, '');
    } else {
      // Debounce search - only search after typing stops for 500ms
      const timeoutId = setTimeout(() => {
        fetchHealthRecords(1, activeFilter, query);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };
  
  // Refresh records list (pull-to-refresh)
  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealthRecords(1, activeFilter, searchQuery);
  };
  
  // View record details
  const viewRecordDetails = (record: HealthRecord) => {
    navigation.navigate('HealthRecordDetail', { recordId: record.id });
  };
  
  // Navigate to edit record screen
  const editRecord = (record: HealthRecord) => {
    navigation.navigate('EditHealthRecord', { recordId: record.id });
  };
  
  // Delete record
  const deleteRecord = (record: HealthRecord) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this health record?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await HealthRecordService.deleteHealthRecord(record.id);
              fetchHealthRecords(1, activeFilter, searchQuery);
              
              Alert.alert('Success', 'Health record deleted successfully');
            } catch (error) {
              console.error('Error deleting health record:', error);
              Alert.alert('Error', 'Failed to delete health record. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Navigate to add record screen
  const addNewRecord = () => {
    navigation.navigate('AddHealthRecord');
  };
  
  // Render loading indicator
  if (loading && !refreshing && records.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7367F0" />
        <Text style={styles.loadingText}>Loading health records...</Text>
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
          <Text style={styles.headerTitle}>Health Records</Text>
          <Text style={styles.headerSubtitle}>
            {pagination.total} {pagination.total === 1 ? 'Record' : 'Records'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addNewRecord}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#7367F0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search health records..."
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
      
      {/* Records list */}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <HealthRecordCard
            record={item}
            onPress={() => viewRecordDetails(item)}
            onEdit={() => editRecord(item)}
            onDelete={() => deleteRecord(item)}
          />
        )}
        contentContainerStyle={styles.recordsList}
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
                  ? 'No health records found for your search' 
                  : activeFilter 
                    ? `No ${activeFilter.toLowerCase()} health records found` 
                    : 'No health records found. Add your first record!'}
              </Text>
              <TouchableOpacity 
                style={styles.addEmptyButton}
                onPress={addNewRecord}
              >
                <Text style={styles.addEmptyText}>Add Health Record</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
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
  recordsList: {
    padding: 16,
    paddingBottom: 80,
  },
  recordCard: {
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
  recordDate: {
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
  detailsContainer: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 90,
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
  backButton: {
    padding: 4,
  },
  imagesScrollView: {
    marginBottom: 12,
  },
  recordImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
}); 