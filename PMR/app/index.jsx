import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Animated, Dimensions, StatusBar } from 'react-native';
import { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Reanimated from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { enableScreens } from 'react-native-screens';
enableScreens();

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
      colorAnimation.setValue(0);
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
  const opacity = new Animated.Value(Math.random() * 0.5 + 0.1);
  const size = Math.random() * 3 + 1; // Légèrement plus petit pour être moins distrayant

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

// Composant pour les boutons
const ActionButton = ({ label, onPress, primary = false, icon = null }) => {
  // Fonction pour rendre l'icône appropriée
  const renderIcon = () => {
    switch (icon) {
      case '🔑':
        return <Ionicons name="key" size={18} color="white" style={styles.buttonIcon} />;
      case '📝':
        return <Ionicons name="create-outline" size={18} color="white" style={styles.buttonIcon} />;
      default:
        return null;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        primary ? styles.primaryButton : styles.secondaryButton,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
      onPress={onPress}
    >
      {renderIcon()}
      <Text style={[styles.buttonText, !primary && styles.secondaryButtonText]}>
        {label}
      </Text>
    </Pressable>
  );
};

// Composant pour les icônes de fonctionnalités
const FeatureIcon = ({ name }) => {
  // Choisit l'icône appropriée en fonction du nom
  switch (name) {
    case '🛡️':
      return <MaterialCommunityIcons name="shield-check" size={20} color="white" />;
    case '✈️':
      return <FontAwesome5 name="plane" size={20} color="white" />;
    case '🌟':
      return <Ionicons name="star" size={20} color="white" />;
    default:
      return null;
  }
};

// Composant principal
export default function Index() {
  const CMF = require('../assets/images/CMF_1.png');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#192031" />
      <AnimatedBackground />
      
      {/* Particules animées - réduites en nombre */}
      {[...Array(20)].map((_, index) => (
        <Particle key={index} delay={index * 300} />
      ))}

      <View style={styles.mainContainer}>
        {/* Logo */}
        <Reanimated.View 
          entering={FadeIn.duration(800)} 
          style={styles.logoContainer}
        >
          <Image source={CMF} style={styles.logo} />
        </Reanimated.View>
        
        {/* Card Container */}
        <Reanimated.View 
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.card}
        >
          {/* Headline */}
          <Text style={styles.headline}>Voyagez serein, voyagez avec C&FM</Text>
          <Text style={styles.subheadline}>
            Garantissez à votre famille un voyage sécurisé dans les meilleures conditions
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <FeatureIcon name="🛡️" />
              </View>
              <Text style={styles.featureText}>Sécurité optimale</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <FeatureIcon name="✈️" />
              </View>
              <Text style={styles.featureText}>Voyages sur mesure</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <FeatureIcon name="🌟" />
              </View>
              <Text style={styles.featureText}>Service premium</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <ActionButton 
              label="Connexion" 
              icon="🔑" 
              primary={true}
              onPress={() => router.push("./authentication/Login")} 
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.divider} />
            </View>
            
            <ActionButton 
              label="Créer un compte" 
              icon="📝"
              onPress={() => router.push("./authentication/Register")} 
            />
          </View>
        </Reanimated.View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.copyright}>
            © 2025 C&FM. Tous droits réservés.
          </Text>
          <Pressable onPress={() => router.push("./cgu")}>
            <Text style={styles.cguLink}>
              Conditions Générales d'Utilisation
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#192031',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 0,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  card: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: 'rgba(30, 42, 58, 0.8)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  headline: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subheadline: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresContainer: {
    marginVertical: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 179, 168, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 4,
  },
  actionButton: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row', // Pour aligner l'icône et le texte horizontalement
  },
  buttonIcon: {
    marginRight: 8, // Espacement entre l'icône et le texte
  },
  primaryButton: {
    backgroundColor: '#12B3A8',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButtonText: {
    color: 'white',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12,
    fontSize: 13,
  },
  particle: {
    position: 'absolute',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  footerContainer: {
    alignItems: 'center',
    padding: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    marginBottom: 4,
  },
  cguLink: {
    color: '#12B3A8',
    fontSize: 11,
    fontWeight: '500',
  },
});