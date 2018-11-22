import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, StatusBar, Platform } from 'react-native';
import PropTypes from 'prop-types';

import { setStateAsync, shuffleArray , returnToZero, getLast, getFirst, getLetter, isValidTimestamp, timeout} from '../functions/Utils';
import IncompletePracticeExamStore, { IncompletePracticeExamModel } from '../functions/IncompletePracticeExamStore';


import { Button, ExpandCollapseTextWithHeader, AnimatedCollapsable } from './Buttons';
import { FlipView, IconText } from './Views';

import * as Animatable from 'react-native-animatable';
import      TimeAgo    from 'react-native-timeago';
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
  };
  
  constructor(props){
    super(props);
    this.animatedValue = new Animated.Value(0);
    this.state = {
      source: require('../animations/checked_done_.json'),
      mountAnimation: false,
    };
  };

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
};

//shows a single exam choice
export class ExamChoice extends React.PureComponent {
  static propTypes = {
    choiceKey : PropTypes.string.isRequired,
    choiceText: PropTypes.string.isRequired,
    answer    : PropTypes.string.isRequired,
    //callback
    onPress: PropTypes.func.isRequired,
    //misc props
    question: PropTypes.object, 
    style   : ViewPropTypes.style,
  };

  static styles = StyleSheet.create({
    button: {
      minHeight: 50,
      flexDirection: 'row', 
      alignItems: 'center',
      borderRadius: 8,
      ...Platform.select({
        ios: {
          overflow: 'hidden'
        },
        android: {
          overflow: 'visible'
        }
      })
    }
  });

  constructor(props){
    super(props);
    this.animatedValue = new Animated.Value(0);
    //wrap question in model
    this.model = new QuestionItem(props.question);

    this.state = {
      backgroundColor: 'rgb(98, 0, 234)',
    };
  };

  animateColor = () => {
    Animated.timing(this.animatedValue, {
      toValue : 1,
      duration: 500,
      useNativeDriver: true,
    }).start(this._onFinishAnimation);

    if(Platform.OS == 'android'){
      this.setState({
        backgroundColor: 'rgb(237, 45, 113)'
      });
    };
  };

  _onFinishAnimation = () => {

  };

  _onPressChoice = () => {
    const { model } = this;
    const { onPress, choiceText, choiceKey} = this.props;

    //set answer on model
    model.setUserAnswer(choiceText);
    model.setAnswerTimestamp();
    const isCorrect = model.isCorrect();

    onPress && onPress(model.get());
    if(!isCorrect) this.animateColor();
  };
  
  render(){
    const { styles } = ExamChoice;
    const { backgroundColor } = this.state;
    const { choiceText, choiceKey, style } = this.props;

    //TODO: move to styles
    const colorOverlayStyle = {
      paddingVertical: 10,
      position: 'absolute', 
      backgroundColor: 'rgb(237, 45, 113)',
      height: '100%',
      width : '100%',
      borderRadius: 8,
      opacity: this.animatedValue,
    };

    return(
      <TouchableOpacity
        style={[{backgroundColor}, styles.button, style]}
        onPress={this._onPressChoice}
        activeOpacity={0.7}
      >
        <Animated.View style={colorOverlayStyle}/>
        <Text style={{fontSize: 18, marginHorizontal: 15, color: 'white', fontWeight: '900', width: 15,}}>{choiceKey }</Text>
        <Text style={{fontSize: 18, color: 'white', fontWeight: '500', flex: 1}}>{choiceText}</Text>
      </TouchableOpacity>
    );
  };
};

//shows a list of choices
export class ExamChoiceList extends React.Component {
  static propTypes = {
    question     : PropTypes.object, 
    onPressChoice: PropTypes.func,
  };

  constructor(props){
    super(props);
  };

  shouldComponentUpdate(nextProps, nextState){
    //temp. fix for choicelist reshuffling on props change
    return false;
  };

  _renderChoices = () => {
    const { question, onPressChoice } = this.props;

    //wrap question in model
    const model = new QuestionItem(question);
    const { answer } = model.get();

    //get choices combined w/ answer
    const choices = model.getChoices();
    //returns a copy of shuffled choices
    const shuffledChoices = shuffleArray(choices);

    //render choices
    return shuffledChoices.map((choiceText, index) => {
      const choiceKey = getLetter(index);
      const key = `${index}-${choiceText}`;

      return (
        <ExamChoice
          style={{marginTop: 8}}
          onPress={onPressChoice}
          //spread and pass down props
          {...{choiceKey, choiceText, answer, key, question}}
      />);
    });
  };
  
  render(){
    return (
      <View>
        {this._renderChoices()}
      </View>
    );
  }
};

//shows a question and a list of choices
export class ExamQuestion extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),
    onPressChoice: PropTypes.func,
  };

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
  };

  _renderBottomChoices(){
    const { question, onPressChoice } = this.props;    
    return(
      <ExamChoiceList
        question={question}
        {...{onPressChoice}}
      />
    );
  };
  
  render(){
    return(
      <View style={{flex: 1, padding: 12}}>
        {this._renderTopQuestion  ()}
        {this._renderBottomChoices()}
      </View>
    );
  };
};

