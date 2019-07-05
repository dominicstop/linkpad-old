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
import {CustomQuizResultsStore,  CustomQuizResultItem, CustomQuizResults} from '../functions/CustomQuizResultsStore';

import Animated, { Easing } from 'react-native-reanimated';
import { QuestionItem } from '../models/ModuleModels';
import { PlatformTouchableIconButton } from '../components/Buttons';
import { CustomQuizExamResultQAScreen } from './CustomQuizExamResultQAScreen';
const { set, cond, block, Value, timing, interpolate, and, or, onChange, eq, call, Clock, clockRunning, startClock, stopClock, debug, divide, multiply } = Animated;
import { TabView, SceneMap } from 'react-native-tab-view';
import { ScoreProgressCard } from '../components/ResultScoreProgressCard';
import { ModalTitle } from '../components/StyledComponents';
import { CustomQuiz } from '../functions/CustomQuizStore';

//declare animations
Animatable.initializeRegistryWithDefinitions({
  rotate360: {
    easing: 'ease-in',
    from  : { transform: [{ rotate: '0deg'   }] },
    to    : { transform: [{ rotate: '360deg' }] },
  },
});

const sharedStyles = StyleSheet.create({
  //header styles
  title: {
    color: PURPLE[1200],
    ...Platform.select({
      ios: {
        fontSize: 24, 
        fontWeight: '800'
      },
      android: {
        fontSize: 26, 
        fontWeight: '900'
      }
    })
  },
  titleContainer: {
  },
  subtitle: {
    flex: 1,
    fontWeight: '200',
    fontSize: 17,
  },
});

const headerTitle = (props) => <CustomHeader 
  name={'info'}
  type={'simple-line-icon'}
  size={22}
  {...props}  
