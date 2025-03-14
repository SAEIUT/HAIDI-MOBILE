import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Modal, TextInput } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { getTrajet, retrievePassenger, changeTrajetStatue, formatDate, calculerAge, getStuff, extractTime } from "./api.js";
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function CurrentTrajet({ idDossier, idTrajet }) {
    const [bagage, setBagage] = useState([]);
    const [trajet, setTrajet] = useState(null);
    const [pmr, setPmr] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [problemMessage, setProblemMessage] = useState("");
    const cameraRef = useRef(null);
    const [facing, setFacing] = useState("back");
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    console.log("idDossier", idDossier);
    console.log("idTrajet", idTrajet);
    useEffect(() => {
        (async () => {
            try {
                if (permission?.status !== "granted") {
                    const { status } = await requestPermission();
                    setHasPermission(status === "granted");
                } else {
                    setHasPermission(true);
                }

                const voyageData = await getStuff(idDossier);
                if (!voyageData) {
                    throw new Error("Voyage non trouvé !");
                }
                setBagage(voyageData?.bagage?.bagagesList || []);
                console.log(voyageData);

                if (voyageData.idPMR) {
                    const pmrData = await retrievePassenger(voyageData.idPMR);
                    if (!pmrData) {
                        throw new Error("Données PMR non disponibles !");
                    }
                    setPmr(pmrData);
                }

                if (voyageData.idPMR) {
                    const trajetData = await getTrajet(idDossier, idTrajet);
                    if (!trajetData) {
                        throw new Error("Trajet non trouvé !");
                    }
                    setTrajet(trajetData);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
                Alert.alert("Erreur", "Impossible de charger les données. Veuillez réessayer.");
            } finally {
                setLoading(false);
            }
        })();
    }, [idDossier, idTrajet]);

    const onScan = (result) => {
        if (result) {
            try {
                const qrData = JSON.parse(result.data);
                console.log("QR Code detected:", qrData);
                console.log("Trajet status:", trajet.statusValue);
                console.log("id Dossier:", idDossier);
                console.log("id Trajet:", idTrajet);

                if (qrData.idTrajet === idTrajet) {
                    changeTrajetStatue(idDossier, idTrajet, trajet.statusValue);
                    setCameraActive(false);
                } else {
                    Alert.alert("QR Code invalide", "Le QR code ne correspond pas à ce trajet.");
                    setCameraActive(false);
                }
            } catch (error) {
                Alert.alert("QR Code invalide", "Le QR code ne correspond pas à ce trajet.");
                setCameraActive(false);
            }
        }
    };

    const redirect = () => {
        router.navigate("Home");
    };

    const validerTrajet = () => {
        Alert.alert(
            "Vous êtes sur le point de valider le trajet",
            "Voulez-vous continuer ?",
            [
                { text: "Annuler", onPress: () => console.log("Cancel Pressed"), style: "cancel" },
                {
                    text: "Valider",
                    onPress: () => {
                        setBagage([]);
                        setTrajet(null);
                        setPmr(null);
                        setCameraActive(false);
                        setModalVisible(false);
                        setProblemMessage("");
                        redirect();
                    },
                },
            ]
        );
    };

    const sendProblemMessage = () => {
        console.log("Problem message sent:", problemMessage);
        setModalVisible(false);
        setProblemMessage("");
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#12B3A8" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.textHeader}>Trajet en cours</Text>
            </View>
            <View style={styles.body}>
                <View style={styles.bodyTop}>
                    <Text style={styles.textTop}><Ionicons name="person" size={16} color="white" /> : {pmr?.firstname + " " + pmr?.lastname}</Text>
                    <Text style={styles.textTop}>Handicape : <Entypo name="eye-with-line" size={16} color="white" /></Text>
                </View>
                <View style={styles.bodyTopMid}>
                    <Text style={styles.textMiddle}>Naissance : {formatDate(pmr?.birthdate)}</Text>
                    <Text style={styles.textMiddle}><FontAwesome name="birthday-cake" size={16} color="white" />  Age : {calculerAge(pmr?.birthdate)}</Text>
                </View>

                <View style={styles.bagage}>
                    <Text style={styles.textBagage}>Bagage : {bagage.length}</Text>
                </View>
                <View style={styles.bodyMidBot}>
                    <View style={styles.trajetDepart}>
                        <Text style={styles.textTrajet}>Lieu de Départ : {trajet?.departure}</Text>
                        <Text style={styles.textTrajet}>Heure : {extractTime(trajet?.departureTime)}</Text>
                    </View>
                    <View style={styles.trajetArrivee}>
                        <Text style={styles.textTrajet}>Lieu d'Arrivée : {trajet?.arrival}</Text>
                        <Text style={styles.textTrajet}>Heure : {extractTime(trajet?.arrivalTime)}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.buttonScanBagage} onPress={() => setCameraActive(true)}><Text style={styles.scan}>Scanner le code des bagages</Text></TouchableOpacity>
                <TouchableOpacity style={styles.buttonScan} onPress={() => setCameraActive(true)}><Text style={styles.scan}>Scanner le code du voyage</Text></TouchableOpacity>
            </View>
            <View style={styles.buttonSection}>
                <TouchableOpacity style={styles.buttonProbleme} onPress={() => setModalVisible(true)}><Text style={styles.probleme}>Signaler un problème ?</Text></TouchableOpacity>
                <TouchableOpacity style={styles.buttonValider} onPress={() => validerTrajet()}><Text style={styles.valider}>Valider voyage</Text></TouchableOpacity>
            </View>

            {cameraActive && hasPermission && (
                <View style={styles.scanContainer}>
                    <CameraView style={styles.camera} facing={facing} barcodeScannerSettings={{ barcodeTypes: ["qr"], }} onBarcodeScanned={onScan}>
                        <View style={styles.scanZone} />
                    </CameraView>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setCameraActive(false)}>
                        <Ionicons name="close" size={32} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Signaler un problème</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Décrivez le problème ici..."
                            placeholderTextColor="white"
                            value={problemMessage}
                            onChangeText={setProblemMessage}
                            multiline
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={sendProblemMessage}>
                            <Text style={styles.modalButtonText}>Envoyer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCloseButtonText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 10,
    },
    header: {
        backgroundColor: '#192031',
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textHeader: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    body: {
        padding: 10,
        borderWidth: 0.3,
        borderColor: 'gray',
        width: '95%',
        height: '50%',
        backgroundColor: '#2D3956',
    },
    bodyTop: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bodyMiddle: {
        padding: 10,
    },
    textMiddle: {
        fontSize: 18,
        color: 'white',
    },
    textTop: {
        fontSize: 18,
        color: 'white',
    },
    bodyMidBot: {
        borderWidth: 0.2,
        padding: 10,
        backgroundColor: '#334160',
        marginTop: 30,
    },
    textBottom: {
        fontSize: 18,
        color: 'white',
    },
    bodyTopMid: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    trajetDepart: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    trajetArrivee: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textTrajet: {
        fontSize: 14,
        color: 'white',
        fontWeight: 'bold',
    },
    buttonSection: {
        marginTop: 10,
        width: '95%',
        alignItems: 'center',
    },
    buttonProbleme: {
        borderColor: '#df6058',
        borderWidth: 2,
        padding: 10,
        borderRadius: 2,
        margin: 10,
        width: '100%',
        height: 50,
        justifyContent: 'center',
    },
    buttonScan: {
        backgroundColor: '#12B3A8',
        padding: 10,
        borderRadius: 2,
        margin: 10,
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    probleme: {
        color: '#df6058',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    scan: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    bagage: {
        padding: 10,
    },
    textBagage: {
        fontSize: 18,
        color: 'white',
    },
    scanContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    camera: {
        width: '100%',
        height: '100%',
    },
    scanZone: {
        position: 'absolute',
        top: '35%', left: '25%',
        width: 200,
        height: 200,
        backgroundColor: 'transparent',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 50,
        padding: 10,
    },
    buttonValider: {
        borderColor: 'green',
        backgroundColor: "green",
        borderWidth: 2,
        padding: 10,
        borderRadius: 2,
        margin: 10,
        width: '100%',
        height: 50,
        justifyContent: 'center',
    },
    valider: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#192031',
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white',
    },
    modalInput: {
        height: 100,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#2D3956',
    },
    modalButton: {
        backgroundColor: '#12B3A8',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalCloseButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#df6058',
        fontWeight: 'bold',
    },

    buttonScanBagage: {
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 2,
        margin: 10,
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignSelf: 'center',
    },
});
