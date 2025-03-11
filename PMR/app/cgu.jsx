import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function CGU() {


  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Conditions Générales d'Utilisation</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>1. Objet et Acceptation</Text>
          <Text style={styles.paragraph}>
            Les présentes Conditions Générales d'Utilisation (ci-après "CGU") définissent les règles d'utilisation de l'application C&FM, une plateforme de planification de voyages adaptés aux besoins spécifiques des utilisateurs, notamment les personnes à mobilité réduite. En accédant à l'application et en utilisant ses services, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, vous devez immédiatement cesser toute utilisation de l'application.
          </Text>

          <Text style={styles.title}>2. Services Proposés</Text>
          <Text style={styles.paragraph}>
            C&FM propose une gamme complète de services destinés à faciliter la planification et l'exécution de voyages adaptés. Ces services incluent, sans s'y limiter :
            - <Text style={styles.boldText}>Organisation de trajets multimodaux</Text> : Planification de déplacements combinant différents modes de transport (train, bus, taxi, etc.).
            - <Text style={styles.boldText}>Assistance aux personnes à mobilité réduite</Text> : Services dédiés pour garantir un voyage confortable et sécurisé.
            - <Text style={styles.boldText}>Accompagnement personnalisé</Text> : Mise en relation avec des accompagnateurs formés pour répondre aux besoins spécifiques.
            - <Text style={styles.boldText}>Gestion des réservations de transport</Text> : Prise en charge des réservations de billets et de places adaptées.
            - <Text style={styles.boldText}>Suivi en temps réel des trajets</Text> : Informations en direct sur l'état des transports et les éventuels retards.
            - <Text style={styles.boldText}>Conseils et recommandations</Text> : Suggestions d'itinéraires, de lieux accessibles et de services adaptés.
          </Text>

          <Text style={styles.title}>3. Protection des Données Personnelles</Text>
          <Text style={styles.paragraph}>
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la législation française en vigueur, C&FM s'engage à protéger vos données personnelles. Les données collectées sont utilisées pour :
            - <Text style={styles.boldText}>Création et gestion de votre compte</Text> : Nom, prénom, adresse e-mail, numéro de téléphone, etc.
            - <Text style={styles.boldText}>Organisation de vos trajets</Text> : Informations sur vos déplacements, préférences et besoins spécifiques.
            - <Text style={styles.boldText}>Amélioration des services</Text> : Analyse des données pour optimiser l'expérience utilisateur.
            - <Text style={styles.boldText}>Communication</Text> : Envoi d'informations relatives à vos réservations, mises à jour des services et offres promotionnelles (avec votre consentement).
            
            Vous disposez des droits suivants concernant vos données :
            - <Text style={styles.boldText}>Droit d'accès</Text> : Obtenir une copie des données vous concernant.
            - <Text style={styles.boldText}>Droit de rectification</Text> : Corriger des informations inexactes ou incomplètes.
            - <Text style={styles.boldText}>Droit à l'effacement</Text> : Demander la suppression de vos données.
            - <Text style={styles.boldText}>Droit à la portabilité</Text> : Récupérer vos données dans un format structuré.
            - <Text style={styles.boldText}>Droit d'opposition</Text> : S'opposer au traitement de vos données pour des raisons légitimes.
            
            Pour exercer ces droits, contactez-nous à l'adresse suivante : support@cfm.com.
          </Text>

          <Text style={styles.title}>4. Accessibilité et Non-Discrimination</Text>
          <Text style={styles.paragraph}>
            C&FM s'engage à fournir des services accessibles à tous, sans discrimination liée au handicap, à l'âge, au genre ou à toute autre caractéristique personnelle. Nous nous conformons aux lois en vigueur, notamment la loi française n°2005-102 pour l'égalité des droits et des chances, la participation et la citoyenneté des personnes handicapées. Nous garantissons :
            - Une assistance adaptée aux besoins spécifiques de chaque utilisateur.
            - Une interface utilisateur conçue pour être intuitive et accessible.
            - Un support client disponible pour répondre à vos questions et résoudre vos problèmes.
          </Text>

          <Text style={styles.title}>5. Réservations et Paiements</Text>
          <Text style={styles.paragraph}>
            Les réservations effectuées via l'application C&FM sont confirmées après validation du paiement. Les tarifs incluent :
            - <Text style={styles.boldText}>Le coût du transport</Text> : Billets de train, bus, taxi, etc.
            - <Text style={styles.boldText}>Les frais d'assistance</Text> : Si requis pour les personnes à mobilité réduite.
            - <Text style={styles.boldText}>Les frais de service C&FM</Text> : Commission pour la gestion des réservations et l'organisation des trajets.
            
            Les modes de paiement acceptés incluent les cartes bancaires (Visa, MasterCard, etc.), les portefeuilles électroniques (PayPal, Apple Pay, etc.) et les virements bancaires. Les paiements sont sécurisés grâce à des protocoles de cryptage avancés.
          </Text>

          <Text style={styles.title}>6. Utilisation de la Reconnaissance d'Image</Text>
          <Text style={styles.paragraph}>
            L'application C&FM propose une fonctionnalité de scan de documents d'identité pour faciliter la vérification d'identité lors des réservations. Cette fonctionnalité est soumise aux conditions suivantes :
            - <Text style={styles.boldText}>Consentement explicite</Text> : Vous devez accepter l'utilisation de cette fonctionnalité.
            - <Text style={styles.boldText}>Utilisation limitée</Text> : Les données collectées sont uniquement utilisées pour la vérification d'identité.
            - <Text style={styles.boldText}>Sécurité des données</Text> : Les images scannées sont cryptées et stockées de manière sécurisée.
            - <Text style={styles.boldText}>Suppression des données</Text> : Les images sont supprimées après validation de l'identité.
          </Text>

          <Text style={styles.title}>7. Responsabilités</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.boldText}>Engagements de C&FM :</Text>
            - Assurer la fiabilité et la qualité des services proposés.
            - Sécuriser vos données personnelles et respecter votre vie privée.
            - Fournir une assistance en cas de problème ou de réclamation.
            
            <Text style={styles.boldText}>Engagements de l'utilisateur :</Text>
            - Fournir des informations exactes et à jour.
            - Respecter les présentes CGU et les lois en vigueur.
            - Ne pas utiliser l'application à des fins frauduleuses ou illégales.
            - Ne pas perturber le fonctionnement de l'application ou de ses services.
          </Text>

          <Text style={styles.title}>8. Annulation et Remboursement</Text>
          <Text style={styles.paragraph}>
            Les conditions d'annulation et de remboursement varient en fonction des prestataires de transport et des services réservés. En règle générale :
            - <Text style={styles.boldText}>Annulation gratuite</Text> : Possible jusqu'à 24 heures avant le départ pour certains services.
            - <Text style={styles.boldText}>Frais d'annulation</Text> : Applicables en cas d'annulation tardive ou selon les conditions du prestataire.
            - <Text style={styles.boldText}>Remboursement</Text> : Effectué sous 14 jours ouvrables après validation de la demande.
            
            Pour plus de détails, consultez les conditions spécifiques de chaque réservation.
          </Text>

          <Text style={styles.title}>9. Propriété Intellectuelle</Text>
          <Text style={styles.paragraph}>
            Tous les éléments de l'application C&FM (design, textes, images, logos, logiciels, etc.) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, modification, distribution ou utilisation non autorisée est strictement interdite et peut entraîner des poursuites judiciaires.
          </Text>

          <Text style={styles.title}>10. Modifications des CGU</Text>
          <Text style={styles.paragraph}>
            C&FM se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des changements substantiels par e-mail ou via une notification dans l'application. En continuant à utiliser l'application après ces modifications, vous acceptez les nouvelles conditions.
          </Text>

          <Text style={styles.title}>11. Contact et Support</Text>
          <Text style={styles.paragraph}>
            Pour toute question, réclamation ou demande d'assistance, vous pouvez nous contacter via :
            - <Text style={styles.boldText}>E-mail</Text> : support@cfm.com
            - <Text style={styles.boldText}>Téléphone</Text> : +33 XXXXXXXXX
            - <Text style={styles.boldText}>Formulaire de contact</Text> : Disponible dans l'application.
            
            Notre équipe est disponible du lundi au vendredi, de 9h à 18h.
          </Text>

          <Text style={styles.title}>12. Droit Applicable et Litiges</Text>
          <Text style={styles.paragraph}>
            Les présentes CGU sont régies par le droit français. Tout litige relatif à l'utilisation de l'application C&FM sera soumis à la compétence exclusive des tribunaux français. En cas de désaccord, nous vous encourageons à nous contacter en premier lieu pour trouver une solution amiable.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#192031',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#12B3A8',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
  paragraph: {
    color: 'white',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 16,
  },
  boldText: {
    fontWeight: 'bold',
    color: 'white',
  },
});