/>

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
      fontSize: 16,
      marginLeft: 7,
      width: 72,
      textAlign: 'center',
    },
    result: {
      fontSize: 16,
    }
  });

  getStateFromModeKind(){
    const { MODE } = ResultCard;
    const { kind } = this.props;
    switch (kind) {
      case MODE.CORRECT: return {
        label: 'Correct',
        color: '#1B5E20',
        //icon props
        name: 'check-circle', 
        type: 'font-awesome', 
      };
      case MODE.INCORRECT: return {
        label: 'Wrong',
        color: RED[900],
        //icon props
        name: 'times-circle', 
        type: 'font-awesome', 
      };
      case MODE.UNANSWERED: return {
        label: 'Skipped',
        color: GREY[900],
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
        <Text style={[styles.result, labelStyle]}>
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
class ResultCard extends React.PureComponent {
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
    cardContainer: {
      paddingBottom: 10,
    },
    divider: {
      marginVertical: 10,
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
    const { MODE } = ResultCard;

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
    const { MODE } = ResultCard;
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
    const { MODE } = ResultCard;
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
  
  _renderHeader(){
    const { desc: subtitle } = this.getStateFromMode();

    return(
      <ModalTitle
        text={'Quiz Results'}
        iconName={'clipboard'}
        iconType={'feather'}
        iconColor={'#512DA8'}
        {...{subtitle}}
      />
    );

    return(
      <IconText
        containerStyle={sharedStyles.titleContainer}
        textStyle={sharedStyles.title}
        
      />
    );
  };

  _renderPictureDesc(){
    const { styles } = ResultCard;
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
        <Text style={[styles.pictureDescText, sharedStyles.subtitle]}>
          <Text style={styles.pictureDescResultText}>{result}</Text>
          {'. '}
          <Text>{resultDescription}</Text>
        </Text>
      </View>
    );
  };

  _renderResults(){
    const { styles, MODE } = ResultCard;
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
    const { styles, MODE } = ResultCard;
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
    const { styles } = ResultCard;

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
    const { styles } = ResultCard;
    return(
      <Card style={styles.cardContainer}>
        {this._renderHeader()}
        <Divider style={styles.divider}/>
        {this._renderPictureDesc()}
        <View style={styles.resultPieContainer}>
          {this._renderResults ()}
          {this._renderPieChart()}
        </View>
      </Card>
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
    //details comp styles
    detailsCompContainer: {
    },
    detailsCompRowContainer: {
      flexDirection: 'row', 
      marginTop: 10,
    },
  });

  addSuffix(value, suffix, seperator = ''){
    return(value == 0? '' : `${value} ${plural(suffix, value)}` + seperator);
  };

  _renderHeader(){
    return(
      <IconText
        containerStyle={sharedStyles.titleContainer}
        textStyle={sharedStyles.title}
        text={'Quiz Statistics'}
        subtitleStyle={sharedStyles.subtitle}
        subtitle={"Information on how you took the quiz."}
        iconName={'speedometer'}
        iconType={'simple-line-icon'}
        iconColor={'#512DA8'}
        iconSize={26}
      />
    );
  };

  _renderDetailsTime(){
    const { styles } = StatsCard;
    const { startTime, endTime } = this.props;

    const diffTime = endTime - startTime;
    const duration = moment.duration(diffTime, 'milliseconds');

    const hrs = this.addSuffix(duration.hours  (), 'Hr' , ' ');
    const min = this.addSuffix(duration.minutes(), 'Min', ' ');
    const sec = this.addSuffix(duration.seconds(), 'Sec'     );

    const timeStarted = moment(startTime).format('LT');
    const timeEnded   = moment(endTime  ).format('LT');
    const durationStr = (hrs + min + sec);
    
    return(
      <Fragment>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Started: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{timeStarted}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Duration: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{durationStr}</Text>
          </View>
        </View>
      </Fragment>
    );
  };

  _renderDetailsComp(){
    const { styles } = StatsCard;
    const { min, max, avg, sum, timestamps } = this.props;

    const timesAnswered = `${timestamps.length} times`;

    const minText = min? `${min.toFixed(1)} Seconds` : 'N/A';
    const maxText = max? `${max.toFixed(1)} Seconds` : 'N/A';
    const avgText = avg? `${avg.toFixed(1)} Seconds` : 'N/A';
    
    return(
      <View style={styles.detailsCompContainer}>
        <Text style={styles.title}>Time Per Answer</Text>
        <Text style={styles.subtitle}>Computes the amount of time it took to answer each question.</Text>
        <View style={styles.detailsCompRowContainer}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Shortest:'}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{minText}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Longest:'}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{maxText}</Text>
          </View>
        </View>
        <View style={styles.detailsCompRowContainer}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Average:'}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{avgText}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Answered:'}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{timesAnswered}</Text>
          </View>
        </View>
      </View>
    );
  };

  render(){
    const { styles } = StatsCard;
    return(
      <Card>
        {this._renderHeader()}
        <Divider style={styles.divider}/>
        {this._renderDetailsTime()}
        <Divider style={styles.divider}/>
        {this._renderDetailsComp()}
      </Card>
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
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    //number indicator styles
    numberIndicatorContainer: {
      marginTop: 10,
      width: 25,
      height: 25,
      borderRadius: 25/2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: PURPLE[400],
    },
    numberIndicatorText: {
      fontSize: 15,
      fontWeight: '500',
      color: 'white',
    },
    //question styles
    questionContainer: {
      flex: 1,
      marginLeft: 10,
    },
    questionText: {
      fontSize: 17,
      fontWeight: '500',
      marginBottom: 5,
      color: PURPLE[1000]
    },
    //answer styles
    detailRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    detailIcon: {
      width: 18,
      marginRight: 3,
    },
    detailText: {
      fontSize: 17,
      fontWeight: '200',
      textAlignVertical: 'center',
    },
    detailLabel: {
      fontSize: 17,
      fontWeight: '500',
      color: GREY[900],
      minWidth: 100,
    },
    detailTextCount: {
      fontSize: 15,
      fontWeight: '100',
      marginRight: 5,
      color: GREY[700]
    },
    //time styles
    timeContainer: {
      flexDirection: 'row',
      marginLeft: 5,
      alignItems: 'center',
    },
    timeText: {
      fontSize: 15,
      fontWeight: '100',
      marginRight: 5,
      color: GREY[700]
    },
    //
    expandedContainer: {
      width: '100%',
      position: 'absolute',
      overflow: 'hidden',
      backgroundColor: 'white',
    },
  });

  constructor(props){
    super(props);

    //animation values
    this.heightExpanded  = new Value(-1);
    this.heightCollapsed = new Value(0);
    this.progress        = new Value(0);

    this.height = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, this.heightExpanded],
      extrapolate: 'clamp',
    });
    this.opacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    this.isExpanded = false;
    this.isHeightMeasured = false;
    this.state = {
      mountExpanded: false,
    };
  };

  expand = async (expand) => {
    if(!this.isHeightMeasured){
      //mount expanded
      await setStateAsync(this, {mountExpanded: true});

      //get current height of collapsed
      const heightCollapsed = await new Promise(resolve => {
        this.collapsedQuestionContainer.measure((x, y, w, h) => resolve(h));
      });
      
      //get current height of expanded
      const heightExpanded = await new Promise(resolve => {
        this.expandedContainer.measure((x, y, w, h) => resolve(h));
      });

      console.log('heightCollapsed: ' + heightCollapsed);
      console.log('heightExpanded: ' + heightExpanded);

      //set height measured flag to true
      this.isHeightMeasured = true;
      //set animated height values
      this.heightExpanded .setValue(heightExpanded - heightCollapsed);
    };

    const config = {
      duration: 250,
      toValue : expand? 100 : 0,
      easing  : Easing.inOut(Easing.ease),
    };

    if(this.isExpanded != expand){
      //start animation
      const animation = timing(this.progress, config);
      animation.start();
      this.isExpanded = expand;
    };
  };

  _handleOnPressIndicator = () => {
    const { onPressNavigate, ...otherProps } = this.props;
    onPressNavigate && onPressNavigate({...otherProps});
  };

  _handleOnPressQuestion = async () => {
    this.expand(!this.isExpanded);
  };

  _handleOnLongPressQuestion = async () => {
    const { onPressNavigate, ...otherProps } = this.props;
    onPressNavigate && onPressNavigate({...otherProps});
  };

  _renderNumberIndicator(){
    const { styles } = Question;
    const { index } = this.props;

    return(
      <TouchableOpacity 
        style={styles.numberIndicatorContainer}
        onPress={this._handleOnPressIndicator}
      >
        <Text style={styles.numberIndicatorText}>{index + 1}</Text>
      </TouchableOpacity>
    );
  };

  _renderExapndedDurations(){
    const { styles } = Question;
    const { durations } = this.props;
    
    const totalTime = moment(durations.totalTime || 0).format('mm:ss');
    const viewCount = durations.viewCount || 0;

    return(
      <View style={styles.detailRow}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <Icon
            containerStyle={styles.detailIcon}
            name={'clock'}
            type={'feather'}
            color={GREY[700]}
            size={17}
          />
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>{'Duration: '}</Text>
            {totalTime}
          </Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.detailTextCount}>{`Viewed: ${viewCount}`}</Text>
          <Icon
            name={'eye'}
            type={'feather'}
            color={GREY[700]}
            size={17}
          />
        </View>
      </View>
    );
  };

  _renderExpandedAnswer(){
    const { styles } = Question;
    const { answer, hasMatchedAnswer, questionID, question, index } = this.props;
    const questionItem = QuestionItem.wrap(question);

    const isCorrect  = hasMatchedAnswer? answer.isCorrect  : false;
    const answerText = hasMatchedAnswer? answer.userAnswer : 'No Answer';
    
    return (isCorrect?(
      <View style={styles.detailRow}>
        <Icon
          containerStyle={styles.detailIcon}
          size={17}
          name={'check-circle'}
          type={'font-awesome'}
          color={'green'}
        />
        <Text numberOfLines={1} style={styles.detailText}>
          {questionItem.answer || "No Data"}
        </Text>
      </View>
    ):(
      <View>
        <View style={styles.detailRow}>
          <Icon
            containerStyle={styles.detailIcon}
            size={17}
            name={'circle-with-cross'}
            type={'entypo'}
            color={'red'}
          />
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>{'Answered: '}</Text>
            {answerText}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon
            containerStyle={styles.detailIcon}
            size={17}
            name={'check-circle'}
            type={'font-awesome'}
            color={'green'}
          />
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>{'Answer: '}</Text>
            {questionItem.answer}
          </Text>
        </View>
      </View>
    ));
  };

  _renderExpanded(){
    const { styles } = Question;
    const { answer, hasMatchedAnswer, questionID, question, index } = this.props;
    const { mountExpanded } = this.state;

    const questionText = isEmpty(question.question)? 'No Question' : question.question; 
    if(!mountExpanded) return null;

    return(
      <View ref={r => this.expandedContainer = r}>
        <Text numberOfLines={3} style={styles.questionText}>{questionText}</Text>
        {this._renderExapndedDurations()}
        {this._renderExpandedAnswer()}
      </View>
    );
  };

  _renderCollpasedTime(){
    const { styles } = Question;
    const { answer, hasMatchedAnswer } = this.props;
    if(!hasMatchedAnswer) return null;

    const timeText = moment(answer.timestampAnswered).format('LTS');

    return(
      <View style={styles.timeContainer}>
        <Text numberOfLines={1} style={styles.timeText}>
          {timeText}
        </Text>
        <Icon
          name={'clock'}
          type={'feather'}
          color={GREY[700]}
          size={15}
        />
      </View>
    );
  };

  _renderCollapsedAnswer(){
    const { styles } = Question;
    const { answer, hasMatchedAnswer, questionID, question, index } = this.props;

    const isCorrect  = hasMatchedAnswer? answer.isCorrect  : false;
    const answerText = hasMatchedAnswer? answer.userAnswer : 'No Answer';
    
    const iconProps = (isCorrect
      ? { name: 'check-circle'     , type: 'font-awesome', color: 'green' }
      : { name: 'circle-with-cross', type: 'entypo'      , color: 'red'   }
    );

    return(
      <View style={styles.detailRow}>
        <Icon
          containerStyle={styles.detailIcon}
          size={17}
          {...iconProps}
        />
        <Text numberOfLines={1} style={styles.detailText}>
          {answerText}
        </Text>
      </View>
    );
  };

  _renderCollapsed(){
    const { styles } = Question;
    const { answer, hasMatchedAnswer, questionID, question, index } = this.props;

    const questionText = isEmpty(question.question)? 'No Question' : question.question; 

    return(
      <View ref={r => this.collapsedQuestionContainer = r}>
        <Text numberOfLines={1} style={styles.questionText}>
          {questionText}
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {this._renderCollapsedAnswer()}
          {this._renderCollpasedTime  ()}
        </View>
      </View>
    );
  };

  _renderQuestionDetails(){
    const { styles } = Question;

    const expandedContainerStyle = {
      opacity: this.opacity,
    };
    const style = {
      height: this.height,
    };

    return(
      <TouchableOpacity 
        style={styles.questionContainer}
        onPress={this._handleOnPressQuestion}
        onLongPress={this._handleOnLongPressQuestion}
        activeOpacity={0.75}
      >
        {this._renderCollapsed()}
        <Animated.View style={[styles.expandedContainer, expandedContainerStyle]}>
          {this._renderExpanded()}
        </Animated.View>
        <Animated.View {...{style}}/>
      </TouchableOpacity>
    );
  };

  render(){
    const { index } = this.props;
    const { styles } = Question;

    return(
      <Fragment>
        {(index == 0) && <Divider style={styles.divider}/>}
        <View style={styles.container}>
          {this._renderNumberIndicator()}    
          {this._renderQuestionDetails()}
        </View>
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
      marginTop: 5,
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      marginLeft: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      fontWeight: '200',
    },
    buttonWrapper: {
      backgroundColor: PURPLE.A700,
      marginTop: 12,
      marginBottom: 5,
    },
    buttonContainer: {
      padding: 12,
    },
    buttonText: {
      color: 'white',
      fontSize: 17,
      fontWeight: '600',
    }
  });

  constructor(props){
    super(props);
    //Clipboard.setString(JSON.stringify(props.questionAnswersList));
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
        <View style={[styles.headerContainer, sharedStyles.titleContainer]}>
          <Icon
            name={'notebook'}
            type={'simple-line-icon'}
            color={'#512DA8'}
            size={23}
          />
          <Text style={[styles.headerTitle, sharedStyles.title]}>{'Answers List'}</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {"Long press on a question or tap on it's number to view all of it's details."}
        </Text>

        <PlatformTouchableIconButton
          onPress={this._handleOnPressViewAllQuestions}
          wrapperStyle={[styles.buttonWrapper, STYLES.lightShadow]}
          containerStyle={styles.buttonContainer}
          textStyle={styles.buttonText}
          text={'View All Questions'}
          iconName={'eye'}
          iconColor={'white'}
          iconType={'feather'}
          iconSize={23}
        />
      </Fragment>
    );
  };
  
  render(){
    return(
      <Card>
        {this._renderHeader()}
        <FlatList
          data={this.props.questionAnswersList}
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
        />
      </Card>
    );
  };
};

