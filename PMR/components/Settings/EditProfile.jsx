import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const EditProfile = ({ editedProfile, onChange, onSave, onCancel }) => {
  // Fonction pour générer un champ avec icône
  const renderInputField = (icon, label, value, placeholder, onChangeKey, keyboardType = 'default', secureTextEntry = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => onChange({ ...editedProfile, [onChangeKey]: text })}
          placeholder={placeholder}
          placeholderTextColor="#8A94A6"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.profileContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <Text style={styles.headerSubtitle}>Mettez à jour vos informations personnelles</Text>
      </View>

      <View style={styles.fieldsContainer}>
        {renderInputField(
          <Ionicons name="person-outline" size={20} color="#12B3A8" />,
          "Prénom",
          editedProfile.firstName,
          "Entrez votre prénom",
          "firstName"
        )}

        {renderInputField(
          <Ionicons name="person-outline" size={20} color="#12B3A8" />,
          "Nom",
          editedProfile.lastName,
          "Entrez votre nom",
          "lastName"
        )}

        {renderInputField(
          <Ionicons name="mail-outline" size={20} color="#12B3A8" />,
          "Email",
          editedProfile.email,
          "Entrez votre email",
          "email",
          "email-address"
        )}

        {renderInputField(
          <Ionicons name="call-outline" size={20} color="#12B3A8" />,
          "Téléphone",
          editedProfile.tel,
          "Entrez votre téléphone",
          "tel",
          "phone-pad"
        )}

        {renderInputField(
          <Ionicons name="lock-closed-outline" size={20} color="#12B3A8" />,
          "Mot de passe",
          editedProfile.password,
          "Entrez un nouveau mot de passe",
          "password",
          "default",
          true
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={onSave}
          activeOpacity={0.8}
        >
          <Feather name="check" size={18} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Sauvegarder</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Feather name="x" size={18} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    width: '100%',
    backgroundColor: '#263142',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  headerContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    backgroundColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  fieldsContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#374151',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 4,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#12B3A8',
  },
  cancelButton: {
    backgroundColor: '#4B5563',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default EditProfile;