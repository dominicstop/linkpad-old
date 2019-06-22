import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Keyboard, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';

import { IconButton } from '../components/Buttons';
import { validateEmail, validatePassword, validateNotEmpty } from '../functions/Validation';
import { setStateAsync, timeout } from '../functions/Utils';

import { BlurView } from 'expo-blur';
import _ from 'lodash';
import { AndroidBackHandler } from 'react-navigation-backhandler';
import {  NavigationEvents } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';

const CREATE_USER_URL = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/createuser';
const NEW_USER_URL    = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/newuser'   ;

const MODES = {
  initial  : 'initial'  ,
  creating : 'creating' ,
  loading  : 'loading'  ,
  succesful: 'succesful',
  invalid  : 'invalid'  ,
  error    : 'error'    ,
};

export class InputForm extends React.PureComponent {
  static propType = {
    //for styling
    iconName: PropTypes.string,
    iconType: PropTypes.string,
    iconSize: PropTypes.number,
    //used for setting state of form
    mode: PropTypes.oneOf(Object.values(MODES)),
    //used to test if value is correct
    validate: PropTypes.func  ,
    //inital color, not in focus
    inactiveStyleBG  : PropTypes.object,
    inactiveColorText: PropTypes.string,
    inactiveColorIcon: PropTypes.string,
    //when selected or focused
    activeStyleBG  : PropTypes.object,
    activeColorText: PropTypes.string,
    activeColorIcon: PropTypes.string,
    //validation success
    correctColor: PropTypes.string,
    //when validation fails
    errorColor: PropTypes.string, 
  }

  //inital values
  static defaultProps = {
    mode: MODES.initial,
    ...Platform.select({
      ios: {
        //active color props
        inactiveStyleBG  : {
          backgroundColor: 'rgba(0, 0, 0, 0.25)',        
        },
        inactiveColorText: 'rgba(0, 0, 0, 0.50)',
        inactiveColorIcon: 'rgba(255, 255, 255, 0.5)',
        //inactive color props
        activeStyleBG  : {
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
        },
        activeColorText: 'rgba(0, 0, 0, 1.00)',
        activeColorIcon: 'rgba(255, 255, 255, 1)',
        correctColor : '#76FF03',
        errorColor   : 'red', 
      },
      android: {
        //active color props
        inactiveStyleBG  : {
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
        },
        inactiveColorText: 'rgba(0, 0, 0, 0.50)',
        inactiveColorIcon: 'rgba(0, 0, 0, 0.10)',
        //inactive color props
        activeStyleBG  : {
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
        },
        activeColorText: 'rgba(0, 0, 0, 1.00)',
        activeColorIcon: 'rgba(0, 0, 0, 1.00)',
        correctColor : 'green',
        errorColor   : 'red', 
      }
    }),
  }

  constructor(props){
    super(props);
    this.state = {
      //Input form BG Color
      backgroundStyle: {},
      //color of the text input
      textColor: '',
      //textInput props
      editable: true,
      iconColor: '',
    };
    //set state to initial
    this.state = this.getMode(MODES.initial);
  };

  //transition left input icon
  transitionIcon = async (callback) => {
    await this.containerIcon.fadeOut(400);
    callback && await callback();
    await this.containerIcon.fadeIn(400);
  }

  //transition input BG
  transitionBG = async (callback) => {
    await this.containerBG.fadeOut(300);
    callback && await callback();
    await this.containerBG.fadeIn(300);
  }

  //transition left icon + input BG
  transitionElements = async (callback) => {
    await Promise.all([
      this.containerIcon.fadeOut(500),
      this.containerBG  .fadeOut(500),
    ]);
    callback && await callback();
    await Promise.all([
      this.containerIcon.fadeIn(500),
      this.containerBG  .fadeIn(500),
    ]);
  }

