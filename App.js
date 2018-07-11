import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';

import { createStackNavigator, } from 'react-navigation';

import Homescreen        from './src/screens/homescreen';
import SubjectListScreen from './src/screens/subjectListScreen';
import NavigationService from './src/NavigationService';

const HeaderProps = {
  headerTransparent: true,
  headerTintColor: 'white',
  headerTitleStyle: {
    fontWeight: 'bold',
    color: 'white'
  },
  headerStyle: {
    backgroundColor: 'rgba(48, 0, 247, 0.7)'    
  },
}

const TopLevelNavigator = createStackNavigator({
    HomeRoute: {
      screen: Homescreen,
    },
    SubjectListRoute: {
      screen: SubjectListScreen,
    }
  },{
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: HeaderProps,
  }
);

export default class App extends React.Component {
  componentDidMount(){
    StatusBar.setBarStyle('light-content');
  }

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
