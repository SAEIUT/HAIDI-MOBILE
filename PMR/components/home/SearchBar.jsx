import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const { height } = Dimensions.get('window');

const Home = () => {
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');
    const [departureSuggestions, setDepartureSuggestions] = useState([]);
    const [arrivalSuggestions, setArrivalSuggestions] = useState([]);
    const [departureDate, setDepartureDate] = useState(new Date());
    const [returnDate, setReturnDate] = useState(new Date());
    const [travelers, setTravelers] = useState(1);
    const [showDeparturePicker, setShowDeparturePicker] = useState(false);
    const [showReturnPicker, setShowReturnPicker] = useState(false);
    const [selectedDepartureCoords, setSelectedDepartureCoords] = useState(null);
    const [selectedArrivalCoords, setSelectedArrivalCoords] = useState(null);
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    
    const router = useRouter();
    const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoia2xlcGVyIiwiYSI6ImNtMjNpdTBjbjA3bmQyanF3cTB3ZDR2bTkifQ.zGnlUoaFGuyhrWSJtEsXYA';

    const fetchSuggestions = async (query, setSuggestions) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await axios.get(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
                {
                    params: {
                        access_token: MAPBOX_ACCESS_TOKEN,
                        country: 'FR',
                        types: 'place,address,poi',
                        language: 'fr',
                        limit: 8
                    },
                }
            );

            if (response.data.features) {
                const suggestions = response.data.features.map(feature => {
                    let displayName = feature.place_name;
                    if (feature.place_type[0] === 'place') {
                        displayName = `${feature.text}, ${feature.context?.[0]?.text || 'France'}`;
                    }

                    return {
                        id: feature.id,
                        name: displayName,
                        coords: feature.center,
                        type: feature.place_type[0]
                    };
                });
                setSuggestions(suggestions);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des suggestions:', error);
        }
    };

    const handleSelectSuggestion = (suggestion, isForDeparture) => {
        if (isForDeparture) {
            setDeparture(suggestion.name);
            setSelectedDepartureCoords(suggestion.coords);
            setDepartureSuggestions([]);
        } else {
            setArrival(suggestion.name);
            setSelectedArrivalCoords(suggestion.coords);
            setArrivalSuggestions([]);
        }
    };

    const handleSearch = () => {
        if (!departure || !arrival || !selectedDepartureCoords || !selectedArrivalCoords) {
            alert('Veuillez sélectionner une adresse de départ et d\'arrivée');
            return;
        }

        router.push({
            pathname: 'Maps',
            params: {
                departure: departure,
                arrival: arrival,
                departureCoords: JSON.stringify(selectedDepartureCoords),
                arrivalCoords: JSON.stringify(selectedArrivalCoords),
                departureDate: departureDate.toISOString(),
                returnDate: isRoundTrip ? returnDate.toISOString() : null,
                travelers: travelers,
                isRoundTrip: isRoundTrip
            },
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.formContainer}>
                    {/* Sélecteur de type de trajet */}
                    <View style={styles.tripTypeContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.tripTypeButton, 
                                !isRoundTrip && styles.tripTypeButtonActive
                            ]}
                            onPress={() => setIsRoundTrip(false)}
                        >
                            <Text style={[
                                styles.tripTypeText,
                                !isRoundTrip && styles.tripTypeTextActive
                            ]}>Aller simple</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.tripTypeButton,
                                isRoundTrip && styles.tripTypeButtonActive
                            ]}
                            onPress={() => setIsRoundTrip(true)}
                        >
                            <Text style={[
                                styles.tripTypeText,
                                isRoundTrip && styles.tripTypeTextActive
                            ]}>Aller-retour</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Champ Départ avec suggestions */}
                    <View style={styles.inputGroup}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="airplane-outline" size={20} color="#8E8E93" />
                        </View>
                        <View style={styles.inputContent}>
                            <Text style={styles.inputLabel}>De</Text>
                            <TextInput
                                style={styles.input}
                                value={departure}
                                onChangeText={(text) => {
                                    setDeparture(text);
                                    fetchSuggestions(text, setDepartureSuggestions);
                                }}
                                placeholder="Ville ou adresse de départ"
                                placeholderTextColor="#8E8E93"
                            />
                        </View>
                    </View>
                    {departureSuggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            <FlatList
                                data={departureSuggestions}
                                keyExtractor={(item) => item.id}
                                style={styles.suggestionsList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.suggestionItem}
                                        onPress={() => handleSelectSuggestion(item, true)}
                                    >
                                        <View style={styles.suggestionContent}>
                                            <Ionicons 
                                                name={item.type === 'place' ? 'location-outline' : 
                                                      item.type === 'address' ? 'home-outline' : 'business-outline'} 
                                                size={16} 
                                                color="#8E8E93" 
                                                style={styles.suggestionIcon}
                                            />
                                            <View>
                                                <Text style={styles.suggestionText}>{item.name}</Text>
                                                <Text style={styles.suggestionType}>
                                                    {item.type === 'place' ? 'Ville' : 
                                                     item.type === 'address' ? 'Adresse' : 'Point d\'intérêt'}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}

                    {/* Champ Arrivée avec suggestions */}
                    <View style={styles.inputGroup}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="airplane-outline" size={20} color="#8E8E93" />
                        </View>
                        <View style={styles.inputContent}>
                            <Text style={styles.inputLabel}>À</Text>
                            <TextInput
                                style={styles.input}
                                value={arrival}
                                onChangeText={(text) => {
                                    setArrival(text);
                                    fetchSuggestions(text, setArrivalSuggestions);
                                }}
                                placeholder="Ville ou adresse d'arrivée"
                                placeholderTextColor="#8E8E93"
                            />
                        </View>
                    </View>
                    {arrivalSuggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            <FlatList
                                data={arrivalSuggestions}
                                keyExtractor={(item) => item.id}
                                style={styles.suggestionsList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.suggestionItem}
                                        onPress={() => handleSelectSuggestion(item, false)}
                                    >
                                        <View style={styles.suggestionContent}>
                                            <Ionicons 
                                                name={item.type === 'place' ? 'location-outline' : 
                                                      item.type === 'address' ? 'home-outline' : 'business-outline'} 
                                                size={16} 
                                                color="#8E8E93" 
                                                style={styles.suggestionIcon}
                                            />
                                            <View>
                                                <Text style={styles.suggestionText}>{item.name}</Text>
                                                <Text style={styles.suggestionType}>
                                                    {item.type === 'place' ? 'Ville' : 
                                                     item.type === 'address' ? 'Adresse' : 'Point d\'intérêt'}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}

                    {/* Dates */}
                    <View style={styles.datesContainer}>
                        <TouchableOpacity 
                            style={[styles.dateInput, !isRoundTrip && styles.dateInputFullWidth]}
                            onPress={() => setShowDeparturePicker(true)}
                        >
                            <Text style={styles.dateLabel}>Départ</Text>
                            <Text style={styles.dateValue}>
                                {departureDate.toLocaleDateString('fr-FR')}
                            </Text>
                        </TouchableOpacity>

                        {isRoundTrip && (
                            <TouchableOpacity 
                                style={styles.dateInput}
                                onPress={() => setShowReturnPicker(true)}
                            >
                                <Text style={styles.dateLabel}>Retour</Text>
                                <Text style={styles.dateValue}>
                                    {returnDate.toLocaleDateString('fr-FR')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={styles.searchButton}
                        onPress={handleSearch}
                    >
                        <Text style={styles.searchButtonText}>Rechercher</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Date Picker Modal */}
            {(showDeparturePicker || showReturnPicker) && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <DateTimePicker
                            value={showDeparturePicker ? departureDate : returnDate}
                            mode="date"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                if (selectedDate) {
                                    if (showDeparturePicker) {
                                        setDepartureDate(selectedDate);
                                    } else {
                                        setReturnDate(selectedDate);
                                    }
                                }
                            }}
                            locale="fr-FR"
                            minimumDate={new Date()}
                            style={styles.datePicker}
                        />
                        <TouchableOpacity 
                            style={styles.modalButton}
                            onPress={() => {
                                setShowDeparturePicker(false);
                                setShowReturnPicker(false);
                            }}
                        >
                            <Text style={styles.modalButtonText}>Valider</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1E',
        // backgroundColor: 'gray',
        borderRadius: 15, 
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    formContainer: {
        width: '100%',
    },
    tripTypeContainer: {
        flexDirection: 'row',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 4,
        marginBottom: 12,
    },
    tripTypeButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    tripTypeButtonActive: {
        backgroundColor: '#12B3A8',
    },
    tripTypeText: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '500',
    },
    tripTypeTextActive: {
        color: 'white',
    },
    inputGroup: {
        flexDirection: 'row',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    suggestionsContainer: {
        marginTop: -8,
        marginBottom: 12,
        zIndex: 1000,
    },
    suggestionsList: {
        maxHeight: 150,
        backgroundColor: '#2C2C2E',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3C3C3E',
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C3E',
    },
    suggestionText: {
        color: 'white',
        fontSize: 14,
    },
    inputIcon: {
        marginRight: 12,
        justifyContent: 'center',
    },
    inputContent: {
        flex: 1,
    },
    inputLabel: {
        color: '#8E8E93',
        fontSize: 12,
        marginBottom: 4,
    },
    input: {
        color: 'white',
        fontSize: 16,
        padding: 0,
    },
    datesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dateInput: {
        flex: 1,
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 12,
        marginRight: 8,
    },
    dateInputFullWidth: {
        marginRight: 0,
    },
    dateLabel: {
        color: '#8E8E93',
        fontSize: 12,
        marginBottom: 4,
    },
    dateValue: {
        color: 'white',
        fontSize: 16,
    },
    travelersContainer: {
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    travelersLabel: {
        color: '#8E8E93',
        fontSize: 12,
        marginBottom: 8,
    },
    travelersControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    travelerButton: {
        width: 32,
        height: 32,
        backgroundColor: '#3A3A3C',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    travelerButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    travelersCount: {
        color: 'white',
        fontSize: 16,
        marginHorizontal: 16,
    },
    searchButton: {
        backgroundColor: '#12B3A8',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    searchButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    datePicker: {
        height: 200,
        width: '100%',
    },
    modalButton: {
        backgroundColor: '#12B3A8',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 16,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#2C2C2E',
        paddingVertical: 12,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#3C3C3E',
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        color: '#8E8E93',
        fontSize: 12,
        marginTop: 4,
    },
    navTextActive: {
        color: '#12B3A8',
    },
});



export default Home;