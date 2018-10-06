import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Keyboard, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';

import { AnimatedGradient } from '../components/AnimatedGradient';
import { IconButton       } from '../components/Buttons';
import { IconText         } from '../components/Views';
import {setStateAsync, timeout} from '../functions/Utils';

import ModuleStore from '../functions/ModuleStore';
import TipsStore from '../functions/TipsStore';
import UserStore from '../functions/UserStore';

import _ from 'lodash';
import { Header, NavigationEvents } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import store from 'react-native-simple-store';

//enable layout animation
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

//Enum for each login state
const MODES = {
  initial  : 'initial'  ,
  loading  : 'loading'  ,
  fetching : 'fetching' ,
  succesful: 'succesful',
  invalid  : 'invalid'  ,
  error    : 'error'    ,
}

export class InputForm extends React.PureComponent {
  static propType = {
    //for styling
    iconName : PropTypes.string,
    iconType : PropTypes.string,
    iconSize : PropTypes.number,
    iconColor: PropTypes.string,
    isEnabled: PropTypes.bool  ,
  }

  static defaultProps = {
    iconColor: Platform.select({
      ios: 'white',
      android: 'grey',
    }),
  }

  render(){
    const { iconName, iconType, iconSize, iconColor, isEnabled, ...textInputProps } = this.props;
    const backgroundColor = Platform.select({
      ios: {
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      },
      android: {
        backgroundColor: isEnabled? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.08)',
      },
    });
    return(
      <Animatable.View 
        style={[styles.textinputContainer, {...backgroundColor}]}
      >
        <Icon
          containerStyle={styles.textInputIcon}
          name={iconName}
          type={iconType}
          size={iconSize}
          color={iconColor}
        />
        <TextInput
          style={styles.textinput}
          maxLength={50}
          autoCapitalize='none'
          enablesReturnKeyAutomatically={true}
          editable={isEnabled}
          {...textInputProps}
        />
      </Animatable.View>
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

//dumb cont: presents the UI for iOS
export class LoginUI_iOS extends React.Component {
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
    //prevent multiple presses
    this._handleOnPressLogin  = _.throttle(this._handleOnPressLogin , 1000, {leading:true, trailing:false});
    this._handleOnPressSignUp = _.throttle(this._handleOnPressSignUp, 1000, {leading:true, trailing:false});
  }

  componentDidFocus = async () => {
    await this.ref_rootView.fadeInLeft(300);
  }

  //returns the corresponding state for the mode
  getState = (mode) => {
    switch(mode) {
      case MODES.initial: return {
        titleText      : 'SIGN IN',
        subtitleText   : 'Please sign in to continue',
        isLoading      : false,
        emailValue     : '',
        passwordValue  : '',
        isEmailValid   : true,
        isPasswordValid: true,
       ...{mode},
      };
      case MODES.loading: return {
        titleText   : 'LOGGING IN',
        subtitleText: 'Please wait for second...',
        isLoading   : true,
        ...{mode}
      };
      case MODES.fetching: return {
        titleText   : 'FETCHING',
        subtitleText: 'Loading the data...',
        isLoading   : true,
        ...{mode}
      };
      case MODES.succesful: return {
        titleText      : 'LOGGED IN',
        subtitleText   : 'Login succesful, please wait.',
        isLoading      : false,
        isEmailValid   : true,
        isPasswordValid: true,
        ...{mode}
      };
      case MODES.invalid: return {
        titleText      : 'SIGN IN',
        subtitleText   : 'Invalid email or password (please try again)',
        isLoading      : false,
        emailValue     : '',
        passwordValue  : '',
        isEmailValid   : false,
        isPasswordValid: false,
        ...{mode}
      };
      case MODES.error: return {
        titleText      : 'SIGN IN',
        subtitleText   : 'Something went wrong (please try again)',
        isLoading      : false,
        isEmailValid   : true,
        isPasswordValid: true,
        ...{mode}
      };
    }
  }

  _handleOnPressLogin = async () => {
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

  _handleOnPressSignUp = async () => {
    const { onPressSignUp } = this.props;
    await this.ref_rootView.fadeOutLeft(300);
    onPressSignUp && onPressSignUp();
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
  transitionHeader = async (callback, animateTitle = true, animateSubtitle = true) => {
    //animate in
    await Promise.all([
      animateTitle    && this.headerTitle   .fadeOutLeft(250),
      animateSubtitle && this.headerSubtitle.fadeOut(100),
    ]);
    //call callback function
    callback && await callback();
    //animate out
    await Promise.all([
      animateTitle    && this.headerTitle.fadeInRight(250),
      animateSubtitle && this.headerSubtitle.fadeInRight(400),
    ]);
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
    const { isLoading, titleText, subtitleText, } = this.state;

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
          onPress={this._handleOnPressLogin}
        >
          <Icon
            name ={'chevron-right'}
            color={'rgba(255, 255, 255, 0.5)'}
            type ={'feather'}
            size ={25}
          /> 
        </IconButton>

        <TouchableOpacity onPress={this._handleOnPressSignUp}>
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
      <View collapsable={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <Animatable.View
          ref={r => this.ref_rootView = r}
          style={styles.rootContainer}
          animation={'fadeIn'}
          duration={500}
          easing={'ease-in-out'}
          useNativeDriver={true}
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
        </Animatable.View>
      </View>
    );
  }
}

//dumb cont: presents the UI for Android
export class LoginUI_android extends React.Component {
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
      firstRender: true,
    };
    //set initial state
    this.state = this.getState('initial');
  }

  componentDidFocus = async () => {
    //dont animate on first mount
    if(this.state.firstRender){
      this.setState({firstRender: false});
      return;
    }
    await this.ref_rootView.fadeInLeft(300);
  }

  //returns the corresponding state for the mode
  getState = (mode) => {
    switch(mode) {
      case MODES.initial: return {
        titleText      : 'Log in...',
        subtitleText   : 'Please sign in to continue',
        isLoading      : false,
        emailValue     : '',
        passwordValue  : '',
        isEmailValid   : true,
        isPasswordValid: true,
        firstRender    : true,
       ...{mode},
      };
      case MODES.loading: return {
        titleText      : 'Logging in...',
        subtitleText   : 'Please wait for a second...',
        isLoading      : true,
        isEmailValid   : true,
        isPasswordValid: true,
        ...{mode}
      };
      case MODES.fetching: return {
        titleText   : 'Logging in...',
        subtitleText: 'Fetching data from server...',
        isLoading   : true,
        ...{mode}
      };
      case MODES.succesful: return {
        titleText      : 'Welcome...',
        subtitleText   : 'Login succesful, please wait.',
        isLoading      : false,
        isEmailValid   : true,
        isPasswordValid: true,
        ...{mode}
      };
      case MODES.invalid: return {
        titleText      : 'Log in...',
        subtitleText   : 'Your email or password is invalid (please try again.)',
        isLoading      : false,
        emailValue     : '',
        passwordValue  : '',
        isEmailValid   : false,
        isPasswordValid: false,
        ...{mode}
      };
      case MODES.error: return {
        titleText      : 'Log In...',
        subtitleText   : 'Something went wrong (please try again)',
        isLoading      : false,
        isEmailValid   : true,
        isPasswordValid: true,
        ...{mode}
      };
    }
  }

  //transtion in/out title and subtitle
  transitionHeader = (callback, animateTitle = true, animateSubtitle = true) => {
    return new Promise(async resolve => {
      //animate in
      await Promise.all([
        animateTitle    && this.headerTitle   .fadeOutLeft(250),
        animateSubtitle && this.headerSubtitle.fadeOut(100),
      ]);
      //call callback function
      callback && await callback();
      //animate out
      await Promise.all([
        animateTitle    && this.headerTitle   .fadeInRight(250),
        animateSubtitle && this.headerSubtitle.fadeInRight(400),
      ]);
      //finish animation
      resolve();
    });
  }

  //helper function to animate changes based on mode
  setMode = async (mode) => {
    const nextState = this.getState(mode);
    const { titleText, subtitleText } = this.state;
    //if there are changes, animate title/sub
    const animateTitle    = titleText    !== nextState.titleText;
    const animateSubtitle = subtitleText !== nextState.subtitleText;
    //animate header
    await this.transitionHeader(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return setStateAsync(this, nextState);
    }, animateTitle, animateSubtitle);
    //reduce stutter
    await timeout(150);
  }

