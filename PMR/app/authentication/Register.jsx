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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router, useNavigation } from 'expo-router';
import { CameraView as ExpoCamera, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from '../../constants/API_CONFIG';

// Composant de barre de progression
const ProgressBar = ({ steps, currentStep }) => {
  return (
    <View style={styles.progressBarContainer}>
      {steps.map((step, index) => (
        <View
          key={index}
          style={[
            styles.progressStep,
            index < currentStep && styles.completedStep,
            index === currentStep - 1 && styles.activeStep,
          ]}
        />
      ))}
    </View>
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

  // address ip 
  // const ipaddress = '172.20.10.3';

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
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return firstName && lastName && birthdate && civility && civility !== "";
      case 2:
        return age && tel && email;
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
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
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
  
      Alert.alert("Succès", "Inscription réussie !");
      router.replace("./Login"); // Redirection vers la page de connexion
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
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Étape 1 : Informations personnelles</Text>
            {
            cameraActive ? (
              <ExpoCamera
                ref={cameraRef}
                style={styles.cameraContainer}
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
                        <>
                          <TouchableOpacity
                            style={styles.captureButton}
                            onPress={takePicture}
                          >
                            <Text style={styles.captureButtonText}>Prendre la photo</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                              setCameraActive(false);
                              setHasPermission(false);
                            }}
                          >
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                )}
                {!hasPermission && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Permission de caméra non accordée</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={handleScanPress}
                    >
                      <Text style={styles.buttonText}>Réessayer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ExpoCamera>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={handleScanPress}
                >
                  <Text style={styles.scanButtonText}>Scanner la carte d'identité</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  placeholder="Prénom"
                  placeholderTextColor="#888"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nom"
                  placeholderTextColor="#888"
                  value={lastName}
                  onChangeText={setLastName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Date de naissance (JJ/MM/AAAA)"
                  placeholderTextColor="#888"
                  value={birthdate}
                  onChangeText={(text) => setBirthdate(formatBirthdate(text))}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.input, styles.civilityInput]}
                  onPress={() => setIsPickerVisible(true)}
                >
                  <Text style={[styles.civilityText, { color: civility ? 'white' : '#888' }]}>
                    {civility || 'Civilité'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Étape 2 : Coordonnées</Text>
            <TextInput
              style={styles.input}
              placeholder="Âge"
              placeholderTextColor="#888"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              placeholderTextColor="#888"
              value={tel}
              onChangeText={setTel}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
        );

        case 3:
          return (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Étape 3 : Handicaps</Text>
              <View style={styles.checkboxContainer}>
                {Object.keys(handicaps).map((key) => (
                  <TouchableOpacity 
                    key={key} 
                    style={styles.checkboxItem}
                    onPress={() => setHandicaps({ ...handicaps, [key]: !handicaps[key] })}
                  >
                    <View style={[styles.checkboxCircle, handicaps[key] && styles.checkboxCircleChecked]}>
                      {handicaps[key] && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {handicaps.autre && (
                <TextInput
                  style={styles.input}
                  placeholder="Précisez votre handicap"
                  placeholderTextColor="#888"
                  value={autreHandicap}
                  onChangeText={setAutreHandicap}
                />
              )}
            </View>
          );
          
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Étape 4 : Note complémentaire</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes supplémentaires (optionnel)"
              placeholderTextColor="#888"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
            />
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Étape 5 : Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Étape 6 : Accompagnateur</Text>
            <View style={styles.accompagnateurChoice}>
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
            </View>

            {hasAccompagnateur && (
              <View style={styles.accompagnateurForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Prénom de l'accompagnateur"
                  placeholderTextColor="#888"
                  value={accompagnateurInfo.firstName}
                  onChangeText={(text) =>
                    setAccompagnateurInfo({ ...accompagnateurInfo, firstName: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nom de l'accompagnateur"
                  placeholderTextColor="#888"
                  value={accompagnateurInfo.lastName}
                  onChangeText={(text) =>
                    setAccompagnateurInfo({ ...accompagnateurInfo, lastName: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Âge"
                  placeholderTextColor="#888"
                  value={accompagnateurInfo.age}
                  onChangeText={(text) =>
                    setAccompagnateurInfo({ ...accompagnateurInfo, age: text })
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Date de naissance (JJ/MM/AAAA)"
                  placeholderTextColor="#888"
                  value={accompagnateurInfo.birthdate}
                  onChangeText={(text) => {
                    const formatted = formatBirthdate(text);
                    setAccompagnateurInfo({ ...accompagnateurInfo, birthdate: formatted });
                  }}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setIsAccompagnateurPickerVisible(true)}
                >
                  <Text style={{ color: accompagnateurInfo.civility ? 'white' : '#888' }}>
                    {accompagnateurInfo.civility || "Civilité de l'accompagnateur"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  const steps = [1, 2, 3, 4, 5, 6];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#2C3A4A' }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        <View style={styles.contentWrapper}>
          <Image
            source={require('../../assets/images/CMF_1.png')}
            style={styles.logo}
          />
          <Text style={styles.text}>Créer un compte</Text>

          <ProgressBar steps={steps} currentStep={currentStep} />

          {renderStep()}

          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.navButton} onPress={prevStep}>
                <Text style={styles.navButtonText}>Précédent</Text>
              </TouchableOpacity>
            )}
            {currentStep < 6 ? (
              <TouchableOpacity
                style={[styles.navButton, currentStep === 1 && styles.navButtonFullWidth]}
                onPress={nextStep}
              >
                <Text style={styles.navButtonText}>Suivant</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.registerButton, currentStep === 1 && styles.navButtonFullWidth]}
                onPress={handleRegister}
              >
                <Text style={styles.registerButtonText}>S'inscrire</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent={true}
        visible={isPickerVisible}
        animationType="slide"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsPickerVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={civility}
                onValueChange={(itemValue) => {
                  setCivility(itemValue);
                  setIsPickerVisible(false);
                }}
                style={{ color: 'white' }}
              >
                <Picker.Item label="Sélectionner" value="" />
                <Picker.Item label="Mr" value="Mr" />
                <Picker.Item label="Mme" value="Mme" />
                <Picker.Item label="Autre" value="Autre" />
              </Picker>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={isAccompagnateurPickerVisible}
        animationType="slide"
        onRequestClose={() => setIsAccompagnateurPickerVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAccompagnateurPickerVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={accompagnateurInfo.civility}
                onValueChange={(itemValue) => {
                  setAccompagnateurInfo({ ...accompagnateurInfo, civility: itemValue });
                  setIsAccompagnateurPickerVisible(false);
                }}
                style={{ color: 'white' }}
              >
                <Picker.Item label="Sélectionner" value="" />
                <Picker.Item label="Mr" value="Mr" />
                <Picker.Item label="Mme" value="Mme" />
                <Picker.Item label="Autre" value="Autre" />
              </Picker>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#192031',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 1,
    backgroundColor: '#192031',
    marginTop: '-33%',
  },
  logo: {
    width: 160,
    height: 224,
    resizeMode: 'contain',
    marginBottom: -34,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 32,
  },
  stepContainer: {
    width: '90%',
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#2C3A4A',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: 'white',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    zIndex: 1,
  },
  checkboxContainer: {
    width: '100%',
    marginBottom: 16,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxCircleChecked: {
    backgroundColor: '#12B3A8',
    borderColor: '#12B3A8',
  },
  checkboxLabel: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  navButton: {
    width: '45%',
    height: 50,
    backgroundColor: '#12B3A8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '-10%',
  },
  navButtonFullWidth: {
    width: '100%',
    marginBottom: 10,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    width: '45%', // Même largeur que navButton
    height: 50,
    backgroundColor: '#12B3A8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '-10%', // Même marge que navButton
},
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2C3A4A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#2C3A4A',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
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
    borderRadius: 5,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: '#12B3A8',
    padding: 15,
    borderRadius: 10,
    minWidth: 130,
    alignItems: 'center',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 10,
    minWidth: 130,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanButton: {
    width: '100%',
    backgroundColor: '#12B3A8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#12B3A8',
    padding: 15,
    borderRadius: 10,
    minWidth: 130,
    alignItems: 'center',
  },
  accompagnateurChoice: {
    width: '100%',
    marginBottom: 24,
  },
  questionText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 16,
  },
  choiceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  choiceButton: {
    width: '48%',
    height: 50,
    backgroundColor: '#2C3A4A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2C3A4A',
  },
  choiceButtonActive: {
    borderColor: '#12B3A8',
  },
  choiceButtonText: {
    color: 'white',
    fontSize: 16,
  },
  accompagnateurForm: {
    width: '100%',
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: 24,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#2C3A4A',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  completedStep: {
    backgroundColor: '#12B3A8',
  },
  activeStep: {
    backgroundColor: '#12B3A8',
    height: 6,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  civilityInput: {
    justifyContent: 'center',
  },
  civilityText: {
    fontSize: 16,
  },
});