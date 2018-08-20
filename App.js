import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';

import { createSwitchNavigator, createStackNavigator } from 'react-navigation';

import AuthLoadingScreen  from './src/screens/AuthLoadingScreen';
import LoginScreen        from './src/screens/LoginScreen';
import Homescreen         from './src/screens/Homescreen';
import NavigationService  from './src/NavigationService';

import { PracticeExamStack } from './src/screens/PracticeExamScreen';

const AppStack = createStackNavigator({
    HomeRoute: {
      screen: Homescreen,
    },
    PracticeExamRoute: {
      screen: PracticeExamStack,
    }
  },{
    headerMode: 'hidden',
    initialRouteName: 'PracticeExamRoute',
  }
);

//handles sign in, sign up etc.
const AuthStack = createStackNavigator({ 
    LoginRoute: {
      screen: LoginScreen,
    },
  }, {
    headerMode: 'hidden',
  }
);

//shows loading then navigates to either app or signin
export const RootNavigator = createSwitchNavigator({
    AuthLoading: AuthLoadingScreen,
    AppRoute   : AppStack ,
    AuthRoute  : AuthStack,
  }, {
    initialRouteName: 'AuthLoading',
  }
);

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
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    );
  }
}
