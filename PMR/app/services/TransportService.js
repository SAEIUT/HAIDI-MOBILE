import { API_CONFIG } from '../../constants/API_CONFIG';

class TransportService {
    // Configuration des modes de transport
    static TRANSPORT_MODES = {
        RATP: {  // Changé de 'bus' à 'RATP'
            id: 'RATP',
            name: 'Bus',
            icon: 'bus-outline',
            color: '#9C27B0',
            lineStyle: {
                weight: 4,
                dashArray: null
            }
        },
        TAXI: {  // Changé de 'car' à 'TAXI'
            id: 'TAXI',
            name: 'Voiture',
            icon: 'car-outline',
            color: '#2196F3',
            lineStyle: {
                weight: 4,
                dashArray: null
            }
        },
        SNCF: {  // Changé de 'train' à 'SNCF'
            id: 'SNCF',
            name: 'Train',
            icon: 'train-outline',
            color: '#4CAF50',
            lineStyle: {
                weight: 4,
                dashArray: null
            }
        },
        AF: {  // Changé de 'plane' à 'AF'
            id: 'AF',
            name: 'Avion',
            icon: 'airplane-outline',
            color: '#FF9800',
            lineStyle: {
                weight: 4,
                dashArray: null
            }
        }
    };

    // Liste des gares
    static STATIONS = [
        {
            id: 'paris_nord',
            name: 'Paris Nord',
            type: 'station',
            icon: 'train-outline',
            coords: [2.3558, 48.8809]
        },
        {
            id: 'marseille_st_charles',
            name: 'Marseille Saint-Charles',
            type: 'station',
            coords: [5.3802, 43.3028]
        },
        {
            id: 'lyon_part_dieu',
            name: 'Lyon Part-Dieu',
            type: 'station',
            coords: [4.8590, 45.7605]
        }
    ];

    // Liste des aéroports
    static AIRPORTS = [
        {
            id: 'cdg',
            name: 'Paris Charles de Gaulle',
            type: 'airport',
            icon: 'airplane-outline',
            coords: [2.5479, 49.0097]
        },
        {
            id: 'ory',
            name: 'Paris Orly',
            type: 'airport',
            coords: [2.3652, 48.7262]
        },
        {
            id: 'mrs',
            name: 'Marseille Provence',
            type: 'airport',
            coords: [5.2145, 43.4365]
        }
    ];

