import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { API_CONFIG } from '../../constants/API_CONFIG';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Header() {
    const [trajets, setTrajets] = useState();
    const [loading, setLoading] = useState(true);
    const [userUid, setUserUid] = useState(null);


    const router = useRouter();
    // Récupérer l'UID de l'utilisateur
    useEffect(() => {
        const getUserUid = async () => {
        try {
            const storedUid = await AsyncStorage.getItem('userUid');
            console.log("UID récupéré pour le hbeader :", storedUid);
            if (storedUid) {
            setUserUid(storedUid);
            } else {
            console.log("Pas d'UID, redirection vers connexion.");
            navigation.replace("/Login");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'UID :", error);
        }
        };
    
        getUserUid();
    }, []);

    // Appeler getTrajets() une fois que l'UID est récupéré
    useEffect(() => {
        if (userUid) {
        getTrajets();
        }
    }, [userUid]);

    





    const extractTime = (dateTime) => {
        const timeMatch = dateTime.match(/T(\d{2}:\d{2}):/);
        if (timeMatch) {
            return timeMatch[1];
        }
        return 'Heure inconnue';
    };

    const extractDate = (dateTime) => {
        if (!dateTime) return 'Date inconnue';

        const regex = /(\d{4})-(\d{2})-(\d{2})/;
        const match = dateTime.match(regex);

        if (match) {
            const [, year, month, day] = match;
            return `${day}/${month}/${year}`;
        }

        return 'Date invalide';
    };

    const handleRefuser = (idDossier) => {
        setTrajets((prevTrajets) => prevTrajets.filter((trajet) => trajet['id-dossier'] !== idDossier));
    };

    const handleValider = (idDossier, numDossier) => {
        setTrajets((prevTrajets) => prevTrajets.filter((trajet) => trajet['id-dossier'] !== idDossier));
        router.push({
            pathname: './Trajet',
            params: { idDossier, numDossier },
        });
    };

    const getTrajets = async () => {
        try {
            // console.log(`http://${API_CONFIG.ipaddress}/api/agent/getTrajetsFromUuid/${auth.currentUser.uid}`);
            console.log(`http://${API_CONFIG.ipaddress}/api/agent/getTrajetsFromUuid/${userUid}`);
            const response = await fetch(`http://${API_CONFIG.ipaddress}/api/agent/getTrajetsFromUuid/${userUid}`);
            const data = await response.json();
            setTrajets(data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors de la récupération des trajets :', error);
            setLoading(false);
        }
    };

    const retrievePassenger = async (idPMR) => {
        try {

            const response = await fetch(`http://${API_CONFIG.ipaddress}/api/user/${idPMR}`);
            console.log(response.url);
            const data = await response.json();
            return data.firstname + ' ' + data.lastname;
        } catch (error) {
            console.error('Erreur lors de la récupération du passager :', error);
        }
    };

    useEffect(() => {
        getTrajets();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#12B3A8" />
                    <Text style={styles.loadingText}>Chargement des trajets...</Text>
                </View>
            ) : (
                <FlatList
                    style={{ marginTop: 10 }}
                    data={trajets}
                    renderItem={({ item }) => (
                        <TouchableOpacity activeOpacity={0.9}>
                            <View style={styles.item}>
                                <View style={styles.top}>
                                    <Text style={styles.header}>{retrievePassenger(item.idPMR)}</Text>
                                    <Text style={styles.header}>{extractDate(item.departureTime)}</Text>
                                    <Text style={styles.middleText}>{extractTime(item.departureTime)}</Text>
                                </View>
                                <View style={styles.middle}>
                                    <Text style={styles.middleText}>{item.departure}</Text>
                                    <Text style={styles.middleText}>{(item.arrival)}</Text>
                                </View>
                                <View style={styles.bottom}>
                                    <TouchableOpacity
                                        style={styles.buttonRouge}
                                        onPress={() => handleRefuser(item.idDossier)}
                                    >
                                        <Text style={styles.bouttonText}>Refuser</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.buttonVert}
                                        onPress={() => handleValider(item.idDossier, item.numDossier)}
                                    >
                                        <Text style={styles.bouttonText}>Accepter</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#192031',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#12B3A8',
        fontSize: 18,
        marginTop: 10,
    },
    item: {
        backgroundColor: '#2D3956',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 2,
        borderWidth: 0.5,
        borderColor: 'gray',
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    middle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    buttonVert: {
        backgroundColor: '#12B3A8',
        padding: 10,
        borderRadius: 2,
    },
    buttonRouge: {
        backgroundColor: '#df6058',
        padding: 10,
        borderRadius: 2,
    },
    bouttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    middleText: {
        fontSize: 16,
        color: 'white',
    },
});
