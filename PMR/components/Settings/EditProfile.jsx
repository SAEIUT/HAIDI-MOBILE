import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Password from './Password'; // Assurez-vous que ce fichier existe

const EditProfile = ({ editedProfile, onChange, onSave, onCancel, passwords }) => {
  const [showPasswordPage, setShowPasswordPage] = useState(false);



  return (
    <>

      {showPasswordPage ? (
        <Password
          passwords={passwords}
          onChange={onChange}
          onSave={() => {
            onSave();
            setShowPasswordPage(false); // Fermer la page après la sauvegarde
          }}
          onCancel={() => setShowPasswordPage(false)} // Fermer la page sans sauvegarder
        />
      ) : (
        <View style={styles.profileContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={editedProfile.firstName}
              onChangeText={(text) => onChange({ ...editedProfile, firstName: text })}
              placeholder="Entrez votre prénom"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={editedProfile.lastName}
              onChangeText={(text) => onChange({ ...editedProfile, lastName: text })}
              placeholder="Entrez votre nom"
              placeholderTextColor="#888"
            />
          </View>

          {/* <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={editedProfile.email}
              onChangeText={(text) => onChange({ ...editedProfile, email: text })}
              placeholder="Entrez votre email"
              placeholderTextColor="#888"
              keyboardType="email-address"
            />
          </View> */}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={editedProfile.tel}
              onChangeText={(text) => onChange({ ...editedProfile, tel: text })}
              placeholder="Entrez votre téléphone"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setShowPasswordPage(true)} // Afficher la page Password
          >
            <Text style={styles.buttonText}>Modifier votre mot de passe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={onSave}>
            <Text style={styles.buttonText}>Sauvegarder</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

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
});

export default EditProfile;