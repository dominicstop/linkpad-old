import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Keyboard, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator, KeyboardAvoidingView, Platform, NetInfo, InteractionManager } from 'react-native';

import { AnimatedGradient } from '../components/AnimatedGradient';
import { IconButton       } from '../components/Buttons';
import { IconText         } from '../components/Views';

import { ROUTES } from '../Constants';
import {setStateAsync, timeout} from '../functions/Utils';

import UserStore from '../functions/UserStore';
import { TipsStore } from '../functions/TipsStore';
import { ModuleStore } from '../functions/ModuleStore';
import { ResourcesStore } from '../functions/ResourcesStore';
import { ModulesLastUpdated, ResourcesLastUpdated, TipsLastUpdated } from '../functions/MiscStore';

import _ from 'lodash';
import { BlurView, LinearGradient } from 'expo';
import {  NavigationEvents } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import Animated, { Easing } from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {RED, PURPLE} from '../Colors';
import {validateEmail, validateNotEmpty} from '../functions/Validation';
const { set, cond, startClock, stopClock, clockRunning, block, add, Value, Clock, timing, concat, interpolate, defined, debug, and, or, onChange, eq, call } = Animated;

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
};

export class Login {
  static URL = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/login';

  static async login({email, pass}, onError) {
    try {
      //fetch request options
      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, pass}),
      };

      //check for internet connectivity
      const isConnected = await NetInfo.isConnected.fetch();
      if(isConnected){
        //post email/pass and wait for response
        const response = await fetch(Login.URL, options);
        //show error when response not okay
        if(!response.ok) {
          onError && onError({
            type   : 'RESPONSE_NOT_OKAY',
            message: 'There seems to be a problem with the server. Try again later.',
          });
        };
        //parse response as json
        const result = await response.json();

        //resolve results
        return {
          success: result.success || false, // whether or not if the user exists
          message: result.message || null , // ex: "Successfully logged in", "Wrong Password", "User not found"
          user   : result.user    || null , // obj: user inf, ex: email, firstname, isPremium etc.
          uid    : result.uid     || null , // unique user identifier
        };

      } else {
        onError && onError({
          type   : 'NO_INTERNET',
          message: 'Unable to connect to server. Please check your internet connection',
        });
      };
      
    } catch(error) {
      console.log("Error: Unale to login.");
      console.log(error);
      onError && onError({
        type   : 'ERROR',
        message: 'Unable to login, an error has occured.',
      });
    };
  };

  static async mockLogin({email, pass}, onError){
    await timeout(2000);
    return({
      "success": true,
      "message": "Successfully logged in",
      "user": {
        "email": "testaccount6@gmail.com",
        "firstname": "test",
        "ispremium": "False",
        "lastlogin": "",
        "lastname": "account",
        "userid": "testaccount6"
      },
      "uid": "X7CYGDXvPuRCzV0Kyq9i180BUj12"
    });
  };
};

class InputForm extends React.PureComponent {
  static propTypes = {
    isEnabled : PropTypes.bool  ,
    iconName  : PropTypes.string, 
    iconType  : PropTypes.string, 
    iconSize  : PropTypes.number, 
    iconColor : PropTypes.string,
    validate  : PropTypes.bool  ,
    validation: PropTypes.func  ,
  };

  static defaultProps = {
    iconColor: Platform.select({
      ios    : 'white',
      android: 'grey',
    }),
  };

  static CONSTANTS = {
    inputHeight: 35,
    inputFontSize: 22,
  }

