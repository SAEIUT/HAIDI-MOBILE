import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import CurrentTrajet from '../../components/trajet/TrajetEnCours';
import { useRoute } from '@react-navigation/native';

export default function Trajet() {
    const route = useRoute();
    const [param, setParam] = useState([]);
    const [loading, setLoading] = useState(true);  // Nouvelle variable d'état pour le chargement

    const verifieParam = () => {
        return param !== null && param.length === 2; // Vérifie si les 2 paramètres sont présents
    };

    useEffect(() => {
        try {
            if (route.params && route.params["idDossier"] && route.params["numDossier"]) {
                setParam([route.params["idDossier"], route.params["numDossier"]]);
                console.log("Paramètres reçus :", param);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [route.params]);

    if (loading) {
        return (
            <SafeAreaView style={styles.notFound}>
                <Text style={styles.textNotFound}>Chargement...</Text>
            </SafeAreaView>
        );
    }

    return (
        verifieParam() ? (
            <SafeAreaView style={styles.container}>
                <CurrentTrajet idDossier={route.params["idDossier"]} idTrajet={route.params["numDossier"]} />
            </SafeAreaView>
        ) : (
            <SafeAreaView style={styles.notFound}>
                <View>
                    <Text style={styles.textNotFound}>Aucun trajet en cours</Text>
                </View>
            </SafeAreaView>
        )
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#192031",
    },
    notFound: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
        backgroundColor: "#192031",
    },
    textNotFound: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
    },
});
