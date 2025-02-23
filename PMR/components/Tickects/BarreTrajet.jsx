import { ProgressBar, Colors } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

export default function BarreTrajet({progression}) {
    
    const princesse = () => {
        return <ProgressBar progress={progression / 2}  style={styles.container} color={"#23b44d"}/>;
    };

    return <View>{princesse()}</View>;
}

const styles = StyleSheet.create({
    container: {
        marginTop: 5,
        height: 4,
        borderRadius: 4,
        backgroundColor: "#ccc"
    },
});