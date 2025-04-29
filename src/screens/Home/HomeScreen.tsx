import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text as RNText } from "react-native";
import { Text } from "../../components/common";
import { colors } from "../../theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import SideMenu from "../../components/SideMenu";

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  bgColor, 
  icon 
}: { 
  title: string; 
  value: string; 
  bgColor: string;
  icon: React.ReactNode;
}) => (
  <View style={[styles.statsCard, { backgroundColor: bgColor }]}>
    <View style={styles.statsTextContainer}>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
    <View style={styles.iconCircle}>
      {icon}
    </View>
  </View>
);

// Fertility Status Component
const FertilityStatus = ({ 
  label, 
  count 
}: { 
  label: string; 
  count: number;
}) => (
  <View style={styles.fertilityStatusContainer}>
    <View style={styles.countCircle}>
      <Text style={styles.countText}>{count}</Text>
    </View>
    <Text style={styles.statusLabel}>{label}</Text>
  </View>
);

export default function HomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const userName = "Dorothy K. Townsend";
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Welcome Back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatar} />
          </TouchableOpacity> */}
        </View>
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatsCard 
            title="Total Animals" 
            value="15" 
            bgColor="#FF6B6B"
            icon={<Ionicons name="paw-outline" size={28} color="white" />}
          />
          <StatsCard 
            title="Milking Cows" 
            value="08" 
            bgColor="#00BBA9"
            icon={<Ionicons name="water-outline" size={28} color="white" />}
          />
          <StatsCard 
            title="Dry Cows" 
            value="02" 
            bgColor="#F8A44C"
            icon={<Ionicons name="sunny-outline" size={28} color="white" />}
          />
          <StatsCard 
            title="Kgs Av.Milk/Cow" 
            value="20.00" 
            bgColor="#422666"
            icon={<Ionicons name="flask-outline" size={28} color="white" />}
          />
        </View>
        
        <View style={styles.fertilityContainer}>
          <Text style={styles.fertilityTitle}>Fertility Summary</Text>
          
          <View style={styles.fertilityStatusGrid}>
            <FertilityStatus label="Open Cows" count={3} />
            <FertilityStatus label="Pregnant" count={3} />
            <FertilityStatus label="Non Pregnant" count={5} />
            <FertilityStatus label="Dry" count={1} />
            <FertilityStatus label="Barren" count={0} />
            <FertilityStatus label="Anoestrus" count={2} />
          </View>
        </View>
      </ScrollView>
      
    
      
      <SideMenu 
        isVisible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
        userName={userName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3F4E6C",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeTextContainer: {
    marginLeft: 15,
  },
  welcomeText: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  userName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    marginRight: 15,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#ccc",
  },
  avatar: {
    width: "100%",
    height: "100%",
    backgroundColor: "#8a8a8a",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statsCard: {
    width: "48%",
    height: 110,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTextContainer: {
    justifyContent: "center",
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  statsTitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  fertilityContainer: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fertilityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  fertilityStatusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  fertilityStatusContainer: {
    width: "33%",
    alignItems: "center",
    marginBottom: 20,
  },
  countCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#3F4E6C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  countText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  statusLabel: {
    fontSize: 13,
    textAlign: "center",
    color: "#333",
  },
  floatingAddButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CA9EB",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
