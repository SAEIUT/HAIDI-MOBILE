import * as React from "react";
import { TextInput, StyleSheet } from "react-native";

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <TextInput
    ref={ref}
    style={[styles.textarea, className]}
    multiline
    textAlignVertical="top"
    placeholderTextColor="#666"
    {...props}
  />
));

const styles = StyleSheet.create({
  textarea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    backgroundColor: 'white',
  },
});

export { Textarea };