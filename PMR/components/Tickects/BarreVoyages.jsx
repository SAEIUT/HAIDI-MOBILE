import { ProgressBar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

export default function BarreVoyage({ points, ordre, statut }) {
    const princesse = () => {
        return ordre.map((progress, index) => (
            <View key={index} style={styles.progressItem}>
                <ProgressBar progress={progress / 2} style={styles.progressBar} color={"#23b44d"} />
            </View>
        ));
    };

    return <View style={styles.container}>{princesse()}</View>;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', // Aligne les barres horizontalement
        marginTop: 10,
        width: '100%', // Prend toute la largeur du parent
    },
    progressItem: {
        flex: 1, // Chaque élément occupe un espace proportionnel
        marginHorizontal: 5, // Espacement horizontal entre les barres
    },
    progressBar: {
        height: 7,
        borderRadius: 4,
        backgroundColor: "#ccc"
    },
});
