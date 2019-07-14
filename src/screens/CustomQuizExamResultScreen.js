import React, { Fragment } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Platform , Alert, FlatList, ActivityIndicator, Dimensions, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import moment from "moment";
import Pie from 'react-native-pie'
import { NavigationEvents } from 'react-navigation';
import { Divider, Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';

import { CustomQuizExamResultQAScreen } from './CustomQuizExamResultQAScreen';
import { ViewWithBlurredHeader, IconText, Card, AnimateInView, IconFooter } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader } from '../components/Header' ;
import { PlatformTouchableIconButton } from '../components/Buttons';
import { ScoreProgressCard } from '../components/ResultScoreProgressCard';

import { GREY, PURPLE, RED, GREEN, BLUE} from '../Colors';
import { STYLES, ROUTES, HEADER_HEIGHT, LOAD_STATE} from '../Constants';

import { QuestionItem } from '../models/ModuleModels';

import { CustomQuiz } from '../functions/CustomQuizStore';
import { plural, isEmpty, formatPercent, setStateAsync} from '../functions/Utils';
import { CustomQuizResultsStore,  CustomQuizResultItem, CustomQuizResults} from '../functions/CustomQuizResultsStore';

import Animated, { Easing } from 'react-native-reanimated';
import { LoadingPill, PlatformButton, NumberIndicator, DetailColumn, DetailRow } from '../components/StyledComponents';
import { TransitionAB } from '../components/Transitioner';
import { QuizAnswer } from '../models/Quiz';
const { set, cond, block, Value, timing, interpolate, and, or, onChange, eq, call, Clock, clockRunning, startClock, stopClock, debug, divide, multiply } = Animated;

//declare animations
Animatable.initializeRegistryWithDefinitions({
  rotate360: {
    easing: 'ease-in',
    from  : { transform: [{ rotate: '0deg'   }] },
    to    : { transform: [{ rotate: '360deg' }] },
  },
});


class CardWithHeader extends React.PureComponent {
  static propTypes = {
    title    : PropTypes.string,
    subtitle : PropTypes.string,
    iconName : PropTypes.string,
    iconType : PropTypes.string,
    iconStyle: PropTypes.object,
  };

  static styles = StyleSheet.create({
    cardContainer: {
      padding: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    wrapperContainer: {
      paddingHorizontal: 12, 
      paddingTop: 12,
      paddingBottom: 13,
    },
    //header styles
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: PURPLE.A700,
      borderBottomWidth: 1,
      borderBottomColor: PURPLE[900],
    },
    headerTextContainer: {
      marginLeft: 10,
    },
    title: {
      color: 'white',
      ...Platform.select({
        ios: {
          fontSize: 22, 
          fontWeight: '800',
          shadowColor: 'white',
          shadowRadius: 4,
          shadowOpacity: 0.25,
        },
        android: {
          fontSize: 24, 
          fontWeight: '900'
        }
      })
    },
    subtitle: {
      color: 'white',
      flex: 1,
      fontWeight: '400',
      fontSize: 16,
    },
    iconContainer: {
      width : 40,
      height: 40,
      borderRadius: 40/2,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: 'white',
      shadowRadius: 4,
      shadowOpacity: 0.25,
    },
  });

  _renderHeader(){
    const { styles } = CardWithHeader;
    const { title, subtitle, ...props } = this.props;
    return(
      <LinearGradient 
        style={styles.headerContainer}
        colors={[PURPLE.A400, PURPLE.A200]}
        start={{ x: 0, y: 1 }}
        end  ={{ x: 1, y: 1 }}
      >
        <Icon
          name={props.iconName}
          type={props.iconType}
          iconStyle={[styles.iconStyle, props.iconStyle]}
          containerStyle={styles.iconContainer}
          color={PURPLE.A700}
          size={26}
        />
        <View style={styles.headerTextContainer}>
          <Text numberOfLines={1} style={styles.title   }>{title   }</Text>
          <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>
        </View>
      </LinearGradient>
    );
  };

  render(){
    const { styles } = CardWithHeader;
    return(
      <Card
        disableOverflow={true}
        containerStyle={styles.cardContainer}
      >
        {this._renderHeader()}
        <View style={styles.wrapperContainer}>
          {this.props.children}
        </View>
      </Card>
    );
  };
};

//quiz results - icon button + value
class ResultItem extends React.PureComponent {
  static propTypes = {
    value  : PropTypes.number,
    kind   : PropTypes.string,
    mode   : PropTypes.string,
    onPress: PropTypes.func  ,
  };

