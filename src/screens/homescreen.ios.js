import React from 'react';
import { StyleSheet, Text, View, TabBarIOS, Platform, NavigatorIOS, TouchableOpacity, LayoutAnimation, UIManager } from 'react-native';

import { ViewWithBlurredHeader } from '../components/views'  ;
import { ModuleListStack } from './ModuleListScreen';
import { SettingsStack   } from './SettingsScreen'  ;

import { createBottomTabNavigator } from 'react-navigation';
//TODO: fork on github, export BottomTabBar and npm install
//import {  } from 'react-navigation-tabs/dist/views/BottomTabBar';
import { Icon } from 'react-native-elements';

const TabNavigation = createBottomTabNavigator({
    ModuleListRoute: {
      screen: ModuleListStack,
      navigationOptions: {
        tabBarLabel: 'Modules',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-albums' : 'ios-albums-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon'/>;
        }
      }
    },
    SettingsRoute: {
      screen: SettingsStack,
      navigationOptions: {
        tabBarLabel: 'Modules',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-settings' : 'ios-settings-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon'/>;
        }
      }
    },
  }, {
    tabBarOptions: {
      activeTintColor: 'rgba(255, 255, 255, 0.8)',
      inactiveTintColor: 'rgba(255, 255, 255, 0.5)',
      style: {
        backgroundColor: 'rgba(48, 0, 247, 0.7)',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        
      }
    }
  }
);

//container for tab navigation
export default class Homescreen extends React.Component {
  static router = TabNavigation.router;

  componentDidMount(){
    //this._navigateToModule(cardsData[0]);
  }

  render(){
    return (
      <TabNavigation
        navigation={this.props.navigation}

      />
    );
  }
}