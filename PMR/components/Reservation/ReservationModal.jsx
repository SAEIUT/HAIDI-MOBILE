import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  Platform,
  Keyboard,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/API_CONFIG';

const ReservationModal = ({ visible, onClose, onConfirm, route }) => {
  // État pour suivre l'étape actuelle
  const [step, setStep] = useState(1);
  
  // État pour stocker les données du formulaire
  const [formData, setFormData] = useState({
    baggage: {
      hasBaggage: false,
      count: 0,
      specialBaggage: '',
    },
    specialAssistance: {
      wheelchair: false,
      visualAssistance: false,
      hearingAssistance: false,
      otherAssistance: '',
    },
    security: {
      validDocuments: false,
      documentsExpiry: '',
      dangerousItems: [],
      liquidVolume: '',
      medicalEquipment: '',
      securityQuestions: {
        packedOwn: false,
        leftUnattended: false,
        acceptedItems: false,
        receivedItems: false,
        dangerousGoods: false,
      },
      declarations: {
        weaponsFirearms: false,
        explosives: false,
        flammableMaterials: false,
        radioactiveMaterials: false,
        toxicSubstances: false,
        compressedGases: false,
        illegalDrugs: false,
      },
    },
    additionalInfo: {
      emergencyContact: '',
      medicalInfo: '',
      dietaryRestrictions: '',
    },
    accompanist: {
      hasAccompanist: false,
      email: '',
    },
  });

  // États pour l'ID utilisateur et validation
  const [userUid, setUserUid] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Pour éviter que le clavier ne se ferme pendant les updates
  const keyboardOpen = useRef(false);

  // Récupération de l'UID utilisateur au chargement
  useEffect(() => {
    const getUserUid = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('userUid');
        if (storedUid) {
          setUserUid(storedUid);
        } else {
          console.log("Pas d'UID trouvé.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'UID :", error);
      }
    };

    getUserUid();

    // Ajouter des écouteurs pour le clavier
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        keyboardOpen.current = true;
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        keyboardOpen.current = false;
      }
    );

    // Nettoyage
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fonction optimisée pour mettre à jour les données du formulaire sans perte de focus
  const updateFormData = (section, field, value) => {
    try {
      // Utiliser batch state update pour réduire les re-renders
      setFormData(prevState => {
        // Ne mettre à jour que si la valeur a changé
        if (typeof field === 'string' && prevState[section][field] === value) {
          return prevState; // Retourner l'état inchangé pour éviter un re-render
        } else if (typeof field !== 'string' && 
                  prevState[section][field.parent] && 
                  prevState[section][field.parent][field.child] === value) {
          return prevState; // Même chose pour les objets imbriqués
        }

        // Sinon, procéder à la mise à jour
        if (typeof field === 'string') {
          return {
            ...prevState,
            [section]: {
              ...prevState[section],
              [field]: value,
            },
          };
        } else {
          return {
            ...prevState,
            [section]: {
              ...prevState[section],
              [field.parent]: {
                ...prevState[section][field.parent],
                [field.child]: value,
              },
            },
          };
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du formulaire:', error);
    }
  };

  // Fonction pour soumettre la réservation
  // Fonction pour soumettre la réservation
const handleSubmitReservation = async () => {
  try {
    console.log('Préparation des données de réservation...');
  
    // Récupérer l'ID du PMR depuis l'API
    const userResponse = await fetch(`${API_CONFIG.BASE_URL}/user/byGoogleID/${userUid}`);
    const userFound = await userResponse.json();
  
    if (!userFound) {
      throw new Error('Utilisateur non trouvé');
    }
  
    const idDossier = Math.floor(Math.random() * 1000000);
  
    const reservationData = {
      idDossier,
      idPMR: userFound.id,
      googleId: userUid,
      enregistre: true,
      sousTrajets: route.segments.map((segment, index) => ({
        BD: segment.mode.toUpperCase(),
        numDossier: idDossier + index,
        idTrajet: Math.random() * 1000 * 10000 - 1000,
        statusValue: 0,
        departureTime: "2024-12-24T04:25:44",
        arrivalTime: "2024-12-24T01:25:44",
        departure: segment.from.name,
        arrival: segment.to.name
      })),
      bagage: {
        bagagesList: formData.baggage.hasBaggage ? Array(formData.baggage.count).fill(1) : [],
        specialBagage: formData.baggage.specialBaggage
      },
      specialAssistance: {
        wheelchair: formData.specialAssistance.wheelchair,
        visualAssistance: formData.specialAssistance.visualAssistance,
        hearingAssistance: formData.specialAssistance.hearingAssistance,
        otherAssistance: formData.specialAssistance.otherAssistance
      },
      security: {
        validDocuments: formData.security.validDocuments,
        documentsExpiry: formData.security.documentsExpiry,
        dangerousItems: formData.security.dangerousItems,
        liquidVolume: formData.security.liquidVolume,
        medicalEquipment: formData.security.medicalEquipment,
        securityQuestions: formData.security.securityQuestions,
        declarations: formData.security.declarations
      },
      additionalInfo: formData.additionalInfo,
      accompanist: formData.accompanist
    };
  
    console.log('Envoi des données:', reservationData);
  
    // Correction de l'URL
    const response = await fetch(`${API_CONFIG.BASE_URL}/reservation`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        'Content-Type': "application/json",
      },
      body: JSON.stringify(reservationData)
    });
  
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
  
    const responseData = await response.json();
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Erreur réservation:', error);
    return { success: false, error };
  }
};

  // Composant pour un switch personnalisé
  const CustomSwitch = ({ label, value, onValueChange }) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3e3e3e', true: '#1a8f87' }}
        thumbColor={value ? '#12B3A8' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        style={styles.switchControl}
      />
    </View>
  );

  // Composant amélioré pour un champ de texte
  class StableTextInput extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        text: props.value || '',
        hasFocus: false
      };
      this.inputRef = React.createRef();
    }

    componentDidUpdate(prevProps) {
      // Ne mettre à jour l'état local depuis les props que si ce n'est pas en focus
      // et que la valeur a changé
      if (!this.state.hasFocus && prevProps.value !== this.props.value && this.props.value !== this.state.text) {
        this.setState({ text: this.props.value });
      }
    }

    // Gestion du focus entrant
    handleFocus = () => {
      this.setState({ hasFocus: true });
    };

    // Gestion du focus sortant
    handleBlur = () => {
      this.setState({ hasFocus: false });
      // Ce n'est qu'à ce moment qu'on met à jour le state parent
      this.props.onChangeText(this.state.text);
    };

    // Utilise seulement le state local pendant la saisie
    handleChangeText = (text) => {
      this.setState({ text });
      
      // On n'appelle PAS props.onChangeText ici pour éviter que le state global
      // ne soit mis à jour pendant la saisie
      
      // Mais on peut appeler un callback spécifique si nécessaire
      if (this.props.onChange) {
        this.props.onChange(text);
      }
    };

    render() {
      const { 
        label, 
        placeholder, 
        multiline, 
        numberOfLines, 
        keyboardType, 
        rightIcon,
        validationStatus,
        validationMessage
      } = this.props;
      
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{label}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              ref={this.inputRef}
              style={[
                styles.textInput,
                multiline && styles.multilineInput,
                rightIcon && { paddingRight: 44 }
              ]}
              value={this.state.text}
              onChangeText={this.handleChangeText}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              placeholder={placeholder}
              placeholderTextColor="#888"
              multiline={multiline}
              numberOfLines={multiline ? numberOfLines : 1}
              keyboardType={keyboardType}
              textAlignVertical={multiline ? "top" : "center"}
              // Important : ne PAS fermer le clavier sur la touche soumission
              blurOnSubmit={false}
              autoCapitalize="none"
              autoCorrect={false}
              // Désactiver les comportements qui ferment le clavier
              returnKeyType="next"
              onSubmitEditing={() => {}}
            />
            {rightIcon && (
              <View style={styles.inputRightIcon}>
                {rightIcon}
              </View>
            )}
          </View>
          {validationMessage && (
            <Text style={[
              styles.validationMessage, 
              validationStatus === 'valid' ? styles.validMessage : styles.errorMessage
            ]}>
              {validationMessage}
            </Text>
          )}
        </View>
      );
    }
  }
  
  // Fonction pour vérifier l'email en temps réel
  const checkEmailExists = async (email, callback) => {
    // Validation basique du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      callback('invalid', 'Format d\'email invalide');
      return;
    }
    
    try {
      callback('checking', 'Vérification...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        callback('invalid', 'Erreur de connexion');
        return;
      }
      
      const data = await response.json();
      
      if (data.exists) {
        callback('valid', 'Email valide');
      } else {
        callback('invalid', 'Email non enregistré');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      callback('invalid', 'Erreur de vérification');
    }
  };

  // Étape 1: Bagages
  const BaggageStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Bagages</Text>
      
      <View style={styles.card}>
        <CustomSwitch
          label="Avez-vous des bagages ?"
          value={formData.baggage.hasBaggage}
          onValueChange={(value) => updateFormData('baggage', 'hasBaggage', value)}
        />
        
        {formData.baggage.hasBaggage && (
          <>
            <StableTextInput
              label="Nombre de bagages"
              value={String(formData.baggage.count)}
              onChangeText={(text) => updateFormData('baggage', 'count', parseInt(text) || 0)}
              placeholder="Indiquez le nombre"
              keyboardType="numeric"
            />
            
            <StableTextInput
              label="Bagages spéciaux"
              value={formData.baggage.specialBaggage}
              onChangeText={(text) => updateFormData('baggage', 'specialBaggage', text)}
              placeholder="Décrivez vos bagages spéciaux"
              multiline={true}
              numberOfLines={4}
            />
          </>
        )}
      </View>
    </View>
  );

  // Étape 2: Assistance Spéciale
  const AssistanceStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Assistance Spéciale</Text>
      
      <View style={styles.card}>
        <CustomSwitch
          label="Fauteuil roulant"
          value={formData.specialAssistance.wheelchair}
          onValueChange={(value) => updateFormData('specialAssistance', 'wheelchair', value)}
        />
        
        <CustomSwitch
          label="Assistance visuelle"
          value={formData.specialAssistance.visualAssistance}
          onValueChange={(value) => updateFormData('specialAssistance', 'visualAssistance', value)}
        />
        
        <CustomSwitch
          label="Assistance auditive"
          value={formData.specialAssistance.hearingAssistance}
          onValueChange={(value) => updateFormData('specialAssistance', 'hearingAssistance', value)}
        />
        
        <StableTextInput
          label="Autre assistance requise"
          value={formData.specialAssistance.otherAssistance}
          onChangeText={(text) => updateFormData('specialAssistance', 'otherAssistance', text)}
          placeholder="Précisez vos besoins d'assistance"
          multiline={true}
          numberOfLines={4}
        />
      </View>
    </View>
  );

  // Étape 3: Sécurité
  const SecurityStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Vérification de Sécurité</Text>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={20} color="#12B3A8" />
          <Text style={styles.cardTitle}>Documents de Voyage</Text>
        </View>
        
        <CustomSwitch
          label="Je confirme avoir des documents d'identité valides"
          value={formData.security.validDocuments}
          onValueChange={(value) => updateFormData('security', 'validDocuments', value)}
        />
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="warning" size={20} color="#12B3A8" />
          <Text style={styles.cardTitle}>Déclarations de Non-Transport</Text>
        </View>
        
        <CustomSwitch
          label="Je déclare ne pas transporter d'armes ou munitions"
          value={formData.security.declarations.weaponsFirearms}
          onValueChange={(value) => updateFormData('security', { parent: 'declarations', child: 'weaponsFirearms' }, value)}
        />
        
        <CustomSwitch
          label="Je déclare ne pas transporter d'explosifs"
          value={formData.security.declarations.explosives}
          onValueChange={(value) => updateFormData('security', { parent: 'declarations', child: 'explosives' }, value)}
        />
        
        <CustomSwitch
          label="Je déclare ne pas transporter de matières inflammables"
          value={formData.security.declarations.flammableMaterials}
          onValueChange={(value) => updateFormData('security', { parent: 'declarations', child: 'flammableMaterials' }, value)}
        />
        
        <CustomSwitch
          label="Je déclare ne pas transporter de matières radioactives"
          value={formData.security.declarations.radioactiveMaterials}
          onValueChange={(value) => updateFormData('security', { parent: 'declarations', child: 'radioactiveMaterials' }, value)}
        />
        
        <CustomSwitch
          label="Je déclare ne pas transporter de substances toxiques"
          value={formData.security.declarations.toxicSubstances}
          onValueChange={(value) => updateFormData('security', { parent: 'declarations', child: 'toxicSubstances' }, value)}
        />
        
        <CustomSwitch
          label="Je déclare ne pas transporter de gaz comprimés"
          value={formData.security.declarations.compressedGases}
          onValueChange={(value) => updateFormData('security', { parent: 'declarations', child: 'compressedGases' }, value)}
        />
        
        <CustomSwitch
          label="Je déclare ne pas transporter de substances illicites"
          value={formData.security.declarations.illegalDrugs}
          onValueChange={(value) => updateFormData('security', { parent: 'declarations', child: 'illegalDrugs' }, value)}
        />
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="help-circle" size={20} color="#12B3A8" />
          <Text style={styles.cardTitle}>Questions de Sécurité</Text>
        </View>
        
        <CustomSwitch
          label="Avez-vous fait vos bagages vous-même ?"
          value={formData.security.securityQuestions.packedOwn}
          onValueChange={(value) => updateFormData('security', { parent: 'securityQuestions', child: 'packedOwn' }, value)}
        />
        
        <CustomSwitch
          label="Vos bagages sont-ils restés sous votre surveillance ?"
          value={formData.security.securityQuestions.leftUnattended}
          onValueChange={(value) => updateFormData('security', { parent: 'securityQuestions', child: 'leftUnattended' }, value)}
        />
        
        <CustomSwitch
          label="Avez-vous accepté des objets d'autres personnes ?"
          value={formData.security.securityQuestions.acceptedItems}
          onValueChange={(value) => updateFormData('security', { parent: 'securityQuestions', child: 'acceptedItems' }, value)}
        />
        
        <CustomSwitch
          label="Transportez-vous des objets pour d'autres personnes ?"
          value={formData.security.securityQuestions.receivedItems}
          onValueChange={(value) => updateFormData('security', { parent: 'securityQuestions', child: 'receivedItems' }, value)}
        />
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="medical" size={20} color="#12B3A8" />
          <Text style={styles.cardTitle}>Équipement Médical</Text>
        </View>
        
        <StableTextInput
          label="Description de l'équipement"
          value={formData.security.medicalEquipment}
          onChangeText={(text) => updateFormData('security', 'medicalEquipment', text)}
          placeholder="Décrivez tout équipement médical nécessaire"
          multiline={true}
          numberOfLines={4}
        />
      </View>
    </View>
  );

  // Étape 4: Informations Complémentaires
  const AdditionalInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Informations Complémentaires</Text>
      
      <View style={styles.card}>
        <StableTextInput
          label="Contact d'urgence"
          value={formData.additionalInfo.emergencyContact}
          onChangeText={(text) => updateFormData('additionalInfo', 'emergencyContact', text)}
          placeholder="Nom et numéro de téléphone"
        />
        
        <StableTextInput
          label="Informations médicales importantes"
          value={formData.additionalInfo.medicalInfo}
          onChangeText={(text) => updateFormData('additionalInfo', 'medicalInfo', text)}
          placeholder="Allergies, médicaments, etc."
          multiline={true}
          numberOfLines={4}
        />
        
        <StableTextInput
          label="Restrictions alimentaires"
          value={formData.additionalInfo.dietaryRestrictions}
          onChangeText={(text) => updateFormData('additionalInfo', 'dietaryRestrictions', text)}
          placeholder="Régime particulier"
          multiline={true}
          numberOfLines={3}
        />
      </View>
    </View>
  );

  // Étape 5: Accompagnateur