    // Calcul de distance
    static calculateDistance(fromCoords, toCoords) {
        const R = 6371e3;
        const φ1 = fromCoords[1] * Math.PI / 180;
        const φ2 = toCoords[1] * Math.PI / 180;
        const Δφ = (toCoords[1] - fromCoords[1]) * Math.PI / 180;
        const Δλ = (toCoords[0] - fromCoords[0]) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                 Math.cos(φ1) * Math.cos(φ2) *
                 Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // Trouver la gare la plus proche
    static async findNearestStation(coords, maxDistance = null) {
        console.log('Recherche de station près de:', coords);
        let nearest = null;
        let minDistance = Infinity;
        
        this.STATIONS.forEach(station => {
            const distance = this.calculateDistance(coords, station.coords);
            if ((!maxDistance || distance <= maxDistance) && distance < minDistance) {
                minDistance = distance;
                nearest = { ...station, distance };
            }
        });

        if (nearest) {
            console.log('Station trouvée:', nearest.name);
        }
        return nearest;
    }

    // Trouver l'aéroport le plus proche
    static async findNearestAirport(coords, maxDistance = null) {
        console.log('Recherche d\'aéroport près de:', coords);
        let nearest = null;
        let minDistance = Infinity;
        
        this.AIRPORTS.forEach(airport => {
            const distance = this.calculateDistance(coords, airport.coords);
            if ((!maxDistance || distance <= maxDistance) && distance < minDistance) {
                minDistance = distance;
                nearest = { ...airport, distance };
            }
        });

        if (nearest) {
            console.log('Aéroport trouvé:', nearest.name);
        }
        return nearest;
    }

    // Obtenir un itinéraire routier
    static async getDetailedRoadRoute(from, to, mode = 'RATP') {
        try {
            // Vérifier si le mode existe dans TRANSPORT_MODES
            if (!this.TRANSPORT_MODES[mode]) {
                console.error(`Mode de transport inconnu: ${mode}`);
                return null;
            }
    
            const modeConfig = this.TRANSPORT_MODES[mode];
            console.log(`Calcul itinéraire ${mode} entre:`, from.name, 'et', to.name);
    
            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/` +
                `${from.coords[0]},${from.coords[1]};${to.coords[0]},${to.coords[1]}?` +
                `geometries=geojson&overview=full&steps=true&access_token=${API_CONFIG.mapbox}`
            );
    
            if (!response.ok) throw new Error(`Erreur itinéraire ${mode}`);
            
            const data = await response.json();
            if (!data.routes?.length) throw new Error('Aucun itinéraire trouvé');
            
            // Ajuster le multiplicateur selon le mode de transport
            const durationMultiplier = mode === 'RATP' ? 1.5 : 
                                     mode === 'TAXI' ? 0.9 : 1.0;
            
            return {
                mode,
                type: mode,
                icon: modeConfig.icon,
                color: modeConfig.color,
                lineStyle: modeConfig.lineStyle,
                duration: data.routes[0].duration / 60 * durationMultiplier,
                distance: data.routes[0].distance,
                geometry: data.routes[0].geometry,
                from,
                to
            };
        } catch (error) {
            console.error(`Erreur itinéraire ${mode}:`, error);
            return null;
        }
    }

    // Obtenir un itinéraire ferroviaire
    static async getDetailedTrainRoute(fromStation, toStation) {
        try {
            console.log('Calcul itinéraire ferroviaire entre:', fromStation.name, 'et', toStation.name);
            
            const modeConfig = this.TRANSPORT_MODES.SNCF;  // Changé de train à SNCF
            const distance = this.calculateDistance(fromStation.coords, toStation.coords);
            const avgSpeed = 160;
            const estimatedDuration = (distance / 1000 / avgSpeed * 60) + 30;
            
            return {
                mode: 'SNCF',  // Changé de train à SNCF
                type: 'SNCF',  // Changé de train à SNCF
                icon: modeConfig.icon,
                color: modeConfig.color,
                lineStyle: modeConfig.lineStyle,
                duration: estimatedDuration,
                distance: distance,
                geometry: {
                    type: 'LineString',
                    coordinates: [fromStation.coords, toStation.coords]
                },
                from: fromStation,
                to: toStation
            };
        } catch (error) {
            console.error('Erreur itinéraire ferroviaire:', error);
            return null;
        }
    }

    // Obtenir un itinéraire aérien
    static getFlightRoute(fromAirport, toAirport) {
        try {
            const modeConfig = this.TRANSPORT_MODES.AF;  // Changé de plane à AF
            const distance = this.calculateDistance(fromAirport.coords, toAirport.coords);
            
            return {
                mode: 'AF',  // Changé de plane à AF
                type: 'AF',  // Changé de plane à AF
                icon: modeConfig.icon,
                color: modeConfig.color,
                lineStyle: modeConfig.lineStyle,
                duration: (distance / 1000) / 800 * 60 + 120,
                distance: distance,
                geometry: {
                    type: 'LineString',
                    coordinates: [fromAirport.coords, toAirport.coords]
                },
                from: fromAirport,
                to: toAirport
            };
        } catch (error) {
            console.error('Erreur itinéraire aérien:', error);
            return null;
        }
    }

    // Génération des itinéraires multimodaux
    static async generateMultimodalRoutes(departure, arrival) {
        try {
            console.log('Génération des itinéraires entre:', departure.name, 'et', arrival.name);
            const routes = [];

            // Points de passage obligatoires
            const departureStation = await this.findNearestStation(departure.coords);
            const departureAirport = await this.findNearestAirport(departureStation.coords, 100000);
            const arrivalStation = await this.findNearestStation(arrival.coords);
            const arrivalAirport = await this.findNearestAirport(arrivalStation.coords, 100000);

            // Options de transport terrestre
            const groundOptions = ['RATP', 'TAXI'];

            for (const groundMode of groundOptions) {
                // Transport terrestre initial
                const toStation = await this.getDetailedRoadRoute(
                    departure,
                    departureStation,
                    groundMode
                );

                // Train vers l'aéroport
                const trainToAirport = await this.getDetailedTrainRoute(
                    departureStation,
                    departureAirport
                );

                // Vol
                const flight = this.getFlightRoute(
                    departureAirport,
                    arrivalAirport
                );

                // Train depuis l'aéroport
                const trainFromAirport = await this.getDetailedTrainRoute(
                    arrivalAirport,
                    arrivalStation
                );

                // Transport terrestre final
                const toFinal = await this.getDetailedRoadRoute(
                    arrivalStation,
                    arrival,
                    groundMode
                );

                if (toStation && trainToAirport && flight && trainFromAirport && toFinal) {
                    routes.push({
                        id: `multimodal-${groundMode}-${Date.now()}`,
                        type: `${groundMode}-SNCF-AF-SNCF-${groundMode}`,
                        segments: [
                            toStation,
                            trainToAirport,
                            flight,
                            trainFromAirport,
                            toFinal
                        ],
                        totalDuration: toStation.duration + trainToAirport.duration + 
                                     flight.duration + trainFromAirport.duration + toFinal.duration,
                        totalDistance: (toStation.distance + trainToAirport.distance + 
                                     flight.distance + trainFromAirport.distance + toFinal.distance) / 1000,
                        departureName: departure.name,
                        arrivalName: arrival.name
                    });
                }
            }

            // Ajout prix et CO2
            const routesWithInfo = routes.map(route => ({
                ...route,
                price: this.calculatePrice(route),
                co2Emissions: this.calculateCO2(route)
            }));

            // Tri par durée
            return routesWithInfo.sort((a, b) => a.totalDuration - b.totalDuration);

        } catch (error) {
            console.error('Erreur génération itinéraires:', error);
            return [];
        }
    }

    // Calcul du prix
    static calculatePrice(route) {
        const prices = {
            RATP: { base: 2, perKm: 0.10 },    // bus -> RATP
            TAXI: { base: 5, perKm: 0.20 },     // car -> TAXI
            SNCF: { base: 10, perKm: 0.20 },    // train -> SNCF
            AF: { base: 50, perKm: 0.30 }       // plane -> AF
        };

        return route.segments.reduce((total, segment) => {
            const price = prices[segment.mode];
            return total + price.base + (segment.distance / 1000 * price.perKm);
        }, 0);
    }

    // Calcul des émissions CO2
    static calculateCO2(route) {
        const co2Factors = {
            RATP: 0.1,    // bus -> RATP
            TAXI: 0.15,   // car -> TAXI
            SNCF: 0.02,   // train -> SNCF
            AF: 0.25      // plane -> AF
        };

        return route.segments.reduce((total, segment) => {
            return total + (segment.distance / 1000) * co2Factors[segment.mode];
        }, 0);
    }
}

export default TransportService;