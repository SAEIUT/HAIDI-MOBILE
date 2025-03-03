import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import React from 'react';
import { AntDesign } from '@expo/vector-icons'; // Assurez-vous d'avoir installé @expo/vector-icons
import { router } from 'expo-router'; 


export default function PageNotif() {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <View style={styles.container2}>
          <View style={styles.leftContainer}>
            <Pressable onPress={() => router.push("../(TabBar)/Home")}>
                <AntDesign name="left" size={24} color="white" />
            </Pressable>
          </View>

          <View style={styles.centerContainer}>
            <Text style={styles.Text1}>Mes notifications</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.box2}>
        {/* Les notifications seront placées ici */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    alignItems: 'center',
  },
  box: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100, // Ajustez la hauteur selon vos besoins
    backgroundColor: '#192031',
    zIndex: 20,
    justifyContent: 'center', // Centrer verticalement le contenu
  },
  container2: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, // Ajouter un peu de padding sur les côtés
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start', // Aligner l'icône à gauche
  },
  centerContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center', // Centrer le texte
  },
  Text1: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  box2: {
    width: '100%',
    marginTop: 100, // Ajustez cette valeur pour éviter que le ScrollView ne chevauche le box
    paddingHorizontal: 16, // Ajouter un peu de padding sur les côtés
  },
});