  static styles = StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
      width: 137,
      height: 32,
      marginBottom: 8,
      //chart radius - inner chart radius
      paddingLeft: (32/2) - (25/2),
      alignItems: 'center',
      borderRadius: 32/2,
      borderWidth: 1,
    },
    label: {
      marginLeft: 7,
      width: 72,
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    result: {
      fontSize: 16,
    }
  });

  getStateFromModeKind(){
    const { MODE } = ResultSummaryCard;
    const { kind } = this.props;
    switch (kind) {
      case MODE.CORRECT: return {
        label: 'Correct',
        color: GREEN.A700,
        //icon props
        name: 'check-circle', 
        type: 'font-awesome', 
      };
      case MODE.INCORRECT: return {
        label: 'Wrong',
        color: RED.A700,
        //icon props
        name: 'times-circle', 
        type: 'font-awesome', 
      };
      case MODE.UNANSWERED: return {
        label: 'Skipped',
        color: GREY[700],
        //icon props
        name: 'question-circle', 
        type: 'font-awesome', 
      };
    };
  };

  _handleOnPress = () => {
    const { onPress, kind } = this.props;
    onPress && onPress(kind);
  };

  _renderContents(){
    const { styles } = ResultItem;
    const { kind, mode, value } = this.props;

    const { label, name, type, color } = this.getStateFromModeKind();
    const isSelected = (kind == mode);

    const iconColor = isSelected? 'white' : color;


    const labelStyle = (isSelected
      ? { color: 'white'  , fontWeight: '700' }
      : { color: GREY[700], fontWeight: '500' }
    );

    const resultStyle = (isSelected
      ? { color: 'white'  , fontWeight: '500' }
      : { color: GREY[900], fontWeight: '300' }
    );

    return(
      <Fragment>
        <Icon
          size={25}
          color={iconColor}
          {...{name, type}}
        />
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
        <Text style={[styles.result, resultStyle]}>
          {value}
        </Text>
      </Fragment>
    );
  };

  render(){
    const { styles } = ResultItem;
    const { kind, mode } = this.props;

    const { color } = this.getStateFromModeKind();
    const isSelected = (kind == mode);

    const buttonContainerStyle = (isSelected
      ? { borderColor: color    , backgroundColor: color   }
      : { borderColor: GREY[300], backgroundColor: 'white' }
    );

    return(
      <TouchableOpacity
        style={[styles.buttonContainer, buttonContainerStyle]}
        onPress={this._handleOnPress}
      >
        {this._renderContents()}
      </TouchableOpacity>
    );
  };
};

//quiz results - shows correct, wrong etc. items + chart
class ResultSummaryCard extends React.PureComponent {
  static propTypes = {
    results: PropTypes.object,
  };

  static MODE = {
    DEFAULT   : 'DEFAULT'   , //initial state
    CORRECT   : 'CORRECT'   , //selected: correct
    INCORRECT : 'INCORRECT' , //selected: incorrect
    UNANSWERED: 'UNANSWERED', //selected: unanswered
  };

