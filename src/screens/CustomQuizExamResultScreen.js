import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback, Clipboard, FlatList, ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView, IconFooter } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader } from '../components/Header' ;

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import moment from "moment";
import { Header, NavigationEvents } from 'react-navigation';
import { Divider, Icon } from 'react-native-elements';
import Pie from 'react-native-pie'

import { STYLES, ROUTES , HEADER_HEIGHT, LOAD_STATE} from '../Constants';
import { plural, isEmpty, timeout , formatPercent, ifTrue, callIfTrue} from '../functions/Utils';
import { BLUE , GREY, PURPLE, RED, GREEN} from '../Colors';
import {CustomQuizResultsStore} from '../functions/CustomQuizResultsStore';

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
    color: '#160656',
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
    const { desc } = this.getStateFromMode();
    return(
      <IconText
        containerStyle={sharedStyles.titleContainer}
        textStyle={sharedStyles.title}
        text={'Quiz Results'}
        subtitleStyle={sharedStyles.subtitle}
        subtitle={desc}
        iconName={'clipboard'}
        iconType={'feather'}
        iconColor={'#512DA8'}
        iconSize={30}
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

class ProgressCard extends React.PureComponent {
  static propTypes = {
    quizResults: PropTypes.array,
    quizResultsLoaded: PropTypes.string,
  };
  
  static styles = StyleSheet.create({
    divider: {
      margin: 10,
    },
  });

  constructor(props){
    super(props);
    
    console.log(props.quizResults);
    Clipboard.setString(JSON.stringify(props.quizResult));
  };

  _renderHeader(){
    return(
      <IconText
        containerStyle={sharedStyles.titleContainer}
        textStyle={sharedStyles.title}
        text={'Progress History'}
        subtitleStyle={sharedStyles.subtitle}
        subtitle={"Shows your previous scores and progress."}
        iconName={'chart'}
        iconType={'simple-line-icon'}
        iconColor={'#512DA8'}
        iconSize={26}
      />
    );
  };

  _renderContent(){
    const { styles } = ProgressCard;

  };
  
  render(){
    const { styles } = ProgressCard;
    return(
      <Card>
        {this._renderHeader()}
        <Divider style={styles.divider}/>
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
    questionID      : PropTypes.object, 
    hasMatchedAnswer: PropTypes.bool  ,
  };

  static styles = StyleSheet.create({
    divider: {
      margin: 10,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    //number indicator styles
    numberIndicatorContainer: {
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
    questionDetailsContainer: {
      flex: 1,
      marginLeft: 10,
    },
    questionText: {
      fontSize: 17,
      fontWeight: '500',
      color: PURPLE[1000]
    },
    //answer styles
    answerContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    answerText: {
      fontSize: 17,
      fontWeight: '200',
      marginLeft: 5,
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
  });

  _renderNumberIndicator(){
    const { styles } = Question;
    const { index } = this.props;

    return(
      <View style={styles.numberIndicatorContainer}>
        <Text style={styles.numberIndicatorText}>{index + 1}</Text>
      </View>
    );
  };

  _renderAnswer(){
    const { styles } = Question;
    const { answer, hasMatchedAnswer, questionID, question, index } = this.props;

    const isCorrect  = hasMatchedAnswer? answer.isCorrect  : false;
    const answerText = hasMatchedAnswer? answer.userAnswer : 'No Answer';
    
    const iconProps = (isCorrect
      ? { name: 'check-circle'     , type: 'font-awesome', color: 'green' }
      : { name: 'circle-with-cross', type: 'entypo'      , color: 'red'   }
    );

    return(
      <View style={styles.answerContainer}>
        <Icon
          size={17}
          {...iconProps}
        />
        <Text numberOfLines={1} style={styles.answerText}>
          {answerText}
        </Text>
      </View>
    );
  };

  _renderTime(){
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

  _renderQuestionDetails(){
    const { styles } = Question;
    const { answer, hasMatchedAnswer, questionID, question, index } = this.props;

    const questionText = isEmpty(question.question)? 'No Question' : question.question; 

    return(
      <View style={styles.questionDetailsContainer}>
        <Text numberOfLines={1} style={styles.questionText}>
          {questionText}
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {this._renderAnswer()}
          {this._renderTime  ()}
        </View>
      </View>
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
  };

  _keyExtractor = (item, index) => {
    return(item.questionID || index);
  };
  
  _renderItem = ({item, index}) => {
    const { answer, hasMatchedAnswer, questionID, question } = item;

    return(
      <Question {...{answer, hasMatchedAnswer, questionID, question, index}}/>
    );
  };
  
  render(){
    return(
      <Card>
        <IconText
          containerStyle={sharedStyles.titleContainer}
          textStyle={sharedStyles.title}
          text={'Answers List'}
          subtitleStyle={sharedStyles.subtitle}
          subtitle={"Questions and corresponding answer."}
          iconName={'notebook'}
          iconType={'simple-line-icon'}
          iconColor={'#512DA8'}
          iconSize={26}
        />
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

  matchQuestionsWithAnswers(questions, answers){
    //remove question from answer
    const new_answers = answers.map((answer) => {
      //extract questions
      const { question, ...otherProperties } = answer;
      //return answer without questions
      return otherProperties;
    });

    return questions.map((question) => {
      //used for checking if question matches answers
      const questionID = `${question.indexID_module}-${question.indexID_subject}-${question.indexID_question}`;
  
      //find matching answer, otherwise returns undefined
      const matchedAnswer = new_answers.find((answer) => questionID == answer.answerID);
      //check if there is match
      const hasMatchedAnswer = (matchedAnswer != undefined);
  
      return({
        answer: matchedAnswer, //contains: timestampAnswered, userAnswer etc.
        hasMatchedAnswer     , //used to check if there's a matching answer
        questionID           , //used as unique id in list
        question             , //contains 
      });
    });
  };
  
  countResults(list){
    const unanswered = list.filter(answer => !answer.hasMatchedAnswer);
    const answered   = list.filter(answer =>  answer.hasMatchedAnswer);
  
    //count answers that are correct/wrong etc.
    const correct   = answered.reduce((acc, {answer}) => acc += answer.isCorrect? 1 : 0, 0);
    const incorrect = answered.reduce((acc, {answer}) => acc += answer.isCorrect? 0 : 1, 0);
    const unaswered = unanswered.length;
  
    //add everything to get total
    const total = (correct + incorrect + unaswered);
  
    return({correct, incorrect, unaswered, total});
  };

  constructor(props){
    super(props);
    
    //for making sure error message is shown only once
    this.didShowError = false;

    const { navigation } = props;
    //get data from previous screen: CustomQuizExamScreen
    const questionList       = navigation.getParam('questionList', []);
    const questionsRemaining = navigation.getParam('questions'   , []);
    const answers            = navigation.getParam('answers'     , []);
    //store data from prev. screen
    this.timeStats = navigation.getParam('timeStats', null);
    this.startTime = navigation.getParam('startTime', null);
    this.endTime   = navigation.getParam('endTime'  , null);
    this.quiz      = navigation.getParam('quiz'     , null);

    //combine questionList and questionsRemaining
    const questions = [...questionList, ...questionsRemaining];
    this.questions = questions;

    //used for showing the list of questions answered
    const questionAnswersList = this.matchQuestionsWithAnswers(questions, answers);
    //count right, wrong etc. answers
    const results = this.countResults(questionAnswersList);
    
    this.state = {
      questionAnswersList, results,
      quizResultSaved  : LOAD_STATE.LOADING,
      quizResultsLoaded: LOAD_STATE.LOADING,
      quizResults: null,
      showLoading: true,
    };
  };

  async saveResults(){
    try{
      const { questionAnswersList, results } = this.state;
      const { indexID_quiz } = this.quiz;

      const quizResult = {
        //pass down state
        questionAnswersList, results,
        //pass down other info
        timeStats: this.timeStats,
        startTime: this.startTime,
        endTime  : this.endTime,
        //pass down quiz id
        indexID_quiz,
      };
      
      //save quiz result
      await CustomQuizResultsStore.insert(quizResult);
      //update loading state
      this.setState({quizResultSaved: LOAD_STATE.SUCCESS});

    } catch(error){
      console.log('Quiz result could not be saved.');
      console.log(error);
      this.setState({quizResultSaved: LOAD_STATE.ERROR});
    };
  };

  async loadQuizResults(){
    try {
      //load prev. quiz results
      await CustomQuizResultsStore.delete();
      const quizResults = await CustomQuizResultsStore.read();
      //save quiz results and update loading state
      this.setState({
        quizResultsLoaded: LOAD_STATE.SUCCESS, 
        quizResults
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
    const { results, questionAnswersList, quizResults, quizResultSaved, quizResultsLoaded } = this.state;
    //don't render while loading
    if(quizResultSaved == LOAD_STATE.LOADING || quizResultsLoaded == LOAD_STATE.LOADING) return null;

    //destructure items from timestats
    const { min, max, avg, sum, timestamps } = this.timeStats;

    return(
      <AnimateInView duration={500}>
        <ResultCard {...{results}}/>
        <StatsCard
          startTime={this.startTime}
          endTime={this.endTime}
          {...{min, max, avg, sum, timestamps}}  
        />
        <ProgressCard {...{quizResultsLoaded, quizResults}}/>
        <AnswersListCard {...{questionAnswersList}}/>
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
