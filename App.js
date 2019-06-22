import React from 'react';
import { StatusBar, UIManager } from 'react-native';
import ExpoConstants from 'expo-constants';

import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import { useScreens } from 'react-native-screens';

import './src/Global';
import Constants from './src/Constants';
import { ROUTES } from './src/Constants';

import { DrawerStackContainer         } from './src/screens/Drawer';
import { PracticeExamStackContainer   } from './src/screens/PracticeExamScreen';
import { CustomQuizExamStackContainer } from './src/screens/CustomQuizExamScreen';
import { TestScreen                   } from './src/screens/TestScreen';

import AuthLoadingScreen from './src/screens/AuthLoadingScreen';
import AuthScreen        from './src/screens/AuthScreen';
import NavigationService from './src/NavigationService';

const expoVersion = ExpoConstants.expoVersion;
const version     = parseFloat(expoVersion.slice(0,4));

if(version <= 2.11){
  //use native navigation
  useScreens();

  //issue: https://github.com/react-navigation/react-navigation/issues/5955
  //latest: 2.11.0.106093 (broken )
  //prev  : 2.10.0.105125 (working)
  console.log('expoVersion: ' + ExpoConstants.expoVersion); 
};


//enable layout animation on android
UIManager.setLayoutAnimationEnabledExperimental && 
UIManager.setLayoutAnimationEnabledExperimental(true);

//main stack for app screens
const AppStack = createStackNavigator({
    [ROUTES.HomeRoute           ]: DrawerStackContainer,
    [ROUTES.PracticeExamRoute   ]: PracticeExamStackContainer,
    [ROUTES.CustomQuizExamScreen]: CustomQuizExamStackContainer,
    [ROUTES.TesterRoute         ]: TestScreen,
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

  async componentDidMount(){
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