  static styles = StyleSheet.create({
    divider: {
      marginTop: 5,
    },
    headerTextContainer: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
    },
    //picture desc styles
    image: {
      width: 75, 
      height: 75,
      marginRight: 8,
    },
    pictureDescContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    pictureDescText: {
      flex: 1,
      textAlignVertical: 'center',
      fontSize: 16,
      fontWeight: '200',
    },
    pictureDescResultText: {
      color: PURPLE[900],
      fontWeight: '500',
    },
    //results styles
    resultPieContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    resultsContainer: {
      marginRight: 15,
    },
    //piechart styles
    pieContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pieInfoContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pieInfoFractionLabel: {
      fontSize: 18,
      fontWeight: '700',
    },
    //pie icon styles
    pieIconContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 5,
    },
    pieIcon: {
      width: 12,
      height: 12,
      borderRadius: 12/2,
    },
  });

  constructor(props){
    super(props);
    const { MODE } = ResultSummaryCard;

    this.state = {
      mode: MODE.DEFAULT,
      showPercentage: false,
    };

    const { correct, total, incorrect, unaswered } = props.results;
    //compute percentages
    this.resultPercentages = {
      perentageCorrect   : (correct   / total) * 100,
      perentageIncorrect : (incorrect / total) * 100,
      perentageUnanswered: (unaswered / total) * 100,
    };

    this.imageFail = require('../../assets/icons/buildings.png');    
  };

  getStateFromMode(){
    const { MODE } = ResultSummaryCard;
    const { results } = this.props;
    const { mode, showPercentage } = this.state;
    //destruct percentages
    const { perentageCorrect, perentageIncorrect, perentageUnanswered } = this.resultPercentages;
    
    switch (mode) {
      case MODE.DEFAULT: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN.A700, RED.A700, GREY[500]],
        label : showPercentage? `${formatPercent(perentageCorrect)}` : `${results.correct}/${results.total}`,
        color : 'white',
        desc  : 'Tap on an item for more info.',
      };
      case MODE.CORRECT: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN.A700, RED[100], GREY[100]],
        label : showPercentage? `${formatPercent(perentageCorrect)}` : `${results.correct}/${results.total}`,
        color : GREEN.A700,
        desc  : 'Items you answered correctly',
      };
      case MODE.INCORRECT: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN[100], RED.A700, GREY[100]],
        label : showPercentage? `${formatPercent(perentageIncorrect)}` : `${results.incorrect}/${results.total}`,
        color : RED.A700,
        desc  : 'The items you got wrong.'
      };
      case MODE.UNANSWERED: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN[100], RED[100], GREY[500]],
        label : showPercentage? `${formatPercent(perentageUnanswered)}` : `${results.unaswered}/${results.total}`,
        color : GREY[500],
        desc  : 'Questions with no answer.'
      };
    };
  };

  _handleOnPressResult = (type) => {
    const { MODE } = ResultSummaryCard;
    const { mode } = this.state;

    this.animatedChart.pulse(500);
    if(mode == type){
      //reset mode to default
      this.setState({mode: MODE.DEFAULT});
    } else {
      this.setState({mode: type});
    };
  };

  _handleOnPressPie = () => {
    const { showPercentage } = this.state;
    this.animatedChart.pulse(500);
    this.setState({showPercentage: !showPercentage});
  };
  
  _renderPictureDesc(){
    const { styles } = ResultSummaryCard;
    const { results } = this.props;
    const { perentageCorrect, perentageIncorrect, perentageUnanswered } = this.resultPercentages;
    //correct, total, incorrect, unaswered
    const didPass = (perentageCorrect >= 50);

    const passingGrade = Math.ceil(results.total/2);

    const itemsNeededToPass = passingGrade - results.correct;
    const itemsAbovePassing = results.correct - passingGrade;

    const result = didPass? 'You Passed' : 'You Failed';

    //const description = 'Your score is 50%.';
    let resultDescription = '';

    if(results.correct == passingGrade){
      resultDescription = 'Woah, you have exactly enough points to pass. Good job!';
    } else if(perentageCorrect == 100){
      resultDescription = 'Wow, a perfect score! Congratulations, you did great!';
    } else if(perentageUnanswered == 100){
      resultDescription = "Whoops, it looks like you skipped all of the questions.";
    } else if(perentageCorrect == 0){
      resultDescription = "You got every question wrong? Don't worry, just keep practicing.";
    } else if(perentageCorrect < 50){
      resultDescription = `You needed ${itemsNeededToPass} ${plural('item', itemsNeededToPass)} more to pass. Your score is ${results.correct}/${results.total}. The passing score is ${passingGrade} ${plural('item', passingGrade)}.`;
    } else if(perentageCorrect > 50){
      resultDescription = `The passing score is ${passingGrade} ${plural('item', passingGrade)} and you scored ${results.correct}/${results.total}. You're ${itemsAbovePassing} ${plural('item', itemsAbovePassing)} above the passing score. `;
    };

    return(
      <View style={styles.pictureDescContainer}>
        <Animatable.Image
          source={this.imageFail}
          style={styles.image}
          animation={'pulse'}
          easing={'ease-in-out'}
          iterationCount={"infinite"}
          duration={5000}
          useNativeDriver={true}
        />
        <Text style={[styles.pictureDescText]}>
          <Text style={styles.pictureDescResultText}>{result}</Text>
          {'. '}
          <Text>{resultDescription}</Text>
        </Text>
      </View>
    );
  };

  _renderResults(){
    const { styles, MODE } = ResultSummaryCard;
    const { results } = this.props;
    const { mode } = this.state;

    return(
      <View style={styles.resultsContainer}>
        <ResultItem
          kind={MODE.CORRECT}
          value={results.correct}
          onPress={this._handleOnPressResult}
          {...{mode}}
        />
        <ResultItem
          kind={MODE.INCORRECT}
          value={results.incorrect}
          onPress={this._handleOnPressResult}
          {...{mode}}
        />
        <ResultItem
          kind={MODE.UNANSWERED}
          value={results.unaswered}
          onPress={this._handleOnPressResult}
          {...{mode}}
        />
      </View>
    );
  };

  _renderPieIcon(){
    const { styles, MODE } = ResultSummaryCard;
    const { mode } = this.state;

    const { color } = this.getStateFromMode();
    const pieIconStyle = {
      backgroundColor: color,
    };

    //dont render icon when default
    if(mode == MODE.DEFAULT){
      return(
        <View style={styles.pieIconContainer}>
          <Text>Score</Text>
        </View>
      );
    } else {
      return(
        <Animatable.View 
          style={styles.pieIconContainer}
          animation={'pulse'}
          duration={1000}
          iterationCount={'infinite'}
          iterationDelay={1000}
          useNativeDriver={true}
        >
          <View style={[styles.pieIcon, pieIconStyle]}/>
        </Animatable.View>
      );
    };
  };

  _renderPieChart(){
    const { styles } = ResultSummaryCard;

    const radius = 60;
    const innerRadius = 45;

    const { series, colors, label } = this.getStateFromMode();
    
    const pieInfoContainerStyle = {
      width  : radius * 2,
      height : radius * 2,
      padding: radius - innerRadius,
    };

    return(
      <Animatable.View
        style={styles.pieContainer}
        ref={r => this.animatedChart = r}
        useNativeDriver={true}
      >
        <TouchableOpacity onPress={this._handleOnPressPie}>
          <Animatable.View
            animation={'rotate360'}
            duration={1000 * 120}
            iterationCount={'infinite'}
            delay={1000}
            useNativeDriver={true}
          >
            <Pie
              backgroundColor='#ddd'
              //pass down props
              {...{radius, innerRadius, series, colors}}
            />
          </Animatable.View>
          <View style={[styles.pieInfoContainer, pieInfoContainerStyle]}>
            {this._renderPieIcon()}
            <Text style={styles.pieInfoFractionLabel}>
              {label}
            </Text>
            <View style={{flex: 1}}/>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  render(){
    const { styles } = ResultSummaryCard;
    const { desc: subtitle } = this.getStateFromMode();

    return(
      <CardWithHeader
        title={'Quiz Results'}
        iconName={'pie-chart'}
        iconType={'feather'}
        iconColor={'#512DA8'}
        {...{subtitle}}
      >
        {this._renderPictureDesc()}
        <View style={styles.resultPieContainer}>
          {this._renderResults ()}
          {this._renderPieChart()}
        </View>
        <Divider style={styles.divider}/>
      </CardWithHeader>
    );
  };
};

//quiz statistics - shows start/end time, time per answer etc.
class StatsCard extends React.PureComponent {
  static propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    avg: PropTypes.number,
    sum: PropTypes.number,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    timestamps: PropTypes.array,
  };

  static styles = StyleSheet.create({
    divider: {
      margin: 10,
    },
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
      margin: 10,
      backgroundColor: 'rgba(0,0,0, 0.12)'
    },
    dividerFooter: {
      marginTop: 15,
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
  });

  _renderDetailsTime(){
    const { styles } = StatsCard;
    const { startTime, endTime } = this.props;

    const diffTime = endTime - startTime;
    const duration = moment.duration(diffTime, 'milliseconds');

    const timeStarted = moment(startTime).format('LT');
    const timeEnded   = moment(endTime  ).format('LT');
    const durationStr = moment.utc(diffTime).format("HH:mm:ss");

    return(
      <DetailRow>
        <DetailColumn
          title={'Started: '}
          subtitle={timeStarted}
          help={true}
          helpTitle={'Started'}
          helpSubtitle={'Tells you what time the quiz began.'}
          backgroundColor={PURPLE.A400}
          disableGlow={true}
        />
        <DetailColumn
          title={'Duration: '}
          subtitle={durationStr}
          help={true}
          helpTitle={'Elapsed'}
          helpSubtitle={'Tells you how much time has elapsed.'}
          backgroundColor={PURPLE.A400}
          disableGlow={true}
        >
        </DetailColumn>
      </DetailRow>
    );
  };

  _renderDetailsComp(){
    const { styles } = StatsCard;
    const { min, max, avg, sum, timestamps } = this.props;

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
            disableGlow={true}
          />
          <DetailColumn 
            title={'Longest: '}
            subtitle={maxText}
            help={true}
            helpTitle={'Longest Time'}
            helpSubtitle={'Tells you what was the max. amount of time you spent on a question.'}
            backgroundColor={BLUE.A400}
            disableGlow={true}
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
            disableGlow={true}
          />
          <DetailColumn 
            title={'Answered: '}
            subtitle={timesAnswered}
            help={true}
            helpTitle={'Times Answered'}
            helpSubtitle={'Tells you how many times you selected a choice across all of the questions in this quiz.'}
            backgroundColor={BLUE.A400}
            disableGlow={true}
          />
        </DetailRow>
      </View>
    );
  };

  render(){
    const { styles } = StatsCard;
    return(
      <CardWithHeader
        title   ={'Quiz Statistics'}
        subtitle={"Stats on how well you did."}
        iconName={'speedometer'}
        iconType={'simple-line-icon'}
      >
        {this._renderDetailsTime()}
        <Divider style={styles.divider}/>
        {this._renderDetailsComp()}
        <Divider style={styles.dividerFooter}/>
      </CardWithHeader>
    );
  };
};

