import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import { Button   } from './Buttons';
import { FlipView } from './Views';

import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import    { Header   } from 'react-navigation';

const QUESTIONS = [
  {
    question: 'What is Hello World',
    answer  : 'Hello World',
    choices: [
      'Hello',
      'World',
      'Word Hello' ,
    ],
  },
  {
    question: 'What is my fave color',
    answer  : 'blue',
    choices: [
      'bitch',
      'lgbt',
      'none' ,
    ],
  },
];

const questionShape = {
  question: PropTypes.string,
  answer  : PropTypes.string,
  choices : PropTypes.arrayOf(PropTypes.string),
  //used for keeping track of ans, score etc.
  userAnswer: PropTypes.string,
};

//TODO: move to util func
function setStateAsync(that, newState) {
  return new Promise((resolve) => {
      that.setState(newState, () => {
          resolve();
      });
  });
}

//shows a single exam choice
export class ExamChoice extends React.PureComponent {
  static propTypes = {
    choiceKey : PropTypes.string.isRequired,
    choiceText: PropTypes.string.isRequired,
    onPress   : PropTypes.func  .isRequired,
    //misc props
    style: ViewPropTypes.style,
  }

  _onPressChoice = () => {
    const { onPress, choiceText, choiceKey} = this.props;
    onPress(choiceText, choiceKey);
  }
  
  render(){
    const { choiceText, choiceKey, style } = this.props;
    //TODO: move to styles
    const choiceContainerStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#6200EA',
      padding: 8,
      borderRadius: 7,
    };
    return(
      <TouchableOpacity
        style={[choiceContainerStyle, style]}
        onPress={this._onPressChoice}
      >
        <Text style={{fontSize: 18, color: 'white', fontWeight: '900', width: 25,}}>{choiceKey }</Text>
        <Text style={{fontSize: 18, color: 'white', fontWeight: '500'}}>{choiceText}</Text>
      </TouchableOpacity>
    );
  }
}

//shows a list of choices
export class ExamChoiceList extends React.PureComponent {
  static propTypes = {
    choices: PropTypes.arrayOf(PropTypes.string),
    onPressChoice: PropTypes.func,
  }

  //TODO: move to util function
  shuffleArray(array) {
    var newArray = array.slice();
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return(newArray);
  }

  _renderChoices = () => {
    const { choices, onPressChoice } = this.props;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const shuffledChoices = this.shuffleArray(choices);

    return shuffledChoices.map((choice, index) => 
      <ExamChoice
        choiceText={choice}
        choiceKey ={alphabet[index]}
        key       ={choice + index}
        style     ={{marginTop: 8, height: 45}}
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
    onPressChoice: PropTypes.func,
    question: PropTypes.shape(questionShape),
  }

  _renderTopQuestion(){
    const { question } = this.props;    
    return(
      <View style={{flex: 1}}>
        <ScrollView style={{flex: 1}}>
          <Text style={{fontSize: 24}}>
            {question.question}
          </Text>
        </ScrollView>
      </View>
    );
  }

  _renderBottomChoices(){
    const { question, onPressChoice } = this.props;
    //combine choices and answer
    const choicesArray = question.choices.slice();
    choicesArray.push(question.answer);
    return(
      <ExamChoiceList
        choices={choicesArray}
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

export class Explanation extends React.PureComponent {

}

export class PracticeQuestion extends React.PureComponent {
  static propTypes = {
    question: PropTypes.shape(questionShape),
    onPressNextQuestion: PropTypes.func,
  }

  constructor(props){
    super(props);
    this.state = {
      hideFlipper: false
    };
  }

  _handleOnPressChoices = async (choice, key) => {
    const { question } = this.props;
    await this.questionFlipView.flipCard();
    await setStateAsync(this, {hideFlipper: true});

    const isCorrect = choice == question.answer;
    
  }

  _handleOnPressNextQuestion = () => {
    const { onPressNextQuestion } = this.props;
    onPressNextQuestion();
  }
  
  _renderFrontQuestion = () => {
    return(
      <ExamQuestion
        onPressChoice={this._handleOnPressChoices}
        question={this.props.question}
      />
    );
  }

  _renderBackExplaination = () => {
    const { hideFlipper } = this.state;
    return(
      <View 
        style={hideFlipper? [styles.questionCard, styles.shadow, {flex: 1, overflow: 'visible'}] : undefined}
        collapsable={true}
      >
        <Button
          text={'Flip'}
          style={{backgroundColor: '#6200EA'}}
          iconName={'pencil-square-o'}
          iconType={'font-awesome'}
          iconSize={22}
          iconColor={'white'}
          onPress={this._handleOnPressNextQuestion}
        />
      </View>
    );
  }

  _renderFlipper = () => {
    return(
      <FlipView 
        ref={r => this.questionFlipView = r}
        containerStyle={[{flex: 1}, styles.shadow]}
        frontComponent={this._renderFrontQuestion()}
        frontContainerStyle={styles.questionCard}
        backComponent={this._renderBackExplaination()}
        backContainerStyle={styles.questionCard}
      />
    );
  }

  render(){
    const { hideFlipper } = this.state;
    return(
      hideFlipper? this._renderBackExplaination() : this._renderFlipper()
    );
  }
}

export class PracticeExamList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      questions   : this.getQuestions(),
      questionList: this.initQuestionList(),
      currentIndex: 0,
    }
  }

  //incomplete
  initQuestionList(){
    const questions = this.getQuestions();
    let   list      = [];
    list.push(questions[0]);
    return list;
  }

  getQuestions(){
    //create a copy
    let questions = QUESTIONS.slice();
    for(let question of questions){
      question.userAnswer = null
    }
    return questions;
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
  
  _renderItem = ({item, index}) => {
    return (
      <PracticeQuestion
        question={item}
        onPressNextQuestion={this._onPressNextQuestion}
      />
    );
  }

  render(){
    //ui values for carousel
    const headerHeight = Header.HEIGHT + 15;
    const screenHeight = Dimensions.get('window').height;
    const carouselHeight = {
      sliderHeight: screenHeight, 
      itemHeight  : screenHeight - headerHeight,
    };

    return(
      <Carousel
        ref={(c) => { this._questionListCarousel = c; }}
        data={this.state.questionList}
        renderItem={this._renderItem}
        firstItem={0}
        activeSlideAlignment={'end'}
        vertical={true}
        lockScrollWhileSnapping={false}
        //scrollview props
        showsHorizontalScrollIndicator={true}
        bounces={true}
        //other props
        {...carouselHeight}
        {...this.props}
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