  static styles = StyleSheet.create({
    container: {
      borderRadius: 10,
      flexDirection: 'row',
      height: InputForm.CONSTANTS.inputHeight + InputForm.CONSTANTS.inputFontSize,
      overflow: 'hidden',
    },
    background: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    iconContainer: {
      width: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 15,
    },
    iconOverlayContainer: {
      position: 'absolute',
      opacity: 0,
    },
    textinput: {
      flex: 1, 
      alignSelf: 'center', 
      fontSize: InputForm.CONSTANTS.inputFontSize, 
      marginLeft: 15,
      marginRight: 15,
      height: InputForm.CONSTANTS.inputHeight, 
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

  constructor(props){
    super(props);

    //icon opacity
    this.opacity = new Value(0.5);
    //bg opacity
    this.bgOpacity = interpolate(this.opacity, {
      inputRange : [0.5, 1],
      outputRange: [0  , 1],
    });

    this.state = {
      isFocused: false,
      textValue: '',
      showOverlayIcon: false,
    };
  };

  toggleOpacity(isActive){
    const config = {
      duration: 500,
      toValue : isActive? 1 : 0.5,
      easing  : Easing.inOut(Easing.ease),
    };
    this.timing = timing(this.opacity, config);
    this.timing.start();
  };

  toggleOverlayIcon = async (toggle) => {
    const { showOverlayIcon } = this.state;
    !showOverlayIcon && await setStateAsync(this, {showOverlayIcon: true});

    const iconOverlay = this.iconOverlay;
    iconOverlay && iconOverlay.transitionTo({opacity: toggle? 1 : 0}, 500);
  };

  getTextValue(){
    const { textValue } = this.state;
    return (textValue);
  };

  /** checks if value is valid vy calling the validation function */
  isValid(){
    const { validation } = this.props;
    const { textValue } = this.state;

    return (validation && validation(textValue));
  };

  _handleOnBlur = () => {
    const { validate, validation } = this.props;
    const { textValue } = this.state;

    this.toggleOpacity(false);
    this.setState({isFocused: false});

    const isValid = validation && validation(textValue);
    if(validate && !isValid){
      this.toggleOverlayIcon(true);
      this.container.shake(750);
    };
  };

  _handleOnFocus = () => {
    const { validate, validation } = this.props;

    this.container.pulse(750);
    this.toggleOpacity(true);
    this.setState({isFocused: true});

    if(validate){
      this.toggleOverlayIcon(false);
    };
  };

  _handleOnEndEditing = (event) => {
    const { onEndEditing } = this.props;
    this.setState({textValue: event.nativeEvent.text})
    //pass down evemt
    onEndEditing && onEndEditing(event);
  };

  _renderOverlayIcon(){
    const { styles } = InputForm;
    const { iconName, iconType, iconSize, validate, validation } = this.props;
    const { showOverlayIcon } = this.state;

    //dont render when validation is off or no validation func is given
    if(!validate || !validation || !showOverlayIcon) return null;

    return(
      <Animatable.View 
        style={styles.iconOverlayContainer}
        ref={r => this.iconOverlay = r}
        useNativeDriver={true}
      >
        <Icon
          name={iconName}
          type={iconType}
          size={iconSize}
          color={RED[900]}
        />
      </Animatable.View>
    );
  };

  render(){
    const { styles } = InputForm;
    const { iconName, iconType, iconSize, iconColor, isEnabled, onEndEditing, ...textInputProps } = this.props;
    const { isFocused } = this.state;

    const containerStyle = {
      backgroundColor: Platform.select({
        ios    : 'rgba(0, 0, 0, 0.25)',
        android: isEnabled? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.08)',
      }),
    };

    const placeholderTextColor = isFocused? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)';

    return(
      <Animatable.View 
        style={[styles.container, containerStyle]}
        ref={r => this.container = r}
        useNativeDriver={true}
      >
        <Animated.View style={[styles.background, {opacity: this.bgOpacity}]}/>
        <Animated.View style={[styles.iconContainer, {opacity: this.opacity}]}>
          <Icon
            name={iconName}
            type={iconType}
            size={iconSize}
            color={iconColor}
          />
          {this._renderOverlayIcon()}
        </Animated.View>
        <TextInput
          style={styles.textinput}
          ref={r => this.textInput = r}
          maxLength={50}
          autoCapitalize={'none'}
          enablesReturnKeyAutomatically={true}
          editable={isEnabled}
          keyboardAppearance={'dark'}
          multiline={false}
          onBlur={this._handleOnBlur}
          onFocus={this._handleOnFocus}
          onEndEditing={this._handleOnEndEditing}
          {...{placeholderTextColor, ...textInputProps}}
        />
      </Animatable.View>
    );
  };
};

class Expander extends React.PureComponent {
  static propTypes = {
    collapsedHeight   : PropTypes.number,
    expandedHeight    : PropTypes.number,
    initiallyCollapsed: PropTypes.bool  ,
  };

