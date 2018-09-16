import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator, KeyboardAvoidingView } from 'react-native';

import { AnimatedGradient } from '../components/AnimatedGradient';
import { IconButton       } from '../components/Buttons';
import { IconText         } from '../components/Views';
import {setStateAsync, timeout} from '../functions/Utils';

import ModuleStore from '../functions/ModuleStore';
import TipsStore from '../functions/TipsStore';
import UserStore from '../functions/UserStore';

import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import store from 'react-native-simple-store';

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export class InputForm extends React.Component {
  static propType = {
    iconName: PropTypes.string,
    iconType: PropTypes.string,
    iconSize: PropTypes.number,
  }

  render(){
    const { iconName, iconType, iconSize, ...textInputProps } = this.props;
    return(
      <View style={styles.textinputContainer}>
        <Icon
          containerStyle={styles.textInputIcon}
          name={iconName}
          type={iconType}
          size={iconSize}
          color='white'
        />
        <TextInput
          style={styles.textinput}
          maxLength={50}
          autoCapitalize='none'
          enablesReturnKeyAutomatically={true}
          {...textInputProps}
        />
      </View>
    );
  }
}


//smart cont: handles all the login logic
export class LoginContainer extends React.Component {
  constructor(props){
    super(props);
  }

  login = ({email, pass}) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await fetch('https://linkpad-pharmacy-reviewer.firebaseapp.com/login', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            pass : pass ,
          }),
        });
        let json = await response.json();
        resolve(json);
      } catch(error) {
        reject();
      }
    });
  }

  _login = async (login_credentials, callbacks) => {
    const {
      onLoginLoading , //while logging in
      onLoginInvalid , //invalid email/password
      onLoginError   , //something went wrong
      onLoginFetching,
      onLoginFinished, //finish logging in
    } = callbacks;

    const { navigation } = this.props;

    
    try {
      //wait for animation while login
      let resolve_results = await Promise.all([
        this.login(login_credentials),
        onLoginLoading && await onLoginLoading(),
      ]);
      //extract login json from Promise Array
      let login_response = resolve_results[0];

      //stop if login invalid
      if(!login_response.success){
        onLoginInvalid && await onLoginInvalid(login_response);
        return;
      }

      //wait for animation and fetch to finish
      await Promise.all([
        ModuleStore.getModuleData(),
        TipsStore.getTips(),
        onLoginFetching(),
      ]);

      //save user data to storage
      UserStore.setUserData(login_response);
      //login finished
      onLoginFinished && await onLoginFinished(login_response);
      navigation.navigate('AppRoute');

    } catch(error){
      await onLoginError();
    }
  }

  render(){
    const childProps = {
      login: this._login,
    };

    return(
      React.cloneElement(this.props.children, childProps)
    );
  }
}

//dumb cont: presents the UI
export class LoginUI extends React.Component {
  static propType = {
    login: PropTypes.func,
  }

  constructor(props){
    super(props);
    this.state = {
      mode: 'initial',
      //shows hide the loading indicator
      isLoading: false,
      //shows or hide the body content
      isCollapsed: false,
      //textinput values
      emailValue: '',
      passwordValue: '',
      //validation
      isEmailValid: true,
      isPasswordValid: true,
      //UI error message
      errorText: '',
      //UI Header title and subtitle
      titleText: '',
      subtitleText: '',
    };
    //set initial state
    this.state = this.getState('initial');
  }

  //returns the corresponding state for the mode
  getState = (mode) => {
    let newState = {};
    switch(mode) {
      case 'initial':
        newState = {
          titleText      : 'SIGN IN',
          subtitleText   : 'Please sign in to continue',
          isLoading      : false,
          emailValue     : '',
          passwordValue  : '',
          isEmailValid   : true,
          isPasswordValid: true,
        };
        break;
      case 'loading':
        newState = {
          titleText      : 'LOGGING IN',
          subtitleText   : 'Please wait for second...',
          isLoading      : true,
        };
        break;
      case 'fetching':
        newState = {
          titleText      : 'FETCHING',
          subtitleText   : 'Loading the data...',
          isLoading      : true,
        };
        break;
      case 'succesful':
      newState = {
          titleText      : 'LOGGED IN',
          subtitleText   : 'Login succesful, please wait.',
          isLoading      : false,
          isEmailValid   : true,
          isPasswordValid: true,
        };
        break;
      case 'invalid':      
        newState = {
          titleText      : 'SIGN IN',
          subtitleText   : 'Invalid email or password (please try again)',
          isLoading      : false,
          emailValue     : '',
          passwordValue  : '',
          isEmailValid   : false,
          isPasswordValid: false,
        };
        break;
      case 'error':      
        newState = {
          titleText      : 'SIGN IN',
          subtitleText   : 'Something went wrong (please try again)',
          isLoading      : false,
          isEmailValid   : true,
          isPasswordValid: true,
        };
        break;
    }
    return {mode: mode, ...newState};
  }

