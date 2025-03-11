import React, { useContext } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { PhotoContext } from './PhotoContext2'; // Importez le contexte

const Photo = () => {
  const { photo } = useContext(PhotoContext); // Utilisez le contexte

  return (
    <View style={styles.container}>
      <Image source={photo} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default Photo;