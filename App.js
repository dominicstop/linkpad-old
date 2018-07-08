import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { createStackNavigator } from 'react-navigation';

import Homescreen        from './src/screens/homescreen';
import SubjectListScreen from './src/screens/subjectListScreen';
import NavigationService from './src/NavigationService';

const TopLevelNavigator = createStackNavigator({
    HomeRoute: {
      screen: Homescreen
    },
    SubjectListRoute: {
      screen: SubjectListScreen
    }
  },{
    headerMode: 'none',
  }
);

export default class App extends React.Component {
  render() {
    return (
      <TopLevelNavigator
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
