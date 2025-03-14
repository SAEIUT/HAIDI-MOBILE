import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router, useNavigation } from 'expo-router';
import { CameraView as ExpoCamera, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { API_CONFIG } from '../../constants/API_CONFIG';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Composant de barre de progression amélioré
const ProgressBar = ({ steps, currentStep }) => {
  return (
    <View style={styles.progressBarContainer}>
      {steps.map((step, index) => (
        <View key={index} style={styles.progressStepWrapper}>
          <View
            style={[
              styles.progressStep,
              index < currentStep && styles.completedStep,
              index === currentStep - 1 && styles.activeStep,
            ]}
          />
          {index < steps.length - 1 && (
            <View style={[
              styles.progressConnector,
              index < currentStep - 1 && styles.completedConnector
            ]} />
          )}
        </View>
      ))}
    </View>
  );
};

// Composant Input personnalisé
const CustomInput = ({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry, 
  keyboardType, 
  multiline,
  numberOfLines,
  onPressIcon,
  iconRight,
  onPress,
  editable = true
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={styles.inputContainer}
    >
      {icon && (
        <View style={styles.inputIconContainer}>
          {typeof icon === 'string' ? (
            <MaterialIcons name={icon} size={20} color="rgba(255, 255, 255, 0.6)" />
          ) : (
            icon
          )}
        </View>
      )}
      <TextInput
        style={[
          styles.input,
          multiline && { textAlignVertical: 'top', paddingTop: 12, height: numberOfLines * 24 },
          !editable && { color: 'rgba(255, 255, 255, 0.5)' }
        ]}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable && !onPress}
      />
      {iconRight && (
        <TouchableOpacity onPress={onPressIcon} style={styles.inputIconRight}>
          {iconRight}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// Composant Checkbox personnalisé
const CustomCheckbox = ({ label, checked, onPress }) => {
  return (
    <TouchableOpacity style={styles.checkboxItem} onPress={onPress}>
      <View style={[styles.checkboxCircle, checked && styles.checkboxCircleChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

// Composant Bouton personnalisé
const CustomButton = ({ title, onPress, style, textStyle, primary = true, icon = null, loading = false }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        primary ? styles.primaryButton : styles.secondaryButton,
        style
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.buttonIcon}>{icon}</View>}
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function Register() {
  // États pour les champs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [civility, setCivility] = useState('');
  const [tel, setTel] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // États pour la caméra
  const [cameraActive, setCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  // États pour les handicaps
  const [handicaps, setHandicaps] = useState({
    visuel: false,
    auditif: false,
    moteur: false,
    mental: false,
    autre: false,
  });
  const [autreHandicap, setAutreHandicap] = useState('');

  // États pour l'accompagnateur
  const [hasAccompagnateur, setHasAccompagnateur] = useState(false);
  const [accompagnateurInfo, setAccompagnateurInfo] = useState({
    firstName: '',
    lastName: '',
    age: '',
    birthdate: '',
    civility: '',
  });

  // État pour gérer l'étape actuelle
  const [currentStep, setCurrentStep] = useState(1);

  // État pour gérer l'affichage des modals
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isAccompagnateurPickerVisible, setIsAccompagnateurPickerVisible] = useState(false);

  const navigation = useNavigation();

  // Masquer l'en-tête de la navigation
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Fonction pour formater la date de naissance
  const formatBirthdate = (text) => {
    let formattedText = text.replace(/[^0-9]/g, '');
    if (formattedText.length > 2) {
      formattedText = formattedText.slice(0, 2) + '/' + formattedText.slice(2);
    }
    if (formattedText.length > 5) {
      formattedText = formattedText.slice(0, 5) + '/' + formattedText.slice(5, 9);
    }
    return formattedText;
  };

  const formatISOBirthdate = (text) => {
    let birthdateArray = birthdate.split('/');
    const jour = birthdateArray[0].padStart(2, '0');
    const mois = birthdateArray[1].padStart(2, '0');
    const annee = birthdateArray[2];
    return `${annee}-${mois}-${jour}`;
  }

  // Fonction pour gérer l'activation de la caméra
  const handleScanPress = async () => {
    Alert.alert(
      "Conditions Générales d'Utilisation",
      "En utilisant la fonction de scan de carte d'identité, vous acceptez que C&FM traite vos données personnelles conformément à nos CGU.",
      [
        {
          text: "En savoir plus",
          onPress: () => router.push("/cgu"),
          style: "default",
        },
        {
          text: "Refuser",
          style: "cancel",
        },
        {
          text: "Accepter",
          onPress: async () => {
            try {
              if (!permission?.granted) {
                const { status } = await requestPermission();
                if (status === 'granted') {
                  setHasPermission(true);
                  setCameraActive(true);
                } else {
                  Alert.alert(
                    "Permission refusée",
                    "L'accès à la caméra est nécessaire pour scanner votre carte d'identité.",
                    [
                      { text: "Réessayer", onPress: handleScanPress },
                      { text: "Annuler", style: "cancel" },
                    ]
                  );
                }
              } else {
                setHasPermission(true);
                setCameraActive(true);
              }
            } catch (error) {
              console.error("Erreur lors de la demande de permission:", error);
              Alert.alert("Erreur", "Impossible d'accéder à la caméra. Veuillez vérifier vos paramètres.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Fonction pour prendre la photo
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsLoading(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
        });

        const formData = new FormData();
        formData.append('image', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'id_card.jpg',
        });

        const response = await fetch(`http://${API_CONFIG.ipaddress}:80/api/textrecognition/analyze`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Server response was not ok');
        }

        const extractedInfo = await response.json();

        if (extractedInfo.data) {
          Alert.alert(
            "Informations trouvées",
            `Nom: ${extractedInfo.data.lastName}\nPrénom: ${extractedInfo.data.firstName}\nDate de naissance: ${extractedInfo.data.birthdate}\nCivilité: ${extractedInfo.data.civility}\n\nVoulez-vous utiliser ces informations ?`,
            [
              {
                text: "Oui",
                onPress: () => {
                  setFirstName(extractedInfo.data.firstName);
                  setLastName(extractedInfo.data.lastName);
                  setBirthdate(extractedInfo.data.birthdate);
                  setCivility(extractedInfo.data.civility);
                  setCameraActive(false);
                },
              },
              {
                text: "Non",
                style: "cancel",
                onPress: () => setCameraActive(false),
              },
            ]
          );
        } else {
          Alert.alert(
            "Attention",
            "Aucune information n'a pu être extraite de l'image. Veuillez réessayer avec une photo plus nette ou remplir les champs manuellement.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("Erreur lors de la prise de photo :", error);
        Alert.alert("Erreur", "Impossible de traiter l'image. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Fonction pour valider l'étape actuelle
  const validateStep = async (step) => {
    switch (step) {
      case 1:
        return firstName && lastName && birthdate && civility && civility !== "";
      case 2:
        if (!age || !tel || !email) {
          Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
          return false;
        }
      
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/check-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            Alert.alert("Erreur", "Problème de connexion au serveur.");
            return false;
          }

          const data = await response.json();

          if (data.exists) {
            Alert.alert("Erreur", "Un compte avec cet email existe déjà.");
            return false;
          }

        } catch (error) {
          console.error("Erreur lors de la vérification de l'email :", error);  
          Alert.alert("Erreur", "Impossible de vérifier l'email. Veuillez réessayer.");
          return false;
        }
      return true;
      case 3:
        return true; // Les handicaps sont optionnels
      case 4:
        return true; // Note est optionnelle
      case 5:
        if (!password || !confirmPassword) {
          Alert.alert('Erreur', 'Veuillez remplir les deux champs de mot de passe');
          return false;
        }
        if (password !== confirmPassword) {
          Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
          return false;
        }
        if (password.length < 8) {
          Alert.alert('Erreur', 'Le mot de passe doit faire au moins 8 caractères');
          return false;
        }
        return true;
      case 6:
        if (hasAccompagnateur) {
          const { firstName, lastName, age, birthdate, civility } = accompagnateurInfo;
          return firstName && lastName && age && birthdate && civility && civility !== "";
        }
        return true;
      default:
        return false;
    }
  };

  // Fonction pour passer à l'étape suivante
  const nextStep = async () => {
    const isValid = await validateStep(currentStep); // Attendre la validation
  
    if (isValid) {
      setCurrentStep((prevStep) => prevStep + 1); // Passe à l'étape suivante seulement si validé
    }
  };
  

  // Fonction pour revenir à l'étape précédente
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Fonction pour gérer l'inscription
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
  
    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
  
    if (!firstName || !lastName || !email || !password || !birthdate || !civility || civility === "" || !tel) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires !');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Appel pour l'inscription via Firebase
      const firebaseResponse = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstname: firstName,
          lastname: lastName,
          birthdate,
          civility,
          Tel: tel,
          Note: note || "", // Optionnel
          handicap: Object.values(handicaps).includes(true), // true si au moins un handicap est coché
        }),
      });
  
      if (!firebaseResponse.ok) {
        const errorData = await firebaseResponse.json();
        Alert.alert("Erreur", errorData.error || "Une erreur s'est produite lors de l'inscription Firebase.");
        return;
      }
  
      const firebaseData = await firebaseResponse.json();
      // Supposons que firebaseData contient l'uid de l'utilisateur
      const firebaseUID = firebaseData.user?.uid || firebaseData.uid;
  
      // Appel pour la création de l'utilisateur dans votre base de données
      const userResponse = await fetch(`${API_CONFIG.BASE_URL}/user`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: firstName,
          lastname: lastName,
          birthdate: formatISOBirthdate(birthdate),
          email,
          tel,
          password,
          civility,
          note,
          handicap: Object.values(handicaps).includes(true) ? 1 : 0,
          googleUUID: firebaseUID, // Utilisation de googleUUID récupéré depuis Firebase
        }),
      });
  
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        Alert.alert("Erreur", errorData.error || "Une erreur s'est produite lors de la création de l'utilisateur.");
        return;
      }
  
      Alert.alert(
        "Inscription réussie",
        "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        [
          {
            text: "Se connecter",
            onPress: () => router.replace("./Login")
          }
        ]
      );
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      Alert.alert("Erreur", "Une erreur est survenue. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour afficher l'étape actuelle
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>Informations personnelles</Text>
            {cameraActive ? (
              <View style={styles.cameraContainer}>
                <ExpoCamera
                  ref={cameraRef}
                  style={styles.camera}
                  type="back"
                  onMountError={(error) => {
                    console.error("Erreur montage caméra:", error);
                  }}
                >
                  {hasPermission && (
                    <View style={styles.overlay}>
                      <View style={styles.frame} />
                      <Text style={styles.instructionText}>
                        Positionnez votre carte d'identité dans le cadre
                      </Text>
                      <View style={styles.buttonContainer}>
                        {isLoading ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#12B3A8" />
                            <Text style={styles.loadingText}>Traitement en cours...</Text>
                          </View>
                        ) : (
                          <View style={styles.cameraButtonsRow}>
                            <CustomButton
                              title="Prendre la photo"
                              onPress={takePicture}
                              icon={<Ionicons name="camera" size={20} color="white" />}
                            />
                            <CustomButton
                              title="Annuler"
                              onPress={() => {
                                setCameraActive(false);
                                setHasPermission(false);
                              }}
                              primary={false}
                              icon={<Ionicons name="close" size={20} color="white" />}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                  {!hasPermission && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>Permission de caméra non accordée</Text>
                      <CustomButton
                        title="Réessayer"
                        onPress={handleScanPress}
                        icon={<Ionicons name="refresh" size={20} color="white" />}
                      />
                    </View>
                  )}
                </ExpoCamera>
              </View>
            ) : (
              <View style={styles.formSection}>
                <CustomButton
                  title="Scanner la carte d'identité"
                  onPress={handleScanPress}
                  style={styles.scanButton}
                  icon={<Ionicons name="id-card" size={20} color="white" />}
                />
                
                <CustomInput
                  icon={<FontAwesome5 name="user" size={18} color="rgba(255, 255, 255, 0.6)" />}
                  placeholder="Prénom"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                
                <CustomInput
                  icon={<FontAwesome5 name="user-tie" size={18} color="rgba(255, 255, 255, 0.6)" />}
                  placeholder="Nom"
                  value={lastName}
                  onChangeText={setLastName}
                />
                
                <CustomInput
                  icon="calendar-today"
                  placeholder="Date de naissance (JJ/MM/AAAA)"
                  value={birthdate}
                  onChangeText={(text) => setBirthdate(formatBirthdate(text))}
                  keyboardType="numeric"
                />
                
                <TouchableOpacity 
                  style={styles.civilitySelector}
                  onPress={() => setIsPickerVisible(true)}
                >
                  <View style={styles.inputIconContainer}>
                    <MaterialIcons name="person" size={20} color="rgba(255, 255, 255, 0.6)" />
                  </View>
                  <Text style={[styles.civilityText, !civility && styles.placeholderText]}>
                    {civility || "Civilité"}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color="rgba(255, 255, 255, 0.6)" />
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>Coordonnées</Text>
            <View style={styles.formSection}>
              <CustomInput
                icon="tag"
                placeholder="Âge"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
              
              <CustomInput
                icon="phone"
                placeholder="Téléphone"
                value={tel}
                onChangeText={setTel}
                keyboardType="phone-pad"
              />
              
              <CustomInput
                icon="email"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>Handicaps</Text>
            <View style={styles.formSection}>
              <Text style={styles.sectionSubtitle}>Sélectionnez vos handicaps si applicable :</Text>
              
              <View style={styles.checkboxContainer}>
                {Object.keys(handicaps).map((key) => (
                  <CustomCheckbox
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    checked={handicaps[key]}
                    onPress={() => setHandicaps({ ...handicaps, [key]: !handicaps[key] })}
                  />
                ))}
              </View>
              
              {handicaps.autre && (
                <CustomInput
                  icon="edit"
                  placeholder="Précisez votre handicap"
                  value={autreHandicap}
                  onChangeText={setAutreHandicap}
                />
              )}
            </View>
          </Animated.View>
        );
          
      case 4:
        return (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>Note complémentaire</Text>
            <View style={styles.formSection}>
              <Text style={styles.sectionSubtitle}>Ajoutez des informations supplémentaires si nécessaire :</Text>
              
              <CustomInput
                icon="note"
                placeholder="Notes supplémentaires (optionnel)"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
              />
            </View>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>Sécurité</Text>
            <View style={styles.formSection}>
              <Text style={styles.sectionSubtitle}>Créez un mot de passe sécurisé :</Text>
              
              <CustomInput
                icon="lock"
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                iconRight={
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                }
                onPressIcon={() => setShowPassword(!showPassword)}
              />
              
              <CustomInput
                icon="lock"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                iconRight={
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                }
                onPressIcon={() => setShowConfirmPassword(!showConfirmPassword)}
              />
              
              <View style={styles.passwordHint}>
                <Ionicons name="information-circle-outline" size={18} color="rgba(255, 255, 255, 0.7)" />
                <Text style={styles.hintText}>Le mot de passe doit contenir au moins 8 caractères</Text>
              </View>
            </View>
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>Accompagnateur</Text>
            <View style={styles.formSection}>
              <Text style={styles.questionText}>Avez-vous un accompagnateur ?</Text>
              
              <View style={styles.choiceButtons}>
                <TouchableOpacity
                  style={[styles.choiceButton, hasAccompagnateur && styles.choiceButtonActive]}
                  onPress={() => setHasAccompagnateur(true)}
                >
                  <Text style={styles.choiceButtonText}>Oui</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.choiceButton, !hasAccompagnateur && styles.choiceButtonActive]}
                  onPress={() => setHasAccompagnateur(false)}
                >
                  <Text style={styles.choiceButtonText}>Non</Text>
                </TouchableOpacity>
              </View>

              {hasAccompagnateur && (
                <Animated.View 
                  entering={FadeInDown.duration(300)}
                  style={styles.accompagnateurForm}
                >
                  <CustomInput
                    icon={<FontAwesome5 name="user" size={18} color="rgba(255, 255, 255, 0.6)" />}
                    placeholder="Prénom de l'accompagnateur"
                    value={accompagnateurInfo.firstName}
                    onChangeText={(text) =>
                      setAccompagnateurInfo({ ...accompagnateurInfo, firstName: text })
                    }
                  />
                  
                  <CustomInput
                    icon={<FontAwesome5 name="user-tie" size={18} color="rgba(255, 255, 255, 0.6)" />}
                    placeholder="Nom de l'accompagnateur"
                    value={accompagnateurInfo.lastName}
                    onChangeText={(text) =>
                      setAccompagnateurInfo({ ...accompagnateurInfo, lastName: text })
                    }
                  />
                  
                  <CustomInput
                    icon="tag"
                    placeholder="Âge"
                    value={accompagnateurInfo.age}
                    onChangeText={(text) =>
                      setAccompagnateurInfo({ ...accompagnateurInfo, age: text })
                    }
                    keyboardType="numeric"
                  />
                  
                  <CustomInput
                    icon="calendar-today"
                    placeholder="Date de naissance (JJ/MM/AAAA)"
                    value={accompagnateurInfo.birthdate}
                    onChangeText={(text) => {
                      const formatted = formatBirthdate(text);
                      setAccompagnateurInfo({ ...accompagnateurInfo, birthdate: formatted });
                    }}
                    keyboardType="numeric"
                  />
                  
                  <TouchableOpacity 
                    style={styles.civilitySelector}
                    onPress={() => setIsAccompagnateurPickerVisible(true)}
                  >
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="person" size={20} color="rgba(255, 255, 255, 0.6)" />
                    </View>
                    <Text style={[styles.civilityText, !accompagnateurInfo.civility && styles.placeholderText]}>
                      {accompagnateurInfo.civility || "Civilité de l'accompagnateur"}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color="rgba(255, 255, 255, 0.6)" />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  const steps = [1, 2, 3, 4, 5, 6];
  const getStepTitle = (step) => {
    switch(step) {
      case 1: return "Informations";
      case 2: return "Coordonnées";
      case 3: return "Handicaps";
      case 4: return "Notes";
      case 5: return "Sécurité";
      case 6: return "Accompagnateur";
      default: return "";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#192031" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/CMF_1.webp')}
                style={styles.logo}
              />
            </View>
          </View>
          
          <Text style={styles.pageTitle}>Création de compte</Text>
          
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <ProgressBar steps={steps} currentStep={currentStep} />
            <View style={styles.stepsLabelContainer}>
              {steps.map((step) => (
                <Text 
                  key={step} 
                  style={[
                    styles.stepLabel,
                    currentStep === step && styles.activeStepLabel
                  ]}
                  numberOfLines={1}
                >
                  {getStepTitle(step)}
                </Text>
              ))}
            </View>
          </View>

          {/* Form Section */}
          {renderStep()}

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <CustomButton
                title="Précédent"
                onPress={prevStep}
                style={styles.navButton}
                primary={false}
                icon={<Ionicons name="arrow-back" size={20} color="white" />}
              />
            )}
            
            {currentStep < 6 ? (
              <CustomButton
                title="Suivant"
                onPress={nextStep}
                style={[styles.navButton, currentStep === 1 && styles.navButtonFullWidth]}
                icon={<Ionicons name="arrow-forward" size={20} color="white" />}
              />
            ) : (
              <CustomButton
                title="S'inscrire"
                onPress={handleRegister}
                style={[styles.navButton, currentStep === 1 && styles.navButtonFullWidth]}
                loading={isLoading}
                icon={!isLoading && <Ionicons name="checkmark-circle" size={20} color="white" />}
              />
            )}
          </View>
          
          {/* Login Option */}
          <View style={styles.loginOption}>
            <Text style={styles.loginText}>Vous avez déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.push('./Login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <Modal
        transparent={true}
        visible={isPickerVisible}
        animationType="slide"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez votre civilité</Text>
              <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.civilityOptions}>
              {["Mr", "Mme", "Autre"].map((option) => (
                <TouchableOpacity 
                  key={option}
                  style={[
                    styles.civilityOption,
                    civility === option && styles.civilityOptionSelected
                  ]}
                  onPress={() => {
                    setCivility(option);
                    setIsPickerVisible(false);
                  }}
                >
                  <Text style={[
                    styles.civilityOptionText,
                    civility === option && styles.civilityOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                  {civility === option && (
                    <Ionicons name="checkmark-circle" size={20} color="#12B3A8" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.modalConfirmButton}
              onPress={() => setIsPickerVisible(false)}
            >
              <Text style={styles.modalConfirmButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={isAccompagnateurPickerVisible}
        animationType="slide"
        onRequestClose={() => setIsAccompagnateurPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Civilité de l'accompagnateur</Text>
              <TouchableOpacity onPress={() => setIsAccompagnateurPickerVisible(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.civilityOptions}>
              {["Mr", "Mme", "Autre"].map((option) => (
                <TouchableOpacity 
                  key={option}
                  style={[
                    styles.civilityOption,
                    accompagnateurInfo.civility === option && styles.civilityOptionSelected
                  ]}
                  onPress={() => {
                    setAccompagnateurInfo({ ...accompagnateurInfo, civility: option });
                    setIsAccompagnateurPickerVisible(false);
                  }}
                >
                  <Text style={[
                    styles.civilityOptionText,
                    accompagnateurInfo.civility === option && styles.civilityOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                  {accompagnateurInfo.civility === option && (
                    <Ionicons name="checkmark-circle" size={20} color="#12B3A8" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.modalConfirmButton}
              onPress={() => setIsAccompagnateurPickerVisible(false)}
            >
              <Text style={styles.modalConfirmButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#192031',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    marginBottom: 10,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressSection: {
    width: '100%',
    marginBottom: 24,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  progressStepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  completedStep: {
    backgroundColor: '#12B3A8',
  },
  activeStep: {
    backgroundColor: '#12B3A8',
    transform: [{ scale: 1.2 }],
    shadowColor: '#12B3A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  progressConnector: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 2,
  },
  completedConnector: {
    backgroundColor: '#12B3A8',
  },
  stepsLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    flex: 1,
    textAlign: 'center',
  },
  activeStepLabel: {
    color: '#12B3A8',
    fontWeight: 'bold',
  },
  stepContainer: {
    width: '100%',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  formSection: {
    width: '100%',
  },
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    height: '100%',
  },
  inputIconRight: {
    padding: 8,
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCircleChecked: {
    backgroundColor: '#12B3A8',
    borderColor: '#12B3A8',
  },
  checkboxLabel: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: '#12B3A8',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanButton: {
    marginBottom: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  navButtonFullWidth: {
    flex: 1,
  },
  cameraContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 4/3,
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    padding: 20,
  },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'white',
    margin: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  cameraButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  questionText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 16,
  },
  choiceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  choiceButton: {
    width: '48%',
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  choiceButtonActive: {
    borderColor: '#12B3A8',
    backgroundColor: 'rgba(18, 179, 168, 0.2)',
  },
  choiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  accompagnateurForm: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2C3A4A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  civilitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  civilityText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  civilityOptions: {
    width: '100%',
    marginVertical: 10,
  },
  civilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  civilityOptionSelected: {
    backgroundColor: 'rgba(18, 179, 168, 0.1)',
  },
  civilityOptionText: {
    color: 'white',
    fontSize: 16,
  },
  civilityOptionTextSelected: {
    fontWeight: 'bold',
    color: '#12B3A8',
  },
  modalConfirmButton: {
    backgroundColor: '#12B3A8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  modalConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginLeft: 8,
  },
  loginOption: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 10,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  loginLink: {
    color: '#12B3A8',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});