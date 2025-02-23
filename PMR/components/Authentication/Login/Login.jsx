import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { Link } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);  

    const handleLogin = () => {
        Alert.alert("Test");
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.inputEmail}>Email</Text>
            <TextInput
                style={[styles.input, focusedInput === 'email' && styles.inputFocused]} 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
            />
            <Text style={styles.inputPassword}>Password</Text>
            <TextInput
                style={[styles.input, focusedInput === 'password' && styles.inputFocused]} 
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
            <Link href="./Register" style={styles.pasCompte}>
                <Text>You don't have an account ?</Text>
            </Link>
            <Text style={styles.mdpOublie}>Forgotten password ?</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#192032',
        borderTopEndRadius: 60,
        borderTopStartRadius: 60,
        alignContent: 'center',
        padding: 5,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '80%',
    },
    title: {
        fontSize: 46,
        marginBottom: "10%",
        textAlign: 'center',
        marginTop: "10%",
        color: 'white',
        fontWeight: 'bold',

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
    inputFocused: {
        borderColor: 'black', 
        backgroundColor: '#F5F5F5',  
        borderWidth: 2,  
    },
    loginButton: {
        width: '70%',
        alignSelf: 'center',
        backgroundColor: '#12B4A9',
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: "5%",
        marginTop: "20%",
        padding: 10,
    },
    loginText: {
        color: 'white',
        fontSize: 20,
    },
    pasCompte: {
        textAlign: 'center',
        fontSize: 13,
        color: 'white',
        marginBottom: "2%",
    },
    mdpOublie: {
        textAlign: 'center',
        fontSize: 13,
        color: 'white',
    },
    inputEmail: {
        marginLeft: '10%',
        marginBottom: '1%',
        fontSize: 16,
        color: 'white',
    },
    inputPassword: {
        marginLeft: '10%',
        marginBottom: '1%',
        color: 'white',
    },
});
