import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';

import { createSwitchNavigator, createStackNavigator } from 'react-navigation';


import AuthLoadingScreen from './src/screens/AuthLoadingScreen';
import LoginScreen       from './src/screens/LoginScreen';
import Homescreen        from './src/screens/homescreen';
import NavigationService from './src/NavigationService';

const AppStack = createStackNavigator({
    HomeRoute: {
      screen: Homescreen,
    },
  },{
    headerMode: 'hidden',
  }
);

const AuthStack = createStackNavigator({ 
    LoginRoute: {
      screen: LoginScreen,
    },
  }, {
    headerMode: 'hidden',
  }
);

export class App extends React.Component {
  static router = AppStack.router;

  componentDidMount(){
    StatusBar.setBarStyle('light-content');
  }

  render() {
    return (
      <AppStack
        navigation={this.props.navigation}
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    );
  }
}

export default createSwitchNavigator({
    AuthLoading: AuthLoadingScreen,
    AppRoute   : App      ,
    AuthRoute  : AuthStack,
  }, {
    initialRouteName: 'AuthLoading',
  }
);

