import React from 'react';
import { View, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS          } from '../Constants';
import { ViewWithBlurredHeader } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';


import { Header, createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';

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

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <ScrollView style={{paddingTop: Header.HEIGHT + 15, paddingHorizontal: 20}}>
        </ScrollView>
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