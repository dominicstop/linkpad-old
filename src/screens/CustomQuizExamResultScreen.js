import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback, Clipboard} from 'react-native';
import PropTypes from 'prop-types';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView, IconFooter } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader } from '../components/Header' ;

import _ from 'lodash';
import moment from "moment";
import * as Animatable from 'react-native-animatable';
import Expo from 'expo';
import { Header, NavigationEvents } from 'react-navigation';

import { STYLES, ROUTES } from '../Constants';
import { ResourceModel } from '../models/ResourceModel';
import { plural, isEmpty, timeout } from '../functions/Utils';
import { BLUE , GREY, PURPLE} from '../Colors';

import { Divider, Icon } from 'react-native-elements';

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
      <View style={{}}>
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
    const questionList = navigation.getParam('questionList', []);
    const answers      = navigation.getParam('answers'     , []);
    const questions    = navigation.getParam('questions'   , []);
    const timeStats    = navigation.getParam('timeStats'   , null);
    const startTime    = navigation.getParam('startTime'   , null);

    //destructure items from timestats
    //const { min, max, avg, sum, timestamps } = timeStats;

    //debug: data from previous screen
    if(false){
      //copy to clipboard
      Clipboard.setString(JSON.stringify({
        questionList, answers, questions, timeStats
      }));
      //print data from previous screen
      console.log(`\n\n questionList (${questionList.length}): `);
      console.log(questionList);
      console.log(`\n\n answers (${answers.length}): `);
      console.log(answers);
      console.log(`\n\n questionList (${questions.length}): `);
      console.log(questions);
      console.log(`\n\n timeStats (${timeStats.length}): `);
      console.log(timeStats);
    };

    //used for showing the list of questions answered
    const questionAnswersList = [...questionList, ...questions].map((question) => {
      const questionID = `${question.indexID_module}-${question.indexID_subject}-${question.indexID_question}`;

      //find matching answer, otherwise returns undefined
      const matchedAnswer = answers.find((answer) => {
        console.log(`${answer.answerID} == ${questionID} result: ${questionID == answer.answerID}`);
        //if ID's match, return answer
        return questionID == answer.answerID;
      });

      console.log('\n\n');
      console.log(matchedAnswer);

      //check if there is match
      const hasMatchedAnswer = (matchedAnswer != undefined);

      return({
        answer: matchedAnswer, //contains: timestampAnswered, userAnswer etc.
        hasMatchedAnswer     , //used to check if there's a matching answer
        questionID           , //used as unique id in list
        question             , //contains: question, choices, explanation etc.
      });
    });

    this.state = {
      questionAnswersList,
    };
  };

  //shows a list of questions + answer, details etc.
  _renderItemQuestions(){
    const { questionAnswersList } = this.state;

    const items =  questionAnswersList.map((item, index) => {
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
    const { questionAnswersList } = this.state;
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
            {this._renderItemQuestions()}
            <Text>Test</Text>
          </AnimateInView>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};
