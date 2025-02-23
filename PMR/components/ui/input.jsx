import * as React from "react";
import { TextInput, StyleSheet } from "react-native";

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <TextInput
    ref={ref}
    style={[styles.input, className]}
    placeholderTextColor="#666"
    {...props}
  />
));

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
});

export { Input };