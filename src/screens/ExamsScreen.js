import React from 'react';
import { View, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage } from 'react-native';
import PropTypes from 'prop-types';

import Constants from '../Constants';

import   NavigationService       from '../NavigationService';
import { ViewWithBlurredHeader } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';
import { DrawerButton          } from '../components/Buttons';

import { Header, createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';

//show the setting screen
export class ExamsScreen extends React.Component {
  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <ScrollView style={{paddingTop: Header.HEIGHT + 15, paddingHorizontal: 20}}>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  }
}