import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, AsyncStorage } from 'react-native';

export default class AuthLoadingScreen extends React.Component { 
  constructor(props) {
    super(props);
    this._authenticate();
  }

  _authenticate =  async () => {
    const userToken = await AsyncStorage.getItem('userToken');
    this.props.navigation.navigate(userToken? 'AppRoute' : 'AuthRoute');
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