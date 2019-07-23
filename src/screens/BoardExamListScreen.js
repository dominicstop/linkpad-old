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
import { ExamTestList } from '../components/ExamTestList';
import { PreboardExam, PreboardExamManager, PreboardExamItem, PreboardExamModuleItem } from '../models/PreboardModel';
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

const ExamTestListHeader = (props) => <CustomHeader {...props}
  iconName='clipboard-pencil'
  iconType='foundation'
  iconSize={22}
/>

export class ExamTestListScreen extends React.Component {
  static navigationOptions=({navigation, screenProps}) => ({
    title: 'Preboard Exam',
    headerTitle: ExamTestListHeader,
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
  };

  _handleOnPressModule = (module, modules) => {
    const { navigation } = this.props;
    //pass selected module and modules to next screen
    const params = { module, modules };
    navigation.navigate('BoardExamTestRoute', params);
  }

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <ExamTestList
          contentInset={{top: Header.HEIGHT}}
          contentOffset={{x: 0, y: -70}}
          onPressModule={this._handleOnPressModule}
        />
      </ViewWithBlurredHeader>
    );
  }
}