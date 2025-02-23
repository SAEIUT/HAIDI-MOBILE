import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Animated, Dimensions } from 'react-native';
import AnimatedComponent, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Composant pour l'arrière-plan animé (dégradé)
const AnimatedBackground = () => {
  const colorAnimation = new Animated.Value(0);

  useEffect(() => {
    // Démarrer l'animation en boucle
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

    // Nettoyer l'animation lors du démontage du composant
    return () => {
      animation.stop();
      colorAnimation.setValue(0); // Réinitialiser la valeur de l'animation
    };
  }, []);

  const backgroundColor = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#192031', '#0E1A2B'],
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
  );
};

// Composant pour les particules animées
const Particle = ({ delay }) => {
  const position = new Animated.ValueXY({ x: Math.random() * width, y: Math.random() * height });

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
      ]).start(() => animateParticle()); // Relance l'animation en boucle
    };

    animateParticle(); // Démarre l'animation

    // Nettoyer l'animation lors du démontage du composant
    return () => {
      position.stopAnimation(); // Arrêter l'animation
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          transform: [{ translateY: position.y }, { translateX: position.x }],
        },
      ]}
    />
  );
};

// Composant principal
export default function Index() {
  const CMF = require('../assets/images/CMF_1.webp');

  return (
    <SafeAreaView style={styles.safe}>
      <AnimatedBackground />
      {/* Ajout des particules animées */}
      {[...Array(20)].map((_, index) => (
        <Particle key={index} delay={index * 500} />
      ))}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.viewContainer}>
          {/* Image Container */}
          <AnimatedComponent.View entering={FadeInDown.duration(200).springify()} style={styles.viewTextContainer}>
            <Image source={CMF} style={styles.image} />
          </AnimatedComponent.View>

          {/* First Subtitle */}
          <AnimatedComponent.View entering={FadeInDown.duration(200).delay(200).springify()} style={styles.viewTextContainer2}>
            <Text style={styles.textSubtitle}>
              🌍 Voyagez serein, voyagez avec C&FM. ✈️
            </Text>
          </AnimatedComponent.View>

          {/* Second Subtitle */}
          <AnimatedComponent.View entering={FadeInDown.duration(200).delay(400).springify()} style={styles.viewTextContainer2}>
            <Text style={styles.textSubtitle2}>
              🛡️ Choisir C&FM, c'est garantir à sa famille un voyage serein, sécurisé et dans les meilleures conditions. 🌟
            </Text>
          </AnimatedComponent.View>

          {/* Buttons Container */}
          <AnimatedComponent.View entering={FadeInDown.duration(200).delay(600).springify()} style={styles.ViewButton}>
            {/* Login Button */}
            <Pressable
              style={[styles.Button, styles.shadow]}
              onPress={() => router.push("./authentication/Login")}
            >
              <Text style={styles.buttonText}>🔑 Connexion</Text>
            </Pressable>

            {/* Register Text and Button */}
            <Text style={styles.title}>Vous n'êtes pas encore inscrit ?</Text>
            <Pressable
              style={[styles.inscription, styles.shadow]}
              onPress={() => router.push("./authentication/Register")}
            >
              <Text style={styles.inscriptionText}>📄 Inscription</Text>
            </Pressable>
          </AnimatedComponent.View>
        </View>
      </ScrollView>

      {/* Copyright centré */}
      <View style={styles.footer}>
  <Text style={styles.copyright}>
    © 2025 C&FM. Tous droits réservés.
  </Text>
  <Pressable onPress={() => router.push("./cgu")}>
    <Text style={styles.cguLink}>
      Conditions Générales d'Utilisation
    </Text>
  </Pressable>
</View>
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
    justifyContent: 'flex-start',
  },
  viewContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    marginTop: -40,
  },
  viewTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -60,
  },
  viewTextContainer2: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  textSubtitle: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  textSubtitle2: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  ViewButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  Button: {
    height: 55,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#12B3A8',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  title: {
    color: 'white',
    fontSize: 13,
    marginTop: 16,
  },
  inscription: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#1E2A3A',
    marginTop: 24, // Déplace le bouton Inscription plus bas
  },
  inscriptionText: {
    color: 'white', // Texte toujours en blanc
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 300,
    height: 320,
    resizeMode: 'contain',
    marginBottom: 24,
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
