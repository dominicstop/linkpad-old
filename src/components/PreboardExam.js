import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, Alert, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { setStateAsync, timeout, shuffleArray, randomElementFromArray , returnToZero} from '../functions/Utils';

import { Button, ExpandCollapseTextWithHeader } from './Buttons';
import { AnimatedListItem, IconText } from './Views';
import { PreboardExam, PreboardExamManager, PreboardExamItem, PreboardExamModuleItem } from '../functions/PreboardExamStore';

import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import    { Header   } from 'react-navigation';
import    { Divider  } from 'react-native-elements';

import { DangerZone } from 'expo';
import _ from 'lodash';
import {STYLES} from '../Constants';
const { Lottie } = DangerZone;

export class PreboardExamList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      modules: [new PreboardExamModuleItem(null).examModule],
    };
    //used for getting the preboard data
    this.preboardExam = new PreboardExamManager();
  }

  async componentWillMount(){
    let exam = await this.preboardExam.getActiveExamModel();
    let modules = exam.getExamModules();
    this.setState({modules});
  }

  _keyExtactor = (item) => {
    const model = new PreboardExamModuleItem(item);
    return model.getCompositeIndexid();
  }

  

  _renderFlatlistHeader = () => {
    return(
      <Text>Header</Text>
    );
  }

  _renderFlatlistFooter = () => {
    return(
      <View style={{padding: 70}}/>
    );
  }

  _renderItem = ({item, index}) => {
    const model = new PreboardExamModuleItem({...item});
    return(
      <AnimatedListItem
        index={index}
        delay={300}
        duration={500}
      >
        <Text>{model.getCompositeIndexid()}</Text>
      </AnimatedListItem>
    );
  }

  render(){
    const { style, ...flatListProps} = this.props;
    const { modules } = this.state;
    return(
      <FlatList
        style={style}
        data={_.compact(modules)}
        keyExtractor={this._keyExtactor}
        renderItem ={this._renderItem }
        ListHeaderComponent={this._renderFlatlistHeader}
        ListFooterComponent={this._renderFlatlistFooter}
        scrollEventThrottle={200}
        directionalLockEnabled={true}
        removeClippedSubviews={true}
        {...flatListProps}
      />
    );
  }
}

export class PreboardExamTest extends React.Component {
  static propTypes = {

  }

  constructor(props){
    super(props);
    this.DEBUG = false;
    this.state = {
      //true when read/writng to storage
      loading: true,
      //list of all the questions
      questions: [],
      //list of questions to show in the UI
      questionList: [],
      //determines which question to show
      currentIndex: 0,
    };

    this.preboard = new PreboardExamManager();
  }

  async componentWillMount(){
    //get Preboard data
    let preboardModel = await this.preboard.getAsModel();
    //extract exams array
    let exams = preboardModel.getExams ();
    //extract modules from first exam item
    let modules = exams[0].getExamModules();
    //extract module details from first module
    let moduleData = modules[0].get();
    //extract questions from module data

    this.setState({
      preboardDetails: preboardModel.get()
    });
  }

  //adds a new question at the end
  async nextQuestion(){
    const { questions, questionList, currentIndex } = this.state;
    //add question to list
    let list = questionList.slice();
    list.push(questions[currentIndex+1]);

    //update question list
    await setStateAsync(this, {
      questionList: list,
      currentIndex: currentIndex+1,
    });

    //show new question
    this._questionListCarousel.snapToNext();
  }

  _onPressNextQuestion = () => {
    this.nextQuestion();
  }

  //callback: when answer is selected
  _onAnswerSelected = (question, questionIndex, answer, isCorrect) => {

  }
  
  _renderItem = ({item, index}) => {
    const isLast = index == this.state.questions.length - 1;
    return (
      null
    );
  }

  render(){
    const {onEndReached, ...flatListProps } = this.props;
    //ui values for carousel
    const headerHeight = Header.HEIGHT + 15;
    const screenHeight = Dimensions.get('window').height;
    const carouselHeight = {
      sliderHeight: screenHeight, 
      itemHeight  : screenHeight - headerHeight,
    };


    if(this.state.loading) return null;

    return(
      <Carousel
        ref={(c) => { this._questionListCarousel = c; }}
        data={this.state.questionList}
        renderItem={this._renderItem}
        firstItem={this.state.currentIndex}
        activeSlideAlignment={'end'}
        vertical={true}
        lockScrollWhileSnapping={false}
        //scrollview props
        showsHorizontalScrollIndicator={true}
        bounces={true}
        //other props
        {...carouselHeight}
        {...flatListProps}
      />
    );
  }
}