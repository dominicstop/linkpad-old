import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import PropTypes from 'prop-types';

import { setStateAsync, shuffleArray , returnToZero, getLast, getFirst} from '../functions/Utils';
import IncompletePracticeExamStore, { IncompletePracticeExamModel } from '../functions/IncompletePracticeExamStore';


import { Button, ExpandCollapseTextWithHeader, AnimatedCollapsable } from './Buttons';
import { FlipView, IconText } from './Views';

import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import    { Header   } from 'react-navigation';
import    { Divider  } from 'react-native-elements';

import { DangerZone } from 'expo';
import _ from 'lodash';
import {STYLES} from '../Constants';
import { SubjectItem, ModuleItemModel, QuestionItem } from '../functions/ModuleStore';
const { Lottie } = DangerZone;

const questionShape = {
  question: PropTypes.string,
  answer  : PropTypes.string,
  choices : PropTypes.array ,
  //used for keeping track of ans, score etc.
  userAnswer: PropTypes.string,
};

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

  _renderHeader(){
    return(
      <IconText
        //icon
        iconName={'help-circle'}
        iconType={'feather'}
        iconColor={'grey'}
        iconSize={26}
        //title
        text={'Question'}
        textStyle={sharedStyles.headerTitle}
      />
    );
  };

  render(){
    //wrap question inside model
    const model = new QuestionItem(this.props.question);
    const { question } = model.get();

    return(
      <AnimatedCollapsable
        extraAnimation={true}
        text={question}
        maxChar={140}
        collapsedNumberOfLines={4}
        titleComponent={this._renderHeader()}
        style={sharedStyles.body}
      />
    );
  };
};

//shows a explanation + title that can collapsed/expanded
export class Explanation extends React.PureComponent {
  static propTypes = {
    question: PropTypes.object,    
  };

  _renderHeader(){
    return(
      <IconText
        //icon
        iconName={'info'}
        iconType={'feather'}
        iconColor={'grey'}
        iconSize={26}
        //title
        text={'Explanation'}
        textStyle={sharedStyles.headerTitle}
      />
    );
  };

  render(){
    const { question } = this.props;

    //wrap question inside model
    const model = new QuestionItem(question);
    const { explanation } = model.get();

    return(
      <AnimatedCollapsable
        extraAnimation={true}
        text={explanation}
        maxChar={140}
        collapsedNumberOfLines={4}
        titleComponent={this._renderHeader()}
        style={sharedStyles.body}
      />
    );
  };
};

