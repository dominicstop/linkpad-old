import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, AsyncStorage } from 'react-native';

export default class AuthLoadingScreen extends React.Component { 
  static navigationOptions = {

  }

  constructor(props) {
    super(props);
    this._authenticate();
  }

  _authenticate =  async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    setInterval(() => {
      this.props.navigation.navigate(userToken? 'AppRoute' : 'AuthRoute');
    }, 1000);
  }
  
  render(){
    return(
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator />
        <Text>Loading</Text>
      </View>
    );
  }
}