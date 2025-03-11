import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { API_CONFIG } from '../../constants/API_CONFIG';
// Component for individual notification
const NotificationItem = ({ notification, onViewDetails }) => {
  // Get time since notification (e.g., "8 min", "2 h")
  const getTimeSince = () => {
    const now = new Date();
    const timestamp = notification.timestamp ? new Date(notification.timestamp) : now;
    const diffMs = now - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 60) {
      return `${diffMin} min`;
    } else {
      const diffHours = Math.floor(diffMin / 60);
      return `${diffHours} h`;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.notificationItem} 
      onPress={() => onViewDetails(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationDot} />
        <View style={styles.notificationTextContainer}>
          <Text style={styles.notificationMessage} numberOfLines={2}>{notification.message}</Text>
          <Text style={styles.notificationTime}>{getTimeSince()}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <AntDesign name="right" size={20} color="#888" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function PageNotif() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);




  const navigation = useNavigation(); 

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  // The userId should come from your authentication system
  const userId = 321; // Example user ID - replace with actual user ID from your auth system
  
  useEffect(() => {
    let isMounted = true;
    let intervalId;
    
    const fetchNotifications = async () => {
      try {
        if (!isMounted) return;
        
        const response = await fetch(`${API_CONFIG.BASE_URL}notification/consume`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        
        if (isMounted) {
          // Add some sample notifications for development if none exist
          if (data.length === 0) {
            const sampleNotifications = [
              {
                message: "URGENT: Adèle et Camille recherche un Commis de cuisine H/F le 04/03, Dispo ? Postule ici 👉",
                timestamp: new Date(Date.now() - 8 * 60000).toISOString() // 8 minutes ago
              },
              {
                message: "5 missions chez E.Leclerc Vitry-sur-Seine à Vitry-sur-Seine à partir du 05/03",
                timestamp: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
              },
              {
                message: "4 missions chez E.Leclerc Vitry-sur-Seine à Vitry-sur-Seine à partir du 05/03",
                timestamp: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
              },
              {
                message: "URGENT: Les Ripeurs recherche un Manutentionnaire le 04/03, Dispo ? Postule ici 👉",
                timestamp: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
              },
              {
                message: "Un nouveau job pour toi ! De nouvelles missions sont disponibles !",
                timestamp: new Date(Date.now() - 3 * 3600000).toISOString() // 3 hours ago
              }
            ];
            setNotifications(sampleNotifications);
          } else {
            setNotifications(data);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching notifications', err);
        if (isMounted) {
          // Add sample notifications for development even if there's an error
          const sampleNotifications = [
            {
              message: "URGENT: Adèle et Camille recherche un Commis de cuisine H/F le 04/03, Dispo ? Postule ici 👉",
              timestamp: new Date(Date.now() - 8 * 60000).toISOString() // 8 minutes ago
            },
            {
              message: "5 missions chez E.Leclerc Vitry-sur-Seine à Vitry-sur-Seine à partir du 05/03",
              timestamp: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
            }
          ];
          setNotifications(sampleNotifications);
          setLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchNotifications();
    
    // Set up polling interval (every 30 seconds)
    intervalId = setInterval(fetchNotifications, 30000);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Function to send a test notification (for testing purposes)
  const sendTestNotification = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}notification/produce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "URGENT: Nouveau poste disponible à E.Leclerc ! Postule ici 👉",
          userId: userId
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to send test notification');
      } else {
        // After sending, refresh notifications immediately
        fetchLatestNotifications();
      }
    } catch (err) {
      console.error('Error sending test notification', err);
    }
  };
  
  // Function to manually refresh notifications
  const fetchLatestNotifications = async () => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}notification/consume`, {
            method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      
      // If no notifications from API, use sample data
      if (data.length === 0) {
        const sampleNotifications = [
          {
            message: "URGENT: Adèle et Camille recherche un Commis de cuisine H/F le 04/03, Dispo ? Postule ici 👉",
            timestamp: new Date(Date.now() - 8 * 60000).toISOString() // 8 minutes ago
          },
          {
            message: "5 missions chez E.Leclerc Vitry-sur-Seine à Vitry-sur-Seine à partir du 05/03",
            timestamp: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
          }
        ];
        setNotifications(sampleNotifications);
      } else {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };
  
  // Function to navigate to notification details
  const handleViewDetails = (notification) => {
    console.log("View details for:", notification);
    
    // Extract job information from notification message
    let title = "Emploi";
    let location = "E.Leclerc Vitry-sur-Seine";
    
    // Try to extract job title from notification message
    if (notification.message.includes("Commis de cuisine")) {
      title = "Commis de cuisine H/F";
    } else if (notification.message.includes("Manutentionnaire")) {
      title = "Manutentionnaire H/F";
    } else if (notification.message.includes("missions chez E.Leclerc")) {
      title = "Employé libre-service H/F";
    }
    
    // Navigate to details page with notification data
    router.push({
      pathname: "/notification-details",
      params: { 
        id: notification.id || new Date().getTime().toString(),
        title: title,
        message: notification.message,
        location: location,
        // Transport info
        transportPublic: true,
        transportPmr: true,
        transportBike: true,
        transportCar: true
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push("./PageNotifComponent")}
          >
            <AntDesign name="left" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Notifications</Text>
          
          <TouchableOpacity style={styles.settingsButton}>
            <AntDesign name="setting" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification List */}
      <ScrollView style={styles.notificationList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#192031" />
            <Text style={styles.loadingText}>Chargement des notifications...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune notification pour le moment</Text>
          </View>
        ) : (
          notifications.map((notification, index) => (
            <NotificationItem 
              key={index} 
              notification={notification} 
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </ScrollView>
      
      {/* For development purposes - test buttons */}
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
          <Text style={styles.testButtonText}>Envoyer notification test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.testButton} onPress={fetchLatestNotifications}>
          <Text style={styles.testButtonText}>Rafraîchir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 100,
    backgroundColor: '#192031',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  settingsButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  notificationList: {
    flex: 1,
    marginTop: 0,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BBB',
    marginTop: 6,
    marginRight: 8,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 14,
    color: '#888',
  },
  arrowContainer: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  testButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  testButton: {
    backgroundColor: '#192031',
    padding: 10,
    borderRadius: 5,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
  }
});