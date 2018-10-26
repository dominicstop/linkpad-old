import React, {Fragment} from 'react';
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
import   WelcomeScreen            from './src/screens/WelomeScreen';
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
    WelcomeRoute: {
      screen: WelcomeScreen,
    },
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
  }

  _renderBG(){
    return(
      <Animatable.View
        style={{position: 'absolute', width: '100%', height: '100%'}}
        animation="fadeIn" 
        duration={2000}
        useNativeDriver={true}
      >
        <Animatable.Image
          style={{width: '100%', height: '100%'}}          
          source={require('./assets/loginBG.jpg')}
          resizeMode={'cover'}
          animation="pulse" 
          easing="ease-in-out" 
          iterationCount="infinite"
          delay={2000}
          duration={13000}
          useNativeDriver={true}
        />
      </Animatable.View>
    );
  }

  _renderBody(){
    return(
      <Fragment>
        <AnimatedGradient
          ref={r => this.animatedGradientRef = r}
          style={{position: 'absolute', width: '100%', height: '100%', opacity: 0.7}}
          colorsTop   ={['#7F00FF', '#654ea3', '#642B73', '#c0392b', '#ff00cc',  '#FC466B', ]}
          colorsBottom={['#F100FF', '#eaafc8', '#C6426E', '#8e44ad', '#333399',  '#3F5EFB', ]}
          speed={100} 
          numOfInterps={1000}
        />
        <AuthStack
          navigation={this.props.navigation}
          screenProps={{
            ...this.props.screenProps,
            getAuthBGGradientRef: () => this.animatedGradientRef,
          }}
        />
      </Fragment>
    );
  }

  render(){
    return (
      <Animatable.View 
        style={{flex: 1}}
        animation={'fadeIn'}
        duration={1000}
        useNativeDriver={true}
      >
        {this._renderBG  ()}
        {this._renderBody()}
      </Animatable.View>
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