  onPressLogin = async () => {
    const { emailValue, passwordValue } = this.state;
    this.props.login({email: emailValue, pass: passwordValue}, {
      //pass the callback functions
      onLoginLoading : this.toggleLoading        ,
      onLoginFetching: this.toggleLoginFetching  ,
      onLoginInvalid : this.toggleLoginInvalid   ,
      onLoginError   : this.toggleLoginError     ,
      onLoginFinished: this.toggleLoginSuccessful,
    });
  }

  //called when attempting to log in
  toggleLoading = () => {
    return new Promise(async (resolve) => {
      //collapse container: hide body
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await setStateAsync(this, {isCollapsed: true});
      //then replace title and subtitle
      await this.transitionHeader(() => {
        let loadingState = this.getState('loading');
        return setStateAsync(this, loadingState);
      });
      //delay to reduce stutter
      await timeout(100);
      resolve();
    });
  }

  //called when login has failed
  toggleLoginError = () => {
    return new Promise(async (resolve) => {
      //first expand container: show body
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await setStateAsync(this, {isCollapsed: false});
      //then replace title and subtitle
      await this.transitionHeader(() => {
        let errorState = this.getState('error');
        return setStateAsync(this, errorState);
      });
      //delay to reduce stutter
      await timeout(100);
      resolve();
    });
  }

  //called when data is being fetched and stored
  toggleLoginFetching = () => {
    return new Promise(async (resolve) => {
      //replace title and subtitle
      await this.transitionHeader(() => {
        let fetchState = this.getState('fetching');
        return setStateAsync(this, fetchState);
      });
      //delay to reduce stutter
      await timeout(100);
      resolve();
    });
  }

  //called after login is finish
  toggleLoginSuccessful = () => {
    return new Promise(async (resolve) => {
      //replace title and subtitle
      await this.transitionHeader(() => {
        let successState = this.getState('succesful');
        return setStateAsync(this, successState);
      });
      //delay to reduce stutter
      await timeout(100);
      resolve();
    });
  }

  //called when login pass and email is invalid
  toggleLoginInvalid = () => {
    return new Promise(async (resolve) => {
      //first expand container: show body
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await setStateAsync(this, {isCollapsed: false});
      //then replace title and subtitle
      await this.transitionHeader(() => {
        let invalidState = this.getState('invalid');
        return setStateAsync(this, invalidState);
      });
      //delay to reduce stutter
      await timeout(100);
      resolve();
    });
  }

  //transtion in/out title and subtitle
  transitionHeader = (callback) => {
    return new Promise(async resolve => {
      //animate in
      await Promise.all([
        this.headerTitle   .fadeOutLeft(250),
        this.headerSubtitle.fadeOut(100),
      ]);
      //call callback function
      callback && await callback();
      //animate out
      await Promise.all([
        this.headerTitle.fadeInRight(250),
        this.headerSubtitle.fadeInRight(400),
      ]);
      resolve();
    });
  }

  //transtion in/out subtitle
  transitionSubtitle = (callback) => {
    return new Promise(async resolve => {
      //animate in
      await this.headerSubtitle.fadeOut(100);
      //call callback function
      if(callback) await callback();
      //animate out
      await this.headerSubtitle.fadeInRight(400);
      resolve();
    });
  }

  //title and subtitle 
  _renderHeader = () => {
    const { isLoading, emailValue, passwordValue, isEmailValid, isPasswordValid, errorText, titleText, subtitleText, } = this.state;

    return(
      <View collapsable={true}>
        <Animatable.View
          style={{flexDirection: 'row'}}
          ref={r => this.headerTitle = r}
          useNativeDriver={true}
        >
          {isLoading && <ActivityIndicator size='large' style={{marginRight: 10}} color={'rgba(255, 255, 255, 0.8)'}/>}
          <Text style={{fontSize: 38, fontWeight: '900', color: 'white'}}>
            {titleText}
          </Text>
        </Animatable.View>
        <Animatable.Text 
          style={{fontSize: 18, fontWeight: '100', color: 'white'}}
          ref={r => this.headerSubtitle = r}
          useNativeDriver={true}
        >
          {subtitleText}
        </Animatable.Text>
      </View>
    );
  }

