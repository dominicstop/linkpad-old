import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TopicsScreen } from './screens/topicsScreen'

export default class App extends React.Component {
  render() {
    return (
      <TopicsScreen/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
