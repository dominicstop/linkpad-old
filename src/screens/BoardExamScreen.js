import React from 'react';
import { View, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS          } from '../Constants';
import { ViewWithBlurredHeader, IconText, Card } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';
import { DrawerButton          } from '../components/Buttons';


import { setStateAsync } from '../functions/Utils';

import { Header, createStackNavigator } from 'react-navigation';
import { Icon, Divider } from 'react-native-elements';

const BoardExamHeader = (props) => <CustomHeader {...props}
  iconName='menu'
  iconType='simple-line-icon'
  iconSize={22}
/>

export class BoardExamScreen extends React.Component {
  static navigationOptions=({navigation, screenProps}) => ({
    title: 'Board Exam',
    headerTitle: BoardExamHeader,
    headerLeft : <DrawerButton drawerNav={screenProps.drawerNav}/>,
  });

  constructor(props){
    super(props);
  }

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={true}>

      </ViewWithBlurredHeader>
    );
  }
}

export const styles = StyleSheet.create({

});

export const BoardExamStack = createStackNavigator({
    BoardExamRoute: {
      screen: BoardExamScreen,
    },
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: HEADER_PROPS,
  }
);