  //returns the corresponding state based on mode
  getMode(mode){
    const { inactiveStyleBG, inactiveColorText, inactiveColorIcon, activeStyleBG, activeColorText, activeColorIcon, correctColor, errorColor } = this.props;
    switch(mode) {
      case MODES.initial: return {
        editable: true,
        backgroundStyle: activeStyleBG,
        iconColor: inactiveColorIcon,
        ...{mode},
      };
      case MODES.loading: return {
        editable: false,
        backgroundStyle: inactiveStyleBG,
        iconColor: activeColorIcon,
        ...{mode}
      };
      case MODES.succesful: return {
        editable: false,
        iconColor: correctColor,
        ...{mode}
      };
      case MODES.invalid: return {
        editable: true,
        iconColor: errorColor,
        ...{mode}
      };
      case MODES.error: return {
        editable: true,
        backgroundStyle: activeStyleBG,
        iconColor: inactiveColorIcon,
        ...{mode}
      };
    }
  }

  //update/animate state based on mode
  setMode = (mode) => {
    //get next state from mode
    const nextMode = this.getMode(mode);
    switch(mode) {
      case MODES.error  :
        this.transitionElements(() => this.setState(nextMode));
        break;

      case MODES.succesful:
        this.transitionIcon(() => this.setState(nextMode));
        break;

      case MODES.loading:
        this.transitionElements(() => this.setState(nextMode));
        break;

      case MODES.invalid:
        this.transitionIcon(() => this.setState(nextMode));
        break;
    }
  }

  componentDidMount(){
    //this is a temp hack
    if(this.props.mode == MODES.succesful && Platform.OS == 'ios'){
      this.setMode(this.props.mode);   
    }
  }

  //update state based on props
  componentDidUpdate(prevProps, prevState, snapshot){
    const didModeChange = this.props.mode != prevProps.mode;
    if(!didModeChange) return false;
    this.setMode(this.props.mode);   
  }

  _handleFocus = () => {
    const { inactiveColorIcon, activeColorIcon, onFocus } = this.props;
    onFocus && onFocus();
    this.transitionIcon(() => {
      return setStateAsync(this, {iconColor: activeColorIcon})
    });
  }

  _handleOnEndEditing = (event) => {
    const { inactiveColorIcon, activeColorIcon, errorColor, onEndEditing, validate } = this.props;
    onEndEditing && onEndEditing(event);

    //get text from textinput
    const text = event.nativeEvent.text;
    //check if input is valid
    const isValid = validate(text);
    //change icon color
    const iconColor = isValid? inactiveColorIcon : errorColor;
    
    this.transitionIcon(() => {
      return setStateAsync(this, {iconColor})
    });
  }

  _renderIcon(){
    const { iconName, iconType, iconSize, inactiveColorIcon } = this.props;
    const { iconColor, mode } = this.state;

    const WrappedIcon = (props) => <Icon
      name={iconName}
      type={iconType}
      size={iconSize}
      {...props}
    />
    
    return(
      <Animatable.View
        animation={'fadeInRight'}
        easing={'ease-in-out'}
        duration={750}
        useNativeDriver={true}
      >
        <WrappedIcon
          containerStyle={[styles.textInputIcon, {position: 'absolute'}]}
          color={inactiveColorIcon}
        />
        <Animatable.View
          ref={r => this.containerIcon = r}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          <WrappedIcon
            containerStyle={styles.textInputIcon}
            color={iconColor}
          />
        </Animatable.View>
      </Animatable.View>
    );
  }

  _renderInput(){
    const { iconName, iconType, iconSize, iconColor, mode, ...textInputProps } = this.props;
    const successStyle = mode == MODES.succesful? {borderBottomColor: 'rgba(255, 255, 255, 0.0)', } : {};
    const { editable } = this.state;
    return(
      <TextInput
        //pass down props
        {...textInputProps}
        style={[styles.textinput, successStyle]}
        maxLength={50}
        autoCapitalize='none'
        enablesReturnKeyAutomatically={true}
        onFocus={this._handleFocus}
        onEndEditing={this._handleOnEndEditing}
        {...{editable}}
      />
    );
  }

