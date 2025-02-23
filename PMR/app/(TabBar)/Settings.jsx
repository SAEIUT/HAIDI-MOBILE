// esma partie 

// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
// import { getAuth } from 'firebase/auth';
// import { useRouter } from 'expo-router';

// const UserProfile = ({ profile, onEdit, onDelete }) => (
//   <View style={styles.profileContainer}>
//     <Text style={styles.label}>Prénom</Text>
//     <Text style={styles.value}>{profile.firstName}</Text>

//     <Text style={styles.label}>Nom</Text>
//     <Text style={styles.value}>{profile.lastName}</Text>

//     <Text style={styles.label}>Email</Text>
//     <Text style={styles.value}>{profile.email}</Text>

//     <Text style={styles.label}>Téléphone</Text>
//     <Text style={styles.value}>{profile.tel || 'Non renseigné'}</Text>

//     <TouchableOpacity style={[styles.button, styles.editButton]} onPress={onEdit}>
//       <Text style={styles.buttonText}>Modifier le profil</Text>
//     </TouchableOpacity>
    
//     <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDelete}>
//       <Text style={styles.buttonText}>Supprimer le compte</Text>
//     </TouchableOpacity>
//   </View>
// );

// const EditProfile = ({ editedProfile, onChange, onSave, onCancel }) => (
//   <>
//     <TextInput
//       style={styles.input}
//       value={editedProfile.firstName}
//       onChangeText={(text) => onChange({ ...editedProfile, firstName: text })}
//       placeholder="Prénom"
//     />
//     <TextInput
//       style={styles.input}
//       value={editedProfile.lastName}
//       onChangeText={(text) => onChange({ ...editedProfile, lastName: text })}
//       placeholder="Nom"
//     />
//     <TextInput
//       style={styles.input}
//       value={editedProfile.email}
//       onChangeText={(text) => onChange({ ...editedProfile, email: text })}
//       placeholder="Email"
//       keyboardType="email-address"
//     />
//     <TextInput
//       style={styles.input}
//       value={editedProfile.tel}
//       onChangeText={(text) => onChange({ ...editedProfile, tel: text })}
//       placeholder="Téléphone"
//       keyboardType="phone-pad"
//     />
//     <TextInput
//       style={styles.input}
//       value={editedProfile.password}
//       onChangeText={(text) => onChange({ ...editedProfile, password: text })}
//       placeholder="Mot de passe (laisser vide pour ne pas changer)"
//       secureTextEntry
//     />

//     <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={onSave}>
//       <Text style={styles.buttonText}>Sauvegarder</Text>
//     </TouchableOpacity>
//     <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
//       <Text style={styles.buttonText}>Annuler</Text>
//     </TouchableOpacity>
//   </>
// );

// export default function ProfileScreen() {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedProfile, setEditedProfile] = useState({});
//   const router = useRouter();
//   const auth = getAuth();
//   const [id, setId] = useState(null);

//   const fetchUserProfile = async () => {
//     try {
//       const userId = auth.currentUser?.uid;
//       if (!userId) {
//         Alert.alert('Erreur', 'Utilisateur non authentifié.');
//         return;
//       }

//       const response = await fetch(`http://172.20.10.11/api/user/byGoogleID/${userId}`);
//       if (response.ok) {
//         const responseData = await response.json();
//         setId(responseData.id);
//         const [firstName, lastName] = responseData.name.split(' ') || ['', ''];
//         setProfile({ firstName, lastName, email: responseData.email, tel: responseData.tel });
//         setEditedProfile({ firstName, lastName, email: responseData.email, tel: responseData.tel, password: '' });
//       } else {
//         Alert.alert('Erreur', 'Données utilisateur non disponibles.');
//       }
//     } catch (error) {
//       Alert.alert('Erreur', 'Impossible de récupérer les données utilisateur.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveProfile = async () => {
//     try {
//       const response = await fetch(`http://172.20.10.11/api/user/${id}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editedProfile),
//       });

//       if (!response.ok) throw new Error('Erreur lors de la mise à jour.');
//       Alert.alert('Succès', 'Profil mis à jour.');
//       setProfile(editedProfile);
//       setIsEditing(false);
//     } catch (error) {
//       Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
//     }
//   };

//   const handleDeleteProfile = async () => {
//     try {
//       const userId = auth.currentUser?.uid;
//       const response = await fetch(`http://172.20.10.11/api/user/byGoogleID/${userId}`);
//       if (!response.ok) throw new Error('Erreur lors de la suppression.');
//       const responseData = await response.json();
//       const pu = await fetch(`http://172.20.10.11/api/user/delete/${responseData.id}`);
//       if (pu.ok) Alert.alert('Compte supprimé', 'Votre compte a été supprimé.');
//     } catch (error) {
//       Alert.alert('Erreur', 'Impossible de supprimer le profil.');
//     }
//   };

//   useEffect(() => {
//     fetchUserProfile();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   if (!profile) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>Impossible de charger le profil utilisateur.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Profil Utilisateur</Text>

//       {isEditing ? (
//         <EditProfile
//           editedProfile={editedProfile}
//           onChange={setEditedProfile}
//           onSave={handleSaveProfile}
//           onCancel={() => setIsEditing(false)}
//         />
//       ) : (
//         <UserProfile profile={profile} onEdit={() => setIsEditing(true)} onDelete={handleDeleteProfile} />
//       )}

//       <TouchableOpacity style={[styles.button, styles.logoutButton]}>
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
//     backgroundColor: '#192031',
//     padding: 16,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: 'white',
//   },
//   profileContainer: {
//     width: '90%',
//     backgroundColor: '#f9f9f9',
//     borderRadius: 12,
//     padding: 16,
//     marginVertical: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   label: {
//     fontSize: 14,
//     color: '#888',
//     marginBottom: 4,
//     fontWeight: '600',
//   },
//   value: {
//     fontSize: 16,
//     color: '#333',
//     marginBottom: 12,
//     fontWeight: 'bold',
//   },
//   input: {
//     width: '90%',
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     marginVertical: 8,
//     backgroundColor: '#fff',
//   },
//   button: {
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 10,
//     alignItems: 'center',
//     width: '90%',
//   },
//   editButton: {
//     backgroundColor: '#12b2a6',
//   },
//   deleteButton: {
//     backgroundColor: '#f44336',
//   },
//   logoutButton: {
//     backgroundColor: '#2196F3',
//   },
//   saveButton: {
//     backgroundColor: '#4CAF50',
//   },
//   cancelButton: {
//     backgroundColor: '#999',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   errorText: {
//     color: 'red',
//     fontWeight: 'bold',
//   },
// });


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