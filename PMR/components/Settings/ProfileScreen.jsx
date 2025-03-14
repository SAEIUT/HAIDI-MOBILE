import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoContext } from '../Photos/PhotoContext2';
import EditProfile from './EditProfile';
import { API_CONFIG } from '../../constants/API_CONFIG';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Speech from 'expo-speech';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const router = useRouter();
  const [id, setId] = useState(null);
  const { photo, setPhoto } = React.useContext(PhotoContext);
  const [userID, setUserID] = useState(null);
  
  // États pour les fonctionnalités d'accessibilité
  const [largeText, setLargeText] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [voiceOverEnabled, setVoiceOverEnabled] = useState(false);
  const [accessibilityExpanded, setAccessibilityExpanded] = useState(false);

  // Récupérer l'UID et charger le profil utilisateur
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('userUid');
        if (!storedUid) {
          Alert.alert('Erreur', 'Utilisateur non authentifié.');
          router.replace('/Login');
          return;
        }

        setUserID(storedUid);

        const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/${storedUid}`);
        const response2 = await fetch(`${API_CONFIG.BASE_URL}/user/byGoogleID/${storedUid}`);

        if (!response.ok) {
          Alert.alert('Erreur', 'Impossible de récupérer les données utilisateur.');
          return;
        }

        const responseData = await response.json();
        const responseData2 = await response2.json();

        setId(responseData2.id);

        setProfile({
          firstName: responseData.user.firstName || responseData.user.firstname,
          lastName: responseData.user.lastName || responseData.user.lastname,
          email: responseData.user.Email || responseData.user.email,
          tel: responseData.user.Tel,
        });

        setEditedProfile({
          firstName: responseData.user.firstName || responseData.user.firstname,
          lastName: responseData.user.lastName || responseData.user.lastname,
          email: responseData.user.Email || responseData.user.email,
          tel: responseData.user.Tel,
          password: '',
        });

        // Charger les préférences d'accessibilité
        loadAccessibilitySettings(storedUid);
      } catch (error) {
        Alert.alert('Erreur', 'Une erreur est survenue lors du chargement du profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Charger les paramètres d'accessibilité depuis AsyncStorage
  const loadAccessibilitySettings = async (uid) => {
    try {
      const largeTextSetting = await AsyncStorage.getItem(`accessibility_largeText_${uid}`);
      const colorBlindSetting = await AsyncStorage.getItem(`accessibility_colorBlind_${uid}`);
      const voiceOverSetting = await AsyncStorage.getItem(`accessibility_voiceOver_${uid}`);
      
      if (largeTextSetting !== null) setLargeText(largeTextSetting === 'true');
      if (colorBlindSetting !== null) setColorBlindMode(colorBlindSetting === 'true');
      if (voiceOverSetting !== null) setVoiceOverEnabled(voiceOverSetting === 'true');
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres d\'accessibilité:', error);
    }
  };

  // Sauvegarder les paramètres d'accessibilité
  const saveAccessibilitySetting = async (key, value) => {
    if (!userID) return;
    try {
      await AsyncStorage.setItem(`accessibility_${key}_${userID}`, value.toString());
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du paramètre ${key}:`, error);
    }
  };

  // Gestionnaires pour les changements d'accessibilité
  const handleLargeTextToggle = (value) => {
    setLargeText(value);
    saveAccessibilitySetting('largeText', value);
  };

  const handleColorBlindToggle = (value) => {
    setColorBlindMode(value);
    saveAccessibilitySetting('colorBlind', value);
  };

  const handleVoiceOverToggle = (value) => {
    setVoiceOverEnabled(value);
    saveAccessibilitySetting('voiceOver', value);
    
    if (value) {
      Speech.speak('Mode lecture à haute voix activé');
    } else {
      Speech.stop();
    }
  };

  // Fonction pour prononcer le texte sélectionné
  const speakText = (text) => {
    if (voiceOverEnabled) {
      Speech.speak(text, { language: 'fr' });
    }
  };

  // Mettre à jour le profil utilisateur
  const handleSaveProfile = async () => {
    try {
      // Mise à jour du profil dans la base MongoDB
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProfile),
      });
  
      // Mise à jour du profil dans Firebase
      const response2 = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/${userID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProfile),
      });
  
      // Vérification que les deux mises à jour se sont bien déroulées
      if (!response.ok || !response2.ok) {
        throw new Error('Erreur lors de la mise à jour.');
      }
  
      Alert.alert('Succès', 'Profil mis à jour avec succès.');
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
    }
  };
  
  // Supprimer le compte utilisateur
  const handleDeleteProfile = async () => {
    Alert.alert(
      'Confirmation de suppression',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { 
          text: 'Annuler', 
          style: 'cancel' 
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!userID) {
                Alert.alert('Erreur', 'Utilisateur non authentifié.');
                return;
              }

              const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/delete/${id}`, {
                method: 'DELETE',
              });

              if (!response.ok) throw new Error('Erreur lors de la suppression du compte.');

              Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès.');
              await AsyncStorage.removeItem('userUid');
              router.replace('/Login');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le profil.');
            }
          },
        },
      ],
    );
  };

  // Se déconnecter
  const handleSignOut = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { 
          text: 'Annuler', 
          style: 'cancel' 
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userUid');
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
      const filePath = `${FileSystem.documentDirectory}Photos/${fileName}`;

      try {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}Photos/`, { intermediates: true });
        await FileSystem.copyAsync({
          from: selectedImage,
          to: filePath,
        });

        setPhoto({ uri: filePath });
        await AsyncStorage.setItem(`profilePhoto_${userID}`, filePath);
        await MediaLibrary.createAssetAsync(filePath);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'image :", error);
      }
    }
  };

  const deletePhoto = async () => {
    try {
      await AsyncStorage.removeItem(`profilePhoto_${userID} `);
      setPhoto(require("./../../assets/Profile/profil.jpeg"));
    } catch (error) {
      console.error("Erreur lors de la suppression de la photo :", error);
    }
  };

  useEffect(() => {
    const loadSavedPhoto = async () => {
      try {
        const savedPhoto = await AsyncStorage.getItem(`profilePhoto_${userID}`);
        if (savedPhoto) {
          setPhoto({ uri: savedPhoto });
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la photo :", error);
      }
    };
    
    if (userID) {
      loadSavedPhoto();
    }
  }, [userID]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#12B3A8" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#FF5252" />
        <Text style={styles.errorText}>Impossible de charger le profil utilisateur.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.replace('/Login')}
        >
          <Text style={styles.retryButtonText}>Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Appliquer les styles en fonction des paramètres d'accessibilité
  const getTextStyle = (baseStyle) => {
    if (!largeText) return baseStyle;
    
    return {
      ...baseStyle,
      fontSize: typeof baseStyle.fontSize === 'number' ? baseStyle.fontSize * 1.3 : 18
    };
  };

  const getThemeColors = () => {
    if (!colorBlindMode) {
      return {
        primary: '#12B3A8',
        secondary: '#263142',
        danger: '#FF5252',
        background: '#192031',
        text: 'white',
        subtext: '#A0A0A0',
        divider: '#374151'
      };
    }
    
    // Palette adaptée pour daltoniens (protanopie/deutéranopie)
    return {
      primary: '#0072B2', // Bleu
      secondary: '#444444', // Gris foncé
      danger: '#D55E00',   // Orange
      background: '#222222', // Presque noir
      text: '#FFFFFF',      // Blanc
      subtext: '#BBBBBB',   // Gris clair
      divider: '#555555'    // Gris moyen
    };
  };

  const colors = getThemeColors();

  const renderProfileField = (icon, label, value) => (
    <TouchableOpacity 
      style={styles.fieldContainer}
      onPress={() => speakText(`${label}: ${value || 'Non renseigné'}`)}
      activeOpacity={voiceOverEnabled ? 0.6 : 1}
    >
      <View style={[styles.fieldIconContainer, { backgroundColor: `${colors.primary}26` }]}>
        {React.cloneElement(icon, { color: colors.primary })}
      </View>
      <View style={styles.fieldContent}>
        <Text style={getTextStyle({ ...styles.fieldLabel, color: colors.subtext })}>{label}</Text>
        <Text style={getTextStyle({ ...styles.fieldValue, color: colors.text })}>{value || 'Non renseigné'}</Text>
      </View>
    </TouchableOpacity>
  );

  // Section d'accessibilité
  const renderAccessibilitySection = () => (
    <View style={[styles.accessibilityContainer, { backgroundColor: colors.secondary }]}>
      <TouchableOpacity 
        style={styles.accessibilityHeader}
        onPress={() => {
          setAccessibilityExpanded(!accessibilityExpanded);
          speakText(accessibilityExpanded ? 'Options d\'accessibilité masquées' : 'Options d\'accessibilité affichées');
        }}
      >
        <View style={styles.accessibilityTitleContainer}>
          <MaterialCommunityIcons name="accessibility" size={20} color={colors.primary} style={styles.accessibilityIcon} />
          <Text style={getTextStyle({ ...styles.accessibilityTitle, color: colors.text })}>Accessibilité</Text>
        </View>
        <MaterialIcons 
          name={accessibilityExpanded ? "expand-less" : "expand-more"} 
          size={24} 
          color={colors.text} 
        />
      </TouchableOpacity>

      {accessibilityExpanded && (
        <View style={styles.accessibilityOptions}>
          <View style={styles.accessibilityOption}>
            <TouchableOpacity 
              style={styles.optionLabelContainer}
              onPress={() => speakText('Option de texte agrandi. Appuyez sur le bouton pour activer ou désactiver.')}
            >
              <MaterialIcons name="format-size" size={20} color={colors.primary} style={styles.optionIcon} />
              <Text style={getTextStyle({ ...styles.optionLabel, color: colors.text })}>Agrandir le texte</Text>
            </TouchableOpacity>
            <Switch
              value={largeText}
              onValueChange={handleLargeTextToggle}
              trackColor={{ false: '#3e3e3e', true: `${colors.primary}80` }}
              thumbColor={largeText ? colors.primary : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>

          <View style={styles.optionDivider} />

          <View style={styles.accessibilityOption}>
            <TouchableOpacity 
              style={styles.optionLabelContainer}
              onPress={() => speakText('Mode daltonien. Appuyez sur le bouton pour activer ou désactiver.')}
            >
              <MaterialIcons name="palette" size={20} color={colors.primary} style={styles.optionIcon} />
              <Text style={getTextStyle({ ...styles.optionLabel, color: colors.text })}>Mode daltonien</Text>
            </TouchableOpacity>
            <Switch
              value={colorBlindMode}
              onValueChange={handleColorBlindToggle}
              trackColor={{ false: '#3e3e3e', true: `${colors.primary}80` }}
              thumbColor={colorBlindMode ? colors.primary : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>

          <View style={styles.optionDivider} />

          <View style={styles.accessibilityOption}>
            <TouchableOpacity 
              style={styles.optionLabelContainer}
              onPress={() => speakText('Lecture à haute voix. Appuyez sur le bouton pour activer ou désactiver.')}
            >
              <MaterialIcons name="record-voice-over" size={20} color={colors.primary} style={styles.optionIcon} />
              <Text style={getTextStyle({ ...styles.optionLabel, color: colors.text })}>Lecture à haute voix</Text>
            </TouchableOpacity>
            <Switch
              value={voiceOverEnabled}
              onValueChange={handleVoiceOverToggle}
              trackColor={{ false: '#3e3e3e', true: `${colors.primary}80` }}
              thumbColor={voiceOverEnabled ? colors.primary : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderUserInfo = () => (
    <View style={[styles.profileContainer, { backgroundColor: colors.secondary }]}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image 
            source={photo?.uri ? { uri: photo.uri } : require("./../../assets/Profile/profil.jpeg")}
            style={[styles.avatar, { borderColor: colors.primary }]}
          />
          <TouchableOpacity 
            style={[styles.editPhotoButton, { backgroundColor: colors.primary }]} 
            onPress={handlePhotoPress}
          >
            <Feather name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.nameContainer}>
          <Text style={getTextStyle({ ...styles.userName, color: colors.text })}>{profile.firstName} {profile.lastName}</Text>
          <Text style={getTextStyle({ ...styles.userEmail, color: colors.subtext })}>{profile.email}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      <View style={styles.fieldsContainer}>
        {renderProfileField(
          <Ionicons name="person" size={20} />,
          "Prénom",
          profile.firstName
        )}
        
        {renderProfileField(
          <Ionicons name="person" size={20} />,
          "Nom",
          profile.lastName
        )}
        
        {renderProfileField(
          <Ionicons name="mail" size={20} />,
          "Email",
          profile.email
        )}
        
        {renderProfileField(
          <Ionicons name="call" size={20} />,
          "Téléphone",
          profile.tel
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]} 
          onPress={() => {
            setIsEditing(true);
            speakText('Mode édition de profil activé');
          }}
        >
          <Feather name="edit-2" size={18} color="white" />
          <Text style={getTextStyle(styles.actionButtonText)}>Modifier le profil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.danger }]} 
          onPress={handleDeleteProfile}
        >
          <Feather name="trash-2" size={18} color="white" />
          <Text style={getTextStyle(styles.actionButtonText)}>Supprimer le compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={getTextStyle({ ...styles.headerTitle, color: colors.text })}>Mon Profil</Text>
          </View>

          <View style={styles.mainContent}>
            {isEditing ? (
              <EditProfile
                editedProfile={editedProfile}
                onChange={setEditedProfile}
                onSave={handleSaveProfile}
                onCancel={() => {
                  setIsEditing(false);
                  speakText('Édition annulée');
                }}
                largeText={largeText}
                colors={colors}
              />
            ) : (
              <>
                {renderUserInfo()}
                <View style={{ height: 16 }} />
                {renderAccessibilitySection()}
              </>
            )}
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colorBlindMode ? '#444444' : '#2C3A4A' }]} 
        onPress={handleSignOut}
      >
        <Feather name="log-out" size={18} color="white" style={styles.logoutIcon} />
        <Text style={getTextStyle(styles.logoutText)}>Se déconnecter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#192031',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#192031',
    padding: 16,
  },
  header: {
    marginTop: 12,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  mainContent: {
    flex: 1,
  },
  profileContainer: {
    backgroundColor: '#263142',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  profileHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginRight: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#12B3A8',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#12B3A8',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  nameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginHorizontal: 20,
  },
  fieldsContainer: {
    padding: 20,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 179, 168, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    backgroundColor: '#12B3A8',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  dangerButton: {
    backgroundColor: '#FF5252',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C3A4A',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#192031',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#192031',
    padding: 24,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#12B3A8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  // Styles pour la section d'accessibilité
  accessibilityContainer: {
    backgroundColor: '#263142',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  accessibilityHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accessibilityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessibilityIcon: {
    marginRight: 12,
  },
  accessibilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  accessibilityOptions: {
    padding: 20,
    paddingTop: 0,
  },
  accessibilityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: 'white',
  },
  optionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  }
});

export default ProfileScreen;