  render(){
    const { iconName, iconType, iconSize, iconColor, mode, ...textInputProps } = this.props;
    const { backgroundStyle } = this.state;
    const successStyle = mode == MODES.succesful? {opacity: 0.75, borderColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 1} : {};

    return(
      <View style={[{overflow: 'hidden', marginTop: 20,  borderRadius: 10}, successStyle]}>
        {/*BG*/}
        <Animatable.View
          style={[{position: 'absolute', width: '100%', height: '100%'}, backgroundStyle]}
          ref={r => this.containerBG = r}
          easing={'ease-in-out'}
          useNativeDriver={true}
        />
        {/*FG*/}
        <View style={{paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', }}>
          {this._renderIcon ()}
          {this._renderInput()}
        </View>
      </View>
    );
  }
}

export class SignUpContainer extends React.PureComponent {
  constructor(props){
    super(props);
  }

  //called first: returns 'uid'
  createUser = ({email, pass}) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await fetch(CREATE_USER_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({...{email, pass}}),
        });

        //reject if not success
        if(!response.ok){
          let text = await response.text();
          reject(text);
        } 

        console.log('createUser resp: ');
        console.log(response);

        
        let json = await response.json();
        console.log('createUser json: ');
        console.log(json);
        resolve(json);

      } catch(error) {
        reject(error);
      }
    });
  }

  //called after create user
  newUser = ({email, userid, firstname, lastname, uid}) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await fetch(NEW_USER_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...{email, userid, firstname, lastname, uid}
          }),
        });

        //reject if not success
        if(!response.ok){
          let text = await response.text();
          reject(text);
        } 
        
        console.log('new user resp:');
        console.log(response);

        resolve(response);
      } catch(error) {
        reject(error);
      }
    });
  }

  //callback is called after create user
  createAccount = async ({email, pass, firstname, lastname}, callback) => {
    const createUser_resp = await this.createUser({email, pass});
    //extract uid from response
    const { uid } = createUser_resp;
    //extract username from email
    const userid = email.replace(/@.*$/,"");
    //wait for newUser and callback to finish
    const results = await Promise.all([
      //register new user
      this.newUser({email, firstname, lastname, uid, userid}),
      //call callback and wait to finish if exist
      callback && callback(uid),
    ]);
    //extract newUser response
    const newUser_resp = results[0];
    //resolve responses
    return {createUser_resp, newUser_resp};
  }

  _signup = async (signup_credentials, callbacks) => {
    const {
      onSigUpLoading , //while signing up: createUser
      onSigUpCreating, //while signing up: newUser
      onSigUpInvalid , //invalid email/password
      onSigUpError   , //something went wrong
      onSigUpFinished, //finish logging in
    } = callbacks;

    try {
      //wait for animation while signing up
      let resolve_results = await Promise.all([
        this.createAccount(signup_credentials, onSigUpCreating),
        onSigUpLoading && await onSigUpLoading(),
      ]);
      //extract response from Promise Array
      const {createUser_resp, newUser_resp} = resolve_results[0];

      /*
      console.log('\n\n_Sign up:');
      console.log('createUser_resp');
      console.log(createUser_resp);
      console.log('newUser_resp');
      console.log(newUser_resp);
      console.log('newUser_resp.ok');
      console.log(newUser_resp.ok);
      */

      //stop if login invalid
      if(!newUser_resp.ok){
        onSigUpInvalid && await onSigUpInvalid(resolve_results[0]);
        return;
      }

      //save user data to storage
      //UserStore.setUserData(signup_response);
      //signup finished
      onSigUpFinished && await onSigUpFinished();
      //const { navigation } = this.props;
      //navigation.navigate('AppRoute');

    } catch(error){
      console.log('error: _signup: ');
      console.log(error);
      await onSigUpError && onSigUpError(error);
    }
  }

  _validate = ({email, pass, firstname, lastname}) => {
    let results = [];
    results.push(validateEmail   (email    ));
    results.push(validatePassword(pass     ));
    results.push(validateNotEmpty(firstname));
    results.push(validateNotEmpty(lastname ));
    //evaluate results
    return results.every(item => item);
  }

  _login = () => {
    const { navigation } = this.props;
    navigation.navigate('LoginRoute');
  }

  render(){
    const childProps = {
      signup  : this._signup  ,
      login   : this._login   ,
      validate: this._validate,
      //pass down props
      ...this.props
    };

    return(
      React.cloneElement(this.props.children, childProps)
    );
  }
}

