import React from 'react';
import { StyleSheet, RefreshControl, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS          } from '../Constants'        ;
import { ViewWithBlurredHeader } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';
import { TipList               } from '../components/Tips'  ;
import { timeout } from '../functions/Utils';
import TipsDataProvider from '../functions/TipsDataProvider';



import { Header, createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { setStateAsync } from '../functions/Utils';

const TipsHeader = (props) => <CustomHeader {...props}
  iconName='star-outlined'
  iconType='entypo'
  iconSize={22}
/>

//show the setting screen
export class TipsScreen extends React.Component {
  static navigationOptions = {
    title: 'Tips',
    headerTitle: TipsHeader,
  };

  constructor(props){
    super(props);
    this.state = {
      tips: [],
      refreshing: false,
    };
  }

  async componentWillMount(){
    let tips = await TipsDataProvider.fetchTipsData();
    await setStateAsync(this, {tips: tips});
  }

  _onRefresh = async () => {
    await setStateAsync(this, {refreshing: true });
    let result = await Promise.all([
      TipsDataProvider.getTips(),
      //avoid flicker
      timeout(1000),
    ]);
    await setStateAsync(this, {refreshing: false, tips: result[0]});
  }

  _renderRefreshCotrol(){
    const { refreshing } = this.state;
    const prefix = refreshing? 'Checking' : 'Pull down to check';
    return(
      <RefreshControl 
        refreshing={this.state.refreshing} 
        onRefresh={this._onRefresh}
        title={prefix + ' for changes...'}
      />
    );
  }

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <TipList
          contentInset={{top: Header.HEIGHT + 12}}
          tips={this.state.tips}
          refreshControl={this._renderRefreshCotrol()}
        />
      </ViewWithBlurredHeader>
    );
  }
}

export const TipsStack = createStackNavigator({
  TipsRoute: {
      screen: TipsScreen,
    },
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: HEADER_PROPS,
  }
);

