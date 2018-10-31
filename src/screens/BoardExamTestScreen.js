import React, { Fragment } from 'react';
import { View, ScrollView, RefreshControl, Text, TouchableOpacity, Platform, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS, STYLES          } from '../Constants';
import { ViewWithBlurredHeader, IconText, Card } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';
import { DrawerButton, IconButton          } from '../components/Buttons';

import PreboardExamStore from '../functions/PreboardExamStore';
import LottieCircle from '../components/LottieCircle';
import { PreboardExamList } from '../components/PreboardExam';
import { PreboardExam, PreboardExamManager, PreboardExamItem, PreboardExamModuleItem } from '../functions/PreboardExamStore';
import { setStateAsync } from '../functions/Utils';

import * as Animatable from 'react-native-animatable';
import { Header, createStackNavigator } from 'react-navigation';
import { Icon, Divider } from 'react-native-elements';

const CloseButton = (props) => {
  return (
    <TouchableOpacity
      style={{marginHorizontal: 10, flexDirection: 'row', alignItems: 'center'}}
      {...props}
    >
      <Icon
        name={'ios-close-circle-outline'}
        type={'ionicon'}
        color={'white'}
        size={26}
      />
      <Text style={{marginLeft: 7, fontSize: 18, color: 'white'}}>Close</Text>
    </TouchableOpacity>
  )
}

const BoardExamTestHeader = (props) => <CustomHeader {...props}
  iconName='menu'
  iconType='simple-line-icon'
  iconSize={22}
/>

export class BoardExamTestScreen extends React.Component {
  static navigationOptions=({navigation, screenProps}) => ({
    title: 'Preboard Exam',
    headerTitle: BoardExamTestHeader,
    headerLeft : <CloseButton onPress={() => navigation.navigate('BoardExamRoute')}/>,
  });

  constructor(props){
    super(props);
    this.state = {
      preboard: null,
    }
    this.preboard = new PreboardExamManager();
    
  }

  async componentWillMount(){
    //get preboard exams
    let preboardModel = await this.preboard.getAsModel();
    this.setState({preboard: preboardModel.get()});
  }

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <PreboardExamList
          contentInset={{top: Header.HEIGHT}}
          contentOffset={{x: 0, y: -70}}
        />
      </ViewWithBlurredHeader>
    );
  }
}

export const styles = StyleSheet.create({

});