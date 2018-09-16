import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import PropTypes from 'prop-types';

import { setStateAsync, timeout, shuffleArray, randomElementFromArray , returnToZero} from '../functions/Utils';
import GradeStorefrom from '../functions/GradeStore';

import { Button, ExpandCollapseTextWithHeader } from './Buttons';
import { FlipView, IconText } from './Views';

import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import    { Header   } from 'react-navigation';
import    { Divider  } from 'react-native-elements';

import { DangerZone } from 'expo';
import _ from 'lodash';
import GradeStore from '../functions/GradeStore';
const { Lottie } = DangerZone;

const QUESTIONS = [
  {
    question: 'Lorum ipsum sit amit dolor aspicing?',
    explanation: 'Hello world world hello explanation lorum ipsum sit amit dolor aspicing',
    answer: 'Correct Answer',
    choices: [
      'Dummy Choice',
      'Wrong Choice',
      'Ladies Choice' ,
    ],
  },
  {
    question: 'Lorum ipsum sit amit dolor aspicing?',
    explanation: 'Hello world world hello explanation',
    answer: 'Correct Answer',
    choices: [
      'Dummy Choice',
      'Wrong Choice',
      'Ladies Choice' ,
    ],
  },
  {
    question: 'Lorum ipsum sit amit dolor aspicing?',
    explanation: 'Hello world world hello explanation',
    answer: 'Correct Answer',
    choices: [
      'Dummy Choice',
      'Wrong Choice',
      'Ladies Choice' ,
    ],
  },
  {
    question: 'Lorum ipsum sit amit dolor aspicing?',
    explanation: 'Hello world world hello explanation',
    answer: 'Correct Answer',
    choices: [
      'Dummy Choice',
      'Wrong Choice',
      'Ladies Choice' ,
    ],
  },
  {
    question: 'Lorum ipsum sit amit dolor aspicing?',
    explanation: 'Hello world world hello explanation1',
    answer: 'Correct Answer',
    choices: [
      'Dummy Choice',
      'Wrong Choice',
      'Ladies Choice' ,
    ],
  },
];

const questionShape = {
  question: PropTypes.string,
  answer  : PropTypes.string,
  choices : PropTypes.array ,
  //used for keeping track of ans, score etc.
  userAnswer: PropTypes.string,
};


class Questions {
  constructor(indexID_module = 0, indexID_subject = 0){
    this.questions
  }
}

//grade for a subject
class GradeItem {
  constructor(indexID_module = 0, indexID_subject = 0){
    this.DEBUG = false;
    this.grade = {
      //used for identifyingå
      indexID_module : indexID_module,
      indexID_subject: indexID_subject,
      //dates
      timestamp_started: this.getTimestamp(),
      timestamp_ended  : '',
      //array of ans to question
      answers: []
    };
    if(this.DEBUG){
      console.log('\n\nNew GradeItem Created:');
      console.log(this.grade);
    }
  }

  //returns the current timestamp
  getTimestamp = () => {
    const dateTime  = new Date().getTime();
    return Math.floor(dateTime / 1000);
  }

  //setter and getters
  getGrade = () => _.cloneDeep(this.grade);
  setGrade = grade => {
    this.grade = grade;
    if(this.DEBUG){
      console.log('\n\nSet Grades with:');
      console.log(grade);
      console.log('\nthis.grade');
      console.log(this.grade);
    }
  };
  getAnswers = () => this.grade.answers;
  setTimestamp_ended = () => this.grade.timestamp_ended = this.getTimestamp();
  getLastAnswer = () => this.getGrade().answers.pop();
  getAnswersLength = () => this.grade["answers"].length;

  //add an answer
  addAnswer = (indexID = 0, answer = '', isCorrect = false) => {
    let new_answer = {
      //append data
      indexID_question: indexID,
      answer: answer,
      isCorrect: isCorrect,
      //add a timestamp
      timestamp: this.getTimestamp(),
    };
    //append to answer
    this.grade.answers.push(new_answer);
    if(this.DEBUG){
      console.log('\n\nNew Answer Added:');
      console.log(new_answer);
      console.log('\n\nhis.grade.answers:');
      console.log(this.grade.answers);
    }
    //return created answer obj
    return new_answer;
  }
}

