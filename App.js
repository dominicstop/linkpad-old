import React, {Fragment} from 'react';
import { StyleSheet, Text, View, StatusBar, Platform } from 'react-native';

import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import { useScreens } from 'react-native-screens';
import * as Animatable from 'react-native-animatable';

import Constants from './src/Constants';
import { shuffleArra } from './src/functions/Utils';
import { AnimatedGradient } from './src/components/AnimatedGradient';

import { DrawerStackContainer       } from './src/screens/Drawer';
import { PracticeExamStackContainer } from './src/screens/PracticeExamScreen';

import AuthLoadingScreen from './src/screens/AuthLoadingScreen';
import AuthScreen        from './src/screens/AuthScreen';
import NavigationService from './src/NavigationService';

//use native navigation
useScreens();

//main stack for app screens
const AppStack = createStackNavigator({
    HomeRoute: {
      screen: DrawerStackContainer,
    },
    PracticeExamRoute: {
      screen: PracticeExamStackContainer,
      navigationOptions: {
        gesturesEnabled: false,
        headerMode: 'hidden',
        mode: 'modal',
      }
    },
  },{
    headerMode: 'hidden',
    initialRouteName: 'HomeRoute',
    ...Constants.STACKNAV_PROPS
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
    AppRoute   : AppScreen ,
    AuthRoute  : AuthScreen,
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