//answer list - shows a single question item
class Question extends React.PureComponent {
  static propTypes = {
    index           : PropTypes.number,
    answer          : PropTypes.object, 
    question        : PropTypes.object, 
    durations       : PropTypes.object,
    questionID      : PropTypes.string, 
    hasMatchedAnswer: PropTypes.bool  ,
    onPressNavigate : PropTypes.func  ,
  };

  static styles = StyleSheet.create({
    divider: {
      margin: 10,
    },
    //#region - header styles
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    headerTextContainer: {
      flex: 1,
      marginLeft: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: PURPLE[900]
    },
    subtitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    subtitleTime: {
      flex: 1,
      fontSize: 15,
      fontWeight: '300',
      color: GREY[600],
      marginLeft: 3,
    },
    subtitleView: {
      fontSize: 15,
      fontWeight: '300',
      color: GREY[600],
      marginLeft: 8,
      marginRight: 5,
    },
    //#endregion
    //#region - answer styles
    answerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    answerLabel: {
      marginLeft: 5,
      fontSize: 16,
      fontWeight: '600',
    },
    answer: {
      flex: 1,
      textAlign: 'right',
    },
    //#endregion
  });

  constructor(props){
    super(props);
  };

  _handleOnPressQuestion = () => {
    this.trans.toggle();
  };

