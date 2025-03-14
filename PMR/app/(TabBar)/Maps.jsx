import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TransportService from '../services/TransportService';
import ReservationModal from '../../components/Reservation/ReservationModal';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

const MapComponent = () => {
  const mapRef = useRef(null);
  const scrollViewRef = useRef(null);
  const { departure, arrival, departureCoords, arrivalCoords } = useLocalSearchParams();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoutesList, setShowRoutesList] = useState(true);
  const [stations, setStations] = useState([]);
  const [airports, setAirports] = useState([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedRouteForReservation, setSelectedRouteForReservation] = useState(null);
  
  // Animation pour la rotation de la flèche
  const rotateAnim = useRef(new Animated.Value(1)).current;
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg']
  });

  // Maps de transport mode vers couleurs et icônes
  const transportModes = {
    'TAXI': { color: '#FF6B6B', icon: 'car', label: 'Taxi' },
    'RATP': { color: '#4ECDC4', icon: 'bus', label: 'Bus' },
    'SNCF': { color: '#1A535C', icon: 'train', label: 'Train' },
    'AF': { color: '#FFE66D', icon: 'airplane', label: 'Avion' }
  };

  const getSegmentColor = (mode) => {
    return transportModes[mode]?.color || '#666666';
  };

  const getTransportIcon = (mode) => {
    const iconName = transportModes[mode]?.icon || 'navigate';
    return `${iconName}-outline`;
  };

  const convertGeoJSONtoCoordinates = (geometry) => {
    if (!geometry || !geometry.coordinates) return [];
    return geometry.coordinates.map(coord => ({
      latitude: coord[1],
      longitude: coord[0]
    }));
  };

  const getMidPoint = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return null;
    const midIndex = Math.floor(coordinates.length / 2);
    return coordinates[midIndex];
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h${mins < 10 ? '0' : ''}${mins}` : `${mins} min`;
  };

  const formatPrice = (price) => {
    return Math.round(price).toLocaleString('fr-FR');
  };

  const handleReservation = (route) => {
    setSelectedRouteForReservation(route);
    setShowReservationModal(true);
  };

  const handleConfirmReservation = async (formData) => {
    try {
      setShowReservationModal(false);
      router.push('/Trajets');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const fitMapToRoute = (route) => {
    if (!mapRef.current || !route) return;

    const allCoordinates = route.segments.flatMap(segment =>
      convertGeoJSONtoCoordinates(segment.geometry)
    );

    if (allCoordinates.length > 0) {
      mapRef.current.fitToCoordinates(allCoordinates, {
        edgePadding: { top: 100, right: 50, bottom: 250, left: 50 },
        animated: true
      });
    }
  };

  const selectRoute = (route, index) => {
    setSelectedRoute(route);
    fitMapToRoute(route);
    
    // Scroll to the selected route card
    if (scrollViewRef.current && routes.length > 0) {
      scrollViewRef.current.scrollTo({ x: index * CARD_WIDTH, animated: true });
    }
  };

  // Fonction pour basculer l'affichage des itinéraires
  const toggleRoutesList = () => {
    const newState = !showRoutesList;
    setShowRoutesList(newState);
    
    // Animation de la flèche
    Animated.timing(rotateAnim, {
      toValue: newState ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    // Ajustement de la carte si nécessaire
    if (selectedRoute) {
      setTimeout(() => {
        fitMapToRoute(selectedRoute);
      }, 300);
    }
  };

  const initializeData = async () => {
    if (!departureCoords || !arrivalCoords) {
      console.warn('Coordonnées manquantes');
      return;
    }

    try {
      setLoading(true);
      const startCoords = JSON.parse(departureCoords);
      const endCoords = JSON.parse(arrivalCoords);

      const departurePoint = {
        coords: startCoords,
        name: departure,
        type: 'address'
      };

      const arrivalPoint = {
        coords: endCoords,
        name: arrival,
        type: 'address'
      };

      const [nearbyStations, nearbyAirports] = await Promise.all([
        TransportService.findNearestStation(startCoords),
        TransportService.findNearestAirport(startCoords)
      ]);

      setStations([nearbyStations].filter(Boolean));
      setAirports([nearbyAirports].filter(Boolean));

      const multimodalRoutes = await TransportService.generateMultimodalRoutes(
        departurePoint,
        arrivalPoint
      );

      setRoutes(multimodalRoutes);

      if (multimodalRoutes.length > 0) {
        setSelectedRoute(multimodalRoutes[0]);
        fitMapToRoute(multimodalRoutes[0]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      Alert.alert('Erreur', 'Impossible de charger les itinéraires. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const showSegmentDetails = (segment) => {
    Alert.alert(
      'Détails du trajet',
      `${transportModes[segment.mode]?.label || 'Transport'}\n` +
      `De: ${segment.from.name}\n` +
      `À: ${segment.to.name}\n` +
      `Durée: ${formatDuration(segment.duration)}\n` +
      `Distance: ${Math.round(segment.distance / 1000)} km`,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  };

  useEffect(() => {
    initializeData();
  }, [departureCoords, arrivalCoords]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.container}>
        {/* Map View */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Point de départ */}
          {departureCoords && (
            <Marker
              coordinate={{
                latitude: JSON.parse(departureCoords)[1],
                longitude: JSON.parse(departureCoords)[0]
              }}
              title="Départ"
              description={departure}
              pinColor="#4285F4"
            />
          )}

          {/* Point d'arrivée */}
          {arrivalCoords && (
            <Marker
              coordinate={{
                latitude: JSON.parse(arrivalCoords)[1],
                longitude: JSON.parse(arrivalCoords)[0]
              }}
              title="Arrivée"
              description={arrival}
              pinColor="#EA4335"
            />
          )}

          {/* Segments de route */}
          {selectedRoute && selectedRoute.segments.map((segment, index) => {
            const coordinates = convertGeoJSONtoCoordinates(segment.geometry);
            const midPoint = getMidPoint(coordinates);
            const segmentColor = getSegmentColor(segment.mode);

            return (
              <React.Fragment key={`segment-${index}`}>
                <Polyline
                  coordinates={coordinates}
                  strokeColor={segmentColor}
                  strokeWidth={4}
                  tappable={true}
                  onPress={() => showSegmentDetails(segment)}
                />

                {midPoint && (
                  <Marker
                    key={`midpoint-${index}`}
                    coordinate={midPoint}
                    onPress={() => showSegmentDetails(segment)}
                    pinColor={segmentColor}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapView>

        {/* Header with Journey Info */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.journeyInfo}>
            <Text style={styles.journeyText} numberOfLines={1}>{departure}</Text>
            <View style={styles.journeyDivider}>
              <Ionicons name="arrow-forward" size={16} color="#666" />
            </View>
            <Text style={styles.journeyText} numberOfLines={1}>{arrival}</Text>
          </View>
        </View>

        {/* En-tête des itinéraires avec flèche */}
        <View style={styles.routesHeaderContainer}>
          <TouchableOpacity 
            style={styles.routesHeader}
            onPress={toggleRoutesList}
            activeOpacity={0.7}
          >
            <Text style={styles.routesTitle}>
              {loading ? 'Recherche d\'itinéraires...' : `${routes.length} itinéraires disponibles`}
            </Text>
            
            {loading ? (
              <ActivityIndicator size="small" color="#12B3A8" />
            ) : (
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="chevron-down" size={24} color="#333" />
              </Animated.View>
            )}
          </TouchableOpacity>
          
          {/* Contenu des itinéraires - affiché conditionnellement */}
          {showRoutesList && !loading && routes.length > 0 && (
            <ScrollView 
              style={styles.routesContent}
              contentContainerStyle={{paddingBottom: 80}}
              nestedScrollEnabled={true}
            >
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 20}
                snapToAlignment="center"
                decelerationRate="fast"
                contentContainerStyle={styles.scrollViewContent}
              >
                {routes.map((route, index) => (
                  <TouchableOpacity
                    key={`route-${index}`}
                    style={[
                      styles.routeCard,
                      selectedRoute?.id === route.id && styles.selectedRouteCard
                    ]}
                    activeOpacity={0.9}
                    onPress={() => selectRoute(route, index)}
                  >
                    <View style={styles.routeCardHeader}>
                      <View style={styles.routePrice}>
                        <Text style={styles.routePriceLabel}>Prix</Text>
                        <Text style={styles.routePriceValue}>{formatPrice(route.price)}€</Text>
                      </View>
                      
                      <View style={styles.routeDetails}>
                        <View style={styles.routeDetailItem}>
                          <Ionicons name="time-outline" size={16} color="#666" />
                          <Text style={styles.routeDetailText}>
                            {formatDuration(route.totalDuration)}
                          </Text>
                        </View>
                        <View style={styles.routeDetailItem}>
                          <Ionicons name="navigate-outline" size={16} color="#666" />
                          <Text style={styles.routeDetailText}>
                            {Math.round(route.totalDistance)} km
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.routeSegments}>
                      <View style={styles.routeTimeline}>
                        {route.segments.map((segment, segIndex) => (
                          <React.Fragment key={`segment-${route.id}-${segIndex}`}>
                            <View style={styles.routeSegmentDot}>
                              <View style={[styles.routeSegmentIcon, { backgroundColor: getSegmentColor(segment.mode) }]}>
                                <Ionicons name={getTransportIcon(segment.mode)} size={14} color="white" />
                              </View>
                            </View>
                            {segIndex < route.segments.length - 1 && (
                              <View style={styles.routeSegmentLine} />
                            )}
                          </React.Fragment>
                        ))}
                      </View>
                      
                      <View style={styles.routeSegmentDetails}>
                        {route.segments.map((segment, segIndex) => (
                          <View key={`segment-detail-${route.id}-${segIndex}`} style={styles.segmentDetail}>
                            <Text style={styles.segmentMode}>
                              {transportModes[segment.mode]?.label || 'Transport'}
                            </Text>
                            <Text style={styles.segmentInfo} numberOfLines={1}>
                              {segment.from.name} → {segment.to.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.reserveButton}
                      onPress={() => handleReservation(route)}
                    >
                      <Text style={styles.reserveButtonText}>Réserver maintenant</Text>
                      <Ionicons name="arrow-forward" size={18} color="white" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Route Indicators */}
              <View style={styles.routeIndicators}>
                {routes.map((route, index) => (
                  <View 
                    key={`indicator-${index}`}
                    style={[
                      styles.routeIndicator,
                      selectedRoute?.id === route.id && styles.activeRouteIndicator
                    ]}
                  />
                ))}
              </View>
            </ScrollView>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#12B3A8" />
              <Text style={styles.loadingText}>Recherche des meilleurs itinéraires...</Text>
            </View>
          )}
          
          {!showRoutesList && !loading && routes.length > 0 && (
            <View style={styles.collapsedPreview}>
              <Text style={styles.previewText}>
                À partir de {formatPrice(Math.min(...routes.map(r => r.price)))}€
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Reservation Modal */}
      <ReservationModal
        visible={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        onConfirm={() => router.push('/Trajets')}
        route={selectedRouteForReservation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  journeyInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  journeyText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  journeyDivider: {
    paddingHorizontal: 8,
  },
  routesHeaderContainer: {
    position: 'absolute',
    bottom: 0, // Augmenté pour laisser de l'espace pour la navigation
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: height * 0.7, // Limiter la hauteur maximale à 70% de l'écran
  },
  routesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  routesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  collapsedPreview: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#12B3A8',
  },
  routesContent: {
    paddingBottom: 70, // Ajouter de l'espace en bas pour éviter le chevauchement avec la barre de navigation
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 80, // Augmenté pour éviter d'être coupé par la navigation
  },
  routeCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedRouteCard: {
    borderWidth: 2,
    borderColor: '#12B3A8',
  },
  routeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routePrice: {
    alignItems: 'flex-start',
  },
  routePriceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  routePriceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#12B3A8',
  },
  routeDetails: {
    alignItems: 'flex-end',
  },
  routeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeDetailText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  routeSegments: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeTimeline: {
    width: 30,
    alignItems: 'center',
  },
  routeSegmentDot: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeSegmentIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeSegmentLine: {
    width: 2,
    height: 30,
    backgroundColor: '#ddd',
  },
  routeSegmentDetails: {
    flex: 1,
    paddingLeft: 10,
  },
  segmentDetail: {
    marginBottom: 14,
  },
  segmentMode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  segmentInfo: {
    fontSize: 12,
    color: '#666',
  },
  reserveButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#12B3A8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reserveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  routeIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  routeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    margin: 4,
  },
  activeRouteIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#12B3A8',
  }
});

export default MapComponent;