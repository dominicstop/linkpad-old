import React, { Fragment } from 'react';
import { StyleSheet } from 'react-native';

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
    },
    gradientBG: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0.7
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
          duration={13000}
          useNativeDriver={true}
        />
      </Animatable.View>
    );
  };

  _renderBG(){
    const { styles } = AuthScreen;

    //gradient colors
    const colorsTop    = ['#7F00FF', '#654ea3', '#642B73', '#c0392b', '#ff00cc',  '#FC466B' ];
    const colorsBottom = ['#F100FF', '#eaafc8', '#C6426E', '#8e44ad', '#333399',  '#3F5EFB' ];

    return(
      <Fragment>
        {this._renderBGImage()}
        <AnimatedGradient
          ref={r => this.animatedGradientRef = r}
          style={styles.gradientBG}
          speed={100} 
          numOfInterps={1000}
          {...{colorsTop, colorsBottom}}
        />
      </Fragment>
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
