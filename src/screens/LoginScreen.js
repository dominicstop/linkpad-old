import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Keyboard, ScrollView, TextInput, UIManager, ActivityIndicator, Platform, InteractionManager, Clipboard } from 'react-native';

import { ROUTES } from '../Constants';
import { RED } from '../Colors';

import { TipsStore } from '../functions/TipsStore';
import { ModuleStore } from '../functions/ModuleStore';
import { ResourcesStore } from '../functions/ResourcesStore';
import { validateEmail } from '../functions/Validation';
import { Login, LoginResponseModel } from '../functions/Login';
import { setStateAsync, timeout, runAfterInteractions } from '../functions/Utils';

import { IconButton       } from '../components/Buttons';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Icon } from 'react-native-elements';
import {  NavigationEvents } from 'react-navigation';
import { BlurView, LinearGradient } from 'expo';

import Animated, { Easing } from 'react-native-reanimated';
import {UserStore} from '../functions/UserStore';
const { set, cond, block, add, Value, timing, interpolate, and, or, onChange, eq, call, Clock, clockRunning, startClock, stopClock, concat, color, divide, multiply, sub, lessThan, abs, modulo, round, debug, clock } = Animated;

//enable layout animation
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

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

  static styles = StyleSheet.create({
    container: {
      borderRadius: 10,
      flexDirection: 'row',
      paddingVertical: 10,
      overflow: 'hidden',
    },
    background: {
      position: 'absolute',
      width: '100%',
      height: '200%',
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
      fontSize: 22, 
      marginLeft: 15,
      marginRight: 15,
      borderColor: 'transparent', 
      borderWidth: 1,
      paddingTop: 3,
      paddingBottom: 7,
      ...Platform.select({
        ios: {
          borderBottomColor: 'rgba(255, 255, 255, 0.15)', 
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

  _handleOnChangeText = (text) => {
    const { onChangeText } = this.props;
    this.setState({textValue: text})
    //pass down to callback
    onChangeText && onChangeText(text);
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
    const { iconName, iconType, iconSize, iconColor, isEnabled, onChangeText, ...textInputProps } = this.props;
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
          underlineColorAndroid={'transparent'}
          onBlur={this._handleOnBlur}
          onFocus={this._handleOnFocus}
          onChangeText={this._handleOnChangeText}
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

  static runTiming(clock, value, dest) {
    const state = {
      finished: new Value(0),
      position: value,
      time: new Value(0),
      frameTime: new Value(0),
    };
  
    const config = {
      duration: 450,
      toValue: dest,
      easing: Easing.inOut(Easing.ease),
    };
  
    return block([
      cond(clockRunning(clock), 0, [
        // If the clock isn't running we reset all the animation params and start the clock
        set(state.finished , 0),
        set(state.time     , 0),
        set(state.frameTime, 0),
        set(state.position , value),
        set(config.toValue , dest ),
        startClock(clock),
      ]),
      // we run the step here that is going to update position
      timing(clock, state, config),
      // if the animation is over we stop the clock
      cond(state.finished, [
        //debug('positon: ', state.position),
        debug('stop clock', stopClock(clock)),
      ]),
      // we made the block return the updated position
      state.position,
    ]);
  };

  constructor(props){
    super(props);
    const { initiallyCollapsed, collapsedHeight } = props;

    const initalValue = initiallyCollapsed? 0 : 100;
    //animation values
    this.progressInitial = new Value(initalValue);
    this.progressFinal   = new Value(initalValue);
    this.expandedHeight  = new Value(-1);
    this.overflow        = new Value(0);
    this.status          = new Value(0);

    const clock = new Clock();
    this.progress = Expander.runTiming(clock, this.progressInitial, this.progressFinal);

    //interpolated values
    this.height = cond(eq(this.expandedHeight, -1), 0, interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [collapsedHeight, this.expandedHeight],
      extrapolate: 'clamp',
    }));
    this.opacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    this.scale = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.9, 1],
      extrapolate: 'clamp',
    });

    this.isHeightSet = false;
    this.onAnimationFinished = null;
    this.isExpanded = !initiallyCollapsed;
  };

  /** expand or collapse the forms */
  async expand(expand){
    if(this.isExpanded != expand){
      this.progressFinal.setValue(expand? 100 : 0);
      await Promise.all([
        new Promise(resolve => this.onAnimationFinished = resolve),
        timeout(500),
      ]);
      this.isExpanded = expand;
    };
  };

  _handleAnimationFinished = () => {
    const callback = this.onAnimationFinished;
    callback && callback();
  };

  _handleOnLayout = ({nativeEvent}) => {
    const { x, y, width, height } = nativeEvent.layout;
    if(height != 0 && !this.isHeightSet){
      this.expandedHeight.setValue(height);
      this.isHeightSet = true;
      console.log(`height: ${height}`);
    };
  };

  render(){
    const { progress, status } = this;
    const containerStyle = {
      height : this.height,
      opacity: this.opacity,
      transform: [{ scale : this.scale }],
      overflow: cond((eq, this.overflow, 1), 'visible', 'hidden'),
    };
    
    return(
      <Animated.View style={[this.props.style, containerStyle]}>
        <Animated.Code exec={block([
          //animation started
          onChange(progress, cond(eq(status, 0), [
            set(status, 1),
            cond(eq(this.progressFinal, 1),
              set(this.overflow, 1),
              set(this.overflow, 0)
            ),
          ])),
          //animation finished
          cond(and(eq(status, 1), or(eq(progress, 0), eq(progress, 100))), [ 
            set(this.status, 0),
            call([this.status], this._handleAnimationFinished),
          ]),
        ])}/>
        <View onLayout={this._handleOnLayout}>
          {this.props.children}
        </View>
      </Animated.View>
    );
  };
};

class ProgressBar extends React.PureComponent {
  static propTypes = {
    opacityInitial    : PropTypes.number,
    opacityFinal      : PropTypes.number,
    height            : PropTypes.number,
    textTitle         : PropTypes.string,
    textSubtitle      : PropTypes.string,
    textSubtitleError : PropTypes.string,
    styleTitle        : PropTypes.object,
    styleSubtitle     : PropTypes.object,
    styleSubtitleError: PropTypes.object,
  };

  static MODES = {
    INITIAL    : 'INITIAL'    ,
    DOWNLOADING: 'DOWNLOADING',
    FINISHED   : 'FINISHED'   ,
    ERROR      : 'ERROR'      ,
  };

  static styles = StyleSheet.create({
    container: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: 'rgba(0,0,0,0.2)',
      padding: 1,
    },
    progressbar: {
      position: 'absolute',
      height: '110%',
      backgroundColor: 'red',
      overflow: 'hidden',
      backgroundColor: 'black',
    },
    leftContainer: {
      marginLeft: 12,
      width: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      flex: 1,
      marginLeft: 10,
    },
    percentageContainer: {
      marginRight: 12,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white'
    },
    percentageStyle: {
      fontSize: 16,
      fontWeight: '200',
      color: 'white',
    },
    progressSubtitle: {
      fontSize: 16,
      fontWeight: '200',
      color: 'white',
    },
    progressSubtitleError: {
      fontSize: 16,
      fontWeight: '300',
      color: 'red',
    },
  });

  static runTiming(clock, value, dest, callback) {
    const state = {
      finished : new Value(0), // will be set to 1 when the position reaches the final value or when frameTime exceeds duration
      position : new Value(0), // gets updated on every frame (value depends on duration and toValue)
      time     : new Value(0), // indicates the last clock time the animation node has been evaluated
      frameTime: new Value(0), // represents the progress of animation in ms (how long the animation has lasted so far)
    };
  
    const config = {
      duration: 900,
      toValue : new Value(0),
      easing  : Easing.inOut(Easing.ease),
    };
      
    return block([
      cond(clockRunning(clock), [,
        // if the clock is already running we update the toValue, in case a new dest has been passed in
        set(config.toValue, dest),
        set(value, state.position),
      ], [
        // if the clock isn't running we reset all the animation params and start the clock
        set(state.finished , 0),
        set(state.time     , 0),
        set(state.frameTime, 0),
        set(state.position , value),
        set(config.toValue , dest ),
        startClock(clock),
      ]),
      // we run the step here that is going to update position
      timing(clock, state, config),
      // if the animation is over, reset
      cond(state.finished, [
        set(state.finished , 0),
        set(state.time     , 0),
        set(state.frameTime, 0),
        set(state.position , value),
        set(config.toValue , dest ),
        stopClock(clock),
        call([state.position], callback),        
      ]),
      // we made the block return the updated position
      state.position,    
    ]);
  };

  static match(condsAndResPairs, offset = 0) {
    if (condsAndResPairs.length - offset === 1) {
      return condsAndResPairs[offset];
    } else if (condsAndResPairs.length - offset === 0) {
      return undefined;
    };

    return cond(
      condsAndResPairs[offset],
      condsAndResPairs[offset + 1],
      ProgressBar.match(condsAndResPairs, offset + 2)
    );
  };

  static colorHSV(h /* 0 - 360 */, s /* 0 - 1 */, v /* 0 - 1 */) {
    // Converts color from HSV format into RGB
    const c = multiply(v, s);
    const hh = divide(h, 60);
    const x = multiply(c, sub(1, abs(sub(modulo(hh, 2), 1))));
  
    const m = sub(v, c);
  
    const colorRGB = (r, g, b) =>
      color(
        round(multiply(255, add(r, m))),
        round(multiply(255, add(g, m))),
        round(multiply(255, add(b, m)))
      );
  
    return ProgressBar.match([
      lessThan(h, 60),
      colorRGB(c, x, 0),
      lessThan(h, 120),
      colorRGB(x, c, 0),
      lessThan(h, 180),
      colorRGB(0, c, x),
      lessThan(h, 240),
      colorRGB(0, x, c),
      lessThan(h, 300),
      colorRGB(x, 0, c),
      colorRGB(c, 0, x) /* else */,
    ]);
  };

  constructor(props){
    super(props);
    const { MODES } = ProgressBar;

    this.progressFinal   = new Value(0);
    this.progressCurrent = new Value(0);

    const clock = new Clock();
    this.progress = ProgressBar.runTiming(clock, 
      this.progressCurrent, 
      this.progressFinal, 
      this._handleAnimationFinished
    );

    this.opacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.1, 0.3],
      extrapolate: 'clamp',
    });
    this.borderRadius = interpolate(this.progress, {
      inputRange : [0 , 50, 100],
      outputRange: [12, 25, 12],
      extrapolate: 'clamp',
    });
    this.color = ProgressBar.colorHSV(251, 0, interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [1, 0],  
      extrapolate: 'clamp',
    }));
    
    //prevent multiple/redundant updates
    this.progressAnimateTo = _.throttle(this.progressAnimateTo, 1000, {
      leading: false, trailing: true 
    });
    
    this.state = {
      percentage: 0,
      mode: MODES.INITIAL,
    };
  };

  async progressAnimateTo(percentage){
    this.progressFinal.setValue(percentage);
    await new Promise(resolve => this.onAnimationFinished = resolve);
  };

  async setProgress(nextPercentage, threshold, shouldWait){
    const { MODES } = ProgressBar;
    const { percentage, mode } = this.state;

    const isDone = (nextPercentage == 100);
    const shouldUpdate = ((nextPercentage - percentage) >= threshold);
    (mode == MODES.INITIAL) && this.setState({mode: MODES.DOWNLOADING});

    if(shouldUpdate && shouldWait){
      await this.progressAnimateTo(nextPercentage);
      if(isDone){
        await this.setMode(MODES.FINISHED, {
          percentage: nextPercentage
        });

      } else {
        this.setState({percentage: nextPercentage});        
      };

    } else if(shouldUpdate){
      this.progressAnimateTo(nextPercentage);
      this.setState({percentage: nextPercentage});
    };
  };

  async setMode(nextMode, nextState = {}){
    const { mode } = this.state;
    const shouldUpdate = (mode != nextMode);
    
    if(shouldUpdate){
      await this.leftContainer.fadeOutLeft(300);
      this.setState({mode: nextMode, ...nextState});
      await this.leftContainer.fadeInLeft(600);
    };
  };

  _handleAnimationFinished = () => {
    const callback = this.onAnimationFinished;
    callback && callback();
  };

  _renderLeft(){
    const { MODES, styles } = ProgressBar;
    const { percentage, mode } = this.state;

    switch (mode) {
      case MODES.INITIAL: return (
        <Icon
          name={'ios-radio-button-off'}
          type={'ionicon'}
          color={'rgba(255,255,255,0.5)'}
          size={22}
        />
      );
      case MODES.DOWNLOADING: return (
        <ActivityIndicator
          size={'small'}
          color={'white'}
        />
      );
      case MODES.FINISHED: return (
        <Icon
          name={'ios-checkmark-circle'}
          type={'ionicon'}
          color={'white'}
          size={22}
        />
      );
      case MODES.ERROR: return (
        <Icon
          name={'ios-close-circle'}
          type={'ionicon'}
          color={'white'}
          size={22}
        />
      );
    };
  };

  _renderSubtitle(){
    const { styles, MODES } = ProgressBar;
    const { textSubtitle, textSubtitleError } = this.props;
    const { mode } = this.state;

    switch (mode) {
      case MODES.ERROR: return(
        <Text style={styles.progressSubtitleError} numberOfLines={1}>
          {textSubtitleError}
        </Text>
      );
      default: return(
        <Text style={styles.progressSubtitle} numberOfLines={1}>
          {textSubtitle}
        </Text>
      );
    };
  };

  render(){
    const { styles } = ProgressBar;
    const { textTitle } = this.props;
    const { percentage } = this.state;

    const progressbarStyle = {
      width: concat(this.progress, "%"),
      opacity: this.opacity,
      borderBottomRightRadius: this.borderRadius,
      borderTopRightRadius: this.borderRadius,
      backgroundColor: this.color,
    };

    return(
      <View style={styles.container}>
        <Animatable.View 
          ref={r => this.leftContainer = r}
          style={styles.leftContainer}
          animation={'fadeInLeft'}
          duration={750}
          useNativeDriver={true}
        >
          {this._renderLeft()}
        </Animatable.View>
        <Animated.View style={[styles.progressbar, progressbarStyle]}/>
        <View style={styles.contentContainer}>
          <Text style={styles.progressTitle}>
            {textTitle}
          </Text>
          {this._renderSubtitle()}
        </View>
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageStyle}>
            {`${percentage}%`}
          </Text>
        </View>
      </View>
    );
  };
};