  _handleOnLongPressQuestion = () => {
    const { onPressNavigate, ...otherProps } = this.props;
    onPressNavigate && onPressNavigate({...otherProps});
  };

  _renderInactive(){
    const { styles } = Question;
    const { index, question: _question, answer: _answer, durations, hasMatchedAnswer } = this.props;

    const answer   = QuizAnswer  .wrap(_answer  );
    const question = QuestionItem.wrap(_question);

    const { totalTime = 0, viewCount = 0 } = durations;
    const { timestampAnswered: time } = answer;

    const timeAnswered  = moment(time     ).format('LT');
    const totalDuration = moment(totalTime).format('m [min], s [sec]');

    const subtitle = (hasMatchedAnswer
      ? `${timeAnswered} (${totalDuration})`
      : 'No Answer/Skipped'
    );

    const color = (
      (!answer.userAnswer)? GREY[700]  :
      ( answer.isCorrect )? GREEN.A700 : RED.A700
    );

    return (
      <View style={styles.headerContainer}>
        <NumberIndicator
          value={index + 1}
          initFontSize={14}
          size={21}
          {...{color}}
        />
        <View style={styles.headerTextContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {question.question || 'Question N/A'}
          </Text>
          <View style={styles.subtitleContainer}>
            <Icon
              name={'clock'}
              type={'feather'}
              size={14}
              color={GREY[700]}
            />
            <Text numberOfLines={1} style={styles.subtitleTime}>
              {subtitle}
            </Text>
            <Text numberOfLines={1} style={styles.subtitleView}>
              {viewCount}
            </Text>
            <Icon
              name={'eye'}
              type={'feather'}
              size={14}
              color={GREY[600]}
            />
          </View>
        </View>
      </View>
    );
  };

  _renderActive(){
    const { styles } = Question;
    const { index, question: _question, answer: _answer, durations, hasMatchedAnswer } = this.props;

    const answer   = QuizAnswer  .wrap(_answer  );
    const question = QuestionItem.wrap(_question);

    const { totalTime = 0, viewCount = 0 } = durations;
    const { timestampAnswered: time } = answer;

    const timeAnswered  = moment(time     ).format('LT');
    const totalDuration = moment(totalTime).format('m [min], s [sec]');

    const subtitle = (hasMatchedAnswer
      ? `${timeAnswered} (${totalDuration})`
      : 'No Answer/Skipped'
    );

    const color = (
      (!answer.userAnswer)? GREY[700]  :
      ( answer.isCorrect )? GREEN.A700 : RED.A700
    );
    
    //check if answer is wrong or skipped
    const isWrong = (!answer.userAnswer || answer.isCorrect);

    const HEADER = (
      <View style={styles.headerContainer}>
        <NumberIndicator
          value={index + 1}
          initFontSize={14}
          size={22}
          {...{color}}
        />
        <View style={styles.headerTextContainer}>
          <Text numberOfLines={2} style={styles.title}>
            {question.question || 'Question N/A'}
          </Text>
          <View style={[styles.subtitleContainer]}>
            <Icon
              name={'clock'}
              type={'feather'}
              size={14}
              color={GREY[700]}
            />
            <Text numberOfLines={1} style={styles.subtitleTime}>
              {subtitle}
            </Text>
            <Text numberOfLines={1} style={styles.subtitleView}>
              {`${viewCount} views`}
            </Text>
            <Icon
              name={'eye'}
              type={'feather'}
              size={14}
              color={GREY[600]}
            />
          </View>
        </View>
      </View>
    );
    
    const minWidth = 82;
    const ANSWERS = (
      <Fragment>
        {!isWrong && <View style={styles.answerContainer}>
          <Icon
            iconStyle={{marginTop: 1}}
            name={'md-close-circle'}
            type={'ionicon'}
            size={18}
            color={RED.A400}
          />
          <Text style={[styles.answerLabel, {minWidth}]}>
            {'Answered'}
          </Text>
          <Text style={styles.answer}>
            {answer.userAnswer || 'No Answer'}
          </Text>
        </View>}
        <View style={styles.answerContainer}>
          <Icon
            iconStyle={{marginTop: 1}}
            name={'md-checkmark-circle'}
            type={'ionicon'}
            size={18}
            color={GREEN.A400}
          />
          <Text style={[styles.answerLabel, {minWidth}]}>
            {'Answer'}
          </Text>
          <Text style={styles.answer}>
            {question.answer || 'Correct Answer N/A'}
          </Text>
        </View>
      </Fragment>
    );

    return(
      <Fragment>
        {HEADER }
        {ANSWERS}
      </Fragment>
    );
  };

  render(){
    const { index } = this.props;
    const { styles } = Question;

    return(
      <Fragment>
        {(index == 0) && <Divider style={styles.divider}/>}
        <TouchableOpacity
          onPress={this._handleOnPressQuestion}
          onLongPress={this._handleOnLongPressQuestion}
        >
          <TransitionAB
            ref={r => this.trans = r}
            handlePointerEvents={false}
          >
            {this._renderInactive()}
            {this._renderActive  ()}
          </TransitionAB>
        </TouchableOpacity>
        <Divider style={styles.divider}/>
      </Fragment>
    );
  };
};

//answer list - shows a list of questions + answer, details etc.
class AnswersListCard extends React.PureComponent {
  static propTypes = {
    questionAnswersList: PropTypes.array,
    //event callbacks
    onPressViewAllQuestions: PropTypes.func,
    onPressNavigate        : PropTypes.func,
  };

