import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/API_CONFIG';
import Tickets from '../Tickects/Tickets';
import Photo from '../Photos/Photo';
import OnGoingHeader from '../Tickects/OnGoingHeader';

export default function Profil() {
  const navigation = useNavigation();
  const [pending, setPending] = useState(true);
  const [user, setUser] = useState(null);
  const [userUid, setUserUid] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const getUserUid = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('userUid');
        // console.log("UID récupéré :", storedUid);
        if (storedUid) {
          setUserUid(storedUid);
        } else {
          // console.log("Pas d'UID, redirection vers connexion.");
          navigation.replace("/Login");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'UID :", error);
      }
    };
  
    getUserUid();
  }, []);

  // Récupérer les informations de l'utilisateur depuis l'API
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
        // console.log("Données utilisateur reçues :", data.user);
  
        if (response.ok) {
          setUser(data.user);
          console.log("je fais user : ", user);
        } else {
          console.log("Erreur API:", data.error);
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

  return (
    <View style={styles.container}>
      <Text style={styles.status}>Profil</Text>
      <Text>{user ? `Bienvenue ${user.firstName || user.firstname}` : "Chargement..."}</Text>

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
              {user && user.firstName  && (
                <Text style={styles.Text2}> {user.firstName || user.firstname} 👋</Text>
              )}
            </View>
            <View style={styles.OnGoing}>
              <OnGoingHeader />
            </View>
          </View>

          <View style={styles.rightContainer}>
            <Text style={styles.Text3}>Mes trajets</Text>
          </View>
        </View>
      </View>

      <View style={styles.box2}>
        <Tickets />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    alignItems: "center",
  },
  box: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: "#192031",
    zIndex: 20,
  },
  box2: {
    width: "100%",
    height: 350,
    top: 690
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
    top: 5,
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
  rightContainer: {
    width: "37%",
    height: 45,
    marginTop: 60,
    borderRadius: 25,
    top: 10,
  },
  Text3: {
    color: "white",
    marginTop: 3,
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 20
  },
  OnGoing: {
    top: 150,
    width: 330,
    height: 130,
    left: -95,
    borderRadius: 7,
    display: "flex",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  }
});
