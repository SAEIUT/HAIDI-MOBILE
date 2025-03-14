import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BarreTrajet from "./BarreTrajet";
import BarreVoyage from "./BarreVoyages";
import QRCodeTrajet from "./QRCodeTrajet";
import { API_CONFIG } from "../../constants/API_CONFIG";
import { useNavigation } from "@react-navigation/native";
import QRCodeBagage from "./QRCodeBagage";
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

const getStatusColor = (status) => {
  switch (status) {
    case 0: return "#FFAB40"; // En attente
    case 1: return "#4CAF50"; // En cours
    case 2: return "#2196F3"; // Terminé
    default: return "#9E9E9E"; // Inconnu
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 0: return "En attente";
    case 1: return "En cours";
    case 2: return "Terminé";
    default: return "Inconnu";
  }
};

const getTransportIcon = (bd) => {
  switch (bd) {
    case "SNCF": return <FontAwesome5 name="train" size={16} color="#1A535C" />;
    case "RATP": return <FontAwesome5 name="bus" size={16} color="#4ECDC4" />;
    case "TAXI": return <FontAwesome5 name="taxi" size={16} color="#FF6B6B" />;
    case "AF": return <FontAwesome5 name="plane" size={16} color="#FFE66D" />;
    default: return <MaterialIcons name="directions" size={16} color="#9E9E9E" />;
  }
};

