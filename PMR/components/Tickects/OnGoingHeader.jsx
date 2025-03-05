import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/API_CONFIG';

export default function OnGoingHeader() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userUid, setUserUid] = useState(null);

    useEffect(() => {
        const fetchUserUid = async () => {
            const storedUid = await AsyncStorage.getItem('userUid');
            setUserUid(storedUid);
        };
        fetchUserUid();
    }, []);

    useEffect(() => {
        if (userUid) {
            retrieveTrajet();
        }
    }, [userUid]);

    const retrieveTrajet = async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/reservation/bygoogleid/${userUid}`);
            console.log(response.url)
            const data = await response.json();
            console.log("Données récupérées :", data);
            setData(data);
        } catch (error) {
            console.log("Erreur :", error);
        } finally {
            setIsLoading(false);
        }
    };

    const ongoingSubTrajets = data.flatMap((dossier) =>
        dossier.sousTrajets?.filter((trajet) => trajet.statusValue === 1) || []
    );

    const extractTime = (dateTime) => dateTime.split('T')[1].split('.')[0];

    const extractDate = (dateTime) => {
        const [date] = dateTime.split('T');
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    };

    const timeToSeconds = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const secondsToReadableTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return minutes === 0 ? `${hours} h${hours > 1 ? 's' : ''}` : `${hours} h${hours > 1 ? 's' : ''} ${pad(minutes)} min`;
    };

    const pad = (num) => (num < 10 ? `0${num}` : num);

    const calculateDuration = (trajet) => {
        const timeOne = extractTime(trajet.arrivalTime);
        const timeTwo = extractTime(trajet.departureTime);
        const durationSeconds = timeToSeconds(timeOne) - timeToSeconds(timeTwo);
        return secondsToReadableTime(durationSeconds);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement des trajets en cours...</Text>
            </View>
        );
    }

    return (
        <View>
            {ongoingSubTrajets.length > 0 ? (
                ongoingSubTrajets.map((trajet, index) => (
                    <View key={index} style={styles.trajetContainer}>
                        <Text style={styles.trajetText}>
                            <Text style={styles.locationText}>{trajet.departure}</Text>
                            <Text style={styles.specialText}> ---jusqu'à--- </Text>
                            <Text style={styles.locationText}>{trajet.arrival}</Text>
                        </Text>
                        <Text style={styles.trajetDetails}>
                            {extractDate(trajet.departureTime)} --- {calculateDuration(trajet)} --- {extractDate(trajet.arrivalTime)}
                        </Text>
                    </View>
                ))
            ) : (
                <Text style={styles.noTrajetText}>Aucun trajet en cours.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    trajetContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 25,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    trajetText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3A3A3A',
        marginBottom: 5,
        textAlign: 'center',
    },
    locationText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3A3A3A',
    },
    specialText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    trajetDetails: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    noTrajetText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    },
});