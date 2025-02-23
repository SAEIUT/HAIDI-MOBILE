import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { getTrajet, retrievePassenger, changeTrajetStatue, formatDate, calculerAge, getStuff, extractTime } from "./api.js";

export default function CurrentTrajet({ idDossier, idTrajet }) {
    const [bagage, setBagage] = useState([]);
    const [trajet, setTrajet] = useState(null);
    const [pmr, setPmr] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
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
    }, []);

    const onScan = (result) => {
        if (result) {
            console.log("QR Code detected:", result.data);
            console.log("Trajet status:", trajet.statusValue);
            console.log("id Dossier:", idDossier);
            console.log("id Trajet:", idTrajet);
            changeTrajetStatue(idDossier, idTrajet, trajet.statusValue);
            setCameraActive(false);
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
                { text: "Valider", onPress: () => redirect() },
            ]
        );
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
                    <Text style={styles.textTop}>Nom : {pmr.firstname + " " + pmr.lastname}</Text>
                    <Text style={styles.textTop}>Handicape : {pmr.handicap}</Text>
                </View>
                <View style={styles.bodyTopMid}>
                    <Text style={styles.textMiddle}>Age : {calculerAge(pmr.birthdate)}</Text>
                    <Text style={styles.textMiddle}>Naissance : {formatDate(pmr.birthdate)}</Text>
                </View>

                <View style={styles.bagage}>
                    <Text style={styles.textBagage}>Bagage : {bagage.length}</Text>

                </View>
                <View style={styles.bodyMidBot}>
                    <View style={styles.trajetDepart}>
                        <Text style={styles.textTrajet}>Lieu de Départ : {trajet.departure}</Text>
                        <Text style={styles.textTrajet}>Heure : {extractTime(trajet.departureTime)}</Text>
                    </View>
                    <View style={styles.trajetArrivee}>
                        <Text style={styles.textTrajet}>Lieu d'Arrivée : {trajet.arrival}</Text>
                        <Text style={styles.textTrajet}>Heure : {extractTime(trajet.arrivalTime)}</Text>
                    </View>

                </View>
                <TouchableOpacity style={styles.buttonScan} onPress={() => setCameraActive(true)}><Text style={styles.scan}>Scanner le code</Text></TouchableOpacity>

            </View>
            <View style={styles.buttonSection}>
                <TouchableOpacity style={styles.buttonProbleme} onPress={() => { }}><Text style={styles.probleme}>Signaler un problème ?</Text></TouchableOpacity>
                <TouchableOpacity style={styles.buttonValider} onPress={() => validerTrajet()}><Text style={styles.valider}>Valider voyage</Text></TouchableOpacity>
            </View>

            {cameraActive && hasPermission && (
                <CameraView style={styles.scanContainer} facing={facing} barcodeScannerSettings={{ barcodeTypes: ["qr"], }} onBarcodeScanned={onScan}>
                    <View style={styles.scanZone} />
                </CameraView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#192031',
        padding: 10,
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
        height: '60%',
        backgroundColor: '#2D3956',
    },
    bodyTop: {
        padding: 10,
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
    scanZone: {
        width: 200,
        height: 200,
        backgroundColor: 'transparent',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
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

});
