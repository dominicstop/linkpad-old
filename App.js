import React from 'react';
import { StyleSheet, Text, View, StatusBar, Platform } from 'react-native';

import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import { useScreens } from 'react-native-screens';
import * as Animatable from 'react-native-animatable';

import Constants from './src/Constants';
import {shuffleArray} from './src/functions/Utils';

import { DrawerStackContainer   } from './src/screens/Drawer';
import { PracticeExamStack      } from './src/screens/PracticeExamScreen';
import { AnimatedGradient       } from './src/components/AnimatedGradient';
import   AuthLoadingScreen        from './src/screens/AuthLoadingScreen';
import   LoginScreen              from './src/screens/LoginScreen';
import   SignUpScreen             from './src/screens/SignUpScreen';
import   NavigationService        from './src/NavigationService';

//use native navigation
useScreens();

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
    mode: 'modal',
    ...Constants.STACKNAV_PROPS
  }
);

//stack for sign in, sign up etc.
const AuthStack = createStackNavigator({ 
    LoginRoute: {
      screen: LoginScreen,
    },
    SignUpRoute: {
      screen: SignUpScreen,
    }
  }, {
    headerMode: 'hidden',
    cardStyle: {
      backgroundColor: 'transparent',
      opacity: 1,
    },
    transitionConfig : () => ({
      containerStyle: {
        backgroundColor: 'transparent',
      },
      transitionSpec: {
        duration: 0,
      },
    }),
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

//holds the AuthStack
export class AuthScreen extends React.Component {
  static router = AuthStack.router;

  constructor(props){
    super(props);
    //shared between ios and android
    this.gradientProps = {
      speed       : 100 ,
      numOfInterps: 1000,  
    }
  }

  render_android(){
    const transparent = 'rgba(255, 255, 255, 0)';
    const colors = shuffleArray(['#7F00FF', '#304FFE', '#651FFF', '#6A1B9A', '#311B92', '#8E24AA', '#673AB7', '#9C27B0' ]);
    return (
      <Animatable.View 
        style={{flex: 1, backgroundColor: '#FAFAFA'}}
        animation={'fadeIn'}
        duration={1000}
        useNativeDriver={true}
      >
        <AnimatedGradient
          ref={r => this.animatedGradientRef = r}
          style={{position: 'absolute', width: '100%', height: '70%'}}
          colorsTop   ={colors}
          colorsBottom={colors.map(() => transparent)}
          {...this.gradientProps}
        />
        <AuthStack
          navigation={this.props.navigation}
          screenProps={{
            ...this.props.screenProps,
            getAuthBGGradientRef: () => this.animatedGradientRef,
          }}
        />
      </Animatable.View>
    );
  }

  render_iOS() {
    return (
      <View style={{flex: 1}}>
        <AnimatedGradient
          ref={r => this.animatedGradientRef = r}
          style={{position: 'absolute', width: '100%', height: '100%'}}
          {...this.gradientProps}          
        />
        <AuthStack
          navigation={this.props.navigation}
          screenProps={{
            ...this.props.screenProps,
            getAuthBGGradientRef: () => this.animatedGradientRef,
          }}
        />
      </View>
    );
  }

  render(){
    return Platform.select({
      ios: this.render_iOS(),
      android: this.render_android(),
    });
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
