import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LoadingScreen = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // Animation de rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation de slide
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideValue, {
          toValue: 400,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(slideValue, {
          toValue: -50,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const transportModes = [
    { icon: 'train-outline', color: '#4CAF50' },
    { icon: 'car-outline', color: '#2196F3' },
    { icon: 'airplane-outline', color: '#FF9800' },
    { icon: 'bus-outline', color: '#9C27B0' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        {transportModes.map((mode, index) => (
          <Animated.View
            key={index}
            style={[
              styles.iconContainer,
              {
                transform: [
                  {
                    translateX: Animated.add(
                      slideValue,
                      new Animated.Value(index * 100)
                    ),
                  },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <Ionicons name={mode.icon} size={40} color={mode.color} />
          </Animated.View>
        ))}
      </View>
      <Text style={styles.loadingText}>Chargement...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#192031',
  },
  animationContainer: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LoadingScreen;