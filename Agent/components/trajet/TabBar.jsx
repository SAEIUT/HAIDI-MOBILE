import React from 'react'
import { TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';

import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';


export default function TabBar({ state, descriptors, navigation }) {

  const icones = {
    Home: (props) => <AntDesign name="home" size={26} color={secondColor} {...props} />,
    Settings: (props) => <AntDesign name="setting" size={26} color={secondColor} {...props} />,
    Trajet: (props) => <Entypo name="ticket" size={26} color={secondColor} {...props} />
  }
  const primaryColor = "#12B3A8";
  const secondColor = "#737373";
  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;
        if (['_sitemap', '+not-found', "index"].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };
        const Icon = icones[route.name];

        return (
          <TouchableOpacity

            key={route.name}
            style={styles.tabbarItems}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >

            {Icon ? Icon({ color: isFocused ? primaryColor : secondColor }) : null}

            <Text style={{ color: isFocused ? primaryColor : secondColor }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>)
}
const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderCurve: "continuous",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  tabbarItems: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  }
})