  static defaultProps = {
    collapsedHeight: 0,
    initiallyCollapsed: true,
  };

  constructor(props){
    super(props);
    const { initiallyCollapsed, collapsedHeight, expandedHeight } = props;

    //animation values
    this.progress = new Value(initiallyCollapsed? 0 : 100);
    this.status   = new Value(0);

    //interpolated values
    this.height = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [collapsedHeight, expandedHeight],
    });
    this.opacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 1],
    });
    this.scale = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.8, 1],
    });

    this.onAnimationFinished = null;
    this.state = {
      enableOverflow: false,
    };
  };

  /** expand or collapse the forms */
  async expand(expand){
    const { enableOverflow } = this.state;
    (enableOverflow != expand) && await setStateAsync(this, {enableOverflow: expand});

    const config = {
      duration: 350,
      toValue : expand? 100 : 0,
      easing  : Easing.inOut(Easing.ease),
    };

    const animation = timing(this.progress, config);
    animation.start();

    (enableOverflow != true) && await setStateAsync(this, {enableOverflow: true});
    await new Promise(resolve => this.onAnimationFinished = resolve);
  };

  _handleAnimationFinished = () => {
    const callback = this.onAnimationFinished;
    callback && callback();
  };

  render(){
    const { progress, status } = this;
    const { enableOverflow } = this.state;

    const containerStyle = {
      height : this.height,
      opacity: this.opacity,
      transform: [{ scale : this.scale }],
      overflow: enableOverflow? 'visible' : 'hidden',
    };
    
    return(
      <Animated.View style={[this.props.style, containerStyle]}>
        <Animated.Code exec={block([
          //animation started
          onChange(progress, cond(eq(status, 0), [
            set(status, add(this.status, 1)),
          ])),
          //animation finished
          cond(and(eq(status, 1), or(eq(progress, 0), eq(progress, 100))), [ 
            set(this.status, 0),
            call([this.status], this._handleAnimationFinished),
          ]),
        ])}/>
        {this.props.children}
      </Animated.View>
    );
  };
};

class SigninForm extends React.PureComponent {
  static propTypes = {
    onPressLogin: PropTypes.func,
  };

  static CONSTANTS = {
    spacer: 10,
    formPadding: 32,
    //sign in button
    signinLabel: 20,
    signinButtonPadding: 17,
    //sign up button
    signupLabel: 17,
    signupLabelMargin: 10,
  };

