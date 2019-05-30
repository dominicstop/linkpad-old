import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated as NativeAnimated, TextInput, TouchableWithoutFeedback, Keyboard, Alert, Dimensions, Clipboard, SectionList, Image, ScrollView, FlatList } from 'react-native';
import { LinearGradient, BlurView, DangerZone } from 'expo';
import PropTypes from 'prop-types';

import { STYLES, FONT_STYLES } from '../Constants';
import { PURPLE, GREY, BLUE, GREEN } from '../Colors';

import { setStateAsync, isEmpty , getTimestamp, plural, timeout, addLeadingZero} from '../functions/Utils';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconText, AnimateInView, IconFooter } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';

import _ from 'lodash';
import moment from "moment";
import TimeAgo from 'react-native-timeago';
import Chroma from 'chroma-js'

import { Icon, Divider } from 'react-native-elements';

import * as Animatable from 'react-native-animatable';
import { QuizAnswer, QuizQuestion } from '../models/Quiz';
import { isIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';

import { BlurViewWrapper, StickyHeader, DetailRow, DetailColumn, ModalBottomTwoButton, ModalTitle, StickyHeaderCollapsable, ModalSection, ExpanderHeader, NumberIndicator } from '../components/StyledComponents';
const { Lottie } = DangerZone;

import Animated, { Easing } from 'react-native-reanimated';
import { ContentExpander } from '../components/Expander';
import { CustomQuiz } from '../functions/CustomQuizStore';
const { interpolate, Value } = Animated; 

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

prevTimestamps = [];


function getAverage(nums = []){
  const numbers = [...nums];

  //remove duplicates
  const filtered = numbers.filter((number, index, array) => 
    array.indexOf(number) === index
  );

  //sort timestamps
  filtered.sort((a, b) => a - b);

  //subtract diff
  const diffs = filtered.map((value, index, array) => {
    //if not last item
    if(index < array.length - 1){
      const nextValue = array[index + 1];
      return Math.abs(value - nextValue);
    };
    //remove undefined values
  }).filter(item => item != undefined);

  const sum = diffs.reduce((acc, value) => acc + value, 0);
  const avg = Math.floor(sum / diffs.length);

  const min = Math.min(...diffs); 
  const max = Math.max(...diffs);

  return({ 
    avg, sum, 
    min: isFinite(min)? min : null,
    max: isFinite(max)? max : null, 
  });
};

class CheckOverlay extends React.PureComponent {
  constructor(props){
    super(props);

    this.state = {
      mountAnimation: false,
    };

    this._source = require('../animations/checked_done_.json');
    this._value = new NativeAnimated.Value(0);
    this._config = { 
      toValue: 1,
      duration: 1000,
      useNativeDriver: true 
    };
    this._animated = NativeAnimated.timing(this._value, this._config);
  };

  //start animation
  start = () => {
    return new Promise(async resolve => {
      await setStateAsync(this, {mountAnimation: true});
      this._animated.start(() => resolve());
    });
  };

  render(){
    //dont mount until animation starts
    if(!this.state.mountAnimation) return null;

    return(
      <Animatable.View
        style={{width: '100%', height: '100%'}}
        animation={'bounceIn'}
        duration={1000}
        useNativeDriver={true}
      >
        <Lottie
          resizeMode={'contain'}
          ref={r => this.animation = r}
          progress={this._value}
          source={this._source}
          loop={false}
          autoplay={false}
        />
      </Animatable.View>
    );
  };
};

class TimeElasped extends React.PureComponent {
  static propTypes = {
    startTime: PropTypes.number,
  };

  constructor(props){
    super(props);
    this.state = {
      time: this.getTimeElapsed(),
    };

    this.interval = null;
  };

  componentDidMount(){
    this.start();
  };

  getTimeElapsed = () => {
    const { startTime } = this.props;
    const currentTime = new Date().getTime();

    const diffTime = currentTime - startTime;
    const duration = moment.duration(diffTime, 'milliseconds');

    const hours    = addLeadingZero(duration.hours  ());
    const minutes  = addLeadingZero(duration.minutes());
    const seconds  = addLeadingZero(duration.seconds());

    return(`${hours}:${minutes}:${seconds}`);
  };

  componentWillUnmount(){
    this.stop();
  };

  start = () => {
    const { startTime } = this.props;
    //stop if there's already a timer
    if(this.interval) return;

    this.interval = setInterval(() => {
      const time = this.getTimeElapsed();
      this.setState({time});
    }, 1000);
  };

  stop(){
    if(this.interval){
      clearInterval(this.interval);
      this.interval = null;
    };
  };

  render(){
    const { startTime, ...textProps } = this.props;
    const { time } = this.state;
    return(
      <Text {...textProps}>{time}</Text>
    );
  };
};

class QuizStats extends React.PureComponent {
  static propTypes = {
    startTime: PropTypes.number,
    answers  : PropTypes.array ,
    questions: PropTypes.array ,
    quiz     : PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: Platform.select({
      ios: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: 'rgba(245, 245, 245, 0.5)',
      },
      android: {
        backgroundColor: 'white',
        padding: 12,
        paddingBottom: 15,
      }
    }),
    divider: {
      height: 1,
      margin: 15,
      backgroundColor: 'rgba(0,0,0, 0.12)'
    },
    detailsCompContainer: {
    },
    title: {
      fontWeight: '600',
      fontSize: 18,
      color: PURPLE[1000],
    },
    subtitle: {
      fontSize: 17,
      fontWeight: '200'
    },
    detailTitle: Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '600',
        color: PURPLE[1000]
      },
      android: {
        fontSize: 17,
        fontWeight: '900'
      }
    }),
    detailSubtitle: Platform.select({
      ios: {
        fontSize: 21,
        fontWeight: '200'
      },
      android: {
        fontSize: 21,
        fontWeight: '100',
        color: '#424242'
      },
    }),
  });

  constructor(props){
    super(props);

    const answers = QuizAnswer.wrapArray(props.answers);
    
    //extract timestamps
    const new_timestamps = answers.map(answer => answer.timestampAnswered);
    const timestamps = [...new Set([...prevTimestamps, ...new_timestamps])];

    //update old timestamps
    prevTimestamps = [...timestamps];

    //compute avg time to answer
    const { min, max, avg, sum } = getAverage(timestamps);

    this.state = { 
      min: min? min / 1000 : null, 
      max: max? max / 1000 : null, 
      avg: avg? avg / 1000 : null, 
      sum: sum? sum / 1000 : null,
      timestamps,
    };
  };

  getState = () => {
    return(this.state);
  };

  _renderDetailsTime(){
    const { styles } = QuizStats;
    const { startTime, answers, quiz, questions } = this.props;

    const timeStarted = moment(startTime).format('LT');
    const total = quiz.questions.length || 'N/A';

    const progress  = `${answers.length}/${total} items`;
    const remaining = `${total - answers.length} remaining`;

    return(
      <Fragment>
        <DetailRow>
          <DetailColumn
            title={'Started: '}
            subtitle={timeStarted}
            help={true}
            helpTitle={'Started'}
            helpSubtitle={'Tells you what time the quiz began.'}
            backgroundColor={PURPLE.A400}
          />
          <DetailColumn 
            title={'Elapsed: '}
            help={true}
            helpTitle={'Elapsed'}
            helpSubtitle={'Tells you how much time has elapsed.'}
            backgroundColor={PURPLE.A400}
          >
            <TimeElasped {...{startTime}}/>
          </DetailColumn>
        </DetailRow>
        <DetailRow marginTop={10}>
          <DetailColumn
            title={'Progress: '}
            subtitle={progress}
            help={true}
            helpTitle={'Progress'}
            helpSubtitle={'Shows how many questions you have answered over the total questions in this quiz.'}
            backgroundColor={PURPLE.A700}
          />
          <DetailColumn
            title={'Questions: '}
            subtitle={remaining}
            help={true}
            helpTitle={'Remaining Questions'}
            helpSubtitle={'Shows how many questions are left for this quiz.'}
            backgroundColor={PURPLE.A700}
          />
        </DetailRow>
      </Fragment>
    );
  };

  _renderDetailsComp(){
    const { styles } = QuizStats;
    const { min, max, avg, sum, timestamps } = this.state;

    const timesAnswered = `${timestamps.length} times`;

    const minText = min? `${min.toFixed(1)} Seconds` : 'N/A';
    const maxText = max? `${max.toFixed(1)} Seconds` : 'N/A';
    const avgText = avg? `${avg.toFixed(1)} Seconds` : 'N/A';

    const marginTop = 12;

    return(
      <View style={styles.detailsCompContainer}>
        <Text style={styles.title}>Time Per Answer</Text>
        <Text style={styles.subtitle}>Computes the amount of time it took to answer each question.</Text>
        <DetailRow {...{marginTop}}>
          <DetailColumn
            title={'Shortest: '}
            subtitle={minText}
            help={true}
            helpTitle={'Shortest Time'}
            helpSubtitle={'Tells you what time the quiz began.'}
            backgroundColor={BLUE.A400}
          />
          <DetailColumn 
            title={'Longest: '}
            subtitle={maxText}
            help={true}
            helpTitle={'Longest Time'}
            helpSubtitle={'Tells you what was the max. amount of time you spent on a question.'}
            backgroundColor={BLUE.A400}
          />
        </DetailRow>
        <DetailRow {...{marginTop}}>
          <DetailColumn
            title={'Average: '}
            subtitle={avgText}
            help={true}
            helpTitle={'Average Time'}
            helpSubtitle={'Tells you the average amount of time you spent on a single question..'}
            backgroundColor={BLUE.A700}
          />
          <DetailColumn 
            title={'Answered: '}
            subtitle={timesAnswered}
            help={true}
            helpTitle={'Times Answered'}
            helpSubtitle={'Tells you how many times you selected a choice across all of the questions in this quiz.'}
            backgroundColor={BLUE.A700}
          />
        </DetailRow>
      </View>
    );
  };

  render(){
    const { styles } = QuizStats;
    const { startTime } = this.props;

    return(
      <ModalSection>
        {this._renderDetailsTime()}
        <View style={styles.divider}/>
        {this._renderDetailsComp()}
      </ModalSection>
    );
  };
};

