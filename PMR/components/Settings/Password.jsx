import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/API_CONFIG';

export default function Password({  onChange, onSave, onCancel }) {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwords, setPasswords] = useState({});


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('userUid');
        if (!storedUid) {
          Alert.alert('Erreur', 'Utilisateur non authentifié.');
          return;
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/${storedUid}`);
        const response2 = await fetch(`${API_CONFIG.BASE_URL}/user/byGoogleID/${storedUid}`);

        if (!response.ok || !response2.ok) {
          Alert.alert('Erreur', 'Impossible de récupérer les données utilisateur.');
          return;
        }

        console.log("voici le mot de passeee : ", passwords);
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', 'Une erreur est survenue lors du chargement du profil.');
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = () => {
    if (passwords.password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
    } else {
      setError('');
      onSave();
    }
  };

  return (
    <View style={styles.profileContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          value={passwords.password}
          onChangeText={(text) => onChange({ ...passwords, password: text })}
          placeholder="Entrez un nouveau mot de passe"
          placeholderTextColor="#888"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmer le mot de passe</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirmer le nouveau mot de passe"
          placeholderTextColor="#888"
          secureTextEntry
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
        <Text style={styles.buttonText}>Sauvegarder</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
        <Text style={styles.buttonText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E1E2D',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C3A4A',
    borderRadius: 15,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3A3A4A',
  },
  button: {
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: '#12B3A8',
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
