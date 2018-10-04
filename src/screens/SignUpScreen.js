import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator, KeyboardAvoidingView } from 'react-native';

import { Header, NavigationEvents } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';

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

export class SignUpContainer extends React.PureComponent {
  constructor(props){
    super(props);
  }

  componentDidMount(){
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

export class SignUpUI extends React.PureComponent {

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
            ref={r => this.animatedformContainer = r}
            useNativeDriver={true}
          >
            {this._renderHeader()}
          </Animatable.View>
        </KeyboardAvoidingView>
      </Animatable.View>
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
          <SignUpUI/>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20
  },
});