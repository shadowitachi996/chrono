import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from './screens/MainScreen'; // Ensure the path matches your file location

export default function App() {
  return (
    <NavigationContainer>
      <MainScreen />
    </NavigationContainer>
  );
}