//TODO: create a generic wrappper
//renders a animated check
export class CheckAnimation extends React.PureComponent {
  static propTypes = {
    style: ViewPropTypes.style
  }
  
  constructor(props){
    super(props);
    this.animatedValue = new Animated.Value(0);
    this.state = {
      source: require('../animations/checked_done_.json'),
      mountAnimation: false,
    };
  }

  //start animation
  start = () => {
    return new Promise(async resolve => {
      await setStateAsync(this, {mountAnimation: true});
      Animated.timing(this.animatedValue, { 
        toValue: 1,
        duration: 750,
        useNativeDriver: true 
      }).start(() => resolve());
    });
  }

  render(){
    const { style } = this.props;
    if(!this.state.mountAnimation) return null;
    return(
      <Lottie
        ref={r => this.animation = r}
        progress={this.animatedValue}
        style={style}
        source={this.state.source}
        loop={false}
        autoplay={false}
      />
    );
  }
}

//shows a single exam choice
export class ExamChoice extends React.PureComponent {
  static propTypes = {
    choiceKey : PropTypes.string.isRequired,
    choiceText: PropTypes.string.isRequired,
    answer    : PropTypes.string.isRequired,
    onPress   : PropTypes.func  .isRequired,
    //misc props
    style: ViewPropTypes.style,
  }

  constructor(props){
    super(props);
    this.animatedValue = new Animated.Value(0);
  }

  animateColor = () => {
    Animated.timing(this.animatedValue, {
      toValue : 1,
      duration: 500,
    }).start();
  }

  _onPressChoice = () => {
    const { onPress, choiceText, choiceKey, answer} = this.props;
    //check if user's ans is correct
    const isCorrect = choiceText == answer;

    onPress(choiceText, choiceKey);
    if(!isCorrect) this.animateColor();
  }
  
  render(){
    const { choiceText, choiceKey, style } = this.props;

    //TODO: move to styles
    const colorOverlayStyle = {
      paddingVertical: 10,
      position: 'absolute', 
      height: '100%',
      width: '100%', 
      backgroundColor: 'rgb(237, 45, 113)',
      opacity: this.animatedValue
    };

    return(
      <TouchableOpacity
        style={[{minHeight: 50, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgb(98, 0, 234)', borderRadius: 8, overflow: 'hidden',}, style]}
        onPress={this._onPressChoice}
        activeOpacity={0.7}
      >
        <Animated.View
          style={colorOverlayStyle}
          useNativeDriver={true}
        />
        <Text style={{fontSize: 18, marginHorizontal: 15, color: 'white', fontWeight: '900', width: 15,}}>{choiceKey }</Text>
        <Text style={{fontSize: 18, color: 'white', fontWeight: '500', flex: 1}}>{choiceText}</Text>
      </TouchableOpacity>
    );
  }
}

//shows a list of choices
export class ExamChoiceList extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),    
    onPressChoice: PropTypes.func,
  }

  _renderChoices = () => {
    const { question, onPressChoice } = this.props;
    //used for the key
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    //
    const choicesArray = question.choices.slice().map(value => value.value);
    //combine choices and answer
    choicesArray.push(question.answer);
    //returns a copy of shuffled choices
    const shuffledChoices = shuffleArray(choicesArray);
    //render choices
    return shuffledChoices.map((choice, index) => 
      <ExamChoice
        choiceText={choice}
        choiceKey ={alphabet[index]}
        answer    ={question.answer}
        key       ={choice + index }
        style     ={{marginTop: 8}}
        onPress   ={onPressChoice}
      />
    );
  }
  
  render(){
    return (
      <View>
        {this._renderChoices()}
      </View>
    );
  }
}

