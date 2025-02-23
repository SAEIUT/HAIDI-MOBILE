import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/API_CONFIG';

// Créez un contexte pour la photo
export const PhotoContext = createContext();

// Créez un fournisseur de contexte
export const PhotoProvider = ({ children }) => {
  const [photo, setPhoto] = useState(require("./../../assets/Profile/profil.jpeg")); // Photo par défaut
  const [userId, setUserId] = useState(null);

  // Charger l'ID utilisateur via le token
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) return;

        const response = await fetch(`${API_CONFIG.BASE_URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (response.ok) {
          setUserId(data.user.uid); // Récupération de l'ID utilisateur
        } else {
          console.log("Erreur API:", data.error);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'ID utilisateur :", error);
      }
    };

    fetchUserId();
  }, []);

  // Charger la photo sauvegardée après avoir récupéré l'ID utilisateur
  useEffect(() => {
    if (!userId) return;

    const loadPhoto = async () => {
      try {
        const savedPhoto = await AsyncStorage.getItem(`profilePhoto_${userId}`);
        if (savedPhoto) {
          setPhoto({ uri: savedPhoto }); // Met à jour la photo avec celle enregistrée
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la photo :", error);
      }
    };

    loadPhoto();
  }, [userId]);

  return (
    <PhotoContext.Provider value={{ photo, setPhoto }}>
      {children}
    </PhotoContext.Provider>
  );
};
