import { router } from 'expo-router';
import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Animated, 
  Dimensions, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useNavigation } from 'expo-router';
import { API_CONFIG } from '../../constants/API_CONFIG';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Reanimated from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Composant pour l'arrière-plan animé (dégradé)
const AnimatedBackground = () => {
  const colorAnimation = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnimation, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnimation, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => {
      animation.stop();
      colorAnimation.setValue(0);
    };
  }, []);

  const backgroundColor = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#192031', '#0E1A2B'],
  });

  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor }]} />;
};

// Composant pour les particules animées
const Particle = ({ delay }) => {
  const position = new Animated.ValueXY({ x: Math.random() * width, y: Math.random() * height });
  const opacity = new Animated.Value(Math.random() * 0.5 + 0.1);
  const size = Math.random() * 3 + 1;

  useEffect(() => {
    // Animation en boucle infinie pour les particules
    const animateParticle = () => {
      Animated.sequence([
        Animated.timing(position, {
          toValue: { x: Math.random() * width, y: Math.random() * height },
          duration: 5000 + Math.random() * 5000,
          useNativeDriver: true,
        }),
        Animated.timing(position, {
          toValue: { x: Math.random() * width, y: Math.random() * height },
          duration: 5000 + Math.random() * 5000,
          useNativeDriver: true,
        }),
      ]).start(() => animateParticle());
      
      // Animation d'opacité
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: Math.random() * 0.5 + 0.1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: Math.random() * 0.5 + 0.1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start();
    };

    animateParticle();

    return () => {
      position.stopAnimation();
      opacity.stopAnimation();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          opacity: opacity,
          transform: [{ translateY: position.y }, { translateX: position.x }],
        },
      ]}
    />
  );
};

// Composant Input personnalisé
const CustomInput = ({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  onPressIcon,
  iconRight,
}) => {
  return (
    <View style={styles.inputContainer}>
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
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {iconRight && (
        <TouchableOpacity onPress={onPressIcon} style={styles.inputIconRight}>
          {iconRight}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Animation de secousse pour les erreurs
  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      shakeError();
      alert('Erreur : Veuillez remplir tous les champs.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.user && data.user.uid) {
        await AsyncStorage.setItem('userUid', data.user.uid);
        router.replace("../(TabBar)/Home");
      } else {
        shakeError();
        alert("Identifiants incorrects. Veuillez réessayer.");
      }
    } catch (error) {
      shakeError();
      alert("Impossible de se connecter. Vérifiez votre connexion internet.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#192031" />
      <AnimatedBackground />
      
      {/* Particules animées */}
      {[...Array(20)].map((_, index) => (
        <Particle key={index} delay={index * 300} />
      ))}
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* Header avec Logo */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Reanimated.View 
              entering={FadeIn.duration(800)} 
              style={styles.logoContainer}
            >
              <Image
                source={require('../../assets/images/CMF_1.webp')}
                style={styles.logo}
              />
            </Reanimated.View>
            
            {/* Titre */}
            <Reanimated.View entering={FadeInDown.duration(500).delay(200)}>
              <Text style={styles.title}>Connexion</Text>
            </Reanimated.View>

            {/* Formulaire */}
            <Reanimated.View entering={FadeInDown.duration(500).delay(400)} style={styles.card}>
              {/* Section Email */}
              <CustomInput
                icon="email"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              {/* Section Mot de passe */}
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

              {/* Oubli de mot de passe */}
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

              {/* Bouton de connexion */}
              <Animated.View
                style={[
                  styles.loginButtonContainer,
                  { transform: [{ translateX: shakeAnimation }] }
                ]}
              >
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <View style={styles.loginButtonContent}>
                      <Ionicons name="log-in-outline" size={20} color="white" style={styles.loginButtonIcon} />
                      <Text style={styles.loginButtonText}>Se connecter</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Lien d'inscription */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Pas encore de compte ?</Text>
                <Link href="./Register" asChild>
                  <TouchableOpacity>
                    <Text style={styles.signupLink}>Créer un compte</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </Reanimated.View>
            
            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2025 C&FM. Tous droits réservés.</Text>
              <TouchableOpacity onPress={() => router.push('./cgu')}>
                <Text style={styles.footerLink}>Conditions Générales d'Utilisation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#192031',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    padding: 24,
    backgroundColor: 'rgba(30, 42, 58, 0.8)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    alignItems: 'center',
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#12B3A8',
    fontSize: 14,
  },
  loginButtonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#12B3A8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    marginRight: -5,
  },
  signupLink: {
    color: '#12B3A8',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginBottom: 5,
  },
  footerLink: {
    color: '#12B3A8',
    fontSize: 12,
  },
  particle: {
    position: 'absolute',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});