  static styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      overflow: 'hidden',
    },
    spacer: {
      marginVertical: SigninForm.CONSTANTS.spacer
    },
    signInButtonContainer: {
      //padding + fontsize
      height: (SigninForm.CONSTANTS.signinButtonPadding * 2) + SigninForm.CONSTANTS.signinLabel,
      paddingHorizontal: 15,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', 
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sigInButtonLabel: {
      color: 'white', 
      fontSize: SigninForm.CONSTANTS.signinLabel, 
      fontWeight: 'bold', 
      marginLeft: 20
    },
    signupButtonLabel: {
      fontSize: SigninForm.CONSTANTS.signupLabel, 
      fontWeight: '100', 
      color: 'white', 
      textAlign: 'center', 
      textDecorationLine: 'underline', 
      marginTop: SigninForm.CONSTANTS.signupLabelMargin, 
    },
  });

  constructor(props){
    super(props);
    this.state = {
      validate: false,
    };
  };

  //----- functions ------
  /** compute the expanded height of the signin form */
  getExpandedHeight(){
    const { CONSTANTS } = SigninForm;
    
    const spacer    = CONSTANTS.spacer;
    const padding   = CONSTANTS.formPadding;
    const signinBtn = (CONSTANTS.signinButtonPadding * 2) + CONSTANTS.signinLabel;
    const signupBtn = (CONSTANTS.signupLabelMargin   * 2) + CONSTANTS.signupLabel;
    const buttons   = signinBtn + signupBtn;

    const inputform = (({CONSTANTS} = InputForm) => 
      CONSTANTS.inputFontSize + CONSTANTS.inputHeight
    )();

    return (inputform * 2) + (spacer * 3) + padding + buttons;
  };

  validateFields(){
    const { validate } = this.state;
    //check if fields are valid
    const isValidEmail    = this.formEmail   .isValid();
    const isValidPassword = this.formPassword.isValid();
    //enable validation if not already
    !validate && this.setState({validate: true});

    //change icon color to red
    !isValidEmail    && this.formEmail   .toggleOverlayIcon(true);
    !isValidPassword && this.formPassword.toggleOverlayIcon(true);

    return({isValidEmail, isValidPassword});
  };

  getValues(){
    const email    = this.formEmail   .getTextValue();
    const password = this.formPassword.getTextValue();

    return({email, password});
  };

  //------ event handlers ------
  _handleOnSubmitEditingEmail = () => {
    const textInputPassword = this.formPassword.textInput;
    textInputPassword.focus();
  };

  _handleOnSubmitEditingPassword = async () => {
    //check if fields are valid
    const isValidEmail    = this.formEmail   .isValid();
    const isValidPassword = this.formPassword.isValid();
    //check if both email and pass are valid
    const isValid = (isValidEmail && isValidPassword);

    Keyboard.dismiss();
    await timeout(250);
    isValid && this.signinButtonContainer.pulse(750);
  };

  _handleValidationEmail = (email) => {
    return validateEmail(email);
  };

  _handleValidationPassword = (password) => {
    return password != '';
  };

  _handleOnEndEditingEmail = (event) => {
    const { validate } = this.state;

    //extract text value
    const emailValue = event.nativeEvent.text;
    const enableValidation = (emailValue != '');

    //enable validation if not already
    !validate && this.setState({validate: enableValidation});
  };
  
  _handleOnPressLogin =  async () => {
    const { onPressLogin } = this.props;
    onPressLogin && onPressLogin();
  };

  _renderLogInButton(){
    const { styles } = SigninForm;
    return(
      <Animatable.View
        ref={r => this.signinButtonContainer = r}
        useNativeDriver={true}
      >
        <IconButton 
          containerStyle={styles.signInButtonContainer}
          textStyle={styles.sigInButtonLabel}
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
      </Animatable.View>
    );
  };

  _renderSignUpButton(){
    const { styles } = SigninForm;
    return(
      <TouchableOpacity onPress={this._handleOnPressSignUp}>
        <Text 
          style={styles.signupButtonLabel}
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          Don't have an acoount? Sign Up
        </Text>
      </TouchableOpacity>
    );
  };

  render(){
    const { styles } = SigninForm;
    const { validate } = this.state;

    const expandedHeight = this.getExpandedHeight();
    const textInputProps = {
      underlineColorAndroid: 'rgba(0,0,0,0)',
      selectionColor: 'rgba(255, 255, 255, 0.7)',
      iconSize: 30,
      validate,
    };

    return(
      <Expander 
        style={styles.container}
        ref={r => this.expander = r}
        initiallyCollapsed={false}
        {...{expandedHeight}}
      >
        <View style={styles.spacer}/>
        <InputForm
          ref={r => this.formEmail = r}
          placeholder={'E-mail address'}
          keyboardType={'email-address'}
          textContentType={'username'}
          returnKeyType={'next'}
          onSubmitEditing={this._handleOnSubmitEditingEmail}
          onEndEditing={this._handleOnEndEditingEmail}
          validation={this._handleValidationEmail}
          iconName={'ios-mail'}
          iconType={'ionicon'}
          {...textInputProps}
        />
        <View style={styles.spacer}/>
        <InputForm
          ref={r => this.formPassword = r}
          placeholder={'Password'}
          textContentType={'password'}
          secureTextEntry={true}
          returnKeyType={'done'}
          validate={true}
          onSubmitEditing={this._handleOnSubmitEditingPassword}
          validation={this._handleValidationPassword}
          iconName={'ios-lock'}
          iconType={'ionicon'}
          {...textInputProps}
        />
        <View style={styles.spacer}/>
        {this._renderLogInButton()}
        {this._renderSignUpButton()}
      </Expander>
    );
  };
};

class WelcomeUser extends React.PureComponent {
  static propTypes = {
    onPressNext: PropTypes.func,
    user: PropTypes.object,
  };

