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

const ExamsHeader = (props) => <CustomHeader {...props}
  iconName='bookmark'
  iconType='feather'
  iconSize={22}
/>

//show the setting screen
export class BoardExamTestScreen extends React.Component {
  static navigationOptions=({navigation, screenProps}) => ({
    title: 'Exams',
    headerTitle: ExamsHeader,
  });

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <ScrollView style={{paddingTop: Header.HEIGHT + 15, paddingHorizontal: 20}}>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  }
}

export const BoardExamTestStack = createStackNavigator({
   BoardExamTestRoute: {
      screen: BoardExamTestScreen,
    },
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: Constants.HEADER_PROPS,
    ...Constants.STACKNAV_PROPS
  }
);