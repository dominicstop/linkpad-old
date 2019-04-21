import React, {Fragment} from 'react';
import { StyleSheet, Text, View, StatusBar, Platform } from 'react-native';

import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import { useScreens } from 'react-native-screens';

import './src/Global';
import Constants from './src/Constants';
import { ROUTES } from './src/Constants';

import { DrawerStackContainer         } from './src/screens/Drawer';
import { PracticeExamStackContainer   } from './src/screens/PracticeExamScreen';
import { CustomQuizExamStackContainer } from './src/screens/CustomQuizExamScreen';

import AuthLoadingScreen from './src/screens/AuthLoadingScreen';
import AuthScreen        from './src/screens/AuthScreen';
import NavigationService from './src/NavigationService';

//use native navigation
useScreens();

//main stack for app screens
const AppStack = createStackNavigator({
    [ROUTES.HomeRoute           ]: DrawerStackContainer,
    [ROUTES.PracticeExamRoute   ]: PracticeExamStackContainer,
    [ROUTES.CustomQuizExamScreen]: CustomQuizExamStackContainer,
  },{
    headerMode: 'hidden',
    initialRouteName: ROUTES.HomeRoute,
    navigationOptions: {
      gesturesEnabled: false,
    },
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
};

//shows loading then navigates to either app or signin
export const RootNavigator = createSwitchNavigator({
    [ROUTES.AuthLoading]: AuthLoadingScreen,
    [ROUTES.AppRoute   ]: AppScreen ,
    [ROUTES.AuthRoute  ]: AuthScreen,
  }, {
    initialRouteName: ROUTES.AuthLoading,
  }
);

//holds the RootNavigator and exposes it via NavigationService
export default class App extends React.Component {
  static router = RootNavigator.router;

  componentDidMount(){
    StatusBar.setBarStyle('light-content');
  };

  render() {
    return (
      <RootNavigator
        navigation={this.props.navigation}
        ref={navigatorRef => {
          NavigationService.setRootNavigator(navigatorRef);
        }}
      />
    );
  };
};