  static CONSTANTS = {
    nextButtonPadding   : 15,
    nextButtonLabel     : 18,
    nextButtonSubtitle  : 17,
    userDetailsPadding  : 10,
    profileContainerSize: 75,
    spacers             : 10,
  };

  static styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
    },
    spacer: {
      margin: WelcomeUser.CONSTANTS.spacers,
    },
    //user details style
    userDetailsContainer: {
      flexDirection  : 'row'   ,
      alignItems     : 'center',
      justifyContent : 'center',
      borderRadius   : 10,
    },
    profileContainer: {
      width       : WelcomeUser.CONSTANTS.profileContainerSize,
      height      : WelcomeUser.CONSTANTS.profileContainerSize,
      borderRadius: WelcomeUser.CONSTANTS.profileContainerSize / 2,
      alignItems     : 'center'   ,
      justifyContent : 'center'   ,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    profileText: {
      fontSize  : 24     ,
      fontWeight: '900'  ,
      color     : 'white',
    },
    detailsContainer: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 13,
      alignSelf: 'stretch',
      marginLeft: 10,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
    },
    //user details text styles
    textName: {
      fontSize: 18,
      fontWeight: '700',
      color: 'white',
    },
    textEmail: {
      fontSize: 17,
      fontWeight: '200',
      color: 'white',
    },  
    textPremium: {
      fontSize: 16,
      fontWeight: '100',
      color: 'white',
    },
    //next button styles
    nextButtonContainer: {
      //padding + fontsize
      height: (WelcomeUser.CONSTANTS.nextButtonPadding * 2) + WelcomeUser.CONSTANTS.nextButtonLabel + WelcomeUser.CONSTANTS.nextButtonSubtitle,
      paddingHorizontal: 15,
      backgroundColor: 'rgba(0,0,0,0.4)', 
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonLabel: {
      flex: 0,
      fontSize: WelcomeUser.CONSTANTS.nextButtonLabel, 
      color: 'white', 
      fontWeight: 'bold', 
    },
    nextButtonSubtitle: {
      fontSize: WelcomeUser.CONSTANTS.nextButtonSubtitle, 
      flex: 0,
      color: 'white', 
      fontWeight: '200', 
    },
  });

  constructor(props){
    super(props);
    
  };

  getExpandedHeight(){
    const { CONSTANTS } = WelcomeUser;

    const padding     = 30;
    const userDetails = CONSTANTS.profileContainerSize;
    const spacer      = (CONSTANTS.spacers * 2);
    const button      = (CONSTANTS.nextButtonPadding * 2) + CONSTANTS.nextButtonLabel + CONSTANTS.nextButtonSubtitle;

    return (button + padding + userDetails + spacer);
  };

  _handleOnPressNext = () => {
    const { onPressNext } = this.props;
    onPressNext && onPressNext();
  };

  _renderUserDetails(){
    const { styles } = WelcomeUser;
    const { user } = this.props;

    const { firstname = '', lastname = '', email = '', ispremium } = user;
    const initials = firstname.charAt(0) + lastname.charAt(0);
    const name = firstname + lastname; 

    return(
      <View style={styles.userDetailsContainer}>
        <View style={styles.profileContainer}>
          <Text style={styles.profileText}>
            {initials}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text numberOfLines={1} style={styles.textName}>
            {name}
          </Text>
          <Text numberOfLines={1} style={styles.textEmail}>
            {email}
          </Text>
          <Text numberOfLines={1} style={styles.textPremium}>
            {ispremium? 'Premium' : 'Free'}
          </Text>
        </View>
      </View>
    );
  };

  _renderNextButton(){
    const { styles } = WelcomeUser;
    return(
      <Animatable.View
        animation={'pulse'}
        duration={1000}
        delay={2000}
        useNativeDriver={true}
      >
        <IconButton 
          containerStyle={styles.nextButtonContainer}
          textStyle={styles.nextButtonLabel}
          subtitleStyle={styles.nextButtonSubtitle}
          text={'Next'}
          subtitle={'download data'}
          iconName={'login'}
          iconType={'simple-line-icon'}
          iconColor={'white'}
          iconSize={22}
          onPress={this._handleOnPressNext}
        >
          <Icon
            name ={'chevron-right'}
            color={'rgba(255, 255, 255, 0.5)'}
            type ={'feather'}
            size ={25}
          /> 
        </IconButton>
      </Animatable.View>
    );
  };

  render(){
    const { styles } = WelcomeUser;    
    const expandedHeight = this.getExpandedHeight();
    return(
      <Expander
        style={styles.container}
        ref={r => this.expander = r}
        initiallyCollapsed={true}
        {...{expandedHeight}}
      >
        <View style={styles.spacer}/>
        {this._renderUserDetails()}
        <View style={styles.spacer}/>
        {this._renderNextButton()}
      </Expander>
    );
  };
};