  static styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      marginBottom: 1,
      alignItems: 'center',
    },
    headerImage: {
      width: 90,
      height: 90,
    },
    headerTitle: {
      flex: 1,
      marginLeft: 8,
    },
    headerSubtitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '200',
      marginLeft: 8,
    },
    buttonContainer: {
      marginTop: 10,
      marginBottom: 5,
    },
  });

  constructor(props){
    super(props);
    this.headerImage = require('../../assets/icons/book-tent.png');
  };

  _handleOnPressViewAllQuestions = () => {
    const { onPressViewAllQuestions } = this.props;
    onPressViewAllQuestions && onPressViewAllQuestions();
  };

  _handleOnPressNavigate = (params) => {
    const { onPressNavigate } = this.props;
    onPressNavigate && onPressNavigate(params);
  };

  _keyExtractor = (item, index) => {
    return(item.questionID || index);
  };
  
  _renderItem = ({item, index}) => {
    const { answer, hasMatchedAnswer, questionID, question, durations } = item;

    return(
      <Question 
        onPressNavigate={this._handleOnPressNavigate}
        {...{answer, hasMatchedAnswer, questionID, question, index, durations}}
      />
    );
  };

  _renderHeader(){
    const { styles } = AnswersListCard;

    return(
      <Fragment>
        <View style={styles.headerContainer}>
          <Animatable.Image
            source={this.headerImage}
            style={styles.headerImage}
            animation={'pulse'}
            duration={20 * 1000}
            iterationCount={'infinite'}
            iterationDelay={1000}
            delay={2000}
          />
          <Text style={styles.headerSubtitle}>
            {"Tap on an item to expand/collapse or you can long press on a question to show that item in the"}
            <Text style={{fontWeight: '500'}}>{" View All Question "}</Text>
            {"list."}
          </Text>
        </View>
        <PlatformButton
          title={'View All Questions'}
          subtitle={"Show the full detailed list of Q&A's"}
          iconDistance={12}
          iconName={'list'}
          iconType={'feather'}
          isBgGradient={true}
          showChevron={true}
          containerStyle={styles.buttonContainer}
          onPress={this._handleOnPressViewAllQuestions}
        />
      </Fragment>
    );
  };
  
  render(){
    return(
      <CardWithHeader
        title={'Answers List'}
        subtitle={'Questions and answer keys'}
        iconName={'check-circle'}
        iconType={'feather'}
      >
        {this._renderHeader()}
        <FlatList
          data={this.props.questionAnswersList}
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
        />
      </CardWithHeader>
    );
  };
};

