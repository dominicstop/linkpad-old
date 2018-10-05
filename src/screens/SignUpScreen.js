import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Keyboard, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';

import { IconButton } from '../components/Buttons';

import { Header, NavigationEvents } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import { setStateAsync, timeout } from '../functions/Utils';
import { validateEmail, validatePassword, validateNotEmpty } from '../functions/Validation';

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
      <View collapsable={true}>
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
      </View>
    );
  }

  _renderInput(){
    const { iconName, iconType, iconSize, iconColor, mode, ...textInputProps } = this.props;
    const { editable } = this.state;
    return(
      <TextInput
        //pass down props
        {...textInputProps}
        style={styles.textinput}
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
    return(
      <View style={{overflow: 'hidden', marginTop: 20,  borderRadius: 10,}}>
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

      console.log('\n\n_Sign up:');
      console.log('createUser_resp');
      console.log(createUser_resp);
      console.log('newUser_resp');
      console.log(newUser_resp);
      console.log('newUser_resp.ok');
      console.log(newUser_resp.ok);

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

  render(){
    const childProps = {
      signup    : this._signup,
      validate  : this._validate,
      navigation: this.props.navigation,
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
      isLoading: false,
    };
    //init state
    this.state = this.getState('initial');
  }

  //returns the corresponding state for the mode
  getState = (mode) => {
    switch(mode) {
      case MODES.initial: return {
        titleText      : 'SIGN UP',
        subtitleText   : 'Create an account',
        isLoading      : false,
        emailValue     : '',
        passwordValue  : '',
        isEmailValid   : true,
        isPasswordValid: true,
      };
      case MODES.loading: return {
        titleText   : 'LOGGING IN',
        subtitleText: 'Please wait for second...',
        isLoading   : true,
      };
      case MODES.fetching: return {
        titleText   : 'FETCHING',
        subtitleText: 'Loading the data...',
        isLoading   : true,
      };
      case MODES.succesful: return {
        titleText      : 'LOGGED IN',
        subtitleText   : 'Login succesful, please wait.',
        isLoading      : false,
        isEmailValid   : true,
        isPasswordValid: true,
      };
      case MODES.invalid: return {
        titleText      : 'SIGN IN',
        subtitleText   : 'Invalid email or password (please try again)',
        isLoading      : false,
        emailValue     : '',
        passwordValue  : '',
        isEmailValid   : false,
        isPasswordValid: false,
      };
      case MODES.error: return {
        titleText      : 'SIGN IN',
        subtitleText   : 'Something went wrong (please try again)',
        isLoading      : false,
        isEmailValid   : true,
        isPasswordValid: true,
      };
    }
  }


  _renderHeader(){
    const { isLoading,  titleText, subtitleText, } = this.state;
    return (
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

  _renderForm() {
    return(
      <View collapsable={true}>
        
      </View>
    );
  }

  render(){
    return(
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
          <Animatable.View
            style={[styles.formContainer, { overflow: 'hidden', elevation: 1 }]}
            ref={r => this.formContainer = r}
            useNativeDriver={true}
          >
            {this._renderHeader()}
          </Animatable.View>
        </KeyboardAvoidingView>
      </Animatable.View>
    );
  }
}

export class SignUpUI_android extends React.PureComponent {

  constructor(props){
    super(props);
    //init state
    this.state = {
      //textinput values
      fnameValue   : '',
      lnameValue   : '',
      emailValue   : '',
      passwordValue: '',
    }
    this.state = this.getState(MODES.initial);
    this.DEBUG = true;
  }

  componentWillBlur = () => {
    this.ref_rootView.fadeOutRight(400);
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

  //returns the corresponding state for the mode
  getState = (mode) => {
    switch(mode) {
      case MODES.initial: return {
        titleText      : 'Sign up',
        subtitleText   : 'Create an account to continue using LinkPad',
        isLoading      : false,
        emailValue     : '',
        passwordValue  : '',
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
    //handle onpress signup
    if(mode == MODES.succesful){
      const { navigation } = this.props;
      navigation.navigate('LoginRoute');
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
        <Animatable.Text 
          ref={r => this.headerTitle = r}
          style={{fontSize: 32, fontWeight: '900'}}
          animation={'fadeInRight'}
          duration={500}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          {titleText}
        </Animatable.Text>
        <Animatable.Text 
          ref={r => this.headerSubtitle = r}
          style={{fontSize: 18, fontWeight: '100', color: 'grey'}}
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
        duration={750}
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
    return(
      <Fragment>
        <NavigationEvents onWillBlur={this.componentWillBlur}/>
        <Animatable.View
          ref={r => this.ref_rootView = r}
          style={styles.rootContainer}
          animation={'fadeInRight'}
          duration={400}
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
      </Fragment>
    );
  }
}

export default class SignUpScreen extends React.Component {

  componentDidFocus = () => {
    const { getAuthBGGradientRef } = this.props.screenProps;
    //start the BG Gradient animation
    getAuthBGGradientRef && getAuthBGGradientRef().start();
  }

  render() {
    return (
      <View collapsable={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus} />
        <SignUpContainer navigation={this.props.navigation}>
          {Platform.select({
            ios: <SignUpUI_iOS/>,
            android: <SignUpUI_android/>,
          })}
        </SignUpContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
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