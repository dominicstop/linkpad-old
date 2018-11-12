import React from 'react';
import { StyleSheet, RefreshControl, Alert, View, Text, TouchableOpacity, AsyncStorage, FlatList, Platform } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService' ;
import { HEADER_PROPS          } from '../Constants'         ;
import { ViewWithBlurredHeader } from '../components/Views'  ;
import { CustomHeader          } from '../components/Header' ;
import { TipList               } from '../components/Tips'   ;
import { DrawerButton          } from '../components/Buttons';

import { timeout, setStateAsync } from '../functions/Utils';

import TipsStore from '../functions/TipsStore';

import { Header, createStackNavigator, NavigationEvents } from 'react-navigation';
import { Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import _ from 'lodash';

//show the setting screen
export class TipsScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      tips: [],
      refreshing: false,
      showContent: false,
    };
  }

  async componentWillMount(){
    //load data from storage
    let tips = await TipsStore.getTips();
    await setStateAsync(this, {tips: tips});
  }

  shouldComponentUpdate(nextProps, nextState){
    return !_.isEqual(this.state, nextState)
  }

  componentDidFocus = () => {
    //mount or show contents on first show
    if(!this.state.showContent){
      this.setState({showContent: true});
    }
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
      //show alert when there are no changes
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
    const delay = 2000;
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return (
      <Animatable.View 
        style={{paddingBottom: 80}}
        duration={750}
        useNativeDriver={true}
        {...{animation, delay}}
      >
        <Animatable.View
          animation={'pulse'}
          duration={1000}
          easing={'ease-in-out'}
          delay={3000}
          iterationCount={'infinite'}
          useNativeDriver={true}
          {...{delay}}
        >
          <Icon
            name={'heart'}
            type={'entypo'}
            color={'#B39DDB'}
            size={24}
          />
        </Animatable.View>
      </Animatable.View>
    );
  };

  render(){
    const offset = Header.HEIGHT + 15;

    return(
      <ViewWithBlurredHeader hasTabBar={true} enableAndroid={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {this.state.showContent && <TipList
          contentInset={{top: offset}}
          contentOffset={{x: 0, y: -offset}}
          tips={this.state.tips}
          refreshControl={this._renderRefreshCotrol()}
          ListFooterComponent={this._renderFooter()}
        />}
      </ViewWithBlurredHeader>
    );
  }
}

