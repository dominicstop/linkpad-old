import React from 'react';
import { StyleSheet, Text, View, TabBarIOS, Platform, TouchableOpacity, AsyncStorage } from 'react-native';

export default class LoginScreen extends React.Component { 
  static navigationOptions = {

  }

  _login = async () => {
    const { navigation } = this.props;
    await AsyncStorage.setItem('userToken', 'abc');
    navigation.navigate('AppRoute');
  }

  render(){
    return(
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <TouchableOpacity
          onPress={this._login}
        >
          <Text>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
}