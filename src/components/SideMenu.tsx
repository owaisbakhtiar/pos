import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './common';
import { colors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  userName: string;
}

export default function SideMenu({ isVisible, onClose, userName }: SideMenuProps) {
  const [slideAnim] = React.useState(new Animated.Value(-300));
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const navigation = useNavigation();
  const { logout, user } = useAuth();

  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  // Use actual user name from auth context if available
  const displayName = user?.name || userName;
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const menuItems = [
    { title: 'Dashboard', icon: 'home-outline', screen: 'Home' },
    { title: 'Farm Management', icon: 'business-outline', screen: 'Home' },
    { title: 'Animal Records', icon: 'paw-outline', screen: 'AnimalRecords' },
    { title: 'Feed Management', icon: 'leaf-outline', screen: 'Feed' },
    { title: 'Breeding', icon: 'heart-outline', screen: 'Home' },
    { title: 'Health Records', icon: 'medkit-outline', screen: 'Vaccination' },
    { title: 'Milk Records', icon: 'water-outline', screen: 'Milk' },
    { title: 'Financial Records', icon: 'cash-outline', screen: 'Home' },
    { title: 'Reports', icon: 'bar-chart-outline', screen: 'Home' },
    { title: 'Profile', icon: 'person-outline', screen: 'Profile' },
    { title: 'Settings', icon: 'settings-outline', screen: 'Settings' },
    { title: 'Help & Support', icon: 'help-circle-outline', screen: 'Home' },
  ];

  const handleMenuItemPress = (screenName: string) => {
    onClose();
    navigation.navigate(screenName as never);
  };

  const handleLogout = () => {
    onClose();
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by AuthContext
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(displayName)}
                </Text>
              </View>
              <View style={styles.userTextContainer}>
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.userRole}>{user?.roles?.[0]?.name || 'User'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuItemsContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.screen)}
              >
                <Ionicons name={item.icon as any} size={22} color="#3F4E6C" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  menuContainer: {
    width: 280,
    backgroundColor: colors.background,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    padding: 20,
    backgroundColor: '#3F4E6C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userTextContainer: {
    marginLeft: 15,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userRole: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  closeButton: {
    padding: 8,
  },
  menuItemsContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
}); 