class SigninForm extends React.PureComponent {
  static propTypes = {
    onPressLogin : PropTypes.func  ,
    onPressSignUp: PropTypes.func  ,
    results      : PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      overflow: 'hidden',
    },
    spacer: {
      marginVertical: 10,
    },
    signInButtonContainer: {
      padding: 15,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', 
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sigInButtonLabel: {
      color: 'white', 
      fontSize: 20, 
      fontWeight: 'bold', 
      marginLeft: 20
    },
    signupButtonLabel: {
      fontSize: 18, 
      fontWeight: '100', 
      color: 'rgba(255,255,255,0.75)', 
      textAlign: 'center', 
      textDecorationLine: 'underline', 
      textDecorationColor: 'rgba(255,255,255,0.25)',
      marginTop: 10,
      marginBottom: 5,
    },
  });

  constructor(props){
    super(props);
    this.state = {
      validate: false,
    };
  };

  //----- functions ------
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
      <TouchableOpacity onPress={this.props.onPressSignUp}>
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
    results    : PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
    },
    spacer: {
      margin: 10,
    },
    //user details style
    userDetailsContainer: {
      flexDirection  : 'row'   ,
      alignItems     : 'center',
      justifyContent : 'center',
      borderRadius   : 12,
    },
    profileContainer: {
      width       : 75,
      height      : 75,
      borderRadius: 75/2,
      alignItems     : 'center'   ,
      justifyContent : 'center'   ,
      backgroundColor: 'rgba(0,0,0,0.3)',
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
      backgroundColor: 'rgba(0,0,0,0.3)',
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
      padding: 15,
      paddingHorizontal: 15,
      backgroundColor: 'rgba(0,0,0,0.3)', 
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonLabel: {
      flex: 0,
      fontSize: 18, 
      color: 'white', 
      fontWeight: 'bold', 
    },
    nextButtonSubtitle: {
      fontSize: 17, 
      flex: 0,
      color: 'white', 
      fontWeight: '200', 
    },
  });

  constructor(props){
    super(props);
  };

  _handleOnPressNext = () => {
    const { onPressNext } = this.props;
    onPressNext && onPressNext();
  };

  _renderUserDetails(){
    const { styles } = WelcomeUser;
    const results = LoginResponseModel.wrap(this.props.results);

    const { firstname, lastname, email, ispremium } = results.user;
    const initials = (firstname || 'N').charAt(0) + (lastname || 'A').charAt(0);
    const name = firstname || 'Not' + lastname || 'Available'; 

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
    return(
      <Expander
        style={styles.container}
        ref={r => this.expander = r}
        initiallyCollapsed={true}
      >
        <View style={styles.spacer}/>
        {this._renderUserDetails()}
        <View style={styles.spacer}/>
        {this._renderNextButton()}
      </Expander>
    );
  };
};