export class SignUpUI_iOS extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      //shows or hide the body content
      isCollapsed: false,
      isLoading: false,
    };
    //init state
    this.state = this.getState(MODES.initial);
    //prevent multiple presses
    this._handleOnPressSignUp = _.throttle(this._handleOnPressSignUp, 1000, {leading:true, trailing:false});
  }

  //returns the corresponding state for the mode
  getState = (mode) => {
    switch(mode) {
      case MODES.initial: return {
        titleText     : 'SIGN UP',
        subtitleText  : 'Create an account to continue using LinkPad',
        isLoading     : false,
        shouldRender  : true,
        emailValue    : '',
        passwordValue : '',
        ...{mode}
      };
      case MODES.loading: return {
        titleText   : 'Signing up',
        subtitleText: 'Creating your account...',
        isLoading   : true,
        ...{mode}
      };
      case MODES.creating: return {
        titleText   : 'Signing up',
        subtitleText: 'Almost done, please wait...',
        isLoading   : true,
        ...{mode}
      };
      case MODES.succesful: return {
        titleText      : 'Signed up',
        subtitleText   : 'Your account has been successfully created. Press sign in to continue.',
        isLoading      : false,
        ...{mode}
      };
      case MODES.invalid: return {
        titleText      : 'Sign up',
        subtitleText   : 'Invalid details (please try again)',
        isLoading      : false,
        emailValue     : '',
        passwordValue  : '',
        ...{mode}
      };
      case MODES.error: return {
        titleText   : 'Sign up',
        subtitleText: 'Something went wrong (please try again)',
        isLoading   : false,
        ...{mode}
      };
    }
  }

  setStateFromMode = async (mode) => {
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
    //less flicker
    await timeout(500);
  }

  transitionOut = async () => {
    const { getAuthBGGradientRef } = this.props.screenProps;
    //stop the BG Gradient animation
    getAuthBGGradientRef && getAuthBGGradientRef().stop();
    //animate out
    await this.formContainer.fadeOutRight(250);
  }

  //called when attempting to log in
  _handleOnSignupLoading = async () => {
    this.DEBUG && console.log('Signup Loading');
    //collapse container: hide body
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await setStateAsync(this, {isCollapsed: true});
    //then replace title and subtitle
    await this.setStateFromMode(MODES.loading);
  }

  _handleOnSignupCreating = async () => {
    this.DEBUG && console.log('Signup Creating');
    this.setStateFromMode(MODES.creating);
  }

  _handleOnSignupFinished = async () => {
    this.DEBUG && console.log('Signup Finished');
    //update state
    await this.setStateFromMode(MODES.succesful);
    //collapse container: hide body
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({isCollapsed: false});
  }

  _handleOnSignupInvalid = async () => {
    this.DEBUG && console.log('Signup Invalid');
    //collapse container: hide body
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await setStateAsync(this, {isCollapsed: false});
    //update state
    this.setStateFromMode(MODES.invalid);
  }

  _handleOnSignupError = async () => {
    this.DEBUG && console.log('Signup Error');
    //collapse container: hide body
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await setStateAsync(this, {isCollapsed: false});
    //update state
    this.setStateFromMode(MODES.error);
  }

  _handleOnPressSignUp = async () => {
    const { fnameValue, lnameValue, emailValue, passwordValue, isLoading, mode } = this.state;
    //handle onpress login
    if(mode == MODES.succesful){
      await this.transitionOut();
      this.props.login();
      return;
    }
    
    //dont invoke when loading
    if(isLoading) return;
    //dismiss keyboard
    Keyboard.dismiss();

    //match state to POST params
    const signup_data = {
      email    : emailValue,
      pass     : passwordValue,
      firstname: fnameValue,
      lastname : lnameValue,
    };

    //check if inputs are valid
    if(!this.props.validate(signup_data)){
      this.formContainer.shake(750);
      this.setStateFromMode(MODES.invalid);
      return;
    }

    //call signup from props
    this.props.signup(signup_data, {
      //pass the callback functions
      onSigUpLoading : this._handleOnSignupLoading , 
      onSigUpCreating: this._handleOnSignupCreating,
      onSigUpInvalid : this._handleOnSignupInvalid ,
      onSigUpError   : this._handleOnSignupError   ,
      onSigUpFinished: this._handleOnSignupFinished,
    });
  }

  _renderHeader(){
    const { isLoading,  titleText, subtitleText, } = this.state;
    return (
      <Fragment>
        <Animatable.View
          style={{flexDirection: 'row'}}
          ref={r => this.headerTitle = r}
          animation={'fadeInRight'}          
          duration={500}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          {isLoading && <ActivityIndicator size='large' style={{marginRight: 10}} color={'rgba(255, 255, 255, 0.8)'}/>}
          <Text style={styles.textTitle}>
            {titleText}
          </Text>
        </Animatable.View>
        <Animatable.Text 
          ref={r => this.headerSubtitle = r}
          style={styles.textSubtitle}
          animation={'fadeInRight'}
          duration={650}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          {subtitleText}
        </Animatable.Text>
      </Fragment>
    );
  }

  _renderSignUpButton(){
    const { isLoading, mode } = this.state;
    //Button text
    let text = isLoading? 'Creating account...' : 'Sign Up';
    if(mode == MODES.succesful) text = 'Sign in';

    return(
      <IconButton 
        containerStyle={styles.iconButtonContainer}
        textStyle={styles.iconButtonText}
        iconName={'login'}
        iconType={'simple-line-icon'}
        iconColor={'white'}
        iconSize={22}
        onPress={this._handleOnPressSignUp}
        {...{text}}
      >
        <Icon
          name ={'chevron-right'}
          color={'rgba(255, 255, 255, 0.5)'}
          type ={'feather'}
          size ={25}
        /> 
      </IconButton>
    );
  }

  //login inputs
  _renderForm(){
    const { fnameValue, lnameValue, emailValue, passwordValue, isLoading, mode } = this.state;
    const succesful = mode == MODES.succesful;
    const textInputProps = {
      selectionColor      : 'rgba(255, 255, 255, 0.5)',
      placeholderTextColor: 'rgba(255, 255, 255, 0.7)',
      autoCorrect: false,
      autoFocus: false,
      blurOnSubmit: true,
      disableFullscreenUI: true,
      multiline: false,
      ...{mode}
    }

    return(
      <Animatable.View 
        collapsable={true}
        ref={r => this.formContainer = r}
        animation={'fadeInRight'}
        duration={700}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        {/*First Name*/}
        <InputForm
          placeholder='First Name'
          onChangeText={(text) => this.setState({fnameValue: text})}
          returnKeyType='next'
          iconName='account'
          iconType='material-community'
          iconSize={30}
          autoCapitalize={'words'}
          validate={validateNotEmpty}
          value={fnameValue}
          {...textInputProps}
        />
        {/*Last Name*/}
        <InputForm
          placeholder='Last name'
          onChangeText={(text) => this.setState({lnameValue: text})}
          returnKeyType='next'
          iconName='account-multiple'
          iconType='material-community'
          iconSize={30}
          autoCapitalize={'words'}
          validate={validateNotEmpty}
          value={lnameValue}
          {...textInputProps}
        />
        {/*E-Mail*/}
        <InputForm
          placeholder='E-mail address'
          keyboardType='email-address'
          onChangeText={(text) => this.setState({emailValue: text})}
          textContentType='username'
          returnKeyType='next'
          iconName='email'
          iconType='material-community'
          iconSize={30}
          validate={validateEmail}
          value={emailValue}
          {...textInputProps}
        />
        {/*Password*/}
        {!succesful && <InputForm
          placeholder='Password'
          onChangeText={(text) => this.setState({passwordValue: text})}
          placeholderTextColor='rgba(255, 255, 255, 0.7)'
          textContentType='password'
          secureTextEntry={true}
          iconName='lock'
          iconType='material-community'
          iconSize={30}
          validate={validatePassword}
          value={passwordValue}
          {...textInputProps}
        />}
        {this._renderSignUpButton()}
      </Animatable.View>
    );
  }

  //sign in form container
  _renderFormContainer(){
    const { isCollapsed } = this.state;
    return(
      <Animatable.View 
        style={[styles.formContainer, {overflow: 'hidden', padding: 0}]}
        ref={r => this.formContainer = r}
        useNativeDriver={true}
      >
        <BlurView
          style={{flex: 1, padding: 18}}
          intensity={75}
          tint={'dark'}
        >
          {this._renderHeader()}
          {!isCollapsed && this._renderForm()}
        </BlurView>
      </Animatable.View>
    );
  }

  render(){
    return(
      <View style={{paddingTop: 20}}>
        <NavigationEvents onWillBlur={this.componentWillBlur}/>
        <Animatable.View
          ref={r => this.ref_rootView = r}
          style={styles.rootContainer}
          animation={'fadeInRight'}
          duration={300}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          <ScrollView 
            contentContainerStyle={{flexGrow: 1}}
            keyboardShouldPersistTaps={'handled'} 
            keyboardDismissMode="interactive"
          >
            <KeyboardAvoidingView
              style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
              behavior='padding'
            >
              {this._renderFormContainer()}       
            </KeyboardAvoidingView>
          </ScrollView>
          
        </Animatable.View>
      </View>
    );
  }
  
}

