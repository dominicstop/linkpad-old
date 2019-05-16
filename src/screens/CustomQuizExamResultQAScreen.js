import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback, Clipboard, FlatList, ActivityIndicator, Dimensions, Switch} from 'react-native';
import PropTypes from 'prop-types';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView, IconFooter } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader } from '../components/Header' ;

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import moment from "moment";
import Pie from 'react-native-pie'
import { Header, NavigationEvents } from 'react-navigation';
import { Divider, Icon } from 'react-native-elements';
import SegmentedControlTab from "react-native-segmented-control-tab";

import * as shape from 'd3-shape'
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
import { LinearGradient, Stop, Defs, G } from 'react-native-svg'

import { STYLES, ROUTES , HEADER_HEIGHT, LOAD_STATE} from '../Constants';
import { plural, isEmpty, timeout , formatPercent, ifTrue, callIfTrue, setStateAsync} from '../functions/Utils';
import { BLUE , GREY, PURPLE, RED, GREEN} from '../Colors';
import {CustomQuizResultsStore,  CustomQuizResultItem} from '../functions/CustomQuizResultsStore';


const headerTitle = (props) => <CustomHeader 
  name={'info'}
  type={'simple-line-icon'}
  size={22}
  {...props}  
/>

export class CustomQuizExamResultQAScreen extends React.PureComponent {
  static navigationOptions = {
    title: 'Answers',
    headerTitle,
    //custom android header
    ...Platform.select({
      android: { header: props => <AndroidHeader {...props}/> }
    }),
  };

  /** combines all qa across all of the results into 1 qa item */
  static combineSameQuestionsAndAnswers(items){
    const results = CustomQuizResultItem.wrapArray(items);
    const QALists = results.map(result => result.questionAnswersList);

    let list = {};
    QALists.forEach(QAList => {
      QAList.forEach(QAItem => {
        const { questionID } = QAItem;
        if(list[questionID]){
          //item already exists, so append
          list[questionID].push(QAItem);
        } else {
          //item doesnt exists, so initialize
          list[questionID] = [QAItem];
        };
      });
    });
    return list;
  };

  constructor(props){
    super(props);
    //get data from prev. screen - quiz results
    const quizResults = navigation.getParam('quizResults', []);
    //combine the same QA items across all results
    const QAList = CustomQuizExamResultQAScreen.combineSameQuestionsAndAnswers(quizResults);

    this.state = {
      QAList
    };
  };

  _renderItem = ({item, index}) => {
    return(
      <Card>
        
      </Card>
    );
  };

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <FlatList
          data={this.state.QAList}
          renderItem={this._renderItem}
        />
      </ViewWithBlurredHeader>
    );
  };
};