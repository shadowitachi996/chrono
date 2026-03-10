import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { usePedometer } from 'expo-sensors';

// Define Root Stack Navigator Types
type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Placeholder components for demonstration
const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Dashboard</Text>
    <TouchableOpacity style={styles.iconButton}>
      <Ionicons name="notifications-outline" size={24} color="#fff" />
    </TouchableOpacity>
  </View>
);

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <View style={[styles.card, { backgroundColor: color }]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Ionicons name={icon} size={20} color="#fff" />
    </View>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const RecentActivity = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Recent Activity</Text>
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: '#e3f2fd' }]}>
        <Ionicons name="cart" size={20} color="#2196f3" />
      </View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityText}>New Order #1234</Text>
        <Text style={styles.activitySubtext}>2 minutes ago</Text>
      </View>
      <Text style={styles.activityAmount}>+$120.00</Text>
    </View>
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: '#e8f5e9' }]}>
        <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
      </View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityText}>Payment Received</Text>
        <Text style={styles.activitySubtext}>1 hour ago</Text>
      </View>
      <Text style={styles.activityAmount}>+$450.00</Text>
    </View>
  </View>
);

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const handlePress = useCallback((screen: keyof RootStackParamList) => {
    onTabChange(screen);
    // Logic to navigate using the actual navigation prop
    if (screen !== activeTab) {
      navigation.navigate(screen);
    }
  }, [activeTab, navigation, onTabChange]);

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handlePress('Home')}
      >
        <Ionicons 
          name="home" 
          size={24} 
          color={activeTab === 'Home' ? '#2196f3' : '#9e9e9e'} 
        />
        <Text style={[styles.navText, { color: activeTab === 'Home' ? '#2196f3' : '#9e9e9e' }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handlePress('Search')}
      >
        <Ionicons 
          name="search" 
          size={24} 
          color={activeTab === 'Search' ? '#2196f3' : '#9e9e9e'} 
        />
        <Text style={[styles.navText, { color: activeTab === 'Search' ? '#2196f3' : '#9e9e9e' }]}>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handlePress('Profile')}
      >
        <Ionicons 
          name="person" 
          size={24} 
          color={activeTab === 'Profile' ? '#2196f3' : '#9e9e9e'} 
        />
        <Text style={[styles.navText, { color: activeTab === 'Profile' ? '#2196f3' : '#9e9e9e' }]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainScreen() {
  const [activeTab, setActiveTab] = useState('Home');
  const { steps, isAvailable, startPedometerAsync, stopPedometerAsync } = usePedometer();

  // Initialize Pedometer logic
  useEffect(() => {
    const initPedometer = async () => {
      if (isAvailable) {
        try {
          await startPedometerAsync({
            updateIntervalMs: 1000,
          });
        } catch (error) {
          console.error('Failed to start pedometer:', error);
        }
      }
    };

    initPedometer();

    return () => {
      stopPedometerAsync();
    };
  }, [isAvailable, startPedometerAsync, stopPedometerAsync]);

  // Update active tab based on navigation state
  const route = useRoute();
  useEffect(() => {
    if (route.name) {
      setActiveTab(route.name as string);
    }
  }, [route.name]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <Header />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <StatCard 
            title="Total Revenue" 
            value="$12,450" 
            icon="trending-up" 
            color="#2196f3" 
          />
          <StatCard 
            title="Active Users" 
            value="1,240" 
            icon="people" 
            color="#4caf50" 
          />
        </View>

        <RecentActivity />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.actionText}>Add New</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ff9800' }]}>
              <Ionicons name="analytics" size={24} color="#fff" />
              <Text style={styles.actionText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Debug View for Pedometer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pedometer Status</Text>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#e0f7fa' }]}>
              <Ionicons name="footsteps" size={20} color="#00bcd4" />
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityText}>Steps Count</Text>
              <Text style={styles.activitySubtext}>
                {isAvailable ? 'Active' : 'Not Available'}
              </Text>
            </View>
            <Text style={styles.activityAmount}>{steps}</Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  card: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  cardValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activitySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6200ea',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionText: {
    color: '#fff',
    marginTop: 8,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 20,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: '#9e9e9e',
  },
});