export class SignUpUI_android extends React.PureComponent {
  constructor(props){
    super(props);
    //init state
    this.state = {
      shouldRender: true,
      //textinput values
      fnameValue   : '',
      lnameValue   : '',
      emailValue   : '',
      passwordValue: '',
    }
    this.state = this.getState(MODES.initial);
    this.DEBUG = false;
  }

  componentWillBlur = () => {
    this.transitionOut();
  }

  //transtion in/out title and subtitle
  transitionHeader = async (callback, animateTitle = true, animateSubtitle = true) => {
    //animate in
    await Promise.all([
      animateTitle    && this.headerTitle   .fadeOutLeft(300),
      animateSubtitle && this.headerSubtitle.fadeOutLeft(200),
    ]);
    //call callback function
    callback && await callback();
    //animate out
    await Promise.all([
      animateTitle    && this.headerTitle   .fadeInRight(300),
      animateSubtitle && this.headerSubtitle.fadeInRight(400),
    ]);
    //reduce stutter
    await timeout(750);
  }

  transitionOut = async () => {
    const { getAuthBGGradientRef } = this.props.screenProps;
    //stop the BG Gradient animation
    getAuthBGGradientRef && getAuthBGGradientRef().stop();
    //animate out
    await this.formContainer.fadeOutRight(250);
    //unmount views
    this.setState({shouldRender: false});
  }

