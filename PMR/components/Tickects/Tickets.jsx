import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BarreTrajet from "./BarreTrajet";
import BarreVoyage from "./BarreVoyages";
import QRCodeTrajet from "./QRCodeTrajet";
import { API_CONFIG } from "../../constants/API_CONFIG";
import { useNavigation } from "@react-navigation/native";
import QRCodeBagage from "./QRCodeBagage";

export default function Tickets() {
  const [idTrajet, setID] = useState(null);
  const [isSousTrajet, setQRCode] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userUid, setUserUid] = useState(null);
  const navigation = useNavigation();
  const [bagage, setBagage] = useState(null);

  useEffect(() => {
    const getUserUid = async () => {
      try {
        const storedUid = await AsyncStorage.getItem("userUid");
        console.log("UID récupéré  dans ticket:", storedUid);
        if (storedUid) {
          setUserUid(storedUid);
        } else {
          console.log("Pas d'UID, redirection vers connexion.");
          navigation.replace("/Login");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'UID :", error);
      }
    };
    getUserUid();
  }, []);

  useEffect(() => {
    if (userUid) {
      retrieveTrajet();
    }
  }, [userUid]);

  const retrieveTrajet = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/reservation/bygoogleid/${userUid}`
      );
      console.log("reponse de l'api ticket :", response);
      const data = await response.json();
      console.log("Données récupérées de la resvation :", data);
      setData(data);
    } catch (error) {
      console.log("Erreur :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const qrBagage = (id) => {
    setBagage(bagage === id ? null : id)
  }

  const getDate = (date) => {
    var newDate = date.split("-");
    var trajetDate = newDate[2] + "/" + newDate[1] + "/" + newDate[0];
    return trajetDate;
  };

  const getHeure = (heure) => {
    var spliHeure = heure.split(".000Z");
    return spliHeure[0];
  };

  const qrData = (id, idTrajet) => {
    const dataQR = JSON.stringify({
      trajet: data
        .find((item) => item["idDossier"] === id)
        .sousTrajets.find((item) => item.numDossier === idTrajet).numDossier,
      bagage: data.find((item) => item["idDossier"] === id).bagage,
    });
    return dataQR;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={{ marginTop: 10 }}
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              setID(idTrajet === item["idDossier"] ? null : item["idDossier"])
            }
          >
            <View style={[styles.item]}>
              <View style={styles.top}>
                <Text style={styles.idTrajet}>
                  Id Trajet: {item["idDossier"]}
                </Text>
                <Text style={styles.idTrajet}>
                  {getDate(item.sousTrajets[0].departureTime.split("T")[0])}
                </Text>
              </View>
              <BarreVoyage
                ordre={item.sousTrajets.map((st) => st.statusValue)}
                style={styles.barres}
              />
              {idTrajet === item["idDossier"] && (
                <View style={styles.details}>
                  {item.sousTrajets.map((sousTrajet, index) => (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() =>
                        setQRCode(
                          isSousTrajet === sousTrajet.numDossier
                            ? null
                            : sousTrajet.numDossier
                        )
                      }
                      key={index}
                    >
                      <View style={styles.sousTrajet}>
                        <View style={styles.top}>
                          <Text style={styles.detailsDate}>
                            {getDate(sousTrajet.departureTime.split("T")[0])}
                          </Text>
                          <Text style={styles.detailsDate}>
                            {getDate(sousTrajet.arrivalTime.split("T")[0])}
                          </Text>
                        </View>
                        <View style={styles.place}>
                          <Text style={styles.lieu}>
                            {sousTrajet.departure}
                          </Text>
                          <Text style={styles.lieu}>{sousTrajet.arrival}</Text>
                        </View>
                        <View style={styles.time}>
                          <Text style={styles.detailsTime}>
                            {getHeure(sousTrajet.arrivalTime.split("T")[1])}
                          </Text>
                          <Text style={styles.detailsTime}>
                            {getHeure(sousTrajet.arrivalTime.split("T")[1])}
                          </Text>
                        </View>
                        <View style={styles.sousTrajetBarre}>
                          <BarreTrajet
                            progression={sousTrajet.statusValue}
                            style={styles.sousTrajetBarre}
                          />
                        </View>

                        {isSousTrajet === sousTrajet.numDossier && (
                          <View style={styles.qrCode}>
                            <QRCodeTrajet id={qrData(idTrajet, isSousTrajet)} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                  <View>
                    <TouchableOpacity
                      style={styles.afficherQr}
                      onPress={() => qrBagage(item["idDossier"])}
                    >
                      <Text style={styles.afficherQrText}>
                        Afficher codes bagages
                      </Text>
                    </TouchableOpacity>
                    {bagage === item["idDossier"] && (
                      <QRCodeBagage bagageListe={item.bagage["bagagesList"]} />

                    )}
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: "#FAF9F6",
    bottom: 390,
    height: 560,
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    color: "gray",
  },
  item: {
    backgroundColor: "#f4f5f9",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 0.2,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  details: {
    marginTop: 10,
    padding: 10,
  },
  sousTrajet: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 5,
    borderColor: "gray",
    borderWidth: 0.2,
  },
  qrCode: {
    alignContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  barres: {
    display: "flex",
    flex: 1,
  },
  time: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  place: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  lieu: {
    fontSize: 15,
    fontWeight: "bold",
  },
  afficherQr : {
    textAlign: 'center', 
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: "black",
    width: '100%',
    padding: '10',
  },
  afficherQrText: {
    fontSize: 16
  }
});
