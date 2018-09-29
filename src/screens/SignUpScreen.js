import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator, KeyboardAvoidingView } from 'react-native';

import { Header, NavigationEvents } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';

const MODES = {
  initial  : 'initial'  ,
  loading  : 'loading'  ,
  fetching : 'fetching' ,
  succesful: 'succesful',
  invalid  : 'invalid'  ,
  error    : 'error'    ,
}

export default class SignUpScreen extends React.Component {

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

  componentDidFocus = () => {
    const { getAuthBGGradientRef } = this.props.screenProps;
    //start the BG Gradient animation
    getAuthBGGradientRef && getAuthBGGradientRef().start();
  }

  _renderHeader(){
    const { isLoading,  titleText, subtitleText, } = this.state;

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

  _renderForm() {
    return(
      <View collapsable={true}>
        
      </View>
    );
  }

  render() {
    return (
      <View collapsable={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus} />
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