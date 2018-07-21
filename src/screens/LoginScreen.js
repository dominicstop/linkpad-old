import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View, TabBarIOS, Platform, TouchableOpacity, AsyncStorage, ScrollView, TextInput } from 'react-native';

import { AnimatedGradient } from '../components/animatedGradient';

import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import { IconButton } from '../components/buttons';

const LOGIN_MODE = {
  INITIAL      : 0,
  LOGIN        : 1,
  LOGIN_INVALID: 2,
  LOGIN_SUCCESS: 3,
  LOGIN_ERROR  : 4,
}

//smart cont: handles all the login logic
export class LoginContainer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      mode: LOGIN_MODE.INITIAL,
    }
  }

  _login = async () => {
    const { navigation } = this.props;
    await this.setState({mode: LOGIN_MODE.LOGIN});
    await AsyncStorage.setItem('userToken', 'abc');
    navigation.navigate('AppRoute');
  }

  render(){
    const childProps = {
      mode : this.state.mode,
      login: this._login,
    }
    return(
      React.cloneElement(this.props.children, childProps)
    );
  }
}

//dumb cont: presents the UI
export class LoginUI extends React.Component {
  static propType = {
    mode : PropTypes.oneOf(Object.values(LOGIN_MODE)),
    login: PropTypes.func,
  }

  _renderHeader = () => {
    return(
      <View>
        <Text style={{fontSize: 40, fontWeight: '900', color: 'white'}}>
          SIGN IN
        </Text>
        <Text style={{fontSize: 18, fontWeight: '100', color: 'white'}}>
          Please sign in to continue
        </Text>
      </View>
    );
  }

  render(){
    console.log(this.props.mode);
    const { mode, login } = this.props;
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
            style={styles.signInContainer}
            animation={'bounceInUp'}
            duration={1000}
            easing={'ease-in-out'}
            useNativeDriver={true}
          >
            {this._renderHeader()}

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
              onPress={this.props.login}
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
});