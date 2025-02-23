import * as React from "react";
import { Text, StyleSheet } from "react-native";

const Label = ({ children, ...props }) => (
  <Text style={styles.label} {...props}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export { Label };