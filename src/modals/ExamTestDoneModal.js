import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated as NativeAnimated, Dimensions, ScrollView, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES, FONT_STYLES } from '../Constants';
import { PURPLE, GREY, BLUE, GREEN, RED, ORANGE, AMBER } from '../Colors';
import { setStateAsync, timeout, addLeadingZero, plural, convertHoursToMS, formatMsToDuration } from '../functions/Utils';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconFooter } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';

import * as Animatable from 'react-native-animatable';
import _ from 'lodash';
import moment from "moment";
import TimeAgo from 'react-native-timeago';
import Chroma from 'chroma-js';

import Lottie from 'lottie-react-native'
import { Icon, Divider } from 'react-native-elements';

import { QuizAnswer, QuizQuestion, QUIZ_LABELS } from '../models/Quiz';
import { isIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';

import { BlurViewWrapper, StickyHeader, DetailRow, DetailColumn, ModalBottomTwoButton, ModalTitle, StickyHeaderCollapsable, ModalSection, ExpanderHeader, NumberIndicator, StickyCollapseHeader, StickyCollapsableScrollView, StyledSwipableModal, Pill } from '../components/StyledComponents';

import Animated, { Easing } from 'react-native-reanimated';
import { ContentExpander } from '../components/Expander';
import { CustomQuiz } from '../functions/CustomQuizStore';
import { TestInformation, EXAM_TYPE, TestAnswer, TestStat } from '../models/TestModels';
const { interpolate, Value } = Animated; 

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

prevTimestamps = [];


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
    startTime  : PropTypes.number,
    timeLimit  : PropTypes.number,
    isCountdown: PropTypes.bool  ,
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
    const { startTime = 0, timeLimit = 1, isCountdown } = this.props;
    const currentTime = new Date().getTime();

    const diffTime = (isCountdown
      ? ((startTime + timeLimit) - currentTime)
      : (currentTime - startTime)
    );

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

class ExamStats extends React.PureComponent {
  static propTypes = {
    testInfo : PropTypes.object,
    testStats: PropTypes.object,
    startTime: PropTypes.number,
    questions: PropTypes.array ,
    //passed down from exam list comp.
    answersList       : PropTypes.array, 
    questionsList     : PropTypes.array, 
    answerHistoryList : PropTypes.array,
    questionsRemaining: PropTypes.array,
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

  getState = () => {
    return(this.state);
  };

  _renderDetailsTime(){
    const { styles } = ExamStats;
    const { testInfo: _testInfo, startTime, ...props } = this.props;

    const { examType, preboardTimeLimit } = TestInformation.wrap(_testInfo);
    const timeLimit = convertHoursToMS(preboardTimeLimit || 0);

    // TimeElasped prop + title/subtitle specific to preboard
    const [isCountdown, elapsed] = (examType == EXAM_TYPE.preboard
      ? [true , {title: 'Remaining', desc: 'Tells you how much time is remaining.'}]
      : [false, {title: 'Elapsed'  , desc: 'Tells you how much time has elapsed.' }]
    );

    const timeStarted = moment(startTime).format('LT');
    const answerCount = TestAnswer.countAnswered(props.answersList || []);
    const total       = (props.questions || []).length;

    const progress  = `${answerCount}/${total} items`;
    const remaining = `${total - answerCount} remaining`;

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
            title={`${elapsed.title}: `}
            help={true}
            helpTitle={elapsed.title}
            helpSubtitle={elapsed.desc}
            backgroundColor={PURPLE.A400}
          >
            <TimeElasped 
              {...{startTime, isCountdown, timeLimit}}
            />
          </DetailColumn>
        </DetailRow>
        <DetailRow marginTop={10}>
          <DetailColumn
            title={'Progress: '}
            subtitle={progress}
            help={true}
            helpTitle={'Progress'}
            helpSubtitle={'Shows how many questions you have answered over the total questions in this exam.'}
            backgroundColor={PURPLE.A400}
          />
          <DetailColumn
            title={'Questions: '}
            subtitle={remaining}
            help={true}
            helpTitle={'Remaining Questions'}
            helpSubtitle={'Shows how many questions are left for this exam.'}
            backgroundColor={PURPLE.A400}
          />
        </DetailRow>
      </Fragment>
    );
  };

  _renderDetailsComp(){
    const { styles } = ExamStats;
    const { answerHistoryList, testStats: _testStats } = this.props;
    const { min, max, avg } = TestStat.wrap(_testStats);

    const marginTop = 12;
    const timesAnswered = `${answerHistoryList.length} times`;


    const minText = min? formatMsToDuration(min) : 'N/A';
    const maxText = max? formatMsToDuration(max) : 'N/A';
    const avgText = avg? formatMsToDuration(avg) : 'N/A';

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
            backgroundColor={BLUE.A400}
          />
          <DetailColumn 
            title={'Answered: '}
            subtitle={timesAnswered}
            help={true}
            helpTitle={'Times Answered'}
            helpSubtitle={'Tells you how many times you selected a choice across all of the questions in this quiz.'}
            backgroundColor={BLUE.A400}
          />
        </DetailRow>
      </View>
    );
  };

  render(){
    const { styles } = ExamStats;

    return(
      <ModalSection>
        {this._renderDetailsTime()}
        <View style={styles.divider}/>
        {this._renderDetailsComp()}
      </ModalSection>
    );
  };
};

