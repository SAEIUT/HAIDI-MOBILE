import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoContext } from './PhotoContext2';
import { getAuth } from 'firebase/auth';

const PhotoButton = () => {
  const { photo, setPhoto } = useContext(PhotoContext);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Garder toutes les fonctions existantes...
  const photosFolderPath = `${FileSystem.documentDirectory}Photos/`;

  const checkIfFileExists = async (filePath) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.exists;
    } catch (error) {
      console.error("Erreur lors de la vérification du fichier :", error);
      return false;
    }
  };

  const savePhotoToStorage = async (filePath) => {
    try {
      if (userId) {
        await AsyncStorage.setItem(`profilePhoto_${userId}`, filePath);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la photo :", error);
    }
  };

  const loadPhotoFromStorage = async () => {
    try {
      if (userId) {
        const savedPhoto = await AsyncStorage.getItem(`profilePhoto_${userId}`);
        if (savedPhoto) {
          setPhoto({ uri: savedPhoto });
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la photo :", error);
    }
  };

  const saveImageToGallery = async (filePath) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert("Désolé, nous avons besoin de la permission d'accéder à la galerie pour enregistrer l'image.");
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(filePath);
      await MediaLibrary.createAlbumAsync('Photos', asset, false);
      console.log("Image enregistrée dans la galerie :", filePath);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'image dans la galerie :", error);
    }
  };

  React.useEffect(() => {
    loadPhotoFromStorage();
  }, [userId]);

  const pickImage = async (source) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
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
      const filePath = `${photosFolderPath}${fileName}`;

      try {
        await FileSystem.makeDirectoryAsync(photosFolderPath, { intermediates: true });
        await FileSystem.copyAsync({
          from: selectedImage,
          to: filePath,
        });

        const fileExists = await checkIfFileExists(filePath);

        if (fileExists) {
          setPhoto({ uri: filePath });
          await savePhotoToStorage(filePath);
          console.log("Image sauvegardée et affichée :", filePath);
          await saveImageToGallery(filePath);
        } else {
          console.error("Le fichier n'existe pas :", filePath);
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'image :", error);
      }
    }
  };

  const deletePhoto = async () => {
    try {
      if (userId) {
        await AsyncStorage.removeItem(`profilePhoto_${userId}`);
        setPhoto(require("./../../assets/Profile/profil.jpeg"));
        console.log("Photo supprimée et remplacée par la photo par défaut.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la photo :", error);
    }
  };

  const showOptions = () => {
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

  return (
    <TouchableOpacity 
      style={styles.editButton} 
      onPress={showOptions}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Feather name="edit-2" size={16} color="#192031" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  editButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
});

export default PhotoButton;