class FormHeader extends React.PureComponent {
  static propTypes = {
    //mode: PropTypes.string,
  };

  static styles = StyleSheet.create({
    loadingIndicator: {
      marginRight: 10,
    },
    titleContainer: {
      flexDirection: 'row'
    },
    titleText: {
      fontSize: 38, 
      fontWeight: '900', 
      color: 'white'
    },
    subtitleText: {
      fontSize: 18, 
      fontWeight: '100', 
      color: 'white'
    },
  });

  constructor(props){
    super(props);

    const { MODES } = LoginScreen;
    const initialState = this.getStateFromMode(MODES.LOGIN);

    this.state = {
      mode: MODES.LOGIN,
      titleText   : initialState.titleText  ,
      subtitleText: initialState.subtitleText,
    };
  };

  getStateFromMode(modeParam){
    const { MODES } = LoginScreen;
    const mode = modeParam || this.state.mode;

    switch (mode) {
      case MODES.LOGIN: return {
        titleText   : 'SIGN IN', 
        subtitleText: 'Please sign in to continue...',
        showLoading : false,
      };
      case MODES.LOGGINGIN: return {
        titleText   : 'LOGGING IN', 
        subtitleText: 'Authenticating, please wait...',
        showLoading : true,
      };
      case MODES.LOGGEDIN: return {
        titleText   : 'LOGGGED IN', 
        subtitleText: 'Welcome to LinkPad!',
        showLoading : false,
      };
      case MODES.DOWNLOADING: return {
        titleText   : 'DOWNLOADING', 
        subtitleText: 'Fetching data from server...',
        showLoading : false,
      };
    };
  };

  async changeTitleDescription(newTitle, newSubtitle, nextState = {}){
    const { titleText, subtitleText } = this.state;

    //check if the title/subtitle changed
    const didChangeTitle    = (titleText    != newTitle   );
    const didChangeSubtitle = (subtitleText != newSubtitle);

    if(didChangeTitle || didChangeSubtitle){
      //hide title and subtitle first
      await Promise.all([
        didChangeTitle    && this.headerTitle   .fadeOutLeft(200),
        didChangeSubtitle && this.headerSubtitle.fadeOutLeft(300),
      ]);
      //then update title and subtitle
      this.setState({
        titleText   : newTitle,
        subtitleText: newSubtitle,
        ...nextState
      });
      //finally, animate in title and subtitle
      await Promise.all([
        didChangeTitle    && this.headerTitle   .fadeInRight(400),
        didChangeSubtitle && this.headerSubtitle.fadeInRight(600),
      ]);
    };
  };

  async changeMode(mode){
    const { MODES } = LoginScreen;
    const { titleText, subtitleText } = this.getStateFromMode(mode);

    await this.changeTitleDescription(titleText, subtitleText, {mode})
    this.setState({mode, titleText, subtitleText});
  };

  _renderTitle(){
    const { styles } = FormHeader;
    const { titleText } = this.state;
    const { showLoading } = this.getStateFromMode();

    return(
      <Animatable.View
        style={styles.titleContainer}
        ref={r => this.headerTitle = r}
        useNativeDriver={true}
      >
        {showLoading && <ActivityIndicator 
          style={styles.loadingIndicator} 
          size='large' 
          color={'rgba(255, 255, 255, 0.8)'}
        />}
        <Text style={styles.titleText}>
          {titleText}
        </Text>
      </Animatable.View>
    );
  };