//shows the answer and user_answer
export class Answer extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),    
  };

  static prefixCorrect = shuffleArray([
    "Yup! The answer is ",
    "Right! The answer is ",
    "Correct! the answer is ",
    "Your answer is correct ",
    "Perfect! The answer is ",
    "You answered correctly ",
    "Great job! the answer is ",
    "You're right, the answer is ",
  ]);

  static prefixWrong = shuffleArray([
    "Sorry, the right answer is ",
    "Oops, the correct choice is ",
    "Wrong! The correct answer is ",
    "Try again! The right choice is ",
    "Incorrect, the right answer is ",
    "You're wrong, the right answer is ",
    "Keep trying! the correct answer is ",
    "Nice try but the correct answer is ",
  ]);

  static styles = StyleSheet.create({
    text: {
      fontSize: 20, 
      fontWeight: '300', 
      textAlign: 'justify'
    },
    correct: {
      fontWeight: 'bold', 
      color: '#1B5E20', 
      textDecorationLine: 'underline'
    },
    wrong: {
      fontWeight: 'bold', 
      color: '#BF360C', 
      textDecorationLine: 'underline'
    },
  });

  constructor(props){
    super(props);
  };

  _renderCorrect(){
    //extract static properties
    const { prefixCorrect, styles } = Answer;
    const { question } = this.props;

    //wrap question in model
    const model = new QuestionItem(question);
    //unwrap question data
    const { indexID_question, answer } = model.get();

    //pick an index/prefix based on the indexid
    const index  = returnToZero(indexID_question, (prefixCorrect.length - 1));
    const prefix = prefixCorrect[index];

    return (
      <Text style={styles.text}>
        {prefix}
        <Text style={styles.correct}>
          {answer}
        </Text>
      </Text>
    );
  };

  _renderWrong(){
    //extract static properties
    const { prefixWrong, styles } = Answer;
    const { question } = this.props;

    //wrap question in model
    const model = new QuestionItem(question);
    //unwrap question data
    const { indexID_question, answer, user_answer } = model.get();

    //pick an index/prefix based on the indexid
    const index  = returnToZero(indexID_question, (prefixWrong.length - 1));
    const prefix = prefixWrong[index];

    return (
      <Text style={styles.text}>
        {prefix}
        <Text style={styles.correct}>
          {answer}
        </Text> 
        {' but you answered '}
        <Text style={styles.wrong}>
          {user_answer}
        </Text>
        {'.'}
      </Text>
    );
  };

  _renderHeader(){
    return(
      <IconText
        //icon
        iconName={'check-circle'}
        iconType={'feather'}
        iconColor={'grey'}
        iconSize={26}
        //title
        text={'Answer'}
        textStyle={sharedStyles.headerTitle}
      />
    );
  };

  render(){
    const { question } = this.props;

    //wrap question in model
    const model = new QuestionItem(question);
    const isCorrect = model.isCorrect();

    return(
      <View collapsable={true}>
        {this._renderHeader()}
        {isCorrect? this._renderCorrect() : this._renderWrong()}
      </View>
    );
  }
}

//shows a question, answer + explanation
export class QuestionExplanation extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),    
  };

  static styles = StyleSheet.create({
    scrollview: {
      flex: 1, 
      padding: 15
    },
    seperator: {
      marginVertical: 13, 
      marginHorizontal: 15
    }
  });

  render(){
    const { styles } = QuestionExplanation;
    const { question } = this.props;

    return (
      <ScrollView style={styles.scrollview}>
        <Question {...{question}}/>
        <Divider style={styles.seperator}/>

        <Answer {...{question}}/>
        <Divider style={styles.seperator}/>

        <Explanation {...{question}}/>
      </ScrollView>
    );
  };
};

export class PracticeQuestion extends React.Component {
  static propTypes = {
    isLast        : PropTypes.bool  ,
    question      : PropTypes.object,
    questionNumber: PropTypes.number,
    //callback functions
    onEndReached       : PropTypes.func, //called when there are no more questions to add
    onAnswerSelected   : PropTypes.func, //called when a choice is pressed
    onPressNextQuestion: PropTypes.func, //called when the next question is pressed in the back explantion
  };

  static styles = StyleSheet.create({

  });

  constructor(props){
    super(props);

    //wrap question inside model
    const model = new QuestionItem(props.question);
    const { user_answer } = model.get();
    
    this.state = {
      user_answer,
      showBackCard: model.isAnswered(),
      disableTouch: false,
    };
  };

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
    const { onPressNextQuestion } = this.props;

    //call callback
    onPressNextQuestion && onPressNextQuestion();

