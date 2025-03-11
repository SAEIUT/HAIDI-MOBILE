import * as React from "react"
import { Alert as RNAlert, View, Text, StyleSheet } from "react-native"

const Alert = ({ children, style, ...props }) => {
  return (
    <View style={[styles.alert, style]} {...props}>
      {children}
    </View>
  )
}

const AlertTitle = ({ children, style, ...props }) => (
  <Text style={[styles.title, style]} {...props}>
    {children}
  </Text>
)

const AlertDescription = ({ children, style, ...props }) => (
  <Text style={[styles.description, style]} {...props}>
    {children}
  </Text>
)

const styles = StyleSheet.create({
  alert: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
  }
})

export { Alert, AlertTitle, AlertDescription }