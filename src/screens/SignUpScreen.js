import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Keyboard, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';

import { IconButton } from '../components/Buttons';

import { Header, NavigationEvents } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import {setStateAsync, timeout} from '../functions/Utils';

const CREATE_USER_URL = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/createuser';
const NEW_USER_URL    = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/newuser'   ;

const MODES = {
  initial  : 'initial'  ,
  loading  : 'loading'  ,
  fetching : 'fetching' ,
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
    validation: PropTypes.func  ,
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
    inactiveColorIcon: 'rgba(0, 0, 0, 0.20)',
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
    await this.containerIcon.fadeOut(500);
    callback && await callback();
    await this.containerIcon.fadeIn(500);
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
    const { inactiveStyleBG, inactiveColorText, inactiveColorIcon, activeStyleBG, activeColorText, activeColorIcon } = this.props;
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
        ...{mode}
      };
      case MODES.invalid: return {
        ...{mode}
      };
    }
  }

  //update/animate state based on mode
  setMode = (mode) => {
    console.log('set mode');
    console.log(mode);
    //get next state from mode
    const nextMode = this.getMode(mode);
    switch(mode) {
      case MODES.loading:
        this.transitionElements(() => this.setState(nextMode));
        break;

      case MODES.succesful:
        break;

      case MODES.invalid: 
        break;
    }
  }

  //update state based on props
  componentDidUpdate(prevProps, prevState, snapshot){
    const didModeChange = this.props.mode != prevProps.mode;
    if(!didModeChange) return false;
    console.log('didModeChange: true');
    this.setMode(this.props.mode);   
  }

  _handleFocus = () => {
    const { inactiveColorIcon, activeColorIcon } = this.props;
    this.transitionIcon(() => {
      return setStateAsync(this, {iconColor: activeColorIcon})
    });
  }

  _handleBlur = () => {
    const { inactiveColorIcon, activeColorIcon } = this.props;
    this.transitionIcon(() => {
      return setStateAsync(this, {iconColor: inactiveColorIcon})
    });
  }

  _renderIcon(){
    const { iconName, iconType, iconSize, inactiveColorText } = this.props;
    const { iconColor, mode } = this.state;
    console.log('Render Mode: ');
    console.log(mode);

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
          color={inactiveColorText}
        />
        <Animatable.View
          ref={r => this.containerIcon = r}
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
        style={styles.textinput}
        maxLength={50}
        autoCapitalize='none'
        enablesReturnKeyAutomatically={true}
        onFocus={this._handleFocus}
        onBlur={this._handleBlur}
        {...{editable}}
        //pass down props
        {...textInputProps}
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

  componentDidMount(){
    return;
    console.log('createUser test');
    //this.createUser({email: 'test@email.com', pass: '123456'});
    this.createAccount({
      email: 'test7@gmail.com', 
      pass : '123456789',
      firstname: 'dominic6',
      lastname: 'test4',
    });
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
        let json = await response.text();
        console.log('new user json');
        console.log(json);

        resolve(json);
      } catch(error) {
        reject(error);
      }
    });
  }

  createAccount = async ({email, pass, firstname, lastname}) => {
    const createUser_response = await this.createUser({email, pass});
    //extract uid from response
    const { uid } = createUser_response;
    //extract username from email
    const userid = email.replace(/@.*$/,"");
    //register new user
    const newUser_response = await this.newUser({
      email, firstname, lastname, uid, userid
    });
  }

  _signUp = async (signup_credentials, callbacks) => {
    const {
      onSigUpLoading , //while signing up
      onSigUpInvalid , //invalid email/password
      onSigUpError   , //something went wrong
      onSigUpFinished, //finish logging in
    } = callbacks;

    try {
      //wait for animation while login
      let resolve_results = await Promise.all([
        this.login(login_credentials),
        onSigUpLoading && await onSigUpLoading(),
      ]);
      //extract login json from Promise Array
      let login_response = resolve_results[0];

      //stop if login invalid
      if(!login_response.success){
        onSigUpInvalid && await onSigUpInvalid(login_response);
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
      onSigUpFinished && await onSigUpFinished(login_response);
      const { navigation } = this.props;
      navigation.navigate('AppRoute');

    } catch(error){
      await onSigUpError && onSigUpError(error);
    }
  }

  render(){
    const childProps = {
      signUp: this._signUp,
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
    this.state = this.getState(MODES.initial);
  }

  componentWillBlur = () => {
    this.ref_rootView.fadeOutRight(400);
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
        ...{mode}
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

  _handleOnPressSignUp = async () => {
    //hide keyboard
    Keyboard.dismiss();
    await timeout(500);
    this.setState(this.getState(MODES.loading));
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
    const { isLoading } = this.state;
    //Button text
    const text = isLoading? 'Creating account...' : 'Sign Up';
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
    const { emailValue, passwordValue, isEmailValid, isPasswordValid, isLoading, mode } = this.state;
    const textInputProps = {
      underlineColorAndroid: 'rgba(0,0,0,0)',
      selectionColor: 'rgba(255, 255, 255, 0.7)',
      placeholderTextColor: 'rgba(0, 0, 0, 0.35)',
      isEnabled: !isLoading,
      ...{mode}
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
        animation={'fadeInRight'}
        duration={750}
        easing={'ease-in-out'}
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
        <SignUpContainer>
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
        paddingTop: 25,
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