  toggleLoading = async () => {
    await this.setMode(MODES.loading);
  }

  toggleLoginFetching = async () => {
    await this.setMode(MODES.fetching);
  }

  toggleLoginInvalid = async () => {
    await this.setMode(MODES.invalid);    
  }

  toggleLoginError = async () => {
    await this.setMode(MODES.error);
  }

  toggleLoginSuccessful = async () => {
    await this.setMode(MODES.succesful);
  }

  _handleOnPressLogin = async () => {
    const { emailValue, passwordValue, isLoading } = this.state;
    //dont invoke when loading
    if(isLoading) return;
    //dismiss keyboard
    Keyboard.dismiss();
    //call login from props
    this.props.login({email: emailValue, pass: passwordValue}, {
      //pass the callback functions
      onLoginLoading : this.toggleLoading        ,
      onLoginFetching: this.toggleLoginFetching  ,
      onLoginInvalid : this.toggleLoginInvalid   ,
      onLoginError   : this.toggleLoginError     ,
      onLoginFinished: this.toggleLoginSuccessful,
    });
  }

  _handleOnPressSignUp = async () => {
    const { onPressSignUp } = this.props;
    await this.ref_rootView.fadeOutLeft(300);
    onPressSignUp && onPressSignUp();
  }

  //the logo on top of sign in container
  _renderLogo(){
    return(
      <Animatable.View
        style={{marginBottom: -45, elevation: 20}}
        animation={'fadeInUp'}
        duration={400}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        <View style={{width: 100, height: 100, backgroundColor: 'white', borderRadius: 50, borderColor: 'rgba(255, 255, 255, 0.4)', borderWidth: 6}}>

        </View>
      </Animatable.View>
    );
  }