const AccompanistStep = () => {
  // État local pour l'email (complètement séparé du state global)
  const [emailValue, setEmailValue] = useState(formData.accompanist.email || '');
  // Référence au champ d'email pour maintenir le focus
  const emailInputRef = useRef(null);
  // Pour le debounce
  const timeoutRef = useRef(null);
  
  // Pour synchroniser les valeurs externes et internes (uniquement au premier affichage)
  useEffect(() => {
    if (formData.accompanist.email) {
      setEmailValue(formData.accompanist.email);
    }
  }, []); // Exécuté uniquement au montage
  
  // Mettre à jour seulement l'état local pendant la saisie
  const handleLocalEmailChange = (text) => {
    // Mettre à jour l'état local uniquement
    setEmailValue(text);
    
    // Annuler tout délai précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Si pas de vérification en cours, cacher les indicateurs
    if (showValidation) {
      setShowValidation(false);
    }
  };
  
  // Vérifier l'email après la saisie complète (quand le champ perd le focus)
  const handleEmailBlur = () => {
    // Mise à jour du state global d'abord
    updateFormData('accompanist', 'email', emailValue);
    
    // Vérifier uniquement si l'email a un format valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    if (emailRegex.test(emailValue)) {
      verifyEmail(emailValue);
    }
  };
  
  // Fonction séparée pour vérifier l'email
  const verifyEmail = async (email) => {
    // Montrer l'indicateur de vérification
    setShowValidation(true);
    setEmailChecked(false);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        setEmailError('Problème de connexion au serveur.');
        setEmailChecked(true);
        return;
      }
      
      const data = await response.json();
      
      // Marquer l'email comme vérifié
      setEmailChecked(true);
      
      // Mettre à jour le statut de validation
      if (!data.exists) {
        setEmailError('Cet e-mail n\'est pas enregistré dans notre système.');
        setIsEmailValid(false);
      } else {
        setEmailError(null);
        setIsEmailValid(true);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email :", error);
      setEmailError('Impossible de vérifier l\'email.');
      setIsEmailValid(false);
      setEmailChecked(true);
    }
  };
  
  // Vérifier l'email après un délai d'inactivité
  useEffect(() => {
    // Annuler tout délai précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Si l'email est suffisamment long et a un format basique
    if (emailValue && emailValue.includes('@') && emailValue.includes('.')) {
      // Attendre que l'utilisateur ait fini de taper (2 secondes d'inactivité)
      timeoutRef.current = setTimeout(() => {
        // Vérifier uniquement si l'email a un format valide complet
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
        if (emailRegex.test(emailValue)) {
          // Mettre à jour le state global d'abord
          updateFormData('accompanist', 'email', emailValue);
          // Puis lancer la vérification
          verifyEmail(emailValue);
        }
      }, 2000); // 2 secondes d'inactivité
    }
    
    // Nettoyage du timeout lors du démontage
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [emailValue]); // Se déclenche à chaque changement d'email
  
  // Déterminer si on doit montrer une icône de validation
  let validationIcon = null;
  if (showValidation) {
    if (!emailChecked) {
      // En cours de vérification
      validationIcon = <Ionicons name="ellipsis-horizontal" size={24} color="#FFC107" />;
    } else if (emailError) {
      // Email vérifié mais n'existe pas
      validationIcon = <Ionicons name="close-circle" size={24} color="#F44336" />;
    } else if (isEmailValid) {
      // Email vérifié et existe
      validationIcon = <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
    }
  }
  
  return (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Accompagnateur</Text>
      
      <View style={styles.card}>
        <CustomSwitch
          label="Voyagez-vous avec un accompagnateur ?"
          value={formData.accompanist.hasAccompanist}
          onValueChange={(value) => {
            updateFormData('accompanist', 'hasAccompanist', value);
            // Réinitialiser les états
            setEmailValue('');
            updateFormData('accompanist', 'email', '');
            setShowValidation(false);
            setEmailError(null);
            setIsEmailValid(false);
            setEmailChecked(false);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
        />
        
        {formData.accompanist.hasAccompanist && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresse e-mail de l'accompagnateur</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={emailInputRef}
                style={[styles.textInput, { paddingRight: 44 }]}
                value={emailValue}
                onChangeText={handleLocalEmailChange}
                onBlur={handleEmailBlur}
                placeholder="Entrez l'adresse e-mail"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                // Empêcher le clavier de se fermer
                blurOnSubmit={false}
                returnKeyType="next"
                onSubmitEditing={() => {}}
              />
              {validationIcon && (
                <View style={styles.inputRightIcon}>
                  {validationIcon}
                </View>
              )}
            </View>
            {emailError && (
              <Text style={styles.errorMessage}>{emailError}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

  // Étape 6: Confirmation
  const ConfirmationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Confirmation de Réservation</Text>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="map" size={20} color="#12B3A8" />
          <Text style={styles.cardTitle}>Itinéraire</Text>
        </View>
        
        {route.segments.map((segment, index) => (
          <View key={index} style={styles.segmentRow}>
            <View style={styles.segmentIcon}>
              <Ionicons
                name={segment.mode === 'train' ? 'train' : segment.mode === 'plane' ? 'airplane' : 'car'}
                size={20}
                color="white"
              />
            </View>
            <Text style={styles.segmentText}>
              {segment.from.name} → {segment.to.name}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="briefcase" size={20} color="#12B3A8" />
          <Text style={styles.cardTitle}>Bagages</Text>
        </View>
        
        <Text style={styles.summaryText}>
          {formData.baggage.hasBaggage
            ? `${formData.baggage.count} bagage(s)${
                formData.baggage.specialBaggage ? '\n\nSpécial: ' + formData.baggage.specialBaggage : ''
              }`
            : 'Aucun bagage'}
        </Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="accessibility" size={20} color="#12B3A8" />
          <Text style={styles.cardTitle}>Assistance</Text>
        </View>
        
        <Text style={styles.summaryText}>
          {[
            formData.specialAssistance.wheelchair ? '• Fauteuil roulant' : '',
            formData.specialAssistance.visualAssistance ? '• Assistance visuelle' : '',
            formData.specialAssistance.hearingAssistance ? '• Assistance auditive' : '',
            formData.specialAssistance.otherAssistance ? `• ${formData.specialAssistance.otherAssistance}` : '',
          ]
            .filter(Boolean)
            .join('\n') || 'Aucune assistance requise'}
        </Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="people" size={20} color="#12B3A8" />
          <Text style={styles.cardTitle}>Accompagnateur</Text>
        </View>
        
        <Text style={styles.summaryText}>
          {formData.accompanist.hasAccompanist 
            ? formData.accompanist.email
              ? `Adresse e-mail: ${formData.accompanist.email}`
              : 'Information d\'accompagnateur incomplète'
            : 'Pas d\'accompagnateur'}
        </Text>
      </View>
    </View>
  );

  // Validation de l'étape Sécurité
  const validateSecurityStep = () => {
    // Validation des documents
    if (!formData.security.validDocuments) {
      Alert.alert('Documents Invalides', 'Vous devez confirmer avoir des documents valides.');
      return false;
    }

    // Validation des déclarations
    const declarations = formData.security.declarations;
    const allDeclared = Object.values(declarations).every((value) => value === true);
    if (!allDeclared) {
      Alert.alert(
        'Déclarations Requises',
        'Vous devez confirmer toutes les déclarations de non-transport d\'objets interdits.',
      );
      return false;
    }

    // Validation des questions de sécurité
    if (!formData.security.securityQuestions.packedOwn) {
      Alert.alert('Vérification de Sécurité', 'Vous devez avoir fait vos bagages vous-même.');
      return false;
    }

    if (
      formData.security.securityQuestions.leftUnattended ||
      formData.security.securityQuestions.acceptedItems ||
      formData.security.securityQuestions.receivedItems
    ) {
      Alert.alert(
        'Alerte de Sécurité',
        'Vos réponses aux questions de sécurité ne permettent pas de poursuivre la réservation.',
      );
      return false;
    }

    return true;
  };

  // Validation de l'étape Accompagnateur sans Alert pour ne pas perturber le clavier
  const validateAccompanistStep = async () => {
    // Si l'utilisateur n'a pas d'accompagnateur, nous pouvons simplement continuer
    if (!formData.accompanist.hasAccompanist) {
      return true;
    }
    
    // Vérifier si l'email est fourni
    const email = formData.accompanist.email;
    if (!email.trim()) {
      setEmailError('Veuillez saisir l\'adresse e-mail de l\'accompagnateur.');
      return false;
    }
    
    // Validation basique du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Format d\'email invalide. Exemple: nom@domaine.com');
      return false;
    }
    
    // Si l'email est déjà vérifié et valide, pas besoin de revérifier
    if (emailChecked && !emailError) {
      return true;
    }
    
    // Sinon, vérifier l'email via l'API
    try {
      // Afficher visuellement que la vérification est en cours
      setShowValidation(true);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        setEmailError('Problème de connexion au serveur.');
        return false;
      }
      
      const data = await response.json();
      
      // Marquer l'email comme vérifié
      setEmailChecked(true);
      
      // Si l'email n'existe pas, afficher une erreur
      if (!data.exists) {
        setEmailError('Cet e-mail n\'est pas enregistré dans notre système.');
        return false;
      }
      
      // L'email existe, mettre à jour l'état et continuer
      setIsEmailValid(true);
      setEmailError(null);
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email :", error);
      setEmailError('Impossible de vérifier l\'email. Veuillez réessayer.');
      return false;
    }
  };

  // Fonction de confirmation finale
  const handleConfirmation = async () => {
    if (!userUid) {
      Alert.alert('Erreur', 'UID utilisateur non trouvé.');
      return;
    }

    try {
      const result = await handleSubmitReservation();

      if (result.success) {
        Alert.alert(
          'Succès',
          'Votre réservation a été confirmée avec succès',
          [
            {
              text: 'OK',
              onPress: () => {
                onClose();
                onConfirm();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Erreur',
          'Une erreur est survenue lors de la confirmation de la réservation',
          [{ text: 'OK', style: 'cancel' }],
        );
      }
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la confirmation de la réservation',
        [{ text: 'OK', style: 'cancel' }],
      );
    }
  };

  // Affichage de l'étape actuelle
  const renderCurrentStep = () => {
    switch (step) {
      case 1: return <BaggageStep />;
      case 2: return <AssistanceStep />;
      case 3: return <SecurityStep />;
      case 4: return <AdditionalInfoStep />;
      case 5: return <AccompanistStep />;
      case 6: return <ConfirmationStep />;
      default: return null;
    }
  };

  // Navigation vers l'étape suivante (maintenant async pour gérer la validation de l'email)
  const handleNext = async () => {
    if (step === 3 && !validateSecurityStep()) {
      return;
    }
    
    if (step === 5) {
      setShowValidation(true); // Afficher l'indicateur de vérification
      const isValid = await validateAccompanistStep();
      if (!isValid) {
        return;
      }
    }

    // Fermer le clavier seulement après la validation réussie
    Keyboard.dismiss();

    if (step < 6) {
      setStep(prevStep => prevStep + 1);
    } else {
      handleConfirmation();
    }
  };

  // Navigation vers l'étape précédente
  const handleBack = () => {
    // Fermer le clavier immédiatement lors d'un retour
    Keyboard.dismiss();
    
    if (step > 1) {
      setStep(prevStep => prevStep - 1);
    } else {
      onClose();
    }
  };

  // Rendu des indicateurs d'étape
  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {Array.from({ length: 6 }, (_, i) => (
        <View 
          key={i} 
          style={[
            styles.stepDot,
            i + 1 === step && styles.activeStepDot,
            i + 1 < step && styles.completedStepDot
          ]}
        />
      ))}
    </View>
  );

  // Rendu principal du modal
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#192031" />
        
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerMiddle}>
            <Text style={styles.headerTitle}>Réservation</Text>
            {renderStepIndicator()}
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.stepCounter}>Étape {step}/6</Text>
          </View>
        </View>
        
        {/* Contenu principal */}
        <View style={styles.container}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="always" // Garantit que le clavier reste ouvert lors d'une touche ailleurs
            showsVerticalScrollIndicator={true}
            keyboardDismissMode="none" // Empêche le clavier de se fermer lors du défilement
          >
            {renderCurrentStep()}
          </ScrollView>
        </View>
        
        {/* Boutons de navigation */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{step === 1 ? 'Annuler' : 'Retour'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{step === 6 ? 'Confirmer' : 'Suivant'}</Text>
            <Ionicons 
              name={step === 6 ? "checkmark" : "arrow-forward"} 
              size={20} 
              color="white" 
              style={styles.buttonIcon} 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#192031',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C3A4A',
    backgroundColor: '#192031',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerMiddle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  stepCounter: {
    color: '#12B3A8',
    fontSize: 14,
    fontWeight: '600',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2C3A4A',
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: '#12B3A8',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedStepDot: {
    backgroundColor: '#1a8f87',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  stepContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#263142',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 8,
  },
  cardTitle: {
    color: '#12B3A8',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  switchLabel: {
    color: 'white',
    fontSize: 16,
    flex: 1,
    paddingRight: 12,
  },
  switchControl: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    color: 'white',
    borderWidth: 1,
    borderColor: '#2C3A4A',
    fontSize: 16,
  },
  inputRightIcon: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -12 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  validationMessage: {
    marginTop: 4,
    fontSize: 12,
  },
  validMessage: {
    color: '#4CAF50',
  },
  errorMessage: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  segmentIcon: {
    backgroundColor: '#12B3A8',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentText: {
    color: 'white',
    fontSize: 16,
  },
  summaryText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C3A4A',
    backgroundColor: '#192031',
  },
  backButton: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#12B3A8',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginHorizontal: 8,
  },
});

export default ReservationModal;