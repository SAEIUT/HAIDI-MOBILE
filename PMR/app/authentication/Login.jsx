import { router } from 'expo-router';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Animated, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import AnimatedComponent, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useNavigation } from 'expo-router';
import { API_CONFIG } from '../../constants/API_CONFIG';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Erreur : Veuillez remplir tous les champs.');
      return;
    }
    try {
      console.log("Tentative de connexion avec :", email, password);
      const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      console.log("Données reçues :", data);
      if (response.ok && data.user && data.user.uid) {
        console.log("UID récupéré :", data.user.uid);
        await AsyncStorage.setItem('userUid', data.user.uid);
        console.log("UID stocké dans AsyncStorage");
        router.replace("../(TabBar)/Home");
      } else {
        console.error("Aucun UID reçu ou erreur API.");
        alert("Erreur lors de la connexion.");
      }
    } catch (error) {
      console.error('Erreur de connexion :', error);
      alert("Impossible de se connecter");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AnimatedBackground />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <AnimatedComponent.View entering={FadeInDown.duration(200).springify()} style={styles.logoContainer}>
            <Image source={require('../../assets/images/CMF_1.webp')} style={styles.logo} />
          </AnimatedComponent.View>
          <AnimatedComponent.View entering={FadeInDown.duration(200).delay(200).springify()}>
            <Text style={styles.text}>Connexion</Text>
          </AnimatedComponent.View>
          <AnimatedComponent.View entering={FadeInDown.duration(200).delay(400).springify()} style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={[styles.button, styles.shadow]} onPress={handleLogin}>
              <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>
            <Link href="./Register">
              <Text style={styles.linkText}>Pas encore inscrit ? Inscrivez-vous</Text>
            </Link>
          </AnimatedComponent.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#192031',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginTop: '-50%', // Ajoutez cette ligne pour monter le bloc de 5%
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -70,
  },
  logo: {
    width: 170,
    height: 320,
    resizeMode: 'contain',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 32,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#2C3A4A',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: 'white',
    fontSize: 16,
  },
  button: {
    width: '90%',
    height: 50,
    backgroundColor: '#12B3A8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: '5%', // Ajoutez cette ligne pour descendre le bouton de 5%
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 16,
    color: '#12B3A8',
    fontWeight: 'bold',
  },
  particle: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Pour Android
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  copyright: {
    color: 'white',
    fontSize: 12,
    marginBottom: 8,
  },
  cguLink: {
    color: '#12B3A8',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginTop: 4,
  }
});
