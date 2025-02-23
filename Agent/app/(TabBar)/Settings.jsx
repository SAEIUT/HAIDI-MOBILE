// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_CONFIG } from '../../constants/API_CONFIG';

// export default function Setting() {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(true);

//   const [user, setUser] = useState(null);
//   const [userUid, setUserUid] = useState(null);

//     // Récupérer l'UID de l'utilisateur
//     useEffect(() => {
//       const getUserUid = async () => {
//         try {
//           const storedUid = await AsyncStorage.getItem('userUid');
//           console.log("UID récupéré  dans settings :", storedUid);
//           if (storedUid) {
//             setUserUid(storedUid);
//           } else {
//             console.log("Pas d'UID, redirection vers connexion.");
//             navigation.replace("/Login");
//           }
//         } catch (error) {
//           console.error("Erreur lors de la récupération de l'UID :", error);
//         }
//       };
    
//       getUserUid();
//     }, []);
    
  
//     // Récupérer les informations de l'utilisateur depuis l'API
//     useEffect(() => {
//       if (!userUid) return;
    
//       const fetchCurrentUser = async () => {
//         setPending(true);
//         try {
//           console.log("Appel API  dans settings :", `${API_CONFIG.BASE_URL}/firebase/agent/${userUid}`);
//           const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/user/${userUid}`, {
//             method: 'GET',
//             headers: { 'Content-Type': 'application/json' }
//           });
    
//           const data = await response.json();
//           console.log("Données utilisateur reçues dans settings :", data);
    
//           if (response.ok) {
//             setUser(data.user);
//           } else {
//             console.log("Erreur API:", data.error);
//             navigation.replace("/Login");
//           }
//         } catch (error) {
//           console.error("Erreur lors de la récupération de l'utilisateur :", error);
//         } finally {
//           setPending(false);
//         }
//       };
    
//       fetchCurrentUser();
//     }, [userUid]);

//   // useEffect(() => {
//   //   const fetchAgentData = async () => {
//   //     setLoading(true);
//   //     try {
//   //       const storedToken = await AsyncStorage.getItem('userToken');
//   //       if (!storedToken) {
//   //         console.log("Pas de token, redirection vers connexion.");
//   //         navigation.replace("/Login");
//   //         return;
//   //       }

//   //       const response = await fetch(`${API_CONFIG.BASE_URL}/agent/profile`, {
//   //         method: 'GET',
//   //         headers: {
//   //           'Authorization': `Bearer ${storedToken}`,
//   //           'Content-Type': 'application/json'
//   //         }
//   //       });

//   //       const data = await response.json();

//   //       if (response.ok) {
//   //         setAgentData({
//   //           email: data.user.Email || 'Non disponible',
//   //           entreprise: data.user.Entreprise || 'Non disponible',
//   //         });
//   //       } else {
//   //         console.log("Erreur API:", data.error);
//   //         navigation.replace("/Login");
//   //       }
//   //     } catch (error) {
//   //       console.error("Erreur lors de la récupération des informations de l'agent :", error);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchAgentData();
//   // }, []);

//   // Fonction de déconnexion
  
//   const handleSignOut = async () => {
//     try {
//       await AsyncStorage.removeItem('userToken'); // Supprime le token
//       navigation.replace("/Login"); // Redirige vers la page de connexion
//     } catch (error) {
//       console.error("Erreur lors de la déconnexion :", error);
//     }
//   };

//   // if (loading) {
//   //   return (
//   //     <View style={styles.loadingContainer}>
//   //       <ActivityIndicator size="large" color="#4B0082" />
//   //     </View>
//   //   );
//   // }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Paramètres</Text>
//       <View style={styles.infoContainer}>
//         <Text style={styles.label}>Email:</Text>
//         <Text style={styles.infoText}>{user.email}</Text>
//         <Text style={styles.label}>Entreprise:</Text>
//         <Text style={styles.infoText}>{user.entreprise}</Text>
//       </View>

//       {/* Bouton de déconnexion */}
//       <TouchableOpacity style={styles.button} onPress={handleSignOut}>
//         <Text style={styles.buttonText}>Se déconnecter</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//     padding: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 20,
//   },
//   infoContainer: {
//     width: '100%',
//     backgroundColor: '#FFF',
//     borderRadius: 10,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#4B0082',
//     marginBottom: 5,
//   },
//   infoText: {
//     fontSize: 16,
//     color: '#555',
//     marginBottom: 15,
//   },
//   button: {
//     width: '100%',
//     height: 50,
//     backgroundColor: '#4B0082',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/API_CONFIG';
import { router } from 'expo-router';

export default function Settings() {
  const [pending, setPending] = useState(true);
  const [user, setUser] = useState(null);
  const [userUid, setUserUid] = useState(null);

  useEffect(() => {
    const getUserUid = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('userUid');
        console.log("UID récupéré dans settings :", storedUid);
        if (storedUid) {
          setUserUid(storedUid);
        } else {
          console.log("Pas d'UID, redirection vers connexion.");
          router.replace("/login");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'UID :", error);
      }
    };

    getUserUid();
  }, []);

  useEffect(() => {
    if (!userUid) return;

    const fetchCurrentUser = async () => {
      setPending(true);
      try {
        console.log("Appel API dans settings :", `${API_CONFIG.BASE_URL}/firebase/agent/${userUid}`);
        const response = await fetch(`${API_CONFIG.BASE_URL}/firebase/agent/${userUid}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        console.log("Données utilisateur reçues dans settings :", data);

        if (response.ok) {
          setUser(data.user);
        } else {
          console.log("Erreur API:", data.error);
          router.replace("/login");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
      } finally {
        setPending(false);
      }
    };

    fetchCurrentUser();
  }, [userUid]);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('userUid');
      router.replace("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  if (pending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B0082" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement des données utilisateur...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email :</Text>
        <Text style={styles.infoText}>{user.email}</Text>
        <Text style={styles.label}>Entreprise :</Text>
        <Text style={styles.infoText}>{user.entreprise}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B0082',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4B0082',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