class QuizDetails extends React.PureComponent {
  static propTypes = {
    quiz: PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: Platform.select({
      ios: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: 'rgba(245, 245, 245, 0.5)',
      },
      android: {
        backgroundColor: 'white',
        padding: 12,
        paddingBottom: 15,
      }
    }),
    divider: {
      margin: 10,
      height: 1,
      backgroundColor: 'rgba(0,0,0, 0.12)'
    },
    title: {
      fontSize: 20,
      color: PURPLE[600],
      fontWeight: '600',
    },
    date: {
      fontSize: 17,
      color: 'black',
      fontWeight: '300',
    },
    label: {
      color: PURPLE[1000],
      fontWeight: '500',
    },
    dateString: {
      color: 'rgb(80, 80, 80)',
      fontWeight: '100',
    },
    description: {
      fontSize: 18,
      fontWeight: '300'
    },
    descriptionLabel: {
      fontWeight: '400'      
    }
  });

  _renderTitle(){
    const { styles } = QuizDetails;
    const quiz = CustomQuiz.wrap(this.props.quiz);

    return(
      <Text 
        style={styles.title}
        numberOfLines={1}
      >
        {quiz.title || 'Unknown Title'}
      </Text>
    );
  };

  _renderDate(){
    const { styles } = QuizDetails;
    const quiz = CustomQuiz.wrap(this.props.quiz);
    const timestampCreated = quiz.timestampCreated || 0; 

    const time = timestampCreated * 1000;
    const date = new Date(time);

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const dateString = date.toLocaleDateString('en-US', options);

    return(
      <Text style={styles.date}>
        <Text style={styles.label}>Created: </Text>
        <TimeAgo {...{time}}/>
        <Text style={styles.dateString}>{` (${dateString})`}</Text>
      </Text>
    );
  };

  _renderDescription(){
    const { styles } = QuizDetails;
    const quiz = CustomQuiz.wrap(this.props.quiz);

    return(
      <Text style={styles.description}>
        <Text style={styles.label}>Description: </Text>
        {quiz.description || 'No Description Available'}
      </Text>
    );
  };

  render(){
    const { styles } = QuizDetails;
    return(
      <ModalSection>
        {this._renderTitle()}
        {this._renderDate()}
        <View style={styles.divider}/>
        {this._renderDescription()}
      </ModalSection>
    );
  };
};