export class CustomQuizExamResultScreen extends React.Component {
  static router = ScoreProgressCard.router;

  static navigationOptions = ({navigation}) => {
    const HEADER_TITLE = (props) => (
      <CustomHeader 
        name={'ios-information-circle'}
        type={'ionicon'}
        size={24}
        {...props}  
      />
    );
    
    return({
      title: 'Results',
      headerTitle: HEADER_TITLE,
      //custom android header
      ...Platform.select({
        android: { header: props => 
          <AndroidHeader {...props}/> 
        }
      }),
    });
  };

  static styles = StyleSheet.create({
    scrollview: {
      paddingTop: 10,
      paddingBottom: 30,
    },
    loadingContainer: {
      position: 'absolute',
      width: '100%',
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  static NAV_PARAMS = {
    /** bool - save result upon navigating, false equals viewing only */
    saveResult: 'saveResult',
    customQuizResult: 'customQuizResult',
    /** obj - custom quiz data */
    quiz: 'quiz',
  };

  constructor(props){
    super(props);

    //for making sure error message is shown only once
    this.didShowError = false;
    this.quizResult = null;
    
    this.state = {
      quizResultSaved  : LOAD_STATE.LOADING,
      quizResultsLoaded: LOAD_STATE.LOADING,
      showLoading: true,
      quizResults: [],
    };
  };

  async saveResults(){
    const { NAV_PARAMS } = CustomQuizExamResultScreen;
    const { navigation } = this.props;

    //get data from previous screen
    const shouldSave = navigation.getParam(NAV_PARAMS.saveResult, false);
    const quizResult = CustomQuizResultItem.wrap(
      navigation.getParam(NAV_PARAMS.customQuizResult, null)
    );

    try{
      //save/store quiz result
      shouldSave && await CustomQuizResultsStore.insert(quizResult);
      //update loading state
      this.setState({quizResultSaved: LOAD_STATE.SUCCESS});

    } catch(error){
      console.log('Quiz result could not be saved.');
      console.log(error);
      this.setState({quizResultSaved: LOAD_STATE.ERROR});
    };
  };

  async loadQuizResults(){
    const { NAV_PARAMS } = CustomQuizExamResultScreen;
    const { navigation } = this.props;

    //get data from previous screen
    const { indexID_quiz } = CustomQuiz.wrap(
      navigation.getParam(NAV_PARAMS.quiz, null)
    );
    
    try {
      //load prev. quiz results
      const quizResults = await CustomQuizResultsStore.read();
      //filter results that belong to this quiz
      const filtered = quizResults.filter((result) => result.indexID_quiz == indexID_quiz);

      //save quiz results and update loading state
      this.setState({
        quizResultsLoaded: LOAD_STATE.SUCCESS, 
        quizResults: filtered,
      });

    } catch(error){
      this.setState({quizResultsLoaded: LOAD_STATE.ERROR});
      console.log('Unable to load prev. quiz results.');
      console.log(error);
    };
  };

  componentDidMount(){
    InteractionManager.runAfterInteractions(async () => {
      //save quiz result
      await this.saveResults();
      //load prev. quiz results
      await this.loadQuizResults();
      //hide loading indicator
      await this.loadingPill.setVisibility(false);
    });
  };

  _handleOnPressViewAllQuestions = () => {
    const { NAV_PARAMS } = CustomQuizExamResultQAScreen;
    const { navigation } = this.props;
    const { quizResults, questionAnswersList } = this.state;

    //pass data and navigate to CustomQuizExamResultQAScreen
    navigation && navigation.navigate(ROUTES.CustomQuizExamResultQARoute, {
      [NAV_PARAMS.quizResults]: quizResults,
      [NAV_PARAMS.quizResult ]: this.quizResult ,
      [NAV_PARAMS.QAList     ]: questionAnswersList,
    });
  };

  _handleOnPressNavigate = async ({index}) => {
    const { NAV_PARAMS } = CustomQuizExamResultQAScreen;
    const { navigation } = this.props;
    const { quizResults, questionAnswersList } = this.state;

    const result = await new Promise(resolve => Alert.alert(
      `Show Question #${index + 1}`,
      `Do you want to view all of the deatils for question #${index + 1}?`, [
        { text: 'OK'    , style: 'default', onPress: () => resolve(true )},
        { text: 'Cancel', style: 'cancel' , onPress: () => resolve(false)},
      ],
      {cancelable: false}, 
    ));

    //pass data and navigate to CustomQuizExamResultQAScreen
    if(result){
      navigation && navigation.navigate(ROUTES.CustomQuizExamResultQARoute, {
        [NAV_PARAMS.quizResults]: quizResults,
        [NAV_PARAMS.quizResult ]: this.quizResult,
        [NAV_PARAMS.QAList     ]: questionAnswersList,
        [NAV_PARAMS.initIndex  ]: index,
      });
    };
  };

  _showErrorMessage(){
    const { quizResultSaved, quizResultsLoaded } = this.state;
    //check if loading failed
    const didQuizResultSaveFail = (quizResultSaved   == LOAD_STATE.ERROR);
    const didQuizResultLoadFail = (quizResultsLoaded == LOAD_STATE.ERROR);

    //show error when loading fails
    if((didQuizResultSaveFail || didQuizResultLoadFail) && !this.didShowError){
      this.didShowError = true;
      const didBothFail = (didQuizResultSaveFail && didQuizResultLoadFail);
      
      let errorMessage = '';
      //create error message
      errorMessage += didQuizResultSaveFail? 'Quiz results could not be saved' : '';
      errorMessage += didBothFail? ' and ' : '';
      errorMessage += didQuizResultLoadFail? 'Prev. Quiz results could not be loaded' : '';
      errorMessage += '.';

      //show error message
      Alert.alert('Error Occured', errorMessage);
    };
  };

  _renderContents(){
    const { NAV_PARAMS } = CustomQuizExamResultScreen;
    const { navigation } = this.props;
    const { quizResults, quizResultSaved, quizResultsLoaded } = this.state;
    
    const didSave = (quizResultSaved   == LOAD_STATE.SUCCESS);
    const didLoad = (quizResultsLoaded == LOAD_STATE.SUCCESS);
    //don't render while loading
    if(!didSave || !didLoad) return null;

    const quizResult = CustomQuizResultItem.wrap(
      navigation.getParam(NAV_PARAMS.customQuizResult, null)
    );

    const quiz = CustomQuiz.wrap(
      navigation.getParam(NAV_PARAMS.quiz, null)
    );

    return(
      <AnimateInView duration={500}>
        <ResultSummaryCard results={quizResult.results}/>
        <StatsCard
          startTime={quizResult.startTime}
          endTime  ={quizResult.endTime  }
          {...quizResult.timeStats}  
        />
        <ScoreProgressCard
          {...{navigation}}
          results={quizResults}
        />
        <AnswersListCard 
          onPressViewAllQuestions={this._handleOnPressViewAllQuestions}
          onPressNavigate={this._handleOnPressNavigate}
          questionAnswersList={quizResult.questionAnswersList}
        />
        <IconFooter
          animateIn={false}
          hide={false}
        />
      </AnimateInView>
    );
  };

  render(){
    const { styles } = CustomQuizExamResultScreen;
    //show alert when there's an error
    this._showErrorMessage();

    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <ScrollView
          style={styles.scrollview}
          //adjust top distance
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
        >
          {this._renderContents()}
        </ScrollView>
        <LoadingPill ref={r => this.loadingPill = r}/>
      </ViewWithBlurredHeader>
    );
  };
};
