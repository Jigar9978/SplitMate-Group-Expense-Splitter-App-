import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddGroupScreen from '../screens/AddGroupScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import SplashScreen from '../screens/SplashScreen';


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddGroup" component={AddGroupScreen} />
        <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      </Stack.Navigator>

    </NavigationContainer>
  );
};

export default AppNavigator;