  _renderLogInButton(){
    const { isLoading } = this.state;
    //Button text
    const text = isLoading? 'Logging in...' : 'Log In';
    //Button right component
    const chevron = (<Icon
      name ={'chevron-right'}
      color={'rgba(255, 255, 255, 0.5)'}
      type ={'feather'}
      size ={25}
    />);
    const loading = (<ActivityIndicator
      color={'white'}
      size={25}
    />);

    return(
      <Fragment>
        <IconButton 
          containerStyle={{padding: 15}}
          wrapperStyle={{marginTop: 25, backgroundColor: '#5E35B1', borderRadius: 20}}
          textStyle={{color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 20}}
          iconName={'login'}
          iconType={'simple-line-icon'}
          iconColor={'white'}
          iconSize={22}
          onPress={this._handleOnPressLogin}
          {...{text}}
        >
          {isLoading? loading : chevron}
        </IconButton>
        <TouchableOpacity onPress={this._handleOnPressSignUp}>
          <Text 
            style={{fontSize: 16, fontWeight: '100', color: 'grey', textAlign: 'center', textDecorationLine: 'underline', marginTop: 7, marginBottom: 10}}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            Don't have an acoount? Sign Up
          </Text>
      </TouchableOpacity>
      </Fragment>
    );
  }