class QuestionItem extends React.PureComponent {
  static propTypes = {
    //indexes
    maxIndex    : PropTypes.number,
    currentIndex: PropTypes.number,
    //time answered
    timestampAnswered: PropTypes.number,
    //style
    indicatorColor: PropTypes.string,
    //data
    answerID  : PropTypes.string,
    userAnswer: PropTypes.string,
    question  : PropTypes.object,
    isCorrect : PropTypes.bool  ,
    isLast    : PropTypes.bool  ,
    //events
    onPressItem: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      ...Platform.select({
        ios: {
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 0, 0, 0.1)', 
        },
        android: {
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderColor: 'rgb(190,190,190)',
        },
      }),
    },
    questionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    question: {
      flex: 1,
      marginLeft: 5,
      fontSize: 18,
      fontWeight: '400'
    },
    answerContainer: {
      flexDirection: 'row',
      marginTop: 2,
      alignItems: 'center',
    },
    answer: {
      flex: 1,
      fontSize: 18,
      fontWeight: '400',
      color: 'rgb(50, 50, 50)',
    },
    answerLabel: {
      fontWeight: '600',
      color: PURPLE[1000],
    },
    answerTime: {
      fontSize: 16,
      fontWeight: '100',
      color: GREY[600]
    }
  });

  _handleOnPress = () => {
    const { onPressItem, index } = this.props;
    onPressItem && onPressItem({index});
  };

  _renderQuestion(){
    const { styles } = QuestionItem;
    const { index, currentIndex } = this.props;
    const props = this.props;
    const question = QuizQuestion.wrap(props.question);

    const isSelected = (index == currentIndex);
    const color = isSelected? BLUE.A700 : props.indicatorColor;
    const questionStyle = {
      ...(isSelected && {
        fontSize: 19,
      }),
    };

    return(
      <View style={styles.questionContainer}>
        <NumberIndicator 
          value={index + 1}
          size={20}
          initFontSize={15}
          diffFontSize={1.5}
          {...{color}}
        />
        <Text style={[styles.question, questionStyle]} numberOfLines={1}>
          {question.question || 'No question to show...'}
        </Text>
      </View>
    );
  };

  _renderDetails(){
    const { styles } = QuestionItem;
    const { userAnswer, index, currentIndex, timestampAnswered } = this.props;

    const isSelected = (index == currentIndex);
    const answerStyle = {
      ...(isSelected && {
        fontSize: 19,
      }),
    };

    const answerTime = moment(timestampAnswered).format('LTS');

    return(
      <View style={styles.answerContainer}>
        <Text style={[styles.answer, answerStyle]} numberOfLines={1}>
          <Text style={styles.answerLabel}>{'Answer: '}</Text>
          {userAnswer || 'N/A'}
        </Text>
        <Text style={styles.answerTime}>{answerTime}</Text>
      </View>
    );
  };

  render(){
    const { styles } = QuestionItem;
    const { index, currentIndex, isLast } = this.props;

    const isSelected = (index == currentIndex);

    const containerStyle = {
      ...isSelected? {
        backgroundColor: BLUE[50],
      } : null,
    };

    return (
      <TouchableOpacity 
        style={[styles.container, containerStyle, {}]}
        onPress={this._handleOnPress}
        activeOpacity={0.75}
      >
        {this._renderQuestion()}
        {this._renderDetails()}
      </TouchableOpacity>
    );
  };
};

