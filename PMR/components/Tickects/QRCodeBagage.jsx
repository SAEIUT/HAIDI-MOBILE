import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRCodeBagage({ bagageListe }) { 
    console.log(bagageListe);
  const renderItem = ({ item, index }) => {
    
    return (
      <View style={styles.qrCodeContainer}>
        <Text style={styles.text}>Bagage {index + 1}</Text>
        <QRCode value={JSON.stringify(item["bagagesList"])} size={150}  />
      </View>
    );
  };

  return (
    <FlatList
      data={bagageListe}
      renderItem={renderItem}
      keyExtractor={(_, index) => index.toString()}
      horizontal
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10, 
  },
  qrCodeContainer: {
    marginRight: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});