//shows a question and a list of choices
export class ExamQuestion extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),
    onPressChoice: PropTypes.func,
  }

  _renderTopQuestion(){
    const { question } = this.props;    
    return(
      <View style={{flex: 1}}>
        <ScrollView style={{flex: 1}}>
          <Text style={{fontSize: 22}}>
            {question.question}
          </Text>
        </ScrollView>
      </View>
    );
  }

  _renderBottomChoices(){
    const { question, onPressChoice } = this.props;    
    return(
      <ExamChoiceList
        question={question}
        onPressChoice={onPressChoice}
      />
    );
  }
  
  render(){
    return(
      <View style={{flex: 1, padding: 12}}>
        {this._renderTopQuestion  ()}
        {this._renderBottomChoices()}
      </View>
    );
  }
}

//shows a single question + title that can collapsed/expanded
export class Question extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),    
  }

  _onPress = (isCollapsed) => {
    this.animatedRootViewRef.pulse(750);
  }

  _renderQuestionHeader = () => {
    return(
      <IconText
        //icon
        iconName={'help-circle'}
        iconType={'feather'}
        iconColor={'grey'}
        iconSize={26}
        //title
        text={'Question'}
        textStyle={{fontSize: 28, fontWeight: '800'}}
      />
    );
  }

  _renderCollapsable(){
    return(
      <Animatable.View 
        ref={r => this.animatedRootViewRef = r}
        useNativeDriver={true}
        {...this.props}
      >
        <ExpandCollapseTextWithHeader
          collapsedNumberOfLines={4}
          style={{fontSize: 20, fontWeight: '300', textAlign: 'justify'}}
          text={this.props.question.question}
          titleComponent={this._renderQuestionHeader()}
          onPress={this._onPress}
        />
      </Animatable.View>
    );
  }

  _renderNormal(){ 
    return(
      <View collapsable={true}>
        {this._renderQuestionHeader()}
        <Text style={{fontSize: 22, fontWeight: '300', textAlign: 'justify'}}>
            {this.props.question.question}
        </Text>
      </View>
    );
  }

  render(){
    const { question } = this.props;
    //console.log('question.question.length: ' + question.question.length);
    const isTextLong = question.question.length > 140;
    return(
      isTextLong? this._renderCollapsable() : this._renderNormal()
    );
  }

}

//shows a explanation + title that can collapsed/expanded
export class Explanation extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),    
  }

  _onPress = (isCollapsed) => {
    this.animatedRootViewRef.pulse(750);
  }

  _renderQuestionHeader = () => {
    return(
      <IconText
        //icon
        iconName={'info'}
        iconType={'feather'}
        iconColor={'grey'}
        iconSize={26}
        //title
        text={'Explanation'}
        textStyle={{fontSize: 28, fontWeight: '800'}}
      />
    );
  }

  _renderCollapsable(){
    return(
      <Animatable.View 
        ref={r => this.animatedRootViewRef = r}
        useNativeDriver={true}
        {...this.props}
      >
        <ExpandCollapseTextWithHeader
          collapsedNumberOfLines={4}
          style={{fontSize: 20, fontWeight: '300', textAlign: 'justify'}}
          text={this.props.question.explanation}
          titleComponent={this._renderQuestionHeader()}
          onPress={this._onPress}
        />
      </Animatable.View>
    );
  }

  _renderNormal(){ 
    return(
      <View collapsable={true}>
        {this._renderQuestionHeader()}
        <Text style={{fontSize: 22, fontWeight: '300', textAlign: 'justify'}}>
            {this.props.question.explanation}
        </Text>
      </View>
    );
  }

  render(){
    const { question } = this.props;
    //console.log('question.question.length: ' + question.question.length);
    const isTextLong = question.explanation.length > 140;
    return(
      isTextLong? this._renderCollapsable() : this._renderNormal()
    );
  }

}

