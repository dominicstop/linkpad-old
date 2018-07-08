import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { createStackNavigator } from 'react-navigation';

import Homescreen from './src/screens/homescreen';

export default createStackNavigator({
    HomeRoute: {
      screen: Homescreen
    },
  },
  {
    headerMode: 'none',
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
