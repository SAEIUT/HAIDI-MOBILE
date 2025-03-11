import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const profileComp = ({ item, onValueChange }) => {
    return (
        <>
            {item.type === 'input' && (
                <View style={styles.container}>
                    <Text style={styles.text}>{item.title}</Text>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={item.secureTextEntry}
                        onChangeText={(text) => onValueChange(item.id, text)}
                    />
                </View>
            )}
            {item.type === 'dropdown' && (
                <View style={styles.container}>
                    <Text style={styles.text}>{item.title}</Text>
                    <Picker
                        selectedValue={item.selectedValue}
                        onValueChange={(value) => onValueChange(item.id, value)}
                        style={styles.dropdown}
                    >
                        {item.options.map((option, index) => (
                            <Picker.Item label={option.title} value={option.value} key={index} />
                        ))}
                    </Picker>
                </View>
            )}
        </>
    );
};



const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'static'
    },
    text: {
        fontSize: 16,
        marginLeft: '10%',
        marginBottom: '1%',
        color: 'white',

    },
    input: {
        height: 40,
        borderColor: '#988F8F',
        borderWidth: 1,
        marginBottom: '5%',
        paddingHorizontal: 8,
        width: '80%',
        alignSelf: 'center',
        backgroundColor: '#E9E9E9',
    },
    dropdown: {
        height: 30,
        width: '80%',
        alignSelf: 'center',
        backgroundColor: '#E9E9E9',
    },
    
});

export default profileComp;
