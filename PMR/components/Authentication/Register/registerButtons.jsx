import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, style, disabled }) => {
    return (
        !disabled&& ( 
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, style, disabled && styles.disabled]}
            disabled={disabled}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
        )
    );
};

export default CustomButton;

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#69B7F6',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '70%',
        
    },
    text: {
        color: 'white',
        fontSize: 16,
    },
    disabled: {
        backgroundColor: '#A9A9A9',
    },
});
