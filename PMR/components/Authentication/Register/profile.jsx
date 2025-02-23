import React, { useState, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, FlatList, Animated, View, useWindowDimensions } from 'react-native';
import slides from '../../../assets/data/profile.js';
import RegisterItem from './registerItem.jsx';
import CustomButton from './registerButtons.jsx';

export default function Register() {
    const { width } = useWindowDimensions();
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);
    const numCol = 3;
    const [currentIndex, setCurrentIndex] = useState(0);

    const organizeInColumns = (data, columns) => {
        const columnsData = [];
        for (let i = 0; i < data.length; i += columns) {
            columnsData.push(data.slice(i, i + columns));
        }
        return columnsData;
    };

    const updateProfile = () => {
        console.log("User created");
    }

    const columns = organizeInColumns(slides, numCol);

    const handleNext = () => {
        if (currentIndex < columns.length - 1) {
            const newIndex = currentIndex + 1;
            flatListRef.current.scrollToOffset({ offset: newIndex * width, animated: true });
            setCurrentIndex(newIndex);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            flatListRef.current.scrollToOffset({ offset: newIndex * width, animated: true });
            setCurrentIndex(newIndex);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Register</Text>

            <FlatList
                ref={flatListRef}
                data={columns}
                style={styles.flatlist}
                renderItem={({ item: column }) => (
                    <View style={[styles.column, { width }]}>
                        {column.map((element) => (
                            <RegisterItem key={element.id} item={element} />
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

            <View style={styles.buttonTable}>
                <View style={styles.buttonCell}>
                    <CustomButton
                        title="Previous"
                        onPress={handlePrevious}
                        style={[
                            styles.button,
                            currentIndex === 0 && styles.disabledButton
                        ]}
                        disabled={currentIndex === 0}
                    />
                </View>
                <View style={styles.buttonCell}>
                    <CustomButton
                        title="Next"
                        onPress={handleNext}
                        style={[
                            styles.button,
                            currentIndex === columns.length - 1 && styles.disabledButton
                        ]}
                        disabled={currentIndex === columns.length - 1}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#192032',
        borderTopEndRadius: 60,
        borderTopStartRadius: 60,
        alignContent: 'center',
        padding: 5,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '80%',
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
    flatlist: {
        height: '70%',
    },
    buttonTable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 40,
        marginBottom: 20,
    },
    buttonCell: {
        flex: 1, 
        alignItems: 'center',
       
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#12B4A9',
        padding: 10,
        borderRadius: 10,
    },
    
});