class QuestionList extends React.PureComponent {
  static propTypes = {
    currentIndex: PropTypes.number,
    maxIndex    : PropTypes.number,
    answers     : PropTypes.array ,
    //events
    onPressQuestion: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },
    //list empty styles
    emptyContainer: {  
      flexDirection: 'row',
      paddingTop: 10,
      paddingBottom: 15,
      paddingHorizontal: 5,
    },
    image: {
      width : 80,
      height: 80,
    },
    textContainer: {
      flex: 1,
      marginLeft: 12,
      //justifyContent: 'center',
    },
    title: {
      textAlign: 'center',
      fontSize: 21,
      fontWeight: '700',
      color: PURPLE[700],
    },
    description: {
      fontSize: 16,
      fontWeight: '300'
    },
    //header styles
    headerContainer: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderColor: GREY[200],
      borderBottomWidth: 1,
      alignItems: 'center',
    },
    headerImage: {
      width : 75,
      height: 75,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: PURPLE[700],
    },
    //footer styles
    footerContainer: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    footerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    footerTitle: {
      flex: 1,
      marginLeft: 5,
      fontSize: 18,
      fontWeight: '500'
    },
    footerSubtitle: {
      marginTop: 2,  
      fontSize: 17,
      color: GREY[900],
      fontWeight: '400',
    },
  });

  constructor(props){
    super(props);
    this.imageScroll = require('../../assets/icons/exam.png');
    this.imageBook   = require('../../assets/icons/book-forest.png');
    
    //number indicator colors
    this.colors = Chroma.scale([PURPLE.A400, PURPLE.A700]).colors(props.maxIndex);
  };

  _handleOnPressFooter = () => {
    const { onPressQuestion, answers } = this.props;
    const answersCount = (answers || []).length;
    onPressQuestion && onPressQuestion({index: answersCount});
  };

  /** from _renderQuestionList FlatList */
  _handleKeyExtractor = (item, index) => {
    return (`${item.questionID || index}`);
  };

  _renderEmptyQuestion(){
    const { styles } = QuestionList;
    return(
      <View style={styles.emptyContainer}>
        <Animatable.Image 
          style={styles.image}
          source={this.imageScroll}
          animation={'pulse'}
          iterationCount={'infinite'}
          iterationDelay={1000}
          duration={10000}
          useNativeDriver={true}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{'No Answers Yet'}</Text>
          <Text style={styles.description}>{'Nothing to show here (when you answer a question, your answers will appear here.)'}</Text>
        </View>
      </View>
    );
  };

  _renderHeader = () => {
    const { styles } = QuestionList;
    const { currentIndex, maxIndex, answers } = this.props;
    const answersCount = (answers || []).length;

    const isSelected = (currentIndex <  answersCount);
    const isMaxed    = (currentIndex >= maxIndex - 1);

    const textActive   = {title: "Here's a Tip" , subtitle: "The active question is marked blue. Tap on 'Current Question' to jump to latest item."};
    const textInactive = {title: "Tap to Jump"  , subtitle: "Tap on a item in the list to jump and naviagte to that question."};
    const textFinished = {title: "Done already?", subtitle: "Done checking your answers? Tap on the Finish button to see your grade."};

    const text = (
      isMaxed   ? textFinished :
      isSelected? textActive   : textInactive
    );

    return(
      <View style={styles.headerContainer}>
        <Animatable.Image 
          style={styles.headerImage}
          source={this.imageBook}
          animation={'pulse'}
          iterationCount={'infinite'}
          iterationDelay={1000}
          duration={10000}
          useNativeDriver={true}
        />
        <View style={styles.textContainer}>
          <Text style={styles.headerTitle}>{text.title}</Text>
          <Text style={styles.description}>{text.subtitle}</Text>
        </View>
      </View>
    );
  };

  _renderFooter = () => {
    const { styles } = QuestionList;
    const { currentIndex, maxIndex, answers } = this.props;
    const answersCount = (answers || []).length;

    const isSelected = (currentIndex <  answersCount);
    const isMaxed    = (currentIndex >= maxIndex - 1);

    // dont show if no more questions remaining \
    // or when at the last index
    if(!isSelected || isMaxed) return null;

    return(
      <TouchableOpacity 
        style={styles.footerContainer}
        onPress={this._handleOnPressFooter}
        activeOpacity={0.75}
      >
        <View style={styles.footerTitleContainer}>
          <NumberIndicator 
            value={answersCount + 1}
            size={20}
            initFontSize={15}
            diffFontSize={1.5}
            color={GREEN.A700}
          />
          <Text numberOfLines={1} style={styles.footerTitle}>
            {'Current Question'}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.footerSubtitle}>
          {'Tap here to jump to your last unanswered question.'}
        </Text>
      </TouchableOpacity>
    );
  };

  /** for _renderQuestionList */
  _renderItem = ({item, index}) => {
    const { currentIndex, maxIndex, answers } = this.props;
    const answersCount = (answers || []).length;
    const isLast = (index == (answersCount - 1));

    return(
      <QuestionItem
        onPressItem={this.props.onPressQuestion}
        indicatorColor={this.colors[index]}
        {...{index, currentIndex, isLast, ...item}}
      />
    );
  };

  render(){
    const { styles } = QuestionList;
    return(
      <ModalSection containerStyle={styles.container}>
        <FlatList
          data={this.props.answers}
          keyExtractor={this._handleKeyExtractor}
          renderItem={this._renderItem}
          ListEmptyComponent={this._renderEmptyQuestion}
          ListHeaderComponent={this._renderHeader}
          ListFooterComponent={this._renderFooter}
        />
      </ModalSection>
    );
  };
};

