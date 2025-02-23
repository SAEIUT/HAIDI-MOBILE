import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

const PROFILE_IMAGE_KEY = 'profileImageUri'; // Clé pour stocker l'URI de l'image

export const ProfileContext = createContext({
  profileImage: require("../../assets/Profile/profil.jpeg"), // Valeur par défaut
  saveImage: () => {}, // Fonction par défaut
  deleteImage: () => {}, // Fonction par défaut
});

export const ProfileProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(require("../../assets/Profile/profil.jpeg")); // Image par défaut

  // Charger l'image sauvegardée au démarrage
  useEffect(() => {
    const loadSavedImage = async () => {
      const savedImageUri = await SecureStore.getItemAsync(PROFILE_IMAGE_KEY);
      if (savedImageUri) {
        setProfileImage({ uri: savedImageUri });
      }
    };
    loadSavedImage();
  }, []);

  // Sauvegarder l'image dans le stockage local
  const saveImage = async (uri) => {
    const fileName = uri.split('/').pop(); // Extraire le nom du fichier
    const newPath = FileSystem.documentDirectory + fileName; // Chemin de destination

    try {
      await FileSystem.copyAsync({ from: uri, to: newPath }); // Copier l'image
      await SecureStore.setItemAsync(PROFILE_IMAGE_KEY, newPath); // Sauvegarder le chemin
      setProfileImage({ uri: newPath }); // Mettre à jour l'état
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'image :', error);
    }
  };

  // Supprimer l'image et revenir à l'image par défaut
  const deleteImage = async () => {
    await SecureStore.deleteItemAsync(PROFILE_IMAGE_KEY); // Supprimer l'URI sauvegardée
    setProfileImage(require("../../assets/Profile/profil.jpeg")); // Revenir à l'image par défaut
  };

  return (
    <ProfileContext.Provider value={{ profileImage, saveImage, deleteImage }}>
      {children}
    </ProfileContext.Provider>
  );
};