//shows a single question + title that can collapsed/expanded
export class Question extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),    
  };

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

    const extraAnimation = Platform.select({
      ios    : true ,
      android: false,
    });

    return(
      <AnimatedCollapsable
        text={question}
        maxChar={140}
        collapsedNumberOfLines={5}
        titleComponent={this._renderHeader()}
        style={sharedStyles.body}
        {...{extraAnimation}}
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

    const extraAnimation = Platform.select({
      ios    : true ,
      android: false,
    });
     
    //wrap question inside model
    const model = new QuestionItem(question);
    const { explanation } = model.get();

    return(
      <AnimatedCollapsable
        text={explanation}
        maxChar={140}
        collapsedNumberOfLines={4}
        titleComponent={this._renderHeader()}
        style={sharedStyles.body}
        {...{extraAnimation}}
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
    "Your answer is correct: ",
    "Perfect! The answer is ",
    "You answered correctly: ",
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
    textTime: {
      fontSize: 18,
      fontWeight: '200',
      marginBottom: 7,
      textDecorationLine: 'underline',
      textDecorationColor: '#9b9b9b',
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

  _renderDate(){
    const { styles   } = Answer;
    const { question } = this.props;

    //wrap question inside model
    const model = new QuestionItem(question);
    const { timestamp_answered } = model.get();
    
    //check if timestamp is valid
    const isValid = isValidTimestamp(timestamp_answered);
    //dont show if timestamp invalid
    if(!isValid) return null;
    //convert seconds to ms
    const time = timestamp_answered * 1000;

    return(
      <Text style={styles.textTime}>
        {'Answered '}<TimeAgo {...{time}}/>
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
        {this._renderDate  ()}
        {isCorrect? this._renderCorrect() : this._renderWrong()}
      </View>
    );
  };
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
    isLast   : PropTypes.bool ,
    question: PropTypes.object,
    index   : PropTypes.number,
    //callback functions
    onEndReached       : PropTypes.func, //called when there are no more questions to add
    onAnswerSelected   : PropTypes.func, //called when a choice is pressed
    onPressNextQuestion: PropTypes.func, //called when the next question is pressed in the back explantion
  };

  static styles = StyleSheet.create({
    rootContainer: {
      height: '100%', 
      width: '100%',
    },
  });

  constructor(props){
    super(props);
    //wrap questions in model
    const model = new QuestionItem(props.question);
    
    this.state = {
      question: props.question,
      showBackCard: model.isAnswered(),
      disableTouch: false,
    };
  };

  _handleOnPressChoices = async (question) => {
    const { onAnswerSelected, index } = this.props;

    //wrap question in model
    const model = new QuestionItem(question);
    //check if user's ans is correct
    const isCorrect = model.isCorrect();

    //update question, disable touch while animating
    await setStateAsync(this, {
      question,
      disableTouch: true,
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
    };

    //flip and show explanation
    await this.questionFlipView.flipCard();
    //enable touch
    await setStateAsync(this, {disableTouch: false});

    //call the callback prop
    onAnswerSelected && onAnswerSelected(question, index);
  };

  _handleOnPressNextQuestion = async () => {
    const { onPressNextQuestion, index } = this.props;

    //call callback
    onPressNextQuestion && onPressNextQuestion(index);

    //hide flipper after trans
    await this.nextButtonContainer.fadeOut(750);
    this.setState({showBackCard: true});
  };

  _handleOnPressLast = async () => {
    await this.nextButtonContainer.fadeOut(300);
    this.props.onEndReached();
  };
  
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
    const { question } = this.state;

    return(
      <View style={{flex: 1}}>
        <ExamQuestion
          onPressChoice={this._handleOnPressChoices}
          {...{question}}
        />
        {this._renderFrontOverlay()}
      </View>
    );
  };

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
    const { showBackCard, question } = this.state;

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
    const { styles } = PracticeQuestion;
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
  };

  render(){
    const { styles } = PracticeQuestion;
    const { showBackCard } = this.state;

    return(
      <View style={styles.rootContainer}>
        {showBackCard? this._renderBackExplaination() : this._renderFlipper()}
      </View>
    );
  };
};

export class PracticeExamList extends React.Component {
  static propTypes = {
    moduleData : PropTypes.object,
    subjectData: PropTypes.object,
    //callbacks
    onEndReached: PropTypes.func,
    onListInit  : PropTypes.func,
    onNextItem  : PropTypes.func,
  };

