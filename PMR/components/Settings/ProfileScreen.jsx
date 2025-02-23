import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoContext } from '../Photos/PhotoContext2';
import EditProfile from './EditProfile';
import { API_CONFIG } from '../../constants/API_CONFIG';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const router = useRouter();
  const auth = getAuth();
  const [id, setId] = useState(null);
  const { photo, setPhoto } = React.useContext(PhotoContext);

  // Récupérer le profil de l'utilisateur en utilisant BASE_URL
  const fetchUserProfile = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Erreur', 'Utilisateur non authentifié.');
        return;
      }
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/byGoogleID/${userId}`);
      if (response.ok) {
        const responseData = await response.json();
        setId(responseData.id);
        setProfile({
          firstName: responseData.firstname,
          lastName: responseData.lastname,
          email: responseData.email,
          tel: responseData.tel,
        });
        setEditedProfile({
          firstName: responseData.firstname,
          lastName: responseData.lastname,
          email: responseData.email,
          tel: responseData.tel,
          password: '',
        });
      } else {
        Alert.alert('Erreur', 'Données utilisateur non disponibles.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les données utilisateur.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour.');
      Alert.alert('Succès', 'Profil mis à jour.');
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
    }
  };

  const handleDeleteProfile = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = auth.currentUser?.uid;
              const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/byGoogleID/${userId}`);
              if (!response.ok) throw new Error('Erreur lors de la suppression des données utilisateur.');
              
              const responseData = await response.json();
              const deleteResponse = await fetch(`${API_CONFIG.BASE_URL}/api/user/delete/${responseData.id}`, {
                method: 'DELETE',
              });

              if (!deleteResponse.ok) throw new Error('Erreur lors de la suppression dans la base de données.');

              await auth.currentUser?.delete();
              Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès.');
              router.replace('/');
            } catch (error) {
              console.error('Erreur lors de la suppression du profil :', error.message);
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'Reconnexion requise',
                  'Vous devez vous reconnecter récemment pour supprimer votre compte. Veuillez vous déconnecter et vous reconnecter.',
                );
              } else {
                Alert.alert('Erreur', 'Impossible de supprimer le profil.');
              }
            }
          },
        },
      ],
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter.');
            }
          },
        },
      ],
    );
  };

  const handlePhotoPress = async () => {
    Alert.alert(
      "Modifier la photo de profil",
      "Choisissez une option :",
      [
        {
          text: "Prendre une photo",
          onPress: () => pickImage('camera'),
        },
        {
          text: "Choisir dans la galerie",
          onPress: () => pickImage('gallery'),
        },
        {
          text: "Supprimer la photo",
          onPress: deletePhoto,
          style: "destructive",
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ]
    );
  };

  const pickImage = async (source) => {
    // Demander les permissions en fonction de la source (caméra ou galerie)
    let permissionResult;
    if (source === 'camera') {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    if (permissionResult.status !== 'granted') {
      alert("Désolé, nous avons besoin de la permission d'accéder à la galerie ou à l'appareil photo pour continuer.");
      return;
    }

    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      const fileName = `profile_${Date.now()}.jpg`;
      const filePath = `${FileSystem.documentDirectory}Photos/${fileName}`;

      try {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}Photos/`, { intermediates: true });
        await FileSystem.copyAsync({
          from: selectedImage,
          to: filePath,
        });

        setPhoto({ uri: filePath });
        await AsyncStorage.setItem(`profilePhoto_${auth.currentUser?.uid}`, filePath);
        await MediaLibrary.createAssetAsync(filePath);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'image :", error);
      }
    }
  };

  const deletePhoto = async () => {
    try {
      await AsyncStorage.removeItem(`profilePhoto_${auth.currentUser?.uid}`);
      setPhoto(require("./../../assets/Profile/profil.jpeg"));
    } catch (error) {
      console.error("Erreur lors de la suppression de la photo :", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const loadSavedPhoto = async () => {
      try {
        const savedPhoto = await AsyncStorage.getItem(`profilePhoto_${auth.currentUser?.uid}`);
        if (savedPhoto) {
          setPhoto({ uri: savedPhoto });
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la photo :", error);
      }
    };
    loadSavedPhoto();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Impossible de charger le profil utilisateur.</Text>
      </View>
    );
  }

  const renderUserInfo = () => (
    <View style={styles.profileContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Prénom</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{profile.firstName}</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{profile.lastName}</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{profile.email}</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Téléphone</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{profile.tel || 'Non renseigné'}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, styles.editButton]} 
        onPress={() => setIsEditing(true)}
      >
        <Text style={styles.buttonText}>Modifier le profil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteProfile}>
        <Text style={styles.buttonText}>Supprimer le compte</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image 
          source={photo?.uri ? { uri: photo.uri } : require("./../../assets/Profile/profil.jpeg")}
          style={styles.avatar}
        />
        <TouchableOpacity 
          style={styles.editPhotoButton} 
          onPress={handlePhotoPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="edit-2" size={16} color="#192031" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {isEditing ? (
          <EditProfile
            editedProfile={editedProfile}
            onChange={setEditedProfile}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          renderUserInfo()
        )}
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleSignOut}>
          <Text style={[styles.buttonText, { color: '#FF5252', textDecorationLine: 'underline' }]}>
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#42547e',
    padding: 20,
    paddingTop: 50,
  },
  avatarContainer: {
    position: 'relative',
    width: 70,
    height: 70,
    marginBottom: 20,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#12B3A8',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  mainContent: {
    width: 370,
    alignItems: 'center',
  },
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
    width: '90%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 5,
    fontWeight: '600',
  },
  valueContainer: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C3A4A',
    borderRadius: 15,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A3A4A',
  },
  value: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
  editButton: {
    backgroundColor: '#12B3A8',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 12,
    marginTop: 5,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#192031',
  },
  errorText: {
    color: '#FF5252',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;