  //returns the corresponding state for the mode
  getState = (mode) => {
    switch(mode) {
      case MODES.initial: return {
        titleText     : 'Sign up',
        subtitleText  : 'Create an account to continue using LinkPad',
        isLoading     : false,
        shouldRender  : true,
        emailValue    : '',
        passwordValue : '',
        ...{mode}
      };
      case MODES.loading: return {
        titleText   : 'Signing up',
        subtitleText: 'Creating account...',
        isLoading   : true,
        ...{mode}
      };
      case MODES.creating: return {
        titleText   : 'Signing up',
        subtitleText: 'Almost done, please wait...',
        isLoading   : true,
        ...{mode}
      };
      case MODES.succesful: return {
        titleText      : 'Signed up',
        subtitleText   : 'Your account has been successfully created.',
        isLoading      : false,
        ...{mode}
      };
      case MODES.invalid: return {
        titleText      : 'Sign up',
        subtitleText   : 'Invalid details (please try again)',
        isLoading      : false,
        emailValue     : '',
        passwordValue  : '',
        ...{mode}
      };
      case MODES.error: return {
        titleText   : 'Sign up',
        subtitleText: 'Something went wrong (please try again)',
        isLoading   : false,
        ...{mode}
      };
    }
  }

  setStateFromMode = async (mode) => {
    const nextState = this.getState(mode);
    const { titleText, subtitleText } = this.state;
    //if there are changes, animate title/sub
    const animateTitle    = titleText    !== nextState.titleText;
    const animateSubtitle = subtitleText !== nextState.subtitleText;
    //animate header
    await this.transitionHeader(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState(nextState);
    }, animateTitle, animateSubtitle);
  }

  _handleOnSignupLoading = async () => {
    this.DEBUG && console.log('Signup Loading');
    this.setStateFromMode(MODES.loading);
  }

  _handleOnSignupCreating = async () => {
    this.DEBUG && console.log('Signup Creating');
    this.setStateFromMode(MODES.creating);
  }

  _handleOnSignupFinished = async () => {
    this.DEBUG && console.log('Signup Finished');
    this.setStateFromMode(MODES.succesful);
  }

  _handleOnSignupInvalid = async () => {
    this.DEBUG && console.log('Signup Invalid');
    this.setStateFromMode(MODES.invalid);
  }

  _handleOnSignupError = async () => {
    this.DEBUG && console.log('Signup Error');
    this.setStateFromMode(MODES.error);
  }

  _handleOnPressSignUp = async () => {
    const { fnameValue, lnameValue, emailValue, passwordValue, isLoading, mode } = this.state;
    //handle onpress login
    if(mode == MODES.succesful){
      await this.transitionOut();
      this.props.login();
      return;
    }
    
    //dont invoke when loading
    if(isLoading) return;
    //dismiss keyboard
    Keyboard.dismiss();

    //match state to POST params
    const signup_data = {
      email    : emailValue,
      pass     : passwordValue,
      firstname: fnameValue,
      lastname : lnameValue,
    };

    //check if inputs are valid
    if(!this.props.validate(signup_data)){
      this.formContainer.shake(750);
      this.setStateFromMode(MODES.invalid);
      return;
    }

    //call signup from props
    this.props.signup(signup_data, {
      //pass the callback functions
      onSigUpLoading : this._handleOnSignupLoading , 
      onSigUpCreating: this._handleOnSignupCreating,
      onSigUpInvalid : this._handleOnSignupInvalid ,
      onSigUpError   : this._handleOnSignupError   ,
      onSigUpFinished: this._handleOnSignupFinished,
    });
  }

  _handleOnBackPress = async () => {
    //dont go back when loading
    if(this.state.isLoading) return true;
    //animate out
    await this.transitionOut();
    //go back to login
    this.props.login();
    return true;
  };

  _renderHeader(){
    const { isLoading,  titleText, subtitleText, } = this.state;
    return (
      <Fragment>
        <Animatable.Text 
          ref={r => this.headerTitle = r}
          style={styles.textTitle}
          animation={'fadeInRight'}
          duration={500}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          {titleText}
        </Animatable.Text>
        <Animatable.Text 
          ref={r => this.headerSubtitle = r}
          style={styles.textSubtitle}
          animation={'fadeInRight'}
          duration={650}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          {subtitleText}
        </Animatable.Text>
      </Fragment>
    );
  }

  _renderSignUpButton(){
    const { isLoading, mode } = this.state;
    //Button text
    let text = isLoading? 'Creating account...' : 'Sign Up';
    if(mode == MODES.succesful) text = 'Sign in';
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
      <IconButton 
        containerStyle={{padding: 15}}
        wrapperStyle={{marginTop: 25, backgroundColor: '#5E35B1', borderRadius: 20}}
        textStyle={{color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 20}}
        iconName={'login'}
        iconType={'simple-line-icon'}
        iconColor={'white'}
        iconSize={22}
        onPress={this._handleOnPressSignUp}
        {...{text}}
      >
        {isLoading? loading : chevron}
      </IconButton>
    );
  }

  //login inputs
  _renderForm(){
    const { emailValue, passwordValue, isLoading, mode } = this.state;
    const textInputProps = {
      underlineColorAndroid: 'rgba(0, 0, 0, 0)',
      selectionColor       : '#B39DDB',
      placeholderTextColor : 'rgba(0, 0, 0, 0.35)',
      autoCorrect: false,
      autoFocus: false,
      blurOnSubmit: true,
      disableFullscreenUI: true,
      multiline: false,
      ...{mode}
    }

    return(
      <Animatable.View 
        collapsable={true}
        animation={'fadeInRight'}
        duration={700}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        {/*First Name*/}
        <InputForm
          placeholder='First Name'
          onChangeText={(text) => this.setState({fnameValue: text})}
          returnKeyType='next'
          iconName='account'
          iconType='material-community'
          iconSize={30}
          autoCapitalize={'words'}
          validate={validateNotEmpty}
          {...textInputProps}
        />
        {/*Last Name*/}
        <InputForm
          placeholder='Last name'
          onChangeText={(text) => this.setState({lnameValue: text})}
          returnKeyType='next'
          iconName='account-multiple'
          iconType='material-community'
          iconSize={30}
          autoCapitalize={'words'}
          validate={validateNotEmpty}
          {...textInputProps}
        />
        {/*E-Mail*/}
        <InputForm
          placeholder='E-mail address'
          keyboardType='email-address'
          onChangeText={(text) => this.setState({emailValue: text})}
          textContentType='username'
          returnKeyType='next'
          iconName='email'
          iconType='material-community'
          iconSize={30}
          validate={validateEmail}
          {...textInputProps}
        />
        {/*Password*/}
        <InputForm
          placeholder='Password'
          onChangeText={(text) => this.setState({passwordValue: text})}
          placeholderTextColor='rgba(255, 255, 255, 0.7)'
          textContentType='password'
          secureTextEntry={true}
          iconName='lock'
          iconType='material-community'
          iconSize={30}
          validate={validatePassword}
          {...textInputProps}
        />
        {this._renderSignUpButton()}
      </Animatable.View>
    );
  }
  
  //sign in form container
  _renderFormContainer(){
    const { titleText, subtitleText } = this.state;
    return(
      <Animatable.View 
        style={[styles.formContainer, {overflow: 'hidden'}]}
        ref={r => this.formContainer = r}
        useNativeDriver={true}
      >
        {this._renderHeader()}
        {this._renderForm  ()}
      </Animatable.View>
    );
  }

  render(){
    if(!this.state.shouldRender) return null;
    return(
      <AndroidBackHandler onBackPress={this._handleOnBackPress}>
        <NavigationEvents onWillBlur={this.componentWillBlur}/>
        <Animatable.View
          ref={r => this.ref_rootView = r}
          style={styles.rootContainer}
          animation={'fadeInRight'}
          duration={300}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          <KeyboardAvoidingView
            style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
            behavior='padding'
          >
            {this._renderFormContainer()}          
          </KeyboardAvoidingView>
        </Animatable.View>
      </AndroidBackHandler>
    );
  }
}

