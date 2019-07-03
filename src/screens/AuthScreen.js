import React from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';

import { createStackNavigator } from 'react-navigation';
import * as Animatable from 'react-native-animatable';

import { AnimatedGradient } from '../components/AnimatedGradient';
import { ROUTES } from '../Constants';

import LoginScreen   from './LoginScreen' ;
import SignUpScreen  from './SignUpScreen';
import WelcomeScreen from './WelomeScreen';

//stack for sign in, sign up etc.
const AuthStack = createStackNavigator({
    [ROUTES.WelcomeRoute]: WelcomeScreen,
    [ROUTES.LoginRoute  ]: LoginScreen  ,
    [ROUTES.SignUpRoute ]: SignUpScreen ,
  }, {
    initialRouteName: ROUTES.LoginRoute,
    headerMode: 'hidden',
    cardStyle: {
      backgroundColor: 'transparent',
      opacity: 1,
    },
    transitionConfig : () => ({
      containerStyle: {
        backgroundColor: 'transparent',
      },
      ...Platform.select({
        ios: {
          transitionSpec: {
            duration: 0,
          },
        }
      })
    })
  }
);

//holds the AuthStack
export default class AuthScreen extends React.Component {
  static router = AuthStack.router;

  static styles = StyleSheet.create({
    backgroundContainer: {
      position: 'absolute', 
      width: '100%', 
      height: '100%',
    },
    imageBG: {
      width: '100%',
      height: '100%',
      opacity: 0.75,
    },
    gradientBG: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0.7
    },
    backgroundWrapper: {
      position: 'absolute',
      width: '100%',
      height: '100%'
    },
  });

  constructor(props){
    super(props);
    this.loginBG = require('../../assets/loginBG.jpg');
  };

  _renderBGImage(){
    const { styles } = AuthScreen;

    return(
      <Animatable.View
        style={styles.backgroundContainer}
        animation={"fadeIn"}
        duration={2000}
        useNativeDriver={true}
      >
        <Animatable.Image
          style={styles.imageBG}          
          source={this.loginBG}
          resizeMode={'cover'}
          animation={"pulse"}
          easing={"ease-in-out"} 
          iterationCount={"infinite"}
          delay={2000}
          duration={1000 * 30}
          shouldRasterizeIOS={true}
          renderToHardwareTextureAndroid={true}
          useNativeDriver={true}
        />
      </Animatable.View>
    );
  };

  _renderBG(){
    const { styles } = AuthScreen;

    //gradient colors
    const colorsTop    = ['#7F00FF', '#8e44ad', '#fc4a1a', '#FC466B', '#3f2b96', '#0575E6', '#8A2387', '#C33764'];
    const colorsBottom = ['#F100FF', '#c0392b', '#f7b733', '#3F5EFB', '#a8c0ff', '#00F260', '#f27121', '#1D2671'];
    const speed = Platform.select({ios: 300, android: 400});

    return(
      <View style={styles.backgroundWrapper}>
        {this._renderBGImage()}
        <AnimatedGradient
          ref={r => this.animatedGradientRef = r}
          style={styles.gradientBG}
          {...{colorsTop, colorsBottom, speed}}
        />
      </View>
    );
  };

  render(){
    return (
      <Animatable.View 
        style={{flex: 1}}
        animation={'fadeIn'}
        duration={1000}
        useNativeDriver={true}
      >
        {this._renderBG()}
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
};
