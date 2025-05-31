import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Home'); // 2 sec ke baad HomeScreen khulega
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>SplitMate</Text>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
});
