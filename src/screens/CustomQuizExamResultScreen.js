import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback, Clipboard} from 'react-native';
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

import { STYLES, ROUTES } from '../Constants';
import { plural, isEmpty, timeout } from '../functions/Utils';
import { BLUE , GREY, PURPLE, RED, GREEN} from '../Colors';



function matchQuestionsWithAnswers(questions, answers){
  return questions.map((question) => {
    //used for checking if question matches answers
    const questionID = `${question.indexID_module}-${question.indexID_subject}-${question.indexID_question}`;

    //find matching answer, otherwise returns undefined
    const matchedAnswer = answers.find((answer) => questionID == answer.answerID);
    //check if there is match
    const hasMatchedAnswer = (matchedAnswer != undefined);

    return({
      answer: matchedAnswer, //contains: timestampAnswered, userAnswer etc.
      hasMatchedAnswer     , //used to check if there's a matching answer
      questionID           , //used as unique id in list
      question             , //contains: question, choices, explanation etc.
    });
  });
};

function countResults(list){
  const unanswered = list.filter(answer => !answer.hasMatchedAnswer);
  const answered   = list.filter(answer =>  answer.hasMatchedAnswer);

  //count answers that are correct/wrong etc.
  const correct   = answered.reduce((acc, {answer}) => acc += answer.isCorrect? 1 : 0, 0);
  const incorrect = answered.reduce((acc, {answer}) => acc += answer.isCorrect? 0 : 1, 0);
  const unaswered = unanswered.length;

  console.log(`
    correct  : ${correct}
    incorrect: ${incorrect}
    unaswered: ${unaswered}
  `);

  //add everything to get total
  const total = (correct + incorrect + unaswered);

  return({correct, incorrect, unaswered, total});
};

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
      marginBottom: 7,
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

  getValueFromModeKind(kind){
    const { MODE } = ResultCard;
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

    const { label, name, type, color } = this.getValueFromModeKind(kind);
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

    const { color } = this.getValueFromModeKind(kind);
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
      marginTop: 15,
    },
    divider: {
      marginVertical: 10,
    },
    //results style
    resultPieContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    resultsContainer: {
      flex: 1,
      marginRight: 5,
    },
    //piechart styles
    pieContainer: {
      paddingRight: 10,
    },
    pieInfoContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pieInfoFractionLabel: {
      fontSize: 18,
    },
    //pie icon styles
    pieIconContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pieIcon: {
      width: 12,
      height: 12,
      borderRadius: 12/2,
      marginTop: 2,
    },
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
      fontSize: 16,
    },
  });

  constructor(props){
    super(props);
    const { MODE } = ResultCard;

    this.state = {
      mode: MODE.DEFAULT,
      showPercentage: false,
    };
  };

  getStateFromMode(){
    const { MODE } = ResultCard;
    const { results } = this.props;
    const { mode, showPercentage } = this.state;

    const perentageCorrect    = (results.correct   / results.total) * 100;
    const perentageIncorrect  = (results.incorrect / results.total) * 100;
    const perentageUnanswered = (results.unaswered / results.total) * 100;
    
    switch (mode) {
      case MODE.DEFAULT: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN.A700, RED.A700, GREY[500]],
        label : showPercentage? `${perentageCorrect.toFixed(2)}%` : `${results.correct}/${results.total}`,
        color: 'white',
        desc  : 'Tap on an item for more info.',
      };
      case MODE.CORRECT: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN.A700, RED[100], GREY[100]],
        label : showPercentage? `${perentageCorrect.toFixed(2)}%` : `${results.correct}/${results.total}`,
        color : GREEN.A700,
        desc  : 'Items you answered correctly',
      };
      case MODE.INCORRECT: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN[100], RED.A700, GREY[100]],
        label : showPercentage? `${perentageIncorrect.toFixed(2)}%` : `${results.incorrect}/${results.total}`,
        color : RED.A700,
        desc  : 'The items you got wrong.'
      };
      case MODE.UNANSWERED: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN[100], RED[100], GREY[500]],
        label : showPercentage? `${perentageUnanswered.toFixed(2)}%` : `${results.unaswered}/${results.total}`,
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

    //dont render icon when default
    if(mode == MODE.DEFAULT) return(
      <View style={styles.pieIconContainer}/>
    );

    const { color } = this.getStateFromMode();
    const pieIconStyle = {
      backgroundColor: color,
    };
    
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
        ref={r => this.animatedChart = r}
        useNativeDriver={true}
      >
        <TouchableOpacity
          onPress={this._handleOnPressPie}
          style={styles.pieContainer}
        >
          <Pie
            backgroundColor='#ddd'
            //pass down props
            {...{radius, innerRadius, series, colors}}
          />
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

  _renderHeader(){
    const { styles } = ResultCard;
    const { desc } = this.getStateFromMode();
    return(
      <IconText
        containerStyle={styles.titleContainer}
        textStyle={styles.title}
        text={'Quiz Results'}
        subtitleStyle={styles.subtitle}
        subtitle={desc}
        iconName={'clipboard'}
        iconType={'feather'}
        iconColor={'#512DA8'}
        iconSize={30}
      />
    );
  };

  render(){
    const { styles } = ResultCard;
    return(
      <Card style={styles.cardContainer}>
        {this._renderHeader()}
        <Divider style={styles.divider}/>
        <View style={styles.resultPieContainer}>
          {this._renderResults ()}
          {this._renderPieChart()}
        </View>
      </Card>
    );
  };
};

