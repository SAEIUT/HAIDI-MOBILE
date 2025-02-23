import { Alert } from "react-native";
import { API_CONFIG } from "../../constants/API_CONFIG";


export const getTrajet = async (idDossier, idTrajet) => {


    try {
        const response = await fetch(`http://${API_CONFIG.ipaddress}/api/reservation/${idDossier}/${idTrajet}`);
        console.log(response.url);
        const data = await response.json();
        if (response.ok) {
            console.log(data);
            return data; 
        } else {
            console.error("Erreur de récupération du trajet :", data);
            throw new Error(data);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du trajet :", error);
        throw error;
    }
};

export const getStuff = async (idDossier) => {
     try {
        const response = await fetch(`http://${API_CONFIG.ipaddress}/api/reservation/${idDossier}`);
        console.log(response.url);
        const data = await response.json();
        if (response.ok) {
            console.log(data);
            return data; 
        } else {
            console.error("Erreur de récupération du trajet :", data);
            throw new Error(data);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du trajet :", error);
        throw error;
    }
};


export const retrievePassenger = async (idPMR) => {
    try {
        const response = await fetch(`http://${API_CONFIG.ipaddress}/api/user/${idPMR}`);
        const data = await response.json();
        console.log(data);
        return data; 
    } catch (error) {
        console.error("Erreur lors de la récupération du passager :", error);
        throw error;
    }
};


export const changeTrajetStatue = async (idDossier, idTrajet, status) => {
        console.log("idDossier", idDossier);
        console.log("idTrajet", idTrajet);
        console.log("status", status);
    try {
        let endpoint;
       
        if (status === 0) {
            endpoint = `http://${API_CONFIG.ipaddress}/api/reservation/setOngoing/${idDossier}/${idTrajet}`;
        } else if (status === 1) {
            endpoint = `http://${API_CONFIG.ipaddress}/api/reservation/setDone/${idDossier}/${idTrajet}`;
        } else {
            Alert.alert("Erreur", "Le trajet est déjà terminé");
            return;
        }

        const response = await fetch(endpoint);
        console

        if (!response.ok) {
            throw new Error("Erreur lors du changement de statut");
        }
    } catch (error) {
        console.error("Erreur dans changeTrajetStatue :", error);
        throw error;
    }
};

export const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
};



export const calculerAge = (dateNaissance) => {
    const naissance = new Date(dateNaissance);
    const aujourdHui = new Date();

    let age = aujourdHui.getFullYear() - naissance.getFullYear();

    const mois = aujourdHui.getMonth() - naissance.getMonth();
    if (mois < 0 || (mois === 0 && aujourdHui.getDate() < naissance.getDate())) {
        age--;
    }

    return age;
}

export const extractTime = (dateTime) => {
        const timeMatch = dateTime.match(/T(\d{2}:\d{2}):/);
        if (timeMatch) {
            return timeMatch[1];
        }
        return 'Heure inconnue';
    };
