import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "../../components/common";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import SideMenu from "../../components/SideMenu";
import StatsCard from "../../components/home/StatsCard";
import FertilityStatus from "../../components/home/FertilityStatus";
import { styles } from "./styles";

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

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
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