export default function Tickets() {
  const [idTrajet, setID] = useState(null);
  const [isSousTrajet, setQRCode] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userUid, setUserUid] = useState(null);
  const [bagage, setBagage] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    const getUserUid = async () => {
      try {
        const storedUid = await AsyncStorage.getItem("userUid");
        if (storedUid) {
          setUserUid(storedUid);
        } else {
          navigation.replace("/Login");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'UID :", error);
      }
    };
    getUserUid();
  }, []);

  useEffect(() => {
    if (userUid) {
      retrieveTrajet();
    }
  }, [userUid]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [isLoading]);

  const retrieveTrajet = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/reservation/bygoogleid/${userUid}`
      );
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.log("Erreur :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const qrBagage = (id) => {
    setBagage(bagage === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const time = new Date(timeString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(time);
  };

  const qrData = (id, idTrajet) => {
    const dataQR = JSON.stringify({
      trajet: data
        .find((item) => item["idDossier"] === id)
        .sousTrajets.find((item) => item.numDossier === idTrajet).numDossier,
      bagage: data.find((item) => item["idDossier"] === id).bagage,
    });
    return dataQR;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#12B3A8" />
          <Text style={styles.loadingText}>Chargement de vos trajets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.emptyState, {opacity: fadeAnim}]}>
          <MaterialIcons name="directions-off" size={80} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>Aucun trajet</Text>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore réservé de trajet. Planifiez votre prochain voyage dès maintenant.
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.emptyButtonText}>Rechercher un trajet</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.containerNoTop}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={{opacity: fadeAnim, flex: 1}}>
        <View style={styles.headerCompact}>
          <Text style={styles.headerTitle}>Mes trajets</Text>
          <Text style={styles.headerSubtitle}>{data.length} trajet{data.length > 1 ? 's' : ''} réservé{data.length > 1 ? 's' : ''}</Text>
        </View>
        
        <FlatList
          contentContainerStyle={styles.listContainerTop}
          data={data}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setID(idTrajet === item["idDossier"] ? null : item["idDossier"])}
              style={styles.cardWrapper}
            >
              <View style={[
                styles.card,
                idTrajet === item["idDossier"] && styles.cardExpanded
              ]}>
                {/* En-tête de la carte */}
                <View style={styles.cardHeader}>
                  <View style={styles.idContainer}>
                    <Text style={styles.idLabel}>Trajet n°</Text>
                    <Text style={styles.idValue}>{item["idDossier"]}</Text>
                  </View>
                  
                  <View style={styles.dateContainer}>
                    <MaterialIcons name="event" size={16} color="#777" style={styles.dateIcon} />
                    <Text style={styles.dateText}>
                      {formatDate(item.sousTrajets[0].departureTime)}
                    </Text>
                  </View>
                </View>
                
                {/* Route simplifiée */}
                <View style={styles.routeOverview}>
                  <View style={styles.locationColumn}>
                    <Text style={styles.locationText} numberOfLines={1}>
                      {item.sousTrajets[0].departure}
                    </Text>
                    <Text style={styles.locationText} numberOfLines={1}>
                      {item.sousTrajets[item.sousTrajets.length-1].arrival}
                    </Text>
                  </View>
                  
                  <View style={styles.statusColumn}>
                    <BarreVoyage
                      ordre={item.sousTrajets.map((st) => st.statusValue)}
                    />
                  </View>
                </View>
                
                {/* Bouton d'expansion */}
                <View style={styles.expandButtonContainer}>
                  <MaterialIcons 
                    name={idTrajet === item["idDossier"] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color="#888"
                  />
                </View>
                
                {/* Section détaillée */}
                {idTrajet === item["idDossier"] && (
                  <View style={styles.detailsContainer}>
                    <View style={styles.sectionDivider} />
                    
                    {/* Liste des sous-trajets */}
                    {item.sousTrajets.map((sousTrajet, index) => (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setQRCode(
                          isSousTrajet === sousTrajet.numDossier ? null : sousTrajet.numDossier
                        )}
                        key={index}
                      >
                        <View style={styles.sousTrajetCard}>
                          {/* Transport icon */}
                          <View style={styles.transportIcon}>
                            {getTransportIcon(sousTrajet.BD)}
                          </View>
                          
                          {/* Segment info */}
                          <View style={styles.segmentInfo}>
                            <View style={styles.segmentLocations}>
                              <View style={styles.locationWithTime}>
                                <Text style={styles.segmentLocationText}>{sousTrajet.departure}</Text>
                                <Text style={styles.segmentTime}>
                                  {formatTime(sousTrajet.departureTime)}
                                </Text>
                              </View>
                              
                              <MaterialIcons name="arrow-forward" size={16} color="#CCC" />
                              
                              <View style={styles.locationWithTime}>
                                <Text style={styles.segmentLocationText}>{sousTrajet.arrival}</Text>
                                <Text style={styles.segmentTime}>
                                  {formatTime(sousTrajet.arrivalTime)}
                                </Text>
                              </View>
                            </View>
                            
                            <View style={styles.segmentDates}>
                              <Text style={styles.segmentDate}>
                                {formatDate(sousTrajet.departureTime)}
                              </Text>
                              
                              <View style={[
                                styles.statusBadge, 
                                {backgroundColor: getStatusColor(sousTrajet.statusValue)}
                              ]}>
                                <Text style={styles.statusText}>
                                  {getStatusLabel(sousTrajet.statusValue)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                        
                        {/* QR Code pour ce segment */}
                        {isSousTrajet === sousTrajet.numDossier && (
                          <View style={styles.qrCodeContainer}>
                            <View style={styles.qrCodeWrapper}>
                              <Text style={styles.qrCodeTitle}>Scannez ce QR Code pour accéder à votre trajet</Text>
                              <QRCodeTrajet id={qrData(idTrajet, isSousTrajet)} />
                              <Text style={styles.qrCodeHelp}>
                                Présentez ce code à l'embarquement
                              </Text>
                            </View>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                    
                    {/* Section bagages */}
                    <View style={styles.baggageSection}>
                      <TouchableOpacity
                        style={styles.baggageButton}
                        onPress={() => qrBagage(item["idDossier"])}
                      >
                        <FontAwesome5 name="suitcase" size={16} color="#333" style={styles.baggageIcon} />
                        <Text style={styles.baggageButtonText}>
                          {bagage === item["idDossier"] ? "Masquer les codes bagages" : "Afficher les codes bagages"}
                        </Text>
                        <MaterialIcons 
                          name={bagage === item["idDossier"] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                          size={20} 
                          color="#666"
                        />
                      </TouchableOpacity>
                      
                      {bagage === item["idDossier"] && (
                        <View style={styles.baggageQrContainer}>
                          <QRCodeBagage bagageListe={item.bagage["bagagesList"]} />
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingContent: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#666666",
    fontWeight: "500",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  // Nouveau container sans padding en haut
  containerNoTop: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 0, // Suppression du padding en haut
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  // Header plus compact
  headerCompact: {
    paddingHorizontal: 16,
    paddingVertical: 8, // Réduit la hauteur du header
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#777777",
  },
  listContainer: {
    padding: 12,
  },
  // Liste de trajets positionnée tout en haut
  listContainerTop: {
    padding: 12,
    paddingTop: 6, // Réduit l'espace en haut de la liste
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  cardExpanded: {
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  idContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  idLabel: {
    fontSize: 13,
    color: "#888888",
    marginRight: 4,
  },
  idValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333333",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "500",
  },
  routeOverview: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 12,
  },
  locationColumn: {
    flex: 1,
    justifyContent: "space-between",
    height: 50,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  statusColumn: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButtonContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  detailsContainer: {
    marginTop: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },
  sousTrajetCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  transportIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  segmentInfo: {
    flex: 1,
  },
  segmentLocations: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  locationWithTime: {
    flex: 1,
  },
  segmentLocationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  segmentTime: {
    fontSize: 12,
    color: "#666666",
  },
  segmentDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  segmentDate: {
    fontSize: 12,
    color: "#888888",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  qrCodeContainer: {
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  qrCodeWrapper: {
    alignItems: "center",
    width: '100%',
  },
  qrCodeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
    textAlign: "center",
  },
  qrCodeHelp: {
    fontSize: 12,
    color: "#666666",
    marginTop: 12,
    textAlign: "center",
  },
  baggageSection: {
    marginTop: 8,
  },
  baggageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 12,
  },
  baggageIcon: {
    marginRight: 8,
  },
  baggageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginRight: 8,
  },
  baggageQrContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#12B3A8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});