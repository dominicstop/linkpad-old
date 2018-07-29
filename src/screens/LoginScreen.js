import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View, TabBarIOS, Platform, TouchableOpacity, AsyncStorage, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator } from 'react-native';

import { AnimatedGradient } from '../components/animatedGradient';

import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import { IconButton } from '../components/buttons';

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

//smart cont: handles all the login logic
export class LoginContainer extends React.Component {
  constructor(props){
    super(props);
  }



  _login = (callbacks) => {
    const {
      onLoginLoading , //while logging in
      onLoginInvalid , //invalid email/password
      onLoginError   , //something went wrong
      onLoginFinished, //finish logging in
    } = callbacks;

    const { navigation } = this.props;

    onLoginLoading();

    //await this.setState({mode: LOGIN_MODE.LOGIN});
    //await AsyncStorage.setItem('userToken', 'abc');
    //navigation.navigate('AppRoute');
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
      loading: false,
    }
  }

  onPressLogin = () => {
    this.toggleLoading();
    //this.props.login();
  }

  toggleLoading(){
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({loading: !this.state.loading});
    this.headerTitle.fadeOutRight(200).then(() => {
      this.headerTitle.fadeInLeft(250);
    });
  }

  _renderHeader = () => {
    const { loading } = this.state;
    return(
      <View>
        <Animatable.View
          style={{flexDirection: 'row'}}
          ref={r => this.headerTitle = r}
          useNativeDriver={true}
        >
          {loading && <ActivityIndicator size='large' style={{marginRight: 10}}/>}
          <Text style={{fontSize: 38, fontWeight: '900', color: 'white'}}>
            {loading? 'SIGNING IN' : 'SIGN IN'}
          </Text>
        </Animatable.View>
        <Animatable.Text 
          style={{fontSize: 18, fontWeight: '100', color: 'white'}}
          ref={r => this.headerSubtitle = r}
          useNativeDriver={true}
        >
          {loading? 'Please wait...' : 'Please sign in to continue'}
        </Animatable.Text>
      </View>
    );
  }

  _renderSignInForm(){
    return(
      <View collapsable={true}>
        <View style={styles.textinputContainer}>
          <Icon
            containerStyle={styles.textInputIcon}
            name='ios-mail-outline'
            type='ionicon'
            color='white'
            size={40}
          />
          <TextInput
            style={styles.textinput}
            placeholder='E-mail address'
            placeholderTextColor='rgba(255, 255, 255, 0.7)'
            keyboardType='email-address'
            textContentType='username'
            returnKeyType='next'
            maxLength={50}
            autoCapitalize={false}
            enablesReturnKeyAutomatically={true}
          />
        </View>
        <View style={styles.textinputContainer}>
          <Icon
            containerStyle={styles.textInputIcon}
            name='ios-lock-outline'
            type='ionicon'
            color='white'
            size={35}
          />
          <TextInput
            style={styles.textinput}
            placeholder='Password'
            placeholderTextColor='rgba(255, 255, 255, 0.7)'
            textContentType='password'
            maxLength={50}
            secureTextEntry={true}
            autoCapitalize={false}
            enablesReturnKeyAutomatically={true}
          />
        </View>
        
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

  render(){
    console.log(this.props.mode);
    const { mode, login } = this.props;
    const { loading } = this.state;
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
          <Animatable.View 
            style={[styles.signInContainer, {overflow: 'hidden'}]}
            animation={'bounceInUp'}
            duration={1000}
            easing={'ease-in-out'}
            useNativeDriver={true}
          >
            {this._renderHeader()}

            {!loading && this._renderSignInForm()}

            
          </Animatable.View>
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
    alignItems: 'center', 
    justifyContent: 'center'
  },
  signInContainer: {
    alignSelf: 'stretch', 
    alignItems: 'stretch', 
    margin: 15, 
    padding: 22, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    borderRadius: 20
  },
  textinputContainer: {
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
    borderBottomColor: 'white', 
    borderWidth: 1,
    paddingHorizontal: 5, 
    color: 'white'
  }
});``