  constructor(props){
    super(props);
    
    this.state = {
      loading: true,
      scrollEnabled: true,
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
    //generate iPE model for storing the answers
    this.practiceExamModel = this.subjectModel.getIncompletePracticeExamModel();
    this.practiceExamModel.setTimestampStart();
  };

  async initlializeList(){
    let store = await IncompletePracticeExamStore.get();
    console.log('store: ');
    console.log(store);

    //get prev. answered questions
    let {questions, answers} = await this.getQuestionsFromStore();

    //console.log('\n\n\n\nquestions: ');
    //console.log(questions);
    //console.log('\n\n\n\nanswers: ');
    //console.log(answers);

    let list = [];
    list = list.concat(answers);
    
    let first = questions.shift();
    first && list.push(first);

    let currentIndex = list.length - 1;
    if(currentIndex < 0){
      currentIndex = 0;
    };

    await setStateAsync(this, {questions, answers, list, currentIndex});
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

      //replace iPE
      this.practiceExamModel = match;

    } else {
      //no question has been answered yet
      let unanswered = this.subjectModel.getUnansweredQuestions();

      //update variable
      questions = questions.concat(unanswered);
    };

    return {questions, answers};
  };

  async componentDidMount(){
    //await IncompletePracticeExamStore.reset();
    await this.initlializeList();

    const { onListInit } = this.props;
    //call callback and pass iPE
    onListInit && onListInit(this.practiceExamModel);

    this.setState({loading: false});
  };

  getCarouselRef = () => {
    return this._carousel;
  };

  //adds a new question at the end
  async nextQuestion(){
    const { questions, answers, list } = this.state;
    
    let last = getLast(list);
    last && answers.push(last);

    let next = questions.shift();
    next && list.push(next);

    let currentIndex = list.length - 1;
    if(currentIndex < 0){
      currentIndex = 0;
    };
    
    await setStateAsync(this, {
      questions, answers, list, currentIndex, 
      scrollEnabled: false
    });    
  };

  _onPressNextQuestion = async () => {
    const { _carousel } = this;

    //temp fix: scroll glitch
    await setStateAsync(this, {scrollEnabled: true});

    if(Platform.OS == 'ios'){
      //load next question
      await this.nextQuestion();
    };

    //go to next question
    _carousel && this._carousel.snapToNext();

    //get current index from carousel
    const currentIndex = this._carousel.currentIndex;

    //fire callback
    const { onNextItem } = this.props;
    onNextItem && onNextItem(currentIndex);

    //temp fix snapping bug
    await setStateAsync(this, {scrollEnabled: false});
    await timeout(50);
    await setStateAsync(this, {scrollEnabled: true});
  };

  //callback: when answer is selected
  _onAnswerSelected = (question) => {
    //wrap question inside model
    const questionModel = new QuestionItem(question);
    const answerModel   = questionModel.getAnswerModel();

    //get current index from carousel
    const currentIndex = this._carousel.currentIndex;
    //determine if it's the last item
    const isLast = currentIndex == (this.subjectModel.getQuestionLength() - 1);

    if(isLast){
      //mark exam as finished
      this.practiceExamModel.setTimestampEnd();
    };

    //append answer to iPE
    this.practiceExamModel.insertAnswer(answerModel);
    //write to store
    IncompletePracticeExamStore.add(this.practiceExamModel);

    if(Platform.OS == 'android'){
      //android bug: load next question before snapping to next 
      this.nextQuestion();
    };
  };
  
  _renderItem = ({item, index}) => {
    const isLast = index == this.subjectModel.getQuestionLength() - 1;
    //console.log(item);
    
    return (
      <PracticeQuestion
        question={item}
        onPressNextQuestion={this._onPressNextQuestion}
        onEndReached={this.props.onEndReached}
        onAnswerSelected={this._onAnswerSelected}
        {...{isLast, index}}
      />
    );
  };

  render(){
    if(this.state.loading) return null;

    const { onEndReached, ...flatListProps } = this.props;
    const { scrollEnabled } = this.state;

    //get screen height/width
    const dimensions   = Dimensions.get('window');
    const screenHeight = dimensions.height;
    const screenWidth  = dimensions.width ;
    
    //ui values for carousel
    const headerHeight = Platform.select({
      ios    : Header.HEIGHT + 15,
      android: Header.HEIGHT + StatusBar.currentHeight,
    });

    const carouseProps = {
      scrollEnabled,
      itemHeight: screenHeight - headerHeight,
      ...Platform.select({
        ios: {
          sliderHeight: screenHeight,
          activeSlideAlignment: 'end',
          vertical: true,
        },
        android: {
          sliderHeight: screenHeight - headerHeight,
          sliderWidth : screenWidth,
          itemWidth   : screenWidth,
          vertical: false,
          activeSlideAlignment: 'center'
        }
      }),
    };

    return(
      <Carousel
        ref={r => this._carousel = r }
        data={this.state.list}
        renderItem={this._renderItem}
        firstItem={this.state.currentIndex}
        //onSnapToItem={this._handleOnSnapToItem}
        //scrollview props
        showsHorizontalScrollIndicator={true}
        bounces={true}
        lockScrollWhileSnapping={true}
        //other props
        {...carouseProps}
        {...flatListProps}
      />
    );
  };
};

const sharedStyles = StyleSheet.create({
  questionCard: {
    flex: 1,
    backgroundColor: 'white', 
    marginHorizontal: 10,
    borderRadius: 15,
    ...Platform.select({
      ios: {
        marginBottom: 15,
      },
      android: {
        marginVertical: 15,
        elevation: 7,
      }
    }),
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