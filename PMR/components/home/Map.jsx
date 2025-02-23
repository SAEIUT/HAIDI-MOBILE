// import React, { useEffect, useRef, useState } from 'react';
// import MapboxGL from '@react-native-mapbox-gl/maps';
// import { View, StyleSheet } from 'react-native';
// import { API_CONFIG } from '../../constants/API_CONFIG'
// import { PLACE_TYPES } from '../../constants/PLACE_TYPES';
// import { TRANSPORT_MODES } from '../../constants/TRANSPORT_MODES';

// MapboxGL.setAccessToken(API_CONFIG.mapbox);

// const Map = ({ selectedDeparture, selectedArrival, selectedJourney }) => {
//     const mapRef = useRef(null);
//     const [markers, setMarkers] = useState([]);
//     const [routes, setRoutes] = useState([]);

//     const clearMap = () => {
//         setMarkers([]);
//         setRoutes([]);
//     };

//     const updateMap = () => {
//         clearMap();

//         const newMarkers = [];
//         const newRoutes = [];
//         const bounds = [];

//         if (selectedDeparture) {
//             newMarkers.push(
//                 <MapboxGL.PointAnnotation
//                     key="departure"
//                     id="departure"
//                     coordinate={selectedDeparture.coords}
//                 />
//             );
//             bounds.push(selectedDeparture.coords);
//         }

//         if (selectedArrival) {
//             newMarkers.push(
//                 <MapboxGL.PointAnnotation
//                     key="arrival"
//                     id="arrival"
//                     coordinate={selectedArrival.coords}
//                 />
//             );
//             bounds.push(selectedArrival.coords);
//         }

//         if (selectedJourney) {
//             selectedJourney.segments.forEach((segment, index) => {
//                 const routeId = `route-${index}`;

//                 newRoutes.push(
//                     <MapboxGL.ShapeSource id={routeId} key={routeId} shape={segment.geometry}>
//                         <MapboxGL.LineLayer
//                             id={`line-${routeId}`}
//                             style={{
//                                 lineColor: TRANSPORT_MODES[segment.mode.toUpperCase()].lineColor,
//                                 lineWidth: 4,
//                                 lineOpacity: 0.8,
//                                 lineDasharray: segment.mode === 'plane' ? [2, 1] : []
//                             }}
//                         />
//                     </MapboxGL.ShapeSource>
//                 );

//                 if (segment.geometry.coordinates) {
//                     bounds.push(...segment.geometry.coordinates);
//                 }
//             });
//         }

//         setMarkers(newMarkers);
//         setRoutes(newRoutes);

//         if (bounds.length > 0) {
//             mapRef.current?.fitBounds(
//                 [Math.min(...bounds.map(coord => coord[0])), Math.min(...bounds.map(coord => coord[1]))],
//                 [Math.max(...bounds.map(coord => coord[0])), Math.max(...bounds.map(coord => coord[1]))],
//                 50
//             );
//         }
//     };

//     useEffect(() => {
//         updateMap();
//     }, [selectedDeparture, selectedArrival, selectedJourney]);

//     return (
//         <View style={styles.container}>
//             <MapboxGL.MapView
//                 ref={mapRef}
//                 style={styles.map}
//                 styleURL={MapboxGL.StyleURL.Street}
//             >
//                 <MapboxGL.Camera
//                     zoomLevel={11}
//                     centerCoordinate={[2.3522, 48.8566]} // Paris par défaut
//                 />
//                 {markers}
//                 {routes}
//             </MapboxGL.MapView>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     map: {
//         flex: 1,
//     },
// });

// export default Map;
