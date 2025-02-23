import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapComponent from '../../app/(TabBar)/map/Maps';  // Ajustez le chemin selon votre structure

const RouteSearchScreen = () => {
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');
    const [searchResults, setSearchResults] = useState(null);

    const handleSearch = async () => {
        if (!departure || !arrival) return;

        try {
            // Recherche du point de départ
            const departureUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(departure)}.json?access_token=${API_CONFIG.mapbox}`;
            const arrivalUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(arrival)}.json?access_token=${API_CONFIG.mapbox}`;

            const [departureRes, arrivalRes] = await Promise.all([
                fetch(departureUrl),
                fetch(arrivalUrl)
            ]);

            const [departureData, arrivalData] = await Promise.all([
                departureRes.json(),
                arrivalRes.json()
            ]);

            if (departureData.features?.[0] && arrivalData.features?.[0]) {
                setSearchResults({
                    departure: {
                        coords: departureData.features[0].center,
                        name: departureData.features[0].place_name,
                        type: 'address'
                    },
                    arrival: {
                        coords: arrivalData.features[0].center,
                        name: arrivalData.features[0].place_name,
                        type: 'address'
                    }
                });
            }
        } catch (error) {
            console.error('Erreur de recherche:', error);
        }
    };

    const swapLocations = () => {
        setDeparture(arrival);
        setArrival(departure);
        if (searchResults) {
            setSearchResults({
                departure: searchResults.arrival,
                arrival: searchResults.departure
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.inputsContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="location" size={24} color="#2196F3" />
                        <TextInput
                            style={styles.input}
                            placeholder="Point de départ"
                            value={departure}
                            onChangeText={setDeparture}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
                    <TouchableOpacity onPress={swapLocations} style={styles.swapButton}>
                        <Ionicons name="swap-vertical" size={24} color="#2196F3" />
                    </TouchableOpacity>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="flag" size={24} color="#2196F3" />
                        <TextInput
                            style={styles.input}
                            placeholder="Destination"
                            value={arrival}
                            onChangeText={setArrival}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
                </View>
            </View>

            <MapComponent
                selectedDeparture={searchResults?.departure}
                selectedArrival={searchResults?.arrival}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        zIndex: 1,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputsContainer: {
        gap: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    swapButton: {
        alignSelf: 'center',
        padding: 4,
    },
});

export default RouteSearchScreen;