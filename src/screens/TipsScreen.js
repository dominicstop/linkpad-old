import React from 'react';
import { StyleSheet, RefreshControl, Alert, View, Text, TouchableOpacity, AsyncStorage, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS          } from '../Constants'        ;
import { ViewWithBlurredHeader } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';
import { TipList               } from '../components/Tips'  ;
import { timeout, setStateAsync } from '../functions/Utils';

import TipsStore from '../functions/TipsStore';

import { Header, createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';
import _ from 'lodash';

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
    let tips = await TipsStore.getTips();
    await setStateAsync(this, {tips: tips});
  }

  _onRefresh = async () => {
    const { tips } = this.state;
    let new_tips = tips;
    //set ui to refrshing
    await setStateAsync(this, {refreshing: true });
    try {
      let result = await Promise.all([
        //get tips from server
        TipsStore.refreshTipsData(),
        //avoid flicker
        timeout(1000),
      ]);
      //extract tips
      new_tips = result[0];
      const isTipsNew = _.isEqual(tips, new_tips);
      if(isTipsNew) Alert.alert('Sorry', 'No new tips to show');
    } catch(error){
      //avoid flicker
      await timeout(750);
      Alert.alert('Error', 'Unable to fetch new tips (Please try again)');
      this.setState({refreshing: false});
    }
    await setStateAsync(this, {refreshing: false, tips: new_tips});
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

  _renderFooter = () => {
    return (
      <View style={{marginBottom: 80}}>
        <Icon
          name={'heart'}
          type={'entypo'}
          color={'rgb(170, 170, 170)'}
          size={24}
        />
      </View>
    )
  }

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <TipList
          contentInset={{top: Header.HEIGHT + 12}}
          tips={this.state.tips}
          refreshControl={this._renderRefreshCotrol()}
          ListFooterComponent={this._renderFooter()}
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