    //hide flipper after trans
    await this.nextButtonContainer.fadeOut(750);
    this.setState({showBackCard: true});
  };

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

  _renderButtons(){
    const { showBackCard } = this.state;
    const { isLast } = this.props;
    
    const showNextButton = !showBackCard && !isLast;
    return(
      <Animatable.View
        ref={r => this.nextButtonContainer = r}
        useNativeDriver={true}
      >
        {showNextButton && <Button
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
    );
  };

  _renderBackExplaination = () => {
    const { showBackCard, userAnswer } = this.state;
    const { question } = this.props;

    const style = showBackCard? [sharedStyles.questionCard, sharedStyles.shadow, {flex: 1, overflow: 'visible'}] : {flex: 1};
    
    return(
      <View {...{style}} collapsable={true}>
        <QuestionExplanation
          onPressNextQuestion={this._handleOnPressNextQuestion}
          {...{question}}
        />
        {this._renderButtons()}
      </View>
    );
  };

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
          containerStyle={[{flex: 1}, sharedStyles.shadow]}
          frontComponent={this._renderFrontQuestion()}
          frontContainerStyle={sharedStyles.questionCard}
          backComponent={this._renderBackExplaination()}
          backContainerStyle={sharedStyles.questionCard}
        />
      </Animatable.View>
    );
  }

  render(){
    const { showBackCard } = this.state;

    return(
      showBackCard? this._renderBackExplaination() : this._renderFlipper()
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
      loading: true,
      //array of questions to show in the UI
      list     : [],
      answers  : [],
      questions: [],
      //determines which current question to show
      currentIndex: 0,
    };

    this.initializeModels();
  };

  initializeModels(){
    const { moduleData, subjectData } = this.props;

    //wrap data inside models and set as property
    this.moduleModel  = new ModuleItemModel(moduleData );
    this.subjectModel = new SubjectItem    (subjectData);
  };

  async initlializeList(){
    let store = await IncompletePracticeExamStore.get();
    console.log(store);

    //get prev. answered questions
    let {questions, answers} = await this.getQuestionsFromStore();

    let list  = [];
    list = list.concat(answers);
    
    let first = getFirst(questions);
    first && list.push(first);

    let currentIndex = list.length - 1;
    if(currentIndex < 0){
      currentIndex = 0;
    };

    this.setState({questions, answers, list, currentIndex});
  };

  async getQuestionsFromStore(){
    //init. variables
    let match      = null ;
    let hasMatch   = false;
    let hasAnswers = false;

    //init. return values
    let questions = [];
    let answers   = [];

    //read from store
    let storeModel = await IncompletePracticeExamStore.getAsModel();
    
    //when store is not empty
    if(storeModel != null){
      //extract index id's
      const { indexID_module, indexID_subject } = this.subjectModel.getIndexIDs();

      //check if subject has been partially answered
      match = storeModel.findMatchFromIDsAsModel({indexID_module, indexID_subject });
      hasMatch = match != undefined;
      
      //check if match has answers
      match && (hasAnswers = !match.isAnswersEmpty());
    };

    //if at least one question is answered
    if(hasMatch && hasAnswers){
      //append the answers from match to subject
      match.appendAnswersToSubject(this.subjectModel);

      //get questions
      let answered   = this.subjectModel.getAnsweredQuestions  ();
      let unanswered = this.subjectModel.getUnansweredQuestions();

      //update variables
      answers   = answers  .concat(answered  );
      questions = questions.concat(unanswered);

    } else {
      //no question has been answered yet
      let unanswered = this.subjectModel.getUnansweredQuestions();

      //update variable
      questions = questions.concat(unanswered);
    };

    return {questions, answers};
  };

  async componentDidMount(){
    await this.initlializeList();

    //get next question
    //this.nextQuestion();
    this.setState({loading: false});
  };

  //adds a new question at the end
  async nextQuestion(){
    const { questions, answers, list, currentIndex } = this.state;
    
    let last = getLast(list);
    last && answers.push(last);
    
    let next = questions.shift();
    next && list.push(next);
    
    this.setState({questions, answers, list});

    //show new question
    const { _carousel } = this;
    _carousel && this._carousel.snapToNext();
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
    const {} = this.props;
    const isLast = index == this.subjectModel.getQuestionLength() - 1;
    //console.log(item);
    return (
      <PracticeQuestion
        question={item}
        questionNumber={index}
        onPressNextQuestion={this._onPressNextQuestion}
        onEndReached={this.props.onEndReached}
        onAnswerSelected={this._onAnswerSelected}
        {...{isLast}}
      />
    );
  };

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
        ref={r => this._carousel = r }
        data={this.state.list}
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

const sharedStyles = StyleSheet.create({
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

  headerTitle: {
    fontSize: 28, 
    fontWeight: '800'
  },
  body: {
    fontSize: 20, 
    fontWeight: '300', 
    textAlign: 'justify'
  }
});