  _renderSubtitle(){
    const { styles } = FormHeader;
    const { subtitleText } = this.state;

    return(
      <Animatable.Text 
        style={styles.subtitleText}
        ref={r => this.headerSubtitle = r}
        useNativeDriver={true}
      >
        {subtitleText}
      </Animatable.Text>
    );
  };

  render() {
    return(
      <View>
        {this._renderTitle()}
        {this._renderSubtitle()}
      </View>
    );
  };
};

class FormContainer extends React.Component {
  static propTypes = {
    onPressLogin: PropTypes.func,
    login: PropTypes.func,
    user: PropTypes.object,
  };

  static styles = StyleSheet.create({
    rootContainer: {
      width: '100%', 
      height: '100%', 
      paddingTop: 20,
    },
    scrollview: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signInContainer: {
      alignSelf: 'stretch', 
      alignItems: 'stretch', 
      margin: 15, 
      borderRadius: 20,
      overflow: 'hidden',
    },
    blurview: {
      flex: 1,
    },
    gradientBG: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 25,
    },
  });

  constructor(props){
    super(props);
    const { MODES } = LoginScreen;

    //prevent multiple presses
    this._handleOnPressSignin = _.throttle(this._handleOnPressSignin, 1000, {leading:true, trailing:false});
    this._handleOnPressNext   = _.throttle(this._handleOnPressNext  , 1000, {leading:true, trailing:false});

    this.onPressNextCallback = null;
  };

  //----- event handlers -----
  _handleOnModeChange = (mode) => {
    const { MODES } = LoginScreen;
    const handle = InteractionManager.createInteractionHandle();
    
    switch (mode) {
      case MODES.LOGGINGIN: return (async () => {
        //collapse signin form
        const expander = this.signinForm.expander;
        await expander.expand(false);

        //change header to logging in
        await Promise.all([
          this.formHeader.changeMode(MODES.LOGGINGIN),
          this.signInContainer.pulse(1250),
        ]);
        //end of animation
        InteractionManager.clearInteractionHandle(handle);
      });

      case MODES.LOGGEDIN: return (async () => {
        //change header to Logged In
        await Promise.all([
          this.formHeader.changeMode(MODES.LOGGEDIN),
          this.signInContainer.pulse(1250),
        ]);

        //collapse welcomeUser
        const expander = this.welcomeUser.expander;
        await expander.expand(true);
        //end of animation
        InteractionManager.clearInteractionHandle(handle);

        //wait until onPressNextCallback is called
        await new Promise(resolve => this.onPressNextCallback = resolve);
        //collapse welcomeUser
        await expander.expand(false);
      });

      case MODES.DOWNLOADING: return (async () => {
        await Promise.all([
          this.formHeader.changeMode(MODES.DOWNLOADING),
          this.signInContainer.pulse(1250),
        ]);
        InteractionManager.clearInteractionHandle(handle);
      });
    };
  };

  _handleOnPressSignin = async () => {
    const { MODES } = LoginScreen;
    const { login } = this.props;

    //hide keyboard/blur
    Keyboard.dismiss();
    //validate fields and trigger animations if not valid
    const { isValidEmail, isValidPassword } = this.signinForm.validateFields();
    //check if both password/email is valid    
    const isAllFieldsValid = true;//(isValidEmail && isValidPassword);

    if(isAllFieldsValid){
      const { email, password } = this.signinForm.getValues();
      login && await login({email, pass: password}, this._handleOnModeChange);

    } else {
      await this.signInContainer.shake(750);
    };
  };

  _handleOnPressNext = () => {
    this.onPressNextCallback && this.onPressNextCallback();
  };

  _renderContents(){
    const { MODES } = LoginScreen;
    const { mode, user } = this.props;

    switch (mode) {
      case MODES.LOGIN: return(
        <SigninForm
          ref={r => this.signinForm = r}
          onPressLogin={this._handleOnPressSignin}
        />
      );
      case MODES.LOGGEDIN: return(
        <WelcomeUser
          ref={r => this.welcomeUser = r}
          onPressNext={this._handleOnPressNext}
          {...{user}}
        />
      );
    };
  };

  _renderContainer(){
    const { styles } = FormContainer;
    return(
      <Animatable.View 
        style={styles.signInContainer}
        ref={r => this.signInContainer = r}
        animation={'bounceInUp'}
        duration={1000}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        <BlurView
          style={styles.blurview}
          intensity={100}
          tint={'default'}
        >
          <LinearGradient
            style={styles.gradientBG}
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.75)']}
          >
            <FormHeader ref={r => this.formHeader = r}/>
            {this._renderContents()}
          </LinearGradient>
        </BlurView>
      </Animatable.View>
    );
  };

  render(){
    const { styles } = FormContainer;
    return(
      <View style={styles.rootContainer}> 
        <ScrollView
          contentContainerStyle={styles.scrollview}
          keyboardShouldPersistTaps={'always'} 
          keyboardDismissMode={'on-drag'}
        >
          {this._renderContainer()}   
        </ScrollView>
        <KeyboardSpacer/>
      </View>
    );
  };
};