//answer list - title 
class QuestionHeader extends React.PureComponent {
  static styles = StyleSheet.create({
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
      fontSize: 16,
    },
  });
    
  render(){
    const { styles } = QuestionHeader;
    return(
      <View>
        <IconText
          containerStyle={styles.titleContainer}
          textStyle={styles.title}
          text={'Answers List'}
          subtitleStyle={styles.subtitle}
          subtitle={"Questions and corresponding answer."}
          iconName={'notebook'}
          iconType={'simple-line-icon'}
          iconColor={'#512DA8'}
          iconSize={26}
        />
      </View>
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

export class CustomQuizExamResultScreen extends React.Component {
  static navigationOptions = {
    title: 'Results',
    //headerTitle: ViewResourceHeader,
    //custom android header
    ...Platform.select({
      android: { header: props => <AndroidHeader {...props}/> }
    }),
  };

  constructor(props){
    super(props);
    const { navigation } = this.props;
    
    //get data from previous screen: CustomQuizExamScreen
    const questionList       = navigation.getParam('questionList', []  );
    const questionsRemaining = navigation.getParam('questions'   , []  );
    const answers            = navigation.getParam('answers'     , []  );
    const timeStats          = navigation.getParam('timeStats'   , null);
    const startTime          = navigation.getParam('startTime'   , null);

    //combine questionList and questionsRemaining
    const questions = [...questionList, ...questionsRemaining];

    //destructure items from timestats
    //const { min, max, avg, sum, timestamps } = timeStats;

    //used for showing the list of questions answered
    const questionAnswersList = matchQuestionsWithAnswers(questions, answers);
    //count right, wrong etc. answers
    const results = countResults(questionAnswersList);
    
    this.state = {
      questionAnswersList, results
    };
  };

  //shows a list of questions + answer, details etc.
  _renderAnswerList(){
    const { questionAnswersList } = this.state;

    const items = questionAnswersList.map((item, index) => {
      const { answer, hasMatchedAnswer, questionID, question } = item;
      return(<Question {...{answer, hasMatchedAnswer, questionID, question, index}}/>);
    });

    return(
      <Card>
        <QuestionHeader/>
        {items}
      </Card>
    );
  };

  render(){
    const { results } = this.state;
    const offset = Header.HEIGHT;

    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <ScrollView
          //adjust top distance
          contentInset ={{top: offset}}
          contentOffset={{x: 0, y: -offset}}
        >
          <AnimateInView duration={500}>
            <ResultCard {...{results}}/>
            {this._renderAnswerList()}
          </AnimateInView>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};
