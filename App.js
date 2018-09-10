import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';

import { createSwitchNavigator, createStackNavigator } from 'react-navigation';

import { DrawerStackContainer   } from './src/screens/Homescreen';
import { PracticeExamStack      } from './src/screens/PracticeExamScreen';
import   AuthLoadingScreen        from './src/screens/AuthLoadingScreen';
import   LoginScreen              from './src/screens/LoginScreen';
import   NavigationService        from './src/NavigationService';


//main stack for app screens
const AppStack = createStackNavigator({
    HomeRoute: {
      screen: DrawerStackContainer,
    },
    PracticeExamRoute: {
      screen: PracticeExamStack,
      navigationOptions: {
        gesturesEnabled: false,
      }
    }
  },{
    headerMode: 'hidden',
    initialRouteName: 'HomeRoute',
    gesturesEnabled: false,
    mode: 'modal'
  }
);

//stack for sign in, sign up etc.
const AuthStack = createStackNavigator({ 
    LoginRoute: {
      screen: LoginScreen,
    },
  }, {
    headerMode: 'hidden',
  }
);

//holds the AppStack and exposes it via NavigationService
export class AppScreen extends React.Component {
  static router = AppStack.router;

  render() {
    return (
      <AppStack 
        navigation={this.props.navigation} 
        ref={navigatorRef => {
          NavigationService.setAppNavigator(navigatorRef);
        }}  
      />
    );
  }
}

//shows loading then navigates to either app or signin
export const RootNavigator = createSwitchNavigator({
    AuthLoading: AuthLoadingScreen,
    AppRoute   : AppScreen,
    AuthRoute  : AuthStack,
  }, {
    initialRouteName: 'AuthLoading',
  }
);

//holds the RootNavigator and exposes it via NavigationService
export default class App extends React.Component {
  static router = RootNavigator.router;

  componentDidMount(){
    StatusBar.setBarStyle('light-content');
  }

  render() {
    return (
      <RootNavigator
        navigation={this.props.navigation}
        ref={navigatorRef => {
          NavigationService.setRootNavigator(navigatorRef);
        }}
      />
    );
  }
}
