import React, { Fragment } from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, Alert, FlatList, Platform } from 'react-native';
import PropTypes from 'prop-types';

import { setStateAsync, timeout, shuffleArray, randomElementFromArray , returnToZero} from '../functions/Utils';

import { IconButton, ExpandCollapseTextWithHeader } from './Buttons';
import { AnimatedListItem, IconText, Card } from './Views';
import { PreboardExam, PreboardExamManager, PreboardExamItem, PreboardExamModuleItem } from '../functions/PreboardExamStore';
import { STYLES } from '../Constants';
import PlatformTouchable from './Touchable';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import { Header } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { DangerZone } from 'expo';
const { Lottie } = DangerZone;

export class ExamModuleItem extends React.PureComponent {
  static propTypes = {
    module: PropTypes.object,
  };

  static styles = StyleSheet.create({
    card: {
      paddingHorizontal: 0, 
      paddingVertical: 0,
    },
    container: {
      paddingHorizontal: 15, 
      paddingVertical: 10,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
    },
    subtitle: {
      fontWeight: '100',
      fontSize: 16,
    },
    description: {
      fontSize: 18,
      textAlign: 'justify',
      marginTop: 5,
    }
  });

  _renderBody(){
    const { styles } = ExamModuleItem;
    const { module, style } = this.props;
    const model = new PreboardExamModuleItem(module);
    const data  = model.examModule;
    const questionCount = model.getQuestionCount();

    return(
      <View style={styles.container}>
        <IconText
          //icon
          iconName={'file-text'}
          iconType={'feather'}
          iconColor={'rgba(74, 20, 140, 0.5)'}
          iconSize={32}
          //title
          text={data.premodulename}
          textStyle={styles.title}
          //subtitle
          subtitle={`Questions: ${questionCount} items`}
          subtitleStyle={styles.subtitle}
        />
        <Text style={styles.description}>{data.description}</Text>
      </View>
    );
  }

  render(){
    const { styles } = ExamModuleItem;
    const { style } = this.props;

    return(
      <Card style={[styles.card, style]}>
        <PlatformTouchable >
          {this._renderBody()}
        </PlatformTouchable>
      </Card>
    );
  }
}

export class PreboardExamList extends React.PureComponent {
  static styles = StyleSheet.create({
    flatlist: {
      flex: 1,
      padding: 0,
    }
  });

  constructor(props){
    super(props);
    this.state = {
      loading: true,
      modules: [new PreboardExamModuleItem(null).examModule],
    };
    //used for getting the preboard data
    this.preboardExam = new PreboardExamManager();
  }

  async componentWillMount(){
    this.setState({loading: true});
    //get module data
    let exam = await this.preboardExam.getActiveExamModel();
    let modules = exam.getExamModules();
    this.setState({modules, loading: false});
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
    //fadeinup clips on android, use diff animation
    const animation = Platform.select({
      ios: 'fadeInUp',
      android: 'fadeInLeft'
    });

    return(
      <AnimatedListItem
        delay={300}
        duration={500}
        {...{index, animation}}
      >
        <ExamModuleItem module={item}/>
      </AnimatedListItem>
    );
  }

  render(){
    const { styles } = PreboardExamList;
    const { style, ...flatListProps} = this.props;
    const { modules, loading} = this.state;
    if(loading) return null;
    return(
      <FlatList
        style={[styles.flatlist, style]}
        data={_.compact(modules)}
        keyExtractor={this._keyExtactor}
        renderItem ={this._renderItem }
        ListHeaderComponent={this._renderFlatlistHeader}
        ListFooterComponent={this._renderFlatlistFooter}
        scrollEventThrottle={200}
        directionalLockEnabled={true}
        removeClippedSubviews={false}
        {...flatListProps}
      />
    );
  }
}

export class PreboardExamTest extends React.PureComponent {
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