export default class SignUpScreen extends React.Component {

  componentDidFocus = async () => {
    const { getAuthBGGradientRef } = this.props.screenProps;
    //start the BG Gradient animation
    await timeout(1250);
    getAuthBGGradientRef && getAuthBGGradientRef().start();
  }

  render() {
    return (
      <View>
        <NavigationEvents 
          onDidFocus={this.componentDidFocus} />
        <SignUpContainer
          navigation={this.props.navigation}
          screenProps={this.props.screenProps}
        >
          {Platform.select({
            ios    : <SignUpUI_iOS/>,
            android: <SignUpUI_android/>,
          })}
        </SignUpContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textTitle: Platform.select({
    ios: {
      fontSize: 38, 
      fontWeight: '900', 
      color: 'white',
    },
    android: {
      fontSize: 32, 
      fontWeight: '900'
    }
  }),
  textSubtitle: Platform.select({
    ios: {
      fontSize: 18, 
      fontWeight: '100', 
      color: 'white',
    },
    android: {
      fontSize: 18, 
      fontWeight: '100', 
      color: 'grey'
    }
  }),
  iconButtonContainer: Platform.select({
    ios: {
      padding: 15, 
      marginTop: 20,
      marginBottom: 5, 
      backgroundColor: 'rgba(0, 0, 0, 0.4)', 
      borderRadius: 10,
    },
    android: {
      padding: 15,
    }
  }),
  iconButtonText: Platform.select({
    ios: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 20,
    },
    android: {
      color: 'white', 
      fontSize: 20, 
      fontWeight: 'bold', 
      marginLeft: 20,
    }
  }),
  
  rootContainer: {
    width: '100%', 
    height: '100%', 
  },
  formContainer: {
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
        elevation: 15,
      },
    })
  },
  textInputIcon: {
    width: 32
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