class Downloading extends React.PureComponent {
  static propTypes = {
    onDownloadsFinished: PropTypes.func,
    onDownloadFinished : PropTypes.func,
    onDownloadFailed   : PropTypes.func,
    onPressNext        : PropTypes.func,
  };

  static DOWNLOAD_TYPES = {
    'MODULES'  : 'MODULES'  ,
    'RESOURCES': 'RESOURCES',
    'TIPS'     : 'TIPS'     ,
  };

  static styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
    },
    spacer: {
      margin: 8,
    },
    //next button styles
    nextButtonContainer: {
      marginTop: 15,
      padding: 15,
      paddingHorizontal: 15,
      backgroundColor: 'rgba(0,0,0,0.3)', 
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonLabel: {
      flex: 0,
      fontSize: 18, 
      color: 'white', 
      fontWeight: 'bold', 
    },
    nextButtonSubtitle: {
      fontSize: 17, 
      flex: 0,
      color: 'white', 
      fontWeight: '200', 
    },
  });

  constructor(props){
    super(props);
  };

  async load(){
    const { onDownloadsFinished } = this.props;
    await this.loadModules();
    await this.loadResources();
    await this.loadTips();

    onDownloadsFinished && onDownloadsFinished();
    await this.expanderNextButton.expand(true);
  };

  async loadModules(){
    const { MODES } = ProgressBar;
    const { DOWNLOAD_TYPES } = Downloading;
    const { onDownloadFinished, onDownloadFailed } = this.props;

    try {
      //wait for animations to finish
      await runAfterInteractions();
      
      this.progressModules.setMode(MODES.DOWNLOADING);
      await ModuleStore.fetchAndSaveWithProgress((percent) => {
        //stop updating progressbar when at 97%
        (percent <= 97) && this.progressModules.setProgress(percent, 2, false);
      });
      await this.progressModules.setProgress(100, 0, true);
      onDownloadFinished && await onDownloadFinished(DOWNLOAD_TYPES.MODULES);
      
    } catch(error){
      console.log('loadModules: error');
      console.log(error);
      //set progressBar mode to error
      this.progressModules.setMode(MODES.ERROR);
      //call download failed callback
      onDownloadFailed && onDownloadFailed(DOWNLOAD_TYPES.MODULES);
    };
  };

  async loadResources(){
    const { MODES } = ProgressBar;
    const { DOWNLOAD_TYPES } = Downloading;
    const { onDownloadFinished, onDownloadFailed } = this.props;

    try {
      //wait for animations to finish
      await runAfterInteractions();
      //show resources progress bar
      await this.expanderResources.expand(true);

      this.progressResource.setMode(MODES.DOWNLOADING); 
      await ResourcesStore.fetchAndSaveWithProgress((percent) => {
        //stop updating progressbar when at 97%
        (percent <= 97) && this.progressResource.setProgress(percent, 2, false);
      });
      //animate progress bar to 100%
      await this.progressResource.setProgress(100, 0, true);
      onDownloadFinished && await onDownloadFinished(DOWNLOAD_TYPES.RESOURCES);

    } catch(error){
      console.log('error: loadResources');
      console.log(error);
      //set progressBar mode to error
      this.progressResource.setMode(MODES.ERROR);      
      //call download failed callback
      onDownloadFinished && await onDownloadFinished(DOWNLOAD_TYPES.RESOURCES);
    };
  };

  async loadTips(){
    const { MODES } = ProgressBar;
    const { DOWNLOAD_TYPES } = Downloading;
    const { onDownloadFinished, onDownloadFailed } = this.props;

    try {
      //wait for animations to finish      
      await runAfterInteractions();
      //show tips progress bar
      await this.expanderTips.expand(true);
      this.progressTips.setMode(MODES.DOWNLOADING); 

      await TipsStore.fetchAndSaveWithProgress((percent) => {
        //stop updating progressbar when at 97%
        (percent <= 97) && this.progressTips.setProgress(percent, 2, false);
      });
      await Promise.all([
        this.progressTips.setProgress(100, 0, true),
        onDownloadFinished && onDownloadFinished(DOWNLOAD_TYPES.TIPS),
      ]);

    } catch(error){
      console.log('loadTips: error');      
      console.log(error);      
      //set progressBar mode to error
      this.progressTips.setMode(MODES.ERROR);
      //call download failed callback
      onDownloadFailed && onDownloadFailed(DOWNLOAD_TYPES.TIPS);
    };
  };

  _handleOnPressNext = () => {
    const { onPressNext } = this.props;
    onPressNext && onPressNext();
  };

  _renderProgressModules(){
    const { styles } = Downloading;
    return(
      <ProgressBar
        ref={r => this.progressModules = r}
        textTitle={'Modules'}
        textSubtitle={'Subjects and questions'}
        textSubtitleError={'Download failed'}         
      />
    );
  };

  _renderProgressResources(){
    const { styles } = Downloading;
       
    return(
      <Expander 
        ref={r => this.expanderResources = r}
        initiallyCollapsed={true}
      >
        <View style={styles.spacer}/>
        <ProgressBar
          ref={r => this.progressResource = r}
          textTitle={'Resources'}
          textSubtitle={'Information and notes'}
          textSubtitleError={'Download failed'}
        />
      </Expander>
    );
  };

  _renderProgressTips(){
    const { styles } = Downloading;
    return(
      <Expander 
        ref={r => this.expanderTips = r}
        initiallyCollapsed={true}
      >
        <View style={styles.spacer}/>
        <ProgressBar
          ref={r => this.progressTips = r}
          textTitle={'Tips'}
          textSubtitle={'Study tips and trick'}
          textSubtitleError={'Download failed'}
        />
      </Expander>
    );
  };

  _renderNextButton(){
    const { styles } = Downloading;
    return(
      <Expander
        ref={r => this.expanderNextButton = r}
        initiallyCollapsed={true}
      >
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
            subtitle={'Navigate to Home'}
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
      </Expander>
    );
  };

  render(){
    const { styles } = Downloading;

    return(
      <Fragment>
        <Expander
          style={styles.container}
          ref={r => this.expander = r}
          initiallyCollapsed={true}
        >
          <View style={styles.spacer}/>
          {this._renderProgressModules()}
        </Expander>
        {this._renderProgressResources()}
        {this._renderProgressTips()}
        {this._renderNextButton()}
      </Fragment>
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
      case MODES.LOGINFAILED: return {
        titleText   : 'SIGN IN', 
        subtitleText: 'Something went wrong...',
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

  async changeSubtitle(newSubtitle){
    //hide title and subtitle first
    await this.headerSubtitle.fadeOutLeft(300);
    //then update title and subtitle
    this.setState({subtitleText: newSubtitle});
    //finally, animate in title and subtitle
    await this.headerSubtitle.fadeInRight(500);
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

export default class LoginScreen extends React.Component {
  static navigationOptions = {
  };
  
  static propTypes = {
    onPressLogin: PropTypes.func  ,
    login       : PropTypes.func  ,
    results     : PropTypes.object,
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
      mode   : MODES.LOGIN,
      results: null,
    };

    //prevent multiple presses
    this._handleOnPressSignin       = _.throttle(this._handleOnPressSignin      , 1000, {leading:true, trailing:false});
    this._handleOnPressNextWelcome  = _.throttle(this._handleOnPressNextWelcome , 1000, {leading:true, trailing:false});
    this._handleOnPressNextDownload = _.throttle(this._handleOnPressNextDownload, 1000, {leading:true, trailing:false});

    this.onPressNextWelcome  = null;
    this.onPressNextDownload = null; 
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

    try {
      //wait for transition to loggiing in to finish
      await onModeChange && onModeChange(MODES.LOGGINGIN)();
      //try to login, else throw an error
      const results = await Login.login(loginCredentials, true);
      
      //wrap results and destruct
      const { user, uid } = LoginResponseModel.wrap(results);
      //combine uid and user then save user data to store
      await UserStore.set({ uid, ...user });
  
      //logged in: show user information
      this.changeMode(MODES.LOGGEDIN, {results});
      await Promise.all([
        onModeChange && onModeChange(MODES.LOGGEDIN)(),
        timeout(2000),
      ]);

      //download data
      this.changeMode(MODES.DOWNLOADING);
      await Promise.all([
        onModeChange && onModeChange(MODES.DOWNLOADING)(),
        timeout(2000),
      ]);
  
    } catch(error){
      console.log(`login error: ${error}`);
      const message = Login.getErrorMessage(error);
      onModeChange && await onModeChange(MODES.LOGINFAILED, message)();
    };
  };

  //----- event handlers -----
  _handleOnDidFocus = async (payload) => {
    const { type } = payload.action;
    if(type === 'Navigation/BACK'){
      await this.signInContainer.fadeInLeft(300);
    };

    //start the BG Gradient animation
    const { getAuthBGGradientRef } = this.props.screenProps;
    getAuthBGGradientRef && getAuthBGGradientRef().start();
  };

  _handleOnWillBlur = () => {
    const { getAuthBGGradientRef } = this.props.screenProps;
    //stop the BG Gradient animation
    getAuthBGGradientRef && getAuthBGGradientRef().stop();
  };

  _handleOnModeChange = (mode, message) => {
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

        //expand welcomeUser
        const expander = this.welcomeUser.expander;
        await expander.expand(true);
        //end of animation
        InteractionManager.clearInteractionHandle(handle);

        //wait until onPressNextWelcome is called
        await new Promise(resolve => this.onPressNextWelcome = resolve);
        //collapse welcomeUser
        await expander.expand(false);
      });

      case MODES.DOWNLOADING: return (async () => {
        await Promise.all([
          this.formHeader.changeMode(MODES.DOWNLOADING),
          this.signInContainer.pulse(1250),
        ]);
        
        await this.downloading.expander.expand(true);
        InteractionManager.clearInteractionHandle(handle);
        await this.downloading.load();
        //wait until next button is pressed
        await new Promise(resolve => this.onPressNextDownload = resolve);
      });

      case MODES.LOGINFAILED: return (async () => {
        await Promise.all([
          this.formHeader.changeTitleDescription('SIGN IN', message, {mode}),
          this.signInContainer.pulse(1250),
        ]);
        //collapse signin form
        const expander = this.signinForm.expander;
        await expander.expand(true);

        InteractionManager.clearInteractionHandle(handle);
      })
    };
  };

  /** signinForm: handle when signin button is pressed */
  _handleOnPressSignin = () => {
    //hide keyboard/blur
    Keyboard.dismiss();

    //validate fields and trigger animations if not valid
    const { isValidEmail, isValidPassword } = this.signinForm.validateFields();
    //check if both password/email is valid    
    const isAllFieldsValid = (isValidEmail && isValidPassword);

    if(isAllFieldsValid){
      const { email, password } = this.signinForm.getValues();
      this.login({email, pass: password}, this._handleOnModeChange);

    } else {
      this.signInContainer.shake(750);
    };
  };

  _handleOnPressSignUp = async () => {
    const { navigation } = this.props;
    await this.signInContainer.fadeOutLeft(300);
    navigation.navigate(ROUTES.SignUpRoute);
  };

  /** WelcomeUser: handle when next button is pressed */
  _handleOnPressNextWelcome = () => {
    const callback = this.onPressNextWelcome;
    callback && callback();    
  };

  /** Downloading: handle when a next button is pressed */
  _handleOnPressNextDownload = async () => {
    const { navigation } = this.props;

    const callback = this.onPressNextDownload;
    callback && callback();

    await this.signInContainer.fadeOutLeft(500);
    navigation && navigation.navigate(ROUTES.HomeRoute);
  };

  /** Downloading: handle when a download finishes */
  _handleOnDownloadFinished = async (type) => {
    try {
      const { DOWNLOAD_TYPES } = Downloading; 
      await Promise.all([
        this.signInContainer.pulse(1000),
        this.formHeader.changeSubtitle((() => {
          switch (type) {
            case DOWNLOAD_TYPES.MODULES  : return ('Downloading: 2 of 3 Items...');
            case DOWNLOAD_TYPES.RESOURCES: return ('Downloading: 3 of 3 Items...');
            case DOWNLOAD_TYPES.TIPS     : return ('Downloads Finished: Please wait...');
          };
        })()),
      ]);

    } catch(error){
      console.log('_handleOnDownloadFinished: error');
      console.log(error);
    };
  };

  /** Downloading: handle when a download fails */
  _hadleOnDownloadFailed = (type) => {
  };

  /** render different sections */
  _renderContents(){
    const { MODES } = LoginScreen;
    const { mode, results } = this.state;

    return(
      <Fragment>
        <SigninForm
          ref={r => this.signinForm = r}
          onPressLogin={this._handleOnPressSignin}
          onPressSignUp={this._handleOnPressSignUp}
          {...{results}}
        />
        <WelcomeUser
          ref={r => this.welcomeUser = r}
          onPressNext={this._handleOnPressNextWelcome}
          {...{results}}
        />
        <Downloading
          ref={r => this.downloading = r}
          onDownloadFinished={this._handleOnDownloadFinished}
          onDownloadFailed={this._hadleOnDownloadFailed}
          onPressNext={this._handleOnPressNextDownload}
        />
      </Fragment>
    );
  };

  _renderContainer(){
    const { styles } = LoginScreen;
    return(
      <Animatable.View 
        ref={r => this.signInContainer = r}
        style={styles.signInContainer}
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
    const { styles } = LoginScreen;
    return(
      <View style={styles.rootContainer}> 
        <NavigationEvents 
          onWillBlur={this._handleOnWillBlur}
          onDidFocus={this._handleOnDidFocus}
        />
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