export class CustomQuizExamResultScreen extends React.Component {
  static router = ScoreProgressCard.router;

  static navigationOptions = {
    title: 'Results',
    headerTitle,
    //custom android header
    ...Platform.select({
      android: { header: props => <AndroidHeader {...props}/> }
    }),
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

  async componentDidMount(){
    //save quiz result
    await this.saveResults();
    //load prev. quiz results
    await this.loadQuizResults();
    //hide loading indicator
    await this.animatedLoadingContainer.fadeOutUp(500);
    this.setState({showLoading: false});
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

  _renderLoading(){
    const { styles } = CustomQuizExamResultScreen;
    const { showLoading } = this.state;
    //do not render when not loading
    if(!showLoading) return null;

    return(
      <Animatable.View
        ref={r => this.animatedLoadingContainer = r}
        style={styles.loadingContainer}
        animation={'fadeInUp'}
        duration={300}
        useNativeDriver={true}
      >
        <ActivityIndicator
          size={'large'}
          color={PURPLE.A700}
        />
      </Animatable.View>
    );
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
        <ResultCard results={quizResult.results}/>
        <StatsCard
          startTime={this.startTime}
          endTime={this.endTime}
          //pass down timestats properties as props
          {...quizResult.timeStats}  
        />
        <ScoreProgressCard
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
          {this._renderLoading ()}
          {this._renderContents()}
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};
