import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';


export default function MainPage() {
  return (
    // <ScrollView>
        <View style={styles.mainp}>
        <View style={styles.search}>
            {/* Content of the red div */}
        </View>
        </View>
    // </ScrollView>
    
  )
}

const styles = StyleSheet.create({
    mainp: {
        width: '100%',
        height:1800, 
        backgroundColor: 'grey',
        zIndex: 250, 
        top:350, 
        borderTopLeftRadius: 10, 
        borderTopRightRadius: 10,
  
    },
    text: {
      color: 'white', 
      fontSize: 24,   
      paddingLeft: 30,
      paddingTop: 10,
    },
    search: {
        width: '85%',
        height: 200,
        zIndex: 4, 
        backgroundColor: 'green',
        borderRadius: 10,
        alignSelf: 'center',  // Centers horizontally
        top: -40,  
        justifyContent: 'center',
        alignItems: 'center',
      },
  });
  