  //login inputs
  _renderForm(){
    const { emailValue, passwordValue, isEmailValid, isPasswordValid, isLoading } = this.state;
    const textInputProps = {
      underlineColorAndroid: 'rgba(0,0,0,0)',
      selectionColor: 'rgba(255, 255, 255, 0.7)',
      placeholderTextColor: 'rgba(0, 0, 0, 0.35)',
      isEnabled: !isLoading
    }
    //placeholder text color
    if(!isEmailValid || !isPasswordValid ){
      textInputProps.placeholderTextColor = 'darkred';
    }
    //icon colors idle/active
    let emailIconColor    = emailValue    == ''? 'grey' : 'black' ;
    let passwordIconColor = passwordValue == ''? 'grey' : 'black' ;
    //icon colors when invalid
    if(!isEmailValid   ) emailIconColor    = 'red';
    if(!isPasswordValid) passwordIconColor = 'red';
    

    return(
      <Animatable.View 
        collapsable={true}
        animation={'fadeInUp'}
        easing={'ease-in-out'}
        duration={750}
        useNativeDriver={true}
      >
        <InputForm
          placeholder='E-mail address'
          keyboardType='email-address'
          onChangeText={(text) => this.setState({emailValue: text, isEmailValid: true})}
          textContentType='username'
          returnKeyType='next'
          iconName='ios-mail-outline'
          iconType='ionicon'
          iconSize={30}
          iconColor={emailIconColor}
          {...textInputProps}
        />
        <InputForm
          placeholder='Password'
          onChangeText={(text) => this.setState({passwordValue: text, isPasswordValid: true})}
          placeholderTextColor='rgba(255, 255, 255, 0.7)'
          textContentType='password'
          secureTextEntry={true}
          iconName='ios-lock-outline'
          iconType='ionicon'
          iconSize={30}
          iconColor={passwordIconColor}
          {...textInputProps}
        />
        {this._renderLogInButton()}
      </Animatable.View>
    );
  }
  
  //sign in form container
  _renderSignIn(){
    const { titleText, subtitleText } = this.state;
    return(
      <Animatable.View 
        style={[styles.signInContainer, {overflow: 'hidden'}]}
        ref={r => this.animatedSignInContainer = r}
        animation={'fadeInUp'}
        duration={600}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        <Animatable.Text 
          ref={r => this.headerTitle = r}
          style={{fontSize: 32, fontWeight: '900'}}
          useNativeDriver={true}
        >
          {titleText}
        </Animatable.Text>
        <Animatable.Text 
          ref={r => this.headerSubtitle = r}
          style={{fontSize: 18, fontWeight: '100', color: 'grey'}}
          useNativeDriver={true}
        >
          {subtitleText}
        </Animatable.Text>
        {this._renderForm()}
      </Animatable.View>
    );
  }

  
  render(){
    const { login } = this.props;
    const { isLoading, mode, isCollapsed } = this.state;
    return(
      <View collapsable={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <Animatable.View
          ref={r => this.ref_rootView = r}
          style={styles.rootContainer}
          duration={500}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          <KeyboardAvoidingView
            style={{flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center'}}
            behavior='padding'
          >
            {this._renderLogo  ()}
            {this._renderSignIn()}
          </KeyboardAvoidingView>
        </Animatable.View>
      </View>
    );
  }
}

export default class LoginScreen extends React.Component { 
  static navigationOptions = {
  }

  _handleOnPressSignUp = () => {
    const { navigation } = this.props;
    navigation.navigate('SignUpRoute');
  }

  componentWillBlur = () => {
    const { getAuthBGGradientRef } = this.props.screenProps;
    //stop the BG Gradient animation
    getAuthBGGradientRef && getAuthBGGradientRef().stop();
  }

  componentDidFocus = () => {
    const { getAuthBGGradientRef } = this.props.screenProps;
    //start the BG Gradient animation
    getAuthBGGradientRef && getAuthBGGradientRef().start();
  }

  render(){
    return(
      <View collapsable={true}>
        <NavigationEvents 
          onWillBlur={this.componentWillBlur}
          onDidFocus={this.componentDidFocus}
        />
        <LoginContainer navigation={this.props.navigation}>
          {Platform.select({
            ios    : <LoginUI_iOS     onPressSignUp={this._handleOnPressSignUp}/>,
            android: <LoginUI_android onPressSignUp={this._handleOnPressSignUp}/>,
          })}
        </LoginContainer>
      </View>
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
    borderRadius: 20,
    ...Platform.select({
      ios: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      },
      android: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        paddingTop: 25,
        elevation: 15,
      },
    })
  },
  textinputContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    borderWidth: 1,
    paddingHorizontal: 5,
    ...Platform.select({
      ios: {
        borderBottomColor: 'rgba(255, 255, 255, 0.25)', 
        color: 'white', 
      },
      android: {
        color: 'black'
      },
    }),
  }
});