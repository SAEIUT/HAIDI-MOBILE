import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, FlatList, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BarreTrajet from './BarreTrajet';
import BarreVoyage from './BarreVoyages';
import QRCodeTrajet from './QRCodeTrajet';
import { API_CONFIG } from '../../constants/API_CONFIG';
import { useNavigation } from '@react-navigation/native';

export default function Tickets() {
    const [idTrajet, setID] = useState(null);
    const [isSousTrajet, setQRCode] = useState(null);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userUid, setUserUid] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const getUserUid = async () => {
            try {
                const storedUid = await AsyncStorage.getItem('userUid');
                console.log("UID récupéré :", storedUid);
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

    useEffect(() => {
        if (userUid) {
            retrieveTrajet();
        }
    }, [userUid]);

    const retrieveTrajet = async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/reservation/byuid/${userUid}`);
            const data = await response.json();
            console.log("Données récupérées :", data);
            setData(data);
        } catch (error) {
            console.log("Erreur :", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Chargement des données...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                style={{ marginTop: 10 }}
                data={data}
                renderItem={({ item }) => (
                    <TouchableOpacity activeOpacity={0.9} onPress={() => setID(idTrajet === item["id-dossier"] ? null : item["id-dossier"]) }>
                        <View style={[styles.item]}>
                            <View style={styles.top}>
                                <Text style={styles.idTrajet}>Id Trajet: {item["id-dossier"]}</Text>
                                <Text style={styles.idTrajet}>{item.sousTrajets[0].departureTime.split('T')[0]}</Text>
                            </View>
                            <BarreVoyage ordre={item.sousTrajets.map(st => st.statusValue)} style={styles.barres} />
                            {idTrajet === item["id-dossier"] && (
                                <View style={styles.details}>
                                    {item.sousTrajets.map((sousTrajet, index) => (
                                        <TouchableOpacity activeOpacity={0.9} onPress={() => setQRCode(isSousTrajet === sousTrajet.numDossier ? null : sousTrajet.numDossier)} key={index}>
                                            <View style={styles.sousTrajet}>
                                                <View style={styles.top}>
                                                    <Text style={styles.detailsDate}>{sousTrajet.departureTime.split('T')[0]}</Text>
                                                    <Text style={styles.detailsDate}>{sousTrajet.arrivalTime.split('T')[0]}</Text>
                                                </View>
                                                <View style={styles.qrCode}>
                                                    {isSousTrajet === sousTrajet.numDossier && <QRCodeTrajet id={JSON.stringify({ trajet: sousTrajet.numDossier, bagage: item.bagage })} />}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
                ListFooterComponent={<View style={{ height: 120 }} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 10,
        color: 'gray',
    },
    item: {
        backgroundColor: '#f4f5f9',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        borderWidth: 0.2,
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    details: {
        marginTop: 10,
        padding: 10,
    },
    sousTrajet: {
        marginBottom: 20,
        borderRadius: 10,
        padding: 5,
        borderColor: 'gray',
        borderWidth: 0.2,
    },
    qrCode: {
        alignContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    barres: {
        display: "flex",
        flex: 1,
    }
});