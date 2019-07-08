import React from 'react';
import { StatusBar, UIManager, Platform } from 'react-native';

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
import { CustomQuizExamResultScreen } from './src/screens/CustomQuizExamResultScreen';
import { CustomQuizExamResultQAScreen } from './src/screens/CustomQuizExamResultQAScreen';

useScreens();

//enable layout animation on android
UIManager.setLayoutAnimationEnabledExperimental && 
UIManager.setLayoutAnimationEnabledExperimental(true);

//main stack for app screens
const AppStack = createStackNavigator({
    [ROUTES.HomeRoute                  ]: DrawerStackContainer,
    [ROUTES.PracticeExamRoute          ]: PracticeExamStackContainer,
    [ROUTES.CustomQuizExamScreen       ]: CustomQuizExamStackContainer,
    [ROUTES.CustomQuizExamResultRoute  ]: CustomQuizExamResultScreen,
    [ROUTES.CustomQuizExamResultQARoute]: CustomQuizExamResultQAScreen,
    [ROUTES.TesterRoute                ]: TestScreen,
  },{
    initialRouteName: ROUTES.HomeRoute,
    navigationOptions: {
      gesturesEnabled: false,
    },
    ...Constants.STACKNAV_PROPS,
    ...Platform.select({
      ios: {
        navigationOptions: Constants.HEADER_PROPS, 
        headerMode: 'float',
        headerTransitionPreset: 'uikit',
        headerTransparent: true,
      },
      android: {
        //overriden in tabnav
        navigationOptions: {
          headerTransparent: false,
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: 'white'
          },
        },
      }
    })
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