//shows the answer
export class Answer extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),    
  }

  constructor(props){
    super(props);
    this.DEBUG = false;
  }

  _renderCorrect(){
    const { question } = this.props;
    //possible prefixes
    const prefixes = [
      "Correct! the answer is: ",
      "You're right, the answer is: ",
      "Great job! the answer is: ",
      "Your answer is correct: ",
      "Perfect! The answer is: ",
      "You answered correctly: ",
      "Right! The answer is: ",
    ];
    //pick an index/prefix based on the indexid
    const index = returnToZero(question.indexID, prefixes.length-1);
    const prefix = prefixes[index];
    return (
      <Text style={{fontSize: 20, fontWeight: '300', textAlign: 'justify'}}>
        {prefix}<Text style={{fontWeight: 'bold', color: '#1B5E20', textDecorationLine: 'underline'}}>{question.answer}</Text>
      </Text>
    );
  };

  _renderWrong(){
    const { question } = this.props;
    //possible prefixes
    const prefixes = [
      "Nice try but the correct answer is: ",
      "You're wrong, the right answer is: ",
      "Keep trying! the correct answer is: ",
      "Sorry, the right answer: ",
      "Oops, the correct choice is: ",
      "Incorrect, the right answer is: ",
      "Wrong! The correct answer is: ",
      "Try again! The right choice is: ",
    ];
    //pick an index/prefix based on the indexid
    const index = returnToZero(question.indexID, prefixes.length-1);
    const prefix = prefixes[index];
    return (
      <Text style={{fontSize: 20, fontWeight: '300', textAlign: 'justify'}}>
        {prefix}<Text style={{fontWeight: 'bold', color: '#1B5E20', textDecorationLine: 'underline'}}>{question.answer}</Text> but you answered: <Text style={{fontWeight: 'bold', color: '#BF360C', textDecorationLine: 'underline'}}>{question.userAnswer}</Text>
      </Text>
    );
  }

  render(){
    const { question } = this.props;

    //check if the an
    let isCorrect = question.answer == question.userAnswer;
    if(question.userAnswer == null) isCorrect = true;

    return(
      <View collapsable={true}>
        <IconText
          //icon
          iconName={'check-circle'}
          iconType={'feather'}
          iconColor={'grey'}
          iconSize={26}
          //title
          text={'Answer'}
          textStyle={{fontSize: 28, fontWeight: '800'}}
        />
          {isCorrect? this._renderCorrect() : this._renderWrong()}
      </View>
    );
  }
}

//shows a question, ans + explanation
export class QuestionExplanation extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),    
  }

  render(){
    return(
      <ScrollView style={{flex: 1, padding: 15}}>
        <Question question={this.props.question}/>
        <Divider style={{marginVertical: 13, marginHorizontal: 15}}/>
        <Answer question={this.props.question}/>
        <Divider style={{marginVertical: 13, marginHorizontal: 15}}/>
        <Explanation question={this.props.question}/>
      </ScrollView>
    );
  }
}

export class PracticeQuestion extends React.PureComponent {
  static propTypes = {
    //whether the question is the last one
    isLast: PropTypes.bool,
    question: PropTypes.shape(questionShape),
    questionNumber: PropTypes.number,
    //called when the next question is pressed in the back explantion
    onPressNextQuestion: PropTypes.func,
    //called when there are no more questions to add
    onEndReached: PropTypes.func,
    //called when a choice is pressed
    onAnswerSelected: PropTypes.func
  }

  constructor(props){
    super(props);
    //check if question is answered
    let hasAnswer = props.question.userAnswer != null;
    this.state = {
      isExplanationOnly: hasAnswer,
      disableTouch: false,
      userAnswer: null ,
    };
  }

  _handleOnPressChoices = async (choice, key) => {
    const { question, questionNumber, onAnswerSelected } = this.props;
    //check if user's ans is correct
    const isCorrect = choice == question.answer;
    //call the callback prop
    onAnswerSelected && onAnswerSelected(question, questionNumber, choice, isCorrect);
    //update userAns state + disable touch while animating
    await setStateAsync(this, {
      userAnswer  : choice,
      disableTouch: true  ,
    });
    //animate check animation if correct
    if(isCorrect){
      //fade in white overlay + check animation + pulse forward
      await Promise.all([
        this.animiatedFrontOverlay.fadeIn(500),
        this.animatedContainer.pulse(750),
        this.animatedCheck.start(),
      ]);
    } else {
      //shake the root view
      await this.animatedContainer.shake(750);
    }
    //flip and show explanation
    await this.questionFlipView.flipCard();
    //enable touch
    await setStateAsync(this, {disableTouch: false});
  }