  _renderSignInForm(){

    const textInputProps = {
      underlineColorAndroid: 'rgba(0,0,0,0)',
      selectionColor: 'rgba(255, 255, 255, 0.7)',
    }

    return(
      <Animatable.View 
        collapsable={true}
        animation={'fadeInRight'}
        easing={'ease-in-out'}
        delay={100}
        duration={750}
        useNativeDriver={true}
      >
        <InputForm
          placeholder='E-mail address'
          placeholderTextColor='rgba(255, 255, 255, 0.7)'
          keyboardType='email-address'
          onChangeText={(text) => this.setState({emailValue: text})}
          textContentType='username'
          returnKeyType='next'
          iconName='ios-mail-outline'
          iconType='ionicon'
          iconSize={30}
          {...textInputProps}
        />
        <InputForm
          placeholder='Password'
          onChangeText={(text) => this.setState({passwordValue: text})}
          placeholderTextColor='rgba(255, 255, 255, 0.7)'
          textContentType='password'
          secureTextEntry={true}
          iconName='ios-lock-outline'
          iconType='ionicon'
          iconSize={30}
          {...textInputProps}
        />
        
        <IconButton 
          containerStyle={{padding: 15, marginTop: 25, backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 10}}
          textStyle={{color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 20}}
          iconName={'login'}
          iconType={'simple-line-icon'}
          iconColor={'white'}
          iconSize={22}
          text={'Log In'}
          onPress={this.onPressLogin}
        >
          <Icon
            name ={'chevron-right'}
            color={'rgba(255, 255, 255, 0.5)'}
            type ={'feather'}
            size ={25}
          /> 
        </IconButton>

        <TouchableOpacity>
          <Text 
            style={{fontSize: 16, fontWeight: '100', color: 'white', textAlign: 'center', textDecorationLine: 'underline', marginTop: 7, marginBottom: 10}}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            Don't have an acoount? Sign Up
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  }

  _renderSigninSuccessful(){
    return(
      <Animatable.View
        style={{alignItems: 'center', justifyContent: 'center', marginTop: 25}}
        animation={'fadeIn'}
        easing={'ease-in-out'}
        duration={750}
        ref={r => this.successContainer = r}
      >
        <IconText
          iconName ={'check-circle'}
          iconType ={'feather'}
          iconColor={'rgba(255,255,255,0.8)'}
          iconSize ={32}
          text={'Welcome Back'}
          textStyle={{color: 'white', fontSize: 24}}
        />
      </Animatable.View>
    );
  }

  render(){
    const { login } = this.props;
    const { isLoading, mode, isCollapsed } = this.state;
    return(
      <Animatable.View
        animation={'fadeIn'}
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        <AnimatedGradient
          style={[styles.rootContainer]}
          colorsTop   ={['#7F00FF', '#654ea3', '#642B73', '#c0392b', '#ff00cc', '#FC466B', ]}
          colorsBottom={['#F100FF', '#eaafc8', '#C6426E', '#8e44ad', '#333399', '#3F5EFB', ]}
          speed={100}
          numOfInterps={1000}  
        >
          <KeyboardAvoidingView
            style={{flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center'}}
            behavior='padding'
          >
            <Animatable.View 
              style={[styles.signInContainer, {overflow: 'hidden', elevation: 1}]}
              ref={r => this.animatedSignInContainer = r}
              animation={'bounceInUp'}
              duration={1000}
              easing={'ease-in-out'}
              useNativeDriver={true}
            >
              {this._renderHeader()}
              {!isCollapsed        && this._renderSignInForm      ()}
              {mode == 'succesful' && this._renderSigninSuccessful()}
            </Animatable.View>
          </KeyboardAvoidingView>
        </AnimatedGradient>
      </Animatable.View>
    );
  }
}

export default class LoginScreen extends React.Component { 
  static navigationOptions = {
  }

  render(){
    return(
      <LoginContainer navigation={this.props.navigation}>
        <LoginUI/>
      </LoginContainer>
    );
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    width: '100%', 
    height: '100%', 
  },
  signInContainer: {
    alignSelf: 'stretch', 
    alignItems: 'stretch', 
    margin: 15, 
    padding: 18, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    borderRadius: 20
  },
  textinputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    height: 60,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row', 
    marginTop: 25,
  },
  textInputIcon: {
    width: 30
  },
  textinput: {
    flex: 1, 
    alignSelf: 'center', 
    fontSize: 22, 
    marginLeft: 15, 
    height: 35, 
    borderColor: 'transparent', 
    borderBottomColor: 'rgba(255, 255, 255, 0.25)', 
    borderWidth: 1,
    paddingHorizontal: 5, 
    color: 'white'
  }
});