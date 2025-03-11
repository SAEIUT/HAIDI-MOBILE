import * as React from "react";
import { Switch as RNSwitch, StyleSheet } from "react-native";

const Switch = React.forwardRef(({ checked, onCheckedChange, ...props }, ref) => (
  <RNSwitch
    ref={ref}
    value={checked}
    onValueChange={onCheckedChange}
    trackColor={{ false: '#767577', true: '#12B3A8' }}
    thumbColor={checked ? 'white' : '#f4f3f4'}
    {...props}
  />
));

const styles = StyleSheet.create({});

export { Switch };