  _handleOnPressNextQuestion = async () => {
    //call callback prop
    this.props.onPressNextQuestion();
    //hide flipper after trans
    await this.nextButtonContainer.fadeOut(750);
    await setStateAsync(this, {isExplanationOnly: true});
  }

  _handleOnPressLast = () => {
    this.props.onEndReached();
  }
  
  //renders a checkmark animation + trans white overlay
  _renderFrontOverlay = () => {
    return(
      <Animatable.View 
        style={{backgroundColor: 'rgba(250, 250, 250, 0.5)', position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', opacity: 0}}
        ref={r => this.animiatedFrontOverlay = r}
        useNativeDriver={true}
        pointerEvents={'none'}
      >
        <CheckAnimation ref={r => this.animatedCheck = r} />
      </Animatable.View>
    );
  }
  
  //renders the front question + choices
  _renderFrontQuestion = () => {
    return(
      <View style={{flex: 1}}>
        <ExamQuestion
          onPressChoice={this._handleOnPressChoices}
          question={this.props.question}
        />
        {this._renderFrontOverlay()}
      </View>
    );
  }

  _renderBackExplaination = () => {
    const { isExplanationOnly, userAnswer } = this.state;
    const { isLast, question } = this.props;

    const question_withUserAnswer = {
      ...question,
      userAnswer: userAnswer
    }
    
    const shouldShowNextButton = !isExplanationOnly && !isLast;
    return(
      <View 
        style={isExplanationOnly? [styles.questionCard, styles.shadow, {flex: 1, overflow: 'visible'}] : {flex: 1}}
        collapsable={true}
      >
        <QuestionExplanation
          question={userAnswer == null? question : question_withUserAnswer}
          onPressNextQuestion={this._handleOnPressNextQuestion}
        />
        <Animatable.View
          ref={r => this.nextButtonContainer = r}
          useNativeDriver={true}
        >
          {shouldShowNextButton && <Button
            text={'Next Question'}
            style={{backgroundColor: '#6200EA', margin: 10}}
            iconName={'pencil-square-o'}
            iconType={'font-awesome'}
            iconSize={22}
            iconColor={'white'}
            onPress={this._handleOnPressNextQuestion}
          />}
          {isLast && <Button
            text={'Finish Exam'}
            style={{backgroundColor: '#6200EA', margin: 10}}
            iconName={'check'}
            iconType={'font-awesome'}
            iconSize={22}
            iconColor={'white'}
            onPress={this._handleOnPressLast}
          />}
        </Animatable.View>
      </View>
    );
  }

  _renderFlipper = () => {
    const { disableTouch } = this.state;
    return(
      <Animatable.View 
        style={{flex: 1}}
        ref={r => this.animatedContainer = r}
        useNativeDriver={true}
        pointerEvents={disableTouch? 'none' : 'auto'}
      >
        <FlipView 
          ref={r => this.questionFlipView = r}
          containerStyle={[{flex: 1}, styles.shadow]}
          frontComponent={this._renderFrontQuestion()}
          frontContainerStyle={styles.questionCard}
          backComponent={this._renderBackExplaination()}
          backContainerStyle={styles.questionCard}
        />
      </Animatable.View>
    );
  }

  render(){
    const { isExplanationOnly } = this.state;
    return(
      isExplanationOnly? this._renderBackExplaination() : this._renderFlipper()
    );
  }
}

export class PracticeExamList extends React.Component {
  static propTypes = {
    questions: PropTypes.array,
    onEndReached: PropTypes.func,
    moduleData: PropTypes.object,
    subjectData: PropTypes.object,
  }

  constructor(props){
    super(props);
    this.DEBUG = false;
    this.state = {
      //true when read/writng to storage
      loading: true,
      //list of all the questions in an subject
      questions: [],
      //list of questions to show in the UI
      questionList: [],
      //current question index
      currentIndex: 0,
    }

    //extract id's from the current subject and modules
    const indexID_module  = props.moduleData.indexid ;
    const indexID_subject = props.subjectData.indexid;
    //set ID's
    this.gradeItem = new GradeItem(indexID_module, indexID_subject);

    if(this.DEBUG && false){
      console.log('\n\n\nConstructor - PracticeExamList State:');
      console.log(this.state);
      console.log('\nProps - ModuleData');
      console.log(this.props.moduleData);
      console.log('\nProps - SubjectData');
      console.log(this.props.subjectData);
    }
  }

  async componentWillMount(){
    const { moduleData, subjectData } = this.props;
    //extract id's from the current subject and modules
    const indexID_module  = moduleData.indexid ;
    const indexID_subject = subjectData.indexid;
  
    await setStateAsync(this, {loading: true});
    //get questions from props
    const questions = this.getQuestions();
    //read grades from storage
    let grades_from_store = await GradeStore.getGrades();
    if(grades_from_store != null){
      //find the answers that corresponds to the subject
      let match = grades_from_store.find((grade_item) => {
        if(this.DEBUG){
          console.log('\n\n\nGrades ID from store:');
          console.log('indexID_module : ' + grade_item.indexID_module );
          console.log('indexID_subject: ' + grade_item.indexID_subject);
          console.log('\nCurrent ID:' );
          console.log('indexID_module : ' + indexID_module );
          console.log('indexID_subject: ' + indexID_subject);
        }
        return grade_item.indexID_module == indexID_module && grade_item.indexID_subject == indexID_subject
      });
      
      if(this.DEBUG){
        console.log('\n\nMatching gradeItem from grade store: ');
        console.log(match);
      }

      if(match != null){
        if(this.DEBUG) console.log('Found Match: setting grade item...');
        this.gradeItem.setGrade(match);
      }
    } 
    
    let answered_questions = [];
    let current_index = 0;

    if(this.DEBUG){
      console.log('\nthis.gradeItem');
      console.log(this.gradeItem.getGrade());
    } 
    
    //no questions have been answered yet
    if(this.gradeItem.getAnswersLength() == 0){
      //add the first item in the question array
      answered_questions.push(questions[0]);

    } else {
      //get the answered questions
      answered_questions = this.gradeItem.getAnswers().map((answer_item, index) => {
        //find the matching question item
        let matching_question = questions.find((question) => question.indexID == answer_item.indexID_question);
        return {
          ...matching_question,
          userAnswer: answer_item.answer,
        }
      });
      let last_answer = answered_questions.slice().pop();
      let last_index  = last_answer.indexID;

      current_index = last_index;
      
      let total_questions = subjectData.questions.length - 1;

      if(current_index < total_questions){
        current_index += 1;
        answered_questions.push(questions[current_index]);
      }


    }

    this.setState({
      loading: false,
      questionList: answered_questions,
      questions: questions,
      currentIndex: current_index,
    });
  }

  getQuestions(){
    //add properties to question item
    let questions = this.props.questions.map((item, index) => {
      return {
        ...item,
        userAnswer: null,
        indexID: index,
      }
    });

    return _.compact(questions);
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
    if(this.DEBUG){
      console.log('\n\n\n\n_onAnswerSelected: ');
      console.log('questionIndex: ' + questionIndex);
      console.log('answer: ' + answer);
      console.log('isCorrect: ' + isCorrect);
    }
    this.gradeItem.addAnswer(questionIndex, answer, isCorrect);
    let current_grade = this.gradeItem.getGrade();
    
    GradeStore.addGrade(current_grade);
  }
  
  _renderItem = ({item, index}) => {
    const isLast = index == this.state.questions.length - 1;
    return (
      <PracticeQuestion
        question={item}
        questionNumber={index}
        isLast={isLast}
        onPressNextQuestion={this._onPressNextQuestion}
        onEndReached={this.props.onEndReached}
        onAnswerSelected={this._onAnswerSelected}
      />
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

    if(this.DEBUG && false){
      console.log('\n\Rendering PracticeExamList... STATE:');
      console.log(this.state);
    }

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


const styles = StyleSheet.create({
  questionCard: {
    flex: 1,
    backgroundColor: 'white', 
    marginBottom: 15, 
    marginHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  shadow: {
    shadowOffset:{  width: 3,  height: 5,  },
    shadowColor: 'black',
    shadowRadius: 6,
    shadowOpacity: 0.6,
  },
});