import React, { Fragment } from 'react';
import { View, ScrollView, RefreshControl, Text, TouchableOpacity, Platform, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService      from '../NavigationService';
import Constants, { HEADER_PROPS, STYLES, ROUTES } from '../Constants';

import { PreboardExamListScreen } from './BoardExamListScreen';
import { BoardExamTestStack     } from './BoardExamTestScreen';

import   LottieCircle    from '../components/LottieCircle';
import { setStateAsync } from '../functions/Utils';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader  } from '../components/Header';
import { ExamDetails   } from '../components/PreboardExam';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView } from '../components/Views';
import { DrawerButton, PlatformTouchableIconButton } from '../components/Buttons';
import { PreboardExam, PreboardExamManager } from '../functions/PreboardExamStore';

import { Header, createStackNavigator } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';


class BoardExamMainScreen extends React.Component {
  render(){
    return(
      <View style={{flex: 1, backgroundColor: 'red'}}>

      </View>
    );
  };
};

const CustomQuizExamStack = createStackNavigator({
    [ROUTES.PreboardExamRoute]: BoardExamMainScreen,
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: {
      gesturesEnabled: false,
      ...Constants.HEADER_PROPS
    },
  }
);

//container for the stacknav: CustomQuizExamStack
export class BoardExamScreen extends React.PureComponent {
  static router = CustomQuizExamStack.router;

  static navigationOptions = {
    header: null,
  };

  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1, 
      height: '100%', 
      width: '100%', 
      backgroundColor: 'rgb(233, 232, 239)'
    },
  });

  _renderContents(){
    return(
      <CustomQuizExamStack
        navigation={this.props.navigation}
        screenProps={{
          ...this.props.screenProps,
        }}
      />
    );
  };


  render(){
    const { styles } = CustomQuizExamStackContainer;

    return (
      <View style={styles.rootContainer}>
        {this._renderContents()}
      </View>
    );
  };
};