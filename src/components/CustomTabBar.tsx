import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { FloatingActionButton } from './common';
import { useNavigation } from '@react-navigation/native';

interface TabBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

export default function CustomTabBar({ activeTab, onTabPress }: TabBarProps) {
  const navigation = useNavigation();
  
  const handleAddPress = () => {
    navigation.navigate('Register' as never);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => onTabPress('Home')}
        >
          <Ionicons 
            name="home-outline" 
            size={24} 
            color={activeTab === 'Home' ? colors.primary : '#9E9E9E'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => onTabPress('Feed')}
        >
          <Ionicons 
            name="nutrition-outline" 
            size={24} 
            color={activeTab === 'Feed' ? colors.primary : '#9E9E9E'} 
          />
        </TouchableOpacity>
        
        <View style={styles.fabContainer}>
          <FloatingActionButton 
            onPress={handleAddPress} 
          />
        </View>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => onTabPress('Vaccination')}
        >
          <Ionicons 
            name="medkit-outline" 
            size={24} 
            color={activeTab === 'Vaccination' ? colors.primary : '#9E9E9E'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => onTabPress('Milk')}
        >
          <Ionicons 
            name="help-circle-outline" 
            size={24} 
            color={activeTab === 'Milk' ? colors.primary : '#9E9E9E'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }
}); 