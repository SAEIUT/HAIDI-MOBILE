import { ProgressBar, Colors } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function BarreVoyage({ points, ordre }) {
    const icones = {
        Train: (props) => <FontAwesome name="train" size={18} {...props} />,
        Taxi: (props) => <FontAwesome name="taxi" size={18} {...props} />,
        Plane: (props) => <FontAwesome name="plane" size={18} {...props} />,
        Bus: (props) => <FontAwesome name="bus" size={18} {...props} />,
    };

    const princesse = () => {
        return ordre.map((transport, index) => (
            <View key={index} style={styles.progressItem}>
                {icones[transport] && icones[transport]}
                <ProgressBar progress={undefined}  style={styles.progressBar} />
            </View>
        ));
    };

    return <View style={styles.container}>{princesse()}</View>;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: 10,
    },
    progressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    progressBar: {
        width: 100,
        height: 5,
    },
});