//dumb cont: presents the UI for Android
class LoginAndroid extends React.Component {
  static propType = {
    onPressLogin: PropTypes.func,
  };

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
    //prevent multiple presses
    this._handleOnPressLogin  = _.throttle(this._handleOnPressLogin , 1000, {leading:true, trailing:false});
    this._handleOnPressSignUp = _.throttle(this._handleOnPressSignUp, 1000, {leading:true, trailing:false});
  };

  componentDidFocus = async () => {
    //dont animate on first mount
    if(this.state.firstRender){
      this.setState({firstRender: false});
      return;
    }
    await this.ref_rootView.fadeInLeft(300);
  };

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
  };

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
  };

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
  };

  toggleLoading = async () => {
    await this.setMode(MODES.loading);
  };

  toggleLoginFetching = async () => {
    await this.setMode(MODES.fetching);
  };

  toggleLoginInvalid = async () => {
    await this.setMode(MODES.invalid);    
  };

  toggleLoginError = async () => {
    await this.setMode(MODES.error);
  };

  toggleLoginSuccessful = async () => {
    await this.setMode(MODES.succesful);
  };

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
  };

  _handleOnPressSignUp = async () => {
    const { onPressSignUp } = this.props;
    await this.ref_rootView.fadeOutLeft(300);
    onPressSignUp && onPressSignUp();
  };

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
  };

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
  };

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
};

export default class LoginScreen extends React.Component { 
  static navigationOptions = {
  };

  static MODES = {
    'LOGIN'      : 'LOGIN'      ,
    'LOGGINGIN'  : 'LOGGINGIN'  ,
    'LOGGEDIN'   : 'LOGGEDIN'   ,
    'LOGINFAILED': 'LOGINFAILED',
    'DOWNLOADING': 'DOWNLOADING',
  };

  constructor(props){
    super(props);
    const { MODES } = LoginScreen;

    this.state = {
      mode: MODES.LOGIN,
      user: null,
    };
  };

  changeMode(nextMode, otherState = {}){
    const { mode } = this.state;
    //update mode if the mode has changed
    (mode != nextMode) && this.setState({
      mode: nextMode, 
      ...otherState
    });
  };

  login = async (loginCredentials, onModeChange) => {
    const { MODES } = LoginScreen;

    const [results] = await Promise.all([
      Login.mockLogin(loginCredentials),
      onModeChange && onModeChange(MODES.LOGGINGIN)(),
      timeout(2000),
    ]);

    this.changeMode(MODES.LOGGEDIN, {user: results.user});
    await Promise.all([
      onModeChange && onModeChange(MODES.LOGGEDIN)(),
      timeout(2000),
    ]);

    this.changeMode(MODES.DOWNLOADING);
    await Promise.all([
      onModeChange && onModeChange(MODES.DOWNLOADING)(),
      timeout(2000),
    ]);
  };

  _handleOnPressSignUp = () => {
    const { navigation } = this.props;
    navigation.navigate('SignUpRoute');
  };

  render(){
    const { mode, user } = this.state;
    return(
      <View collapsable={true}>
        <FormContainer
          onPressSignUp={this._handleOnPressSignUp}
          login={this.login}
          {...{mode, user}}
        />
      </View>
    );
  };
};

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
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
      },
      android: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        paddingTop: 25,
        elevation: 15,
      },
    })
  },
});