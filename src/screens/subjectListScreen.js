import React from 'react';
import { StyleSheet, Text, View, TabBarIOS, Platform } from 'react-native';
import { Header } from 'react-navigation';

export default class SubjectListScreen extends React.Component {
  static navigationOptions = {
    title: 'Subject Name',
    headerTransparent: true,
    headerStyle: {
      backgroundColor: 'rgba(48, 0, 247, 0.75)'
    },
    headerTintColor: 'white',
    headerTitleStyle: {
      fontWeight: 'bold',
      color: 'white'
    },
  };

  render(){
    return(
      null
    );
  }
}