export class QuizExamDoneModal extends React.PureComponent {
  static propTypes = {
    onPressQuestionItem: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      paddingBottom: MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP,
    },
    //overlay styles
    overlayWrapper: {
      flex: 1,
      position: 'absolute',
      height: '100%',
      width: '100%',
      marginBottom: MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP,
    },
    overlay: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      opacity: 0,
      backgroundColor: 'white',
    },
    overlayContainer: {
      width: '100%',
      height: '100%',
      //alignItems: 'flex-start',
      //justifyContent: 'flex-start',
      //width: '100%', 
      //height: '100%', 
      //backgroundColor: 'red'
    },
    //header styles
    headerWrapper: {
      ...Platform.select({
        ios: {
          position: 'absolute',
          width: '100%',
        },
        android: {
          borderBottomColor: GREY[900],
        },
      }),
    },
    headerContainer: {
      paddingHorizontal: 7,
      paddingBottom: 10,
      ...Platform.select({
        ios: {
          borderBottomColor: GREY[100],
          borderBottomWidth: 1,
          backgroundColor: 'rgba(255,255,255, 0.5)',      
        },
        android: {
          backgroundColor: 'rgba(255,255,255, 0.75)',      
        },
      }),
    },
    //content styles
    scrollview: {
      flex: 1,
      paddingBottom: 75,
    },
    //footer styles
    footerWrapper: {
      position: 'absolute',
      width: '100%',
      bottom: 0,
    },
    footerContainer: {
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255,255,255,0.4)',
          paddingVertical: 12,
          paddingHorizontal: 10,
          //border
          borderColor: 'rgba(0,0,0,0.2)',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          //extra padding
          ...(isIphoneX() && {
            paddingBottom: getBottomSpace() + 10,
          }),
        },
        android: {
          backgroundColor: 'white',          
          padding: 10,
          height: 80,
          elevation: 15,
        },
      }),
    },
    //list footer
    listFooterContainer: {
      marginBottom: 75
    },
  });

  constructor(props){
    super(props);

    this.state = {
      mountContent: false,
      headerHeight: -1,
      //data from openModal
      currentIndex: -1,
      startTime: -1,
      questionList: [], 
      answers: [],
      questions: [], 
      quiz: null,
    };

    this._deltaY = null;
    //callbacks
    this.onPressFinishButton = null;
    this.onPressQuestionItem = null;
  };

  componentDidMount(){
    const expandedHeight = (Screen.height - MODAL_DISTANCE_FROM_TOP);
    const deltaY = this._modal._deltaY;

    this.opacity = interpolate(deltaY, {
      inputRange : [0, expandedHeight],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });
    this.scale = interpolate(deltaY, {
      inputRange : [0, expandedHeight],
      outputRange: [1, 0.95],
      extrapolate: 'clamp',
    });
    this.translateX = interpolate(deltaY, {
      inputRange : [0, expandedHeight],
      outputRange: [1, 10],
      extrapolate: 'clamp',
    });
  };

  //------ public functions ------
  openModal = async ({currentIndex, questionList, answers, questions, quiz, startTime}) => {
    this.setState({
      mountContent: true, 
      //pass down to state
      currentIndex, questionList, answers, questions, quiz, startTime
    });
    this._modal.showModal();
  };

  resetPrevTimestamps = () => {
    prevTimestamps = [];
  };

  //#region ------ events/handlers ------
  /** from _renderHeader */
  _handleHeaderOnLayout = ({nativeEvent}) => {
    const { headerHeight } = this.state;
    const { height } = nativeEvent.layout;

    if(headerHeight == -1){
      this.setState({headerHeight: height});
    };
  };

  /** from _renderContent: scrolllview */
  _handleOnEndReached = () => {
    this.footer.show();
  };

  _handleOnModalHide = () => {
    //reset state
    this.setState({mountContent: false, });
  };

  /** from _renderContent: QuestionItem*/
  _handleOnPressQuestion = async ({index}) => {
    await this._modal.hideModal();
    //callback assigned via ref
    this.onPressQuestionItem && this.onPressQuestionItem({index});
  };

  /** from _renderFooter */
  _handleOnPressFinish = async () => {
    const timeStats = this.quizStats.getState();
    
    const overlayOpacity = Platform.select({
      ios: 0.5, android: 0.7,
    });
    this.overlay.transitionTo({opacity: overlayOpacity}, 500);
    this.checkOverlay.start();
    await timeout(750);
    await this._modal.hideModal();

    //call callback and pass down params
    this.onPressFinishButton && this.onPressFinishButton({timeStats});
  };

  /** from _renderFooter */
  _handleOnPressCancel = () => {
    this._modal.hideModal();
  };

  //#endregion 
  //#region ------ render functions ------
  /** shows a check animation */
  _renderHeader(){
    const { styles } = QuizExamDoneModal;

    const style = {
      opacity: this.opacity,
      transform: [
        { translateX: this.translateX },
        { scale     : this.scale      },
      ],
    };

    return(
      <BlurViewWrapper
        wrapperStyle={styles.headerWrapper}
        containerStyle={styles.headerContainer}
        onLayout={this._handleHeaderOnLayout}
      >
        <ModalTopIndicator/>
        <Animated.View {...{style}}>
          <ModalTitle
            title={'Custom Quiz Details'}
            subtitle={"When you're done, press finish. "}
            iconStyle={{marginTop: 2}}
            iconName={'ios-book'}
            iconType={'ionicon'}
          />
        </Animated.View>
      </BlurViewWrapper>
    );
  };

  /** bottom buttons */
  _renderFooter(){
    const { styles } = QuizExamDoneModal;

    return(
      <Animatable.View
        style={styles.footerWrapper}
        animation={'fadeInUp'}
        duration={500}
        delay={500}
        useNativeDriver={true}
      >
        <BlurViewWrapper
          containerStyle={styles.footerContainer}
          intensity={100}
          tint={'default'}
        >
          <ModalBottomTwoButton
            leftText={'Finish'}
            rightText={'Cancel'}
            onPressLeft={this._handleOnPressFinish}
            onPressRight={this._handleOnPressCancel}
          />
        </BlurViewWrapper>
      </Animatable.View>
    );
  };

  /** bottom heart icon */
  _renderListFooter = () => {
    const { styles } = QuizExamDoneModal;
    return(
      <View style={styles.listFooterContainer}>
        <IconFooter 
          hide={false}
          delay={3000}
        />
      </View>
    );
  };

  _renderContent(){
    const { styles } = QuizExamDoneModal;
    const { headerHeight, quiz, startTime, answers, questions, currentIndex, questionList } = this.state;
    
    if(headerHeight == -1) return null;
    const maxIndex = (questionList || []).length;

    const style = {
      flex: 1,
      opacity: this.opacity,
    };

    const PlatformProps = {
      ...Platform.select({
        ios: {
          contentInset :{top: headerHeight},
          contentOffset:{x: 0, y: -headerHeight},
        },
      }),
    };

    return(
      <Animatable.View
        style={{flex: 1}}
        animation={'fadeInUp'}
        duration={500}
        useNativeDriver={true}
      >
        <Animated.View {...{style}}>
          <ScrollView
            style={styles.scrollview}
            stickyHeaderIndices={[0, 2]}
            onEndReached={this._handleOnEndReached}
            {...PlatformProps}
          >
            <StickyHeader
              title={'Quiz Details'}
              subtitle={'Details about the current quiz.'}
              iconName={'message-circle'}
              iconType={'feather'}
            />
            <QuizDetails {...{quiz}}/>

            <StickyHeader
              title={'Quiz Statistics'}
              subtitle={'How well are you doing so far?'}
              iconName={'eye'}
              iconType={'feather'}
            />
            <QuizStats
              ref={r => this.quizStats = r}
              {...{quiz, startTime, answers, questions}}
            />
            
            <StickyHeader
              title={'Questions & Answers'}
              subtitle ={'Overview of your answer.'}
              iconName={'list'}
              iconType={'feather'}
            />
            <QuestionList
              onPressQuestion={this._handleOnPressQuestion}
              {...{currentIndex, maxIndex, answers}}
            />
            {this._renderListFooter()}
          </ScrollView>
        </Animated.View>
      </Animatable.View>
    );
  };
  
  _renderOverlay(){
    const { styles } = QuizExamDoneModal;
    
    return (
      <View 
        style={styles.overlayWrapper}
        pointerEvents={'none'}
      >
        <Animatable.View 
          ref={r => this.overlay = r}
          style={styles.overlay}
          useNativeDriver={true}
        />
        <View style={styles.overlayContainer}>
          <CheckOverlay ref={r => this.checkOverlay = r}/>
        </View>
      </View>
    );
  };

  render(){
    const { styles } = QuizExamDoneModal;
    const { mountContent } = this.state;

    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <ModalBackground style={styles.container}>
          {mountContent && this._renderContent()}
          {mountContent && this._renderHeader ()}
          {mountContent && this._renderFooter ()}
          {mountContent && this._renderOverlay()}
        </ModalBackground>
      </SwipableModal>
    );
  };
  //#endregion 
};