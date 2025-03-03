import { View, StyleSheet } from 'react-native';
import React from 'react';
import ProfileScreen from '../../components/Settings/ProfileScreen';

import { ProfileProvider } from '../../components/home/ProfileContext';
export default function Settings() {
  return (
    <View style={styles.container}>
      <ProfileScreen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#192031', // Assurez-vous que la couleur de fond correspond à celle de ProfileScreen
  },
});