import React from 'react';
import { View, ScrollView, ViewPropTypes, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS          } from '../Constants';
import { ViewWithBlurredHeader, IconText, Card } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';
import { DrawerButton          } from '../components/Buttons';

import PreboardExamStore from '../functions/PreboardExamStore';
import LottieCircle from '../components/LottieCircle';
import {PreboardExam, PreboardExamItem, PreboardExamModuleItem} from '../functions/PreboardExamStore';
import { setStateAsync } from '../functions/Utils';

import { Header, createStackNavigator } from 'react-navigation';
import { Icon, Divider } from 'react-native-elements';



export class IntroductionCard extends React.PureComponent {
  constructor(props){
    super(props);
    this.animationSource = require('../animations/text.json');
  }

  render(){
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 15}}>
        <LottieCircle 
          source={this.animationSource}
          containerStyle={{backgroundColor: '#7C4DFF'}}
          ref={r => this.lottie = r}
          circleSize={100}
          iconSize={600}
        />
        <Text style={{fontSize: 32, fontWeight: '700', marginTop: 10, color: '#311B92'}}>{'Prebaord Exam'}</Text>
        <Text style={{flex: 1, fontSize: 22, marginTop: 5}}>
          {'Aenean lacinia bibendum nulla sed consectetur. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.'}
        </Text>
      </View>
    );
  }
}

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

  async componentWillMount(){
    //get preboard exams
    const examsData = await PreboardExamStore.get();
    const exams = new PreboardExam(examsData);
    console.log(exams.response);
  }

  render(){
    const header_height = Header.HEIGHT;

    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <ScrollView style={{paddingTop: header_height}}>
          <IntroductionCard/>
        </ScrollView>
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