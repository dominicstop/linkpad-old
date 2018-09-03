import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator, KeyboardAvoidingView } from 'react-native';

import { AnimatedGradient } from '../components/AnimatedGradient';
import { IconButton       } from '../components/Buttons';
import { IconText         } from '../components/Views';
import {setStateAsync, timeout} from '../functions/Utils';
import ModuleDataProvider from '../functions/ModuleDataProvider';

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

  _login = async (callbacks) => {
    const {
      onLoginLoading , //while logging in
      onLoginInvalid , //invalid email/password
      onLoginError   , //something went wrong
      onLoginFetching,
      onLoginFinished, //finish logging in
    } = callbacks;

    const { navigation } = this.props;

    onLoginLoading && onLoginLoading();

    //simulate loading
    await timeout(1500);

    //wait for animation and fetch to finish
    await Promise.all([
      ModuleDataProvider.getModuleData(),
      onLoginFetching(),
    ]);
    
    onLoginFinished && await onLoginFinished();

    //await AsyncStorage.setItem('userToken', 'abc');
    await store.save('userToken', {loggedIn: true});
    navigation.navigate('AppRoute');
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
    }
  }

  onPressLogin = async () => {
    await this.toggleLoading(true);
    this.props.login({
      onLoginFetching: this.toggleLoginFetching  ,
      onLoginFinished: this.toggleLoginSuccessful,
    });
  }

  toggleLoading = (toggle) => {
    return new Promise(async (resolve) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await this.setState({mode: toggle? 'loading' : 'initial'});
      if(toggle){
        //sign in screen
        await this.headerTitle.fadeOutLeft(200);
        await this.headerTitle.fadeInRight(250);
      } else {
        //loading screen
        await this.headerTitle.fadeOutRight(200);
        await this.headerTitle.fadeInLeft  (250);
      }
      resolve();
    });
  }

  transitionHeader = (callback) => {
    return new Promise(async resolve => {
      //animate in
      await Promise.all([
        this.headerTitle   .fadeOutLeft(250),
        this.headerSubtitle.fadeOut(100),
      ]);
      //call callback function
      if(callback) await callback();
      //animate out
      await Promise.all([
        this.headerTitle.fadeInRight(250),
        this.headerSubtitle.fadeInRight(400),
      ]);
      resolve();
    });
  }

  toggleLoginSuccessful = () => {
    return new Promise(async resolve => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await this.setState({mode: 'succesful'});

      await Promise.all([
        this.transitionHeader(),
        this.successContainer.bounceIn(1250),
      ]);

      resolve();
    });
  }

  toggleLoginFetching = () => new Promise(async (resolve) => {
    //animate header
    await this.transitionHeader(async () => {
      //change header text
      await setStateAsync(this, {mode: 'fetching'})
    });
    //prevent animation from finishing too
    await timeout(500);
    //finish
    resolve();
  });
  

  _renderHeader = () => {
    const { mode } = this.state;

    let headerTitle    = '';
    let headerSubtitle = '';

    switch(mode) {
      case 'initial':
        headerTitle    = 'SIGN IN';
        headerSubtitle = 'Please sign in to continue';
        break;
      case 'loading':
        headerTitle    = 'LOGGING IN';
        headerSubtitle = 'Please wait for second...';
        break;
      case 'fetching':
        headerTitle    = 'FETCHING';
        headerSubtitle = 'Loading the data...';
        break;
      case 'succesful':
        headerTitle    = 'LOGGED IN';
        headerSubtitle = 'Login succesful, please wait.';
        break;
    }

    return(
      <View collapsable={true}>
        <Animatable.View
          style={{flexDirection: 'row'}}
          ref={r => this.headerTitle = r}
          useNativeDriver={true}
        >
          {(mode == 'loading' || mode == 'fetching') && <ActivityIndicator size='large' style={{marginRight: 10}}/>}
          <Text style={{fontSize: 38, fontWeight: '900', color: 'white'}}>
            {headerTitle}
          </Text>
        </Animatable.View>
        <Animatable.Text 
          style={{fontSize: 18, fontWeight: '100', color: 'white'}}
          ref={r => this.headerSubtitle = r}
          useNativeDriver={true}
        >
          {headerSubtitle}
        </Animatable.Text>
      </View>
    );
  }

  _renderSignInForm(){
    return(
      <View collapsable={true}>
        <InputForm
          placeholder='E-mail address'
          placeholderTextColor='rgba(255, 255, 255, 0.7)'
          keyboardType='email-address'
          textContentType='username'
          returnKeyType='next'
          iconName='ios-mail-outline'
          iconType='ionicon'
          iconSize={40}
        />
        <InputForm
          placeholder='Password'
          placeholderTextColor='rgba(255, 255, 255, 0.7)'
          textContentType='password'
          secureTextEntry={true}
          iconName='ios-lock-outline'
          iconType='ionicon'
          iconSize={40}
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
      </View>
    );
  }

  _renderSigninSuccessful(){
    return(
      <Animatable.View
        style={{alignItems: 'center', justifyContent: 'center', marginTop: 25}}
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
    console.log(this.props.mode);
    const { login } = this.props;
    const { mode } = this.state;
    return(
      <Animatable.View
        animation={'fadeIn'}
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        <AnimatedGradient
          style={styles.rootContainer}
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
              style={[styles.signInContainer, {overflow: 'hidden'}]}
              animation={'bounceInUp'}
              duration={1000}
              easing={'ease-in-out'}
              useNativeDriver={true}
            >
              {this._renderHeader()}
              {mode == 'initial'   && this._renderSignInForm      ()}
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