class ExamDetails extends React.PureComponent {
  static propTypes = {
    testInfo: PropTypes.object,
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
    //#region - Date Styles
    date: {
      fontSize: 16,
      fontWeight: '400',
      color: GREY[800],
    },
    dateLabel: {
      fontWeight: '500',
      color: GREY[900],
    },
    dateString: {
      color: GREY[700],
      fontWeight: '200',
    },
    //#endregion 
    //#region - Desc Styles
    description: {
      fontSize: 17,
      fontWeight: '300'
    },
    descriptionLabel: {
      fontWeight: '400'      
    },
    //#endregion
    //#region Extra Details styles
    extraDetailContainer: {
      paddingTop: 10,
    },
    extraDetailRow: {
      flexDirection: 'row',
      paddingVertical: 2,
    },
    extraDetailLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
    },
    extraDetail: {
      fontSize: 15,
      fontWeight: '200',

    },
    //#endregion
  });

  _renderPreboardDetails(){
    const { styles } = ExamDetails;
    const { testInfo } = this.props;

    //dont render if not preboard
    const isPreboard = (testInfo.examType === EXAM_TYPE.preboard);
    if(!isPreboard) return null;

    const exam = TestInformation.convertToPreboardExamItem(testInfo);
    const { timelimit } = exam;

    const startDate = moment(exam.startdate, 'YYYY-MM-DD').format('ddd, MMMM D YYYY');
    const enddate   = moment(exam.enddate  , 'YYYY-MM-DD').format('ddd, MMMM D YYYY');

    return(
      <View style={styles.extraDetailContainer}>
        <View style={styles.extraDetailRow}>
          <Text style={styles.extraDetailLabel}>
            {'Start Date'}
          </Text>
          <Text style={styles.extraDetail}>
            {exam.startdate? startDate : 'N/A'}
          </Text>
        </View>
        <View style={styles.extraDetailRow}>
          <Text style={styles.extraDetailLabel}>
            {'End Date'}
          </Text>
          <Text style={styles.extraDetail}>
            {exam.enddate? enddate : 'N/A'}
          </Text>
        </View>
        <View style={styles.extraDetailRow}>
          <Text style={styles.extraDetailLabel}>
            {'Time Limit'}
          </Text>
          <Text style={styles.extraDetail}>
            {timelimit? `${timelimit} ${plural('Hour', timelimit)}` : 'N/A'}
          </Text>
        </View>
      </View>
    );
  };

  render(){
    const { styles } = ExamDetails;
    const { testInfo: _testInfo } = this.props;

    const testInfo = TestInformation.wrap(_testInfo);
    const ts = testInfo.timestampDate;

    //convert dates to string
    const timeCreated  = moment.unix(ts).format("LT");
    const dateCreated  = moment.unix(ts).format("MMM D ddd YYYY");
    const dateRelative = moment.unix(ts).fromNow();

    return(
      <ModalSection>
        <Text style={styles.title} numberOfLines={1}>
          {testInfo.title || 'Unknown Title'}
        </Text>
        <Text style={styles.date}>
          <Text style={styles.dateLabel}>{'Created: '}</Text>
          {dateRelative}
          <Text style={styles.dateString}>{` (${dateCreated})`}</Text>
        </Text>
        {this._renderPreboardDetails()}
        <View style={styles.divider}/>
        <Text style={styles.description}>
          <Text style={styles.descriptionLabel}>Description: </Text>
          {testInfo.description || 'No Description Available'}
        </Text>
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
    //data - QuizAnswer
    answerID  : PropTypes.string,
    userAnswer: PropTypes.string,
    label     : PropTypes.string,
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
    const { index, label, currentIndex, indicatorColor } = this.props;
    const question = QuizQuestion.wrap(this.props.question);

    const isSelected = (index == currentIndex);
    const isSkipped  = (label == QUIZ_LABELS.SKIPPPED);
    const isMarked   = (label == QUIZ_LABELS.MARKED  );

    const color = (
      isSelected? BLUE .A700 : 
      isSkipped ? RED  .A700 : 
      isMarked  ? AMBER.A700 : indicatorColor
    );

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
          initFontSize={14}
          diffFontSize={2}
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
    const { userAnswer, index, label, currentIndex, timestampAnswered } = this.props;

    const isSelected = (index == currentIndex);
    const isSkipped  = (label == QUIZ_LABELS.SKIPPPED);

    const answerStyle = {
      ...(isSelected && { 
        fontSize: 19,
        color: BLUE[900],
      }),
      ...(isSkipped && {
        fontWeight: '700',
        color: RED[700],
      }),
    };

    const answerTime = moment(timestampAnswered).format('LT');

    return(
      <View style={styles.answerContainer}>
        <Text style={[styles.answer, answerStyle]} numberOfLines={1}>
          <Text style={styles.answerLabel}>{'Answer: '}</Text>
          {isSkipped? 'Skipped' : userAnswer || 'N/A'}
        </Text>
        <Pill
          hasFill={false}
          hasBorder={true}
          text={answerTime}
          bgColor={null}
        />
      </View>
    );
  };

  render(){
    const { styles } = QuestionItem;
    const { index, currentIndex, isLast } = this.props;

    const isSelected = (index == currentIndex);

    const containerStyle = {
      ...(isSelected ? {
        backgroundColor: BLUE[50],
      } : null),
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
      paddingTop: 15,
      paddingBottom: 20,
      paddingHorizontal: 12,
      alignItems: 'center',
    },
    image: {
      width : 75,
      height: 75,
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

  _renderEmptyQuestion = () => {
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
          <Text style={styles.description}>{'Nothing to show here yet. When you answer a question, your answers will appear here.'}</Text>
        </View>
      </View>
    );
  };

  _renderHeader = () => {
    const { styles } = QuestionList;
    const { currentIndex, maxIndex, answers } = this.props;

    const answersCount = (answers || []).length;
    if(answersCount == 0) return null;

    const isSelected = (currentIndex <  answersCount);
    const isMaxed    = (answersCount >= maxIndex    );

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

export class ExamTestDoneModal extends React.PureComponent {
  static styles = StyleSheet.create({
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
  });

  static PARAM_KEYS = {
    openModal: {
      testInfo : 'testInfo' , // TestInformation item
      testStats: 'testStats', // TestStat item
      questions: 'questions', // TestQuestion array
      startTime: 'startTime', // start timestamp
      //taken from from examlist state/data
      answersList       : 'answersList'       , // array of TestAnswer   - selected answers
      questionsList     : 'questionsList'     , // array of TestQuestion - visible questions
      answerHistoryList : 'answerHistoryList' , // array of TestAnswer   - all selected answers
      questionsRemaining: 'questionsRemaining', // array of TestQuestion - remaining questions
    },
  };

  constructor(props){
    super(props);

    this.state = {
      //#region received from openModal
      testInfo : {}, // TestInformation item
      testStats: {}, // TestStat item
      questions: [], // TestQuestion array
      startTime: 0 , // start timestamp
      //taken from from examlist state/data
      answersList       : [], // selected answers
      questionsList     : [], // visible questions
      answerHistoryList : [], // all selected answers
      questionsRemaining: [], // remaining questions
      //#endregion
    };

    //callbacks
    this.onPressFinishButton = null;
    this.onPressQuestionItem = null;
  };

  getTitleDescs(){
    const { testInfo: _testInfo } = this.state;

    const testInfo = TestInformation.wrap(_testInfo); 
    const examType = testInfo.examType || EXAM_TYPE.preboard;

    switch (examType) {
      case EXAM_TYPE.preboard: return ({
        modal: { 
          title : 'Preboard Exam',
          desc  : 'Press "End Session" to save/end the exam.',
          button: 'End Session'
        },
        detail: {
          title: 'Exam Details',
          desc : 'Details about the current exam.',
        },
        stats: {
          title: 'Exam Stats',
          desc : 'How well are you doing so far?',
        },
      });
    };
  };

  //------ public functions ------
  openModal = async (params) => {
    const { openModal: PARAM_KEYS } = ExamTestDoneModal.PARAM_KEYS;

    await setStateAsync(this, {
      //pass down params to state
      testInfo : (params[PARAM_KEYS.testInfo ] || {}),
      testStats: (params[PARAM_KEYS.testStats] || {}),
      questions: (params[PARAM_KEYS.questions] || []),
      startTime: (params[PARAM_KEYS.startTime] || 0 ),
      //pass down examlist comp. state/data
      answersList       : (params[PARAM_KEYS.answersList       ] || []),
      questionsList     : (params[PARAM_KEYS.questionsList     ] || []),
      answerHistoryList : (params[PARAM_KEYS.answerHistoryList ] || []),
      questionsRemaining: (params[PARAM_KEYS.questionsRemaining] || []),
    });

    this.modal.openModal();    
  };

  resetPrevTimestamps = () => {
    prevTimestamps = [];
  };

  //#region ------ events/handlers ------
  /** from _renderContent: QuestionItem*/
  _handleOnPressQuestion = async ({index}) => {
    const modal = this.modal.getModalRef();
    await modal.hideModal();

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

    const modal = this.modal.getModalRef();
    await modal.hideModal();

    //call callback and pass down params
    this.onPressFinishButton && this.onPressFinishButton({timeStats});
  };

  //#endregion 
  //#region ------ render functions ------  
  _renderOverlay = () => {
    const { styles } = ExamTestDoneModal;
    
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
    const { styles } = ExamTestDoneModal;
    const { testInfo, startTime, questions, answersList, questionsList, questionsRemaining, answerHistoryList, testStats } = this.state;

    const { modal, detail, stats } = this.getTitleDescs();
    const maxIndex = (questions || []).length;

    return(
      <StyledSwipableModal
        ref={r => this.modal = r}
        renderOverlay={this._renderOverlay}
        //header styles
        headerTitle={modal.title}
        headerSubtitle={modal.desc}
        headerIconName={'ios-book'}
        headerIconType={'ionicon'}
        headerIconStyle={{marginTop: 2}}
        //footer buttons
        buttonLeftTitle={modal.button}
        onPressLeft={this._handleOnPressFinish}
      >
        <StickyCollapsableScrollView>
          <StickyCollapseHeader
            title={detail.title}
            subtitle={detail.desc}
            iconName={'message-circle'}
            iconType={'feather'}
          />
          <ExamDetails 
            {...{testInfo}}  
          />

          <StickyCollapseHeader
            title={stats.title}
            subtitle={stats.desc}
            iconName={'eye'}
            iconType={'feather'}
          />
          <ExamStats 
            {...{
              //pass down as props
              questionsList     , testInfo , questions  ,
              answerHistoryList , testStats, answersList,
              questionsRemaining, startTime,
            }}
          />
        </StickyCollapsableScrollView>
      </StyledSwipableModal>
    );
  };
  //#endregion 
};