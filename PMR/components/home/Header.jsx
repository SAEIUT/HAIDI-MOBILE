import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Pressable} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from "expo-status-bar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/API_CONFIG';
import SearchBar from './SearchBar';
import Photo from '../Photos/Photo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Notif} from './../../app/services/PageNotifComponent'; 
import { router } from 'expo-router';


export default function Header() {
  const navigation = useNavigation();
  const [pending, setPending] = useState(true);
  const [user, setUser] = useState(null);
  const [userUid, setUserUid] = useState(null);

  // Cacher l'en-tête de la navigation
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Récupérer l'UID de l'utilisateur
  useEffect(() => {
    const getUserUid = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('userUid');
        // console.log("UID récupéré :", storedUid);
        if (storedUid) {
          setUserUid(storedUid);
          console.log('passe');
        } else {
          // console.log("Pas d'UID, redirection vers connexion.");
          navigation.replace("/Login");
        }
      } catch (error) {
        // console.error("Erreur lors de la récupération de l'UID :", error);
      }
    };
  
    getUserUid();
  }, []);
  

  // Récupérer les informations de l'utilisateur depuis l'API firebase
  useEffect(() => {
    if (!userUid) return;
  
    const fetchCurrentUser = async () => {
      setPending(true);
      try {
        // console.log("Appel API :", `${API_CONFIG.BASE_URL}/firebase/user/${userUid}`);
        const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/${userUid}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
  
        const data = await response.json();
        console.log("Données utilisateur reçues :", data);
  
        if (response.ok) {
          setUser(data.user);
          console.log("passe 2 :");
        } else {
          // console.log("Erreur API:", data.error);
          navigation.replace("/Login");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
      } finally {
        setPending(false);
      }
    };
  
    fetchCurrentUser();
  }, [userUid]);
  
console.log(user)
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {pending && (
        <View style={styles.pending}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <View style={styles.box}>
        <View style={styles.container2}>
          <View style={styles.leftContainer}>
            <View style={styles.logoWrapper}>
              <Photo />
            </View>
            <View style={styles.ConText}>
              <Text style={styles.Text1}>Bienvenue,</Text>
              {user && user.firstName && (
                <Text style={styles.Text2}> {user.firstName || user.firstname} 👋</Text>
              )}
            </View>
            <View style={styles.ConText2}>
              <Text style={styles.Text3}>
                Réservez votre titre de transport facilement et en toute sérénité
              </Text>
            </View>
          </View>

          <View style={styles.rightContainer}>
            <Pressable onPress={() => router.push('services/PageNotifComponent')}>
              <Ionicons name="notifications-circle" size={47} color="white" style={styles.notif} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.box2}>
        <SearchBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
    alignItems: "center",
  },
  box: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: "#192031",
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    zIndex: 20,
  },
  box2: {
    width: 380,
    height: 450,
    top: 220,
    zIndex: 26,
    position: 'absolute',
  },
  pending: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000000",
    opacity: 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  container2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    height: 66,
  },
  leftContainer: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrapper: {
    paddingRight: 8,
    marginTop: 52,
    left: 10,
  },
  rightContainer: {
    width: "37%",
    height: 45,
    marginTop: 60,
    borderRadius: 25,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ConText: {
    marginTop: 42,
    left: 10,
    height: 25,
  },
  Text1: {
    color: "grey",
    fontStyle: "italic",
  },
  Text2: {
    color: "red",
    marginTop: 3,
    fontWeight: "bold",
  },
  ConText2: {
    width: 300,
    marginTop: 240,
    marginLeft: 1,
    height: 80,
    right: 120
  },
  Text3: {
    color: "white",
    marginTop: 3,
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 20
  },
  notif: {
    top: -10,
    left: 80,
  }
});
