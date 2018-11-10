import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import PropTypes from 'prop-types';

import { setStateAsync, timeout, shuffleArray, randomElementFromArray , returnToZero} from '../functions/Utils';
import IncompletePracticeExamStore, { IncompletePracticeExamModel } from '../functions/IncompletePracticeExamStore';


import { Button, ExpandCollapseTextWithHeader } from './Buttons';
import { FlipView, IconText } from './Views';

import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import    { Header   } from 'react-navigation';
import    { Divider  } from 'react-native-elements';

import { DangerZone } from 'expo';
import _ from 'lodash';
import {STYLES} from '../Constants';
import {SubjectItem, ModuleItemModel} from '../functions/ModuleStore';
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

class Grade {
  constructor(totalItems = 0, correctItems = 0, incorrectItems = 0){
    this.grade = {
      timestamp      : this.getTimestamp(),
      percentage     : (correctItems / totalItems) * 100,
      unansweredItems: (correctItems + incorrectItems) - totalItems,
      ...{totalItems, correctItems, incorrectItems}, 
    }
  }
  
  getTimestamp = () => {
    const dateTime  = new Date().getTime();
    return Math.floor(dateTime / 1000);
  }

  getGrade = () => {
    return this.grade;
  }
}

//
class IncompletePracticeExams {
  constructor(indexID_module = 0, indexID_subject = 0, totalItems = 0){
    this.DEBUG = false;
    //this is where IPE's are stored
    this.items = {
      //used for identifying
      ...{indexID_module, indexID_subject, totalItems},
      //dates
      timestamp_started: this.getTimestamp(),
      timestamp_ended  : '',
      //array of ans to question
      answers: []
    };

    //debug: print items
    if(this.DEBUG){
      console.log('\n+++++++++++++++++++++++++++++START');
      console.log('New IncompletePracticeExams Created:');
      console.log(this.items);
      console.log('+++++++++++++++++++++++++++++++++END');
    }
  }

  //returns the current timestamp
  getTimestamp = () => {
    const dateTime  = new Date().getTime();
    return Math.floor(dateTime / 1000);
  }

  //setter and getters
  getItems = () => _.cloneDeep(this.items);
  
  setItems = (new_item) => {
    this.items = new_item;
    if(this.DEBUG){
      console.log('\n##########START');
      console.log('Set Grades with: ');
      console.log(new_item);
      console.log('##############END');
    }
  };

  getAnswers = () => this.items.answers;
  setTimestamp_ended = () => this.items.timestamp_ended = this.getTimestamp();
  getLastAnswer = () => this.getItems().answers.pop();
  getAnswersLength = () => this.items["answers"].length;
  
  //return questions with the corresponding userAnswers from iPE
  mergeAnswersWithQuestions = (questions) => {
    //get the answers from the iPE items
    const answers_iPE = this.getAnswers();
    //return an array of questions merged with the matching answer from iPE
    return answers_iPE.map((answer_item, index) => {
      //find the matching question item
      let matching_question = questions.find((question) => question.indexID == answer_item.indexID_question);
      return {
        //append the question item
        ...matching_question,
        //insert the answers from the iPE
        userAnswer: answer_item.answer,
      }
    });
  }

  //add an answer
  addAnswer = (indexID = 0, answer = '', isCorrect = false) => {
    //create an answer object
    let new_answer = {
      indexID_question: indexID,
      //add a timestamp
      timestamp: this.getTimestamp(),
      //append data
      answer, isCorrect,
    };

    //append to answers
    this.items.answers.push(new_answer);
    //debug: print answers and new_answer
    if(this.DEBUG){
      console.log('\n^^^^^^^^^^^START');
      console.log('New Answer Added: ');
      console.log(new_answer          );
      console.log('Current Answeres: ');
      console.log(this.items.answers  );
      console.log('^^^^^^^^^^^^^^^END');
    }

    //return created answer obj
    return new_answer;
  }

  //compute grade
  getGrade = () => {
    let correct = 0, wrong = 0;
    //count correct and wrong
    this.getAnswers.forEach((item) => {
      //increment counters
      item.isCorrect? correct++ : wrong++;
    });
    //compute grade
    const grade = new Grade(this.items.totalItems, correct, wrong);
    return grade.getGrade();
  };
}

class PracticeExamGrade {
  constructor(indexID_module = 0, indexID_subject = 0){
    this.grade = {
      ...{indexID_module, indexID_subject},
      grades: [],
    }
  };

  getTimestamp = () => {
    const dateTime  = new Date().getTime();
    return Math.floor(dateTime / 1000);
  }

  addGrade = (totalItems = 0, correctItems = 0) => {
    const gradeItem = {
      timestamp: this.getTimestamp(),
      percentage: (correctItems / totalItems) * 100,
      ...{totalItems, correctItems} 
    };
    this.grade.grades.push();
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
        {prefix}
        <Text style={[{fontWeight: 'bold', color: '#1B5E20', textDecorationLine: 'underline'}]}>
          {question.answer}
        </Text>
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
        {prefix}
        <Text style={{fontWeight: 'bold', color: '#1B5E20', textDecorationLine: 'underline'}}>
          {question.answer}
        </Text> 
        {' but you answered: '}
        <Text style={{fontWeight: 'bold', color: '#BF360C', textDecorationLine: 'underline'}}>
          {question.userAnswer}
        </Text>
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
    moduleData : PropTypes.object,
    subjectData: PropTypes.object,
    //callbacks
    onEndReached: PropTypes.func,
  }

  constructor(props){
    super(props);
    
    this.state = {
      //true when read/writng to storage
      loading: true,
      //list of all the questions in an subject
      questions: [],
      //list of questions to show in the UI
      questionList: [],
      //determines which question to show
      currentIndex: 0,
    };

    this.initializeModels();
  };

  initializeModels(){
    const { moduleData, subjectData } = this.props;

    //wrap data inside models
    let moduleModel  = new ModuleItemModel(moduleData );
    let subjectModel = new SubjectItem    (subjectData);
    //extract indexid from subjectdata
    const { indexid } = subjectModel.get();

    //set models as properties 
    this.moduleModel  = moduleModel;
    this.subjectModel = moduleModel.getSubjectByID(indexid);
  };

  async componentDidMount(){
    const { subjectModel } = this;

    let iPE_model = subjectModel.getIncompletePracticeExamModel();
    

    let newItem = new IncompletePracticeExamModel({
      indexID_module : 11,
      indexID_subject: 11,
      answers: [],
      timestamp_ended: 9900,
      timestamp_started: 9090,
    });
    
    await IncompletePracticeExamStore.add(iPE_model);
    await IncompletePracticeExamStore.add(newItem);

    let model = await IncompletePracticeExamStore.getAsModel();
    console.log(model.get());
    
  };

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
    this.incompletePE.addAnswer(questionIndex, answer, isCorrect);
    let current_grade = this.incompletePE.getItems();
    
    IncompletePracticeExamStore.add(current_grade);
  }
  
  _renderItem = ({item, index}) => {
    return(
      <View style={{backgroundColor: 'red', height: '50%', width: '50%'}}>
        <Text>Item</Text>
      </View>
    );

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