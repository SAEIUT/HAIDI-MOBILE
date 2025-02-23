import React, { useState, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, FlatList, Animated, View, useWindowDimensions, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import slides from '../../../assets/data/register.js';
import RegisterItem from './registerItem.jsx';
import CustomButton from './registerButtons.jsx';

export default function Register() {
    const { width } = useWindowDimensions();
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);
    const numCol = 3;
    const [formValues, setFormValues] = useState({}); 

    const isFormValid = () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return slides.every((item) =>
            emailRegex.test(formValues[0]) && formValues[1] === formValues[2] &&formValues[item.id] !== ""    
        );
    };

    const handleValueChange = (id, value) => {
        setFormValues((prev) => ({ ...prev, [id]: value }));
    };

    const createUser = () => {
        if (isFormValid()) {
            Alert.alert("Ok");
            console.log(formValues);
        } else {
            Alert.alert("Non");
        }
    };


    const organizeInColumns = (data, columns) => {
        const columnsData = [];
        for (let i = 0; i < data.length; i += columns) {
            columnsData.push(data.slice(i, i + columns));
        }
        return columnsData;
    };

    

    const columns = organizeInColumns(slides, numCol);

    return (
        <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"        }
        style={{ flex: 1 }}
    >
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <FlatList
                ref={flatListRef}
                data={columns}
                renderItem={({ item: column }) => (
                    <View style={[styles.column, { width }]}>
                        {column.map((element) => (
                            <RegisterItem
                                key={element.id}
                                item={element}
                                onValueChange={handleValueChange}
                            />
                        ))}
                    </View>
                )}
                showsHorizontalScrollIndicator={false}
                horizontal
                scrollEnabled={false}
                pagingEnabled
                keyExtractor={(item, index) => `column-${index}`}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
            />
            
            <View style={styles.buttonContainer}>
                <CustomButton title="Sign Up" onPress={createUser} style={[styles.button,{ opacity: isFormValid() ? 1 : 0.5 },  ]} />
            </View>
        </SafeAreaView>
    </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
            flex: 1,
            

    },
    title: {
        fontSize: 46,
        textAlign: 'center',
        marginVertical: "10%",
        color: 'white',
        fontWeight: 'bold',
    },
    column: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70%',  
    },
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 50,
        
    },
    button: {
        backgroundColor: '#12B4A9',
        padding: 15,
        borderRadius: 5,
        width: '60%',
        alignItems: 'center',
    },
});
