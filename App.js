import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TopicsScreen } from './screens/topicsScreen'
import { CardList, CardGroup } from './components/cards';

export default class App extends React.Component {
  render() {
    return (
      <CardList/>
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
