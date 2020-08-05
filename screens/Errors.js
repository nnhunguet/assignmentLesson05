import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Errors() {
  return (
    <View style={styles.container}>
      <Text>Server Error</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});