import * as React from "react";
import { Modal, View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";

const Dialog = ({ open, onOpenChange, children }) => (
  <Modal
    visible={open}
    transparent={true}
    animationType="slide"
    onRequestClose={() => onOpenChange(false)}
  >
    <TouchableWithoutFeedback onPress={() => onOpenChange(false)}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View>{children}</View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const DialogContent = ({ children, className }) => (
  <View style={[styles.content, className]}>{children}</View>
);

const DialogHeader = ({ children }) => (
  <View style={styles.header}>{children}</View>
);

const DialogTitle = ({ children }) => (
  <Text style={styles.title}>{children}</Text>
);

const DialogDescription = ({ children }) => (
  <Text style={styles.description}>{children}</Text>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 500,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };