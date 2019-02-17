import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, FlatList, Dimensions, Clipboard, Platform, StatusBar } from 'react-native';
import PropTypes from 'prop-types';

import * as Animatable from 'react-native-animatable';
import { Header } from 'react-navigation';
import Carousel from 'react-native-snap-carousel';
import { Icon } from 'react-native-elements';

import { getLetter , shuffleArray} from '../functions/Utils';
import { PURPLE } from '../Colors';

class ChoiceItem extends React.PureComponent {
  static propTypes = {
    choice: PropTypes.string, 
    answer: PropTypes.string, 
    index: PropTypes.number,
    isLast: PropTypes.bool,
    selected: PropTypes.string,
    onPressChoice: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      minHeight: 37,
      paddingVertical : 7,
      paddingHorizontal: 10,
      alignItems: 'center',
      flexDirection: 'row',
    },
    choiceText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '100',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    choiceTextSelected: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: 'white',
    }, 
    keyText: {
      fontWeight: '500',
    }
  });

  static colors = [
    PURPLE[800],
    PURPLE[900],
    PURPLE[1000],
    PURPLE[1100],
    PURPLE[1200],
  ];

  _handleOnPress = () => {
    const { onPressChoice, choice, answer, selected } = this.props;
    const isCorrect = choice === answer;

    //call callback with params
    onPressChoice && onPressChoice({choice, answer, isCorrect, selected});
  };

  _renderChoiceText(){
    const { styles } = ChoiceItem;
    const { onPressChoice, choice, index, selected } = this.props;

    const answerKey = getLetter(index);
    const isSelected = selected == choice;

    return(
      <Text style={isSelected? styles.choiceTextSelected : styles.choiceText}>
        <Text style={styles.keyText}>{answerKey}. </Text>
        {choice}
      </Text>
    );
  };

  _renderIndicator(){
    const { selected, choice } = this.props;
    const isSelected = selected == choice;

    if(!isSelected) return null;

    return(
      <Animatable.View
        animation={'fadeInRight'}
        duration={300}
        useNativeDriver={true}
      >
        <Icon
          name={'check'}
          type={'feather'}
          size={22}
          color={'rgba(255, 255, 255, 0.75)'}
        />
      </Animatable.View>
    );
  };

  render(){
    const { styles, colors } = ChoiceItem;
    const { index, isLast } = this.props;

    const containerStyle = {
      //diff bg color based on index
      backgroundColor: colors[index],
    };

    return(
      <TouchableOpacity
        style={[styles.container, containerStyle]}
        onPress={this._handleOnPress}
      >
        {this._renderChoiceText()}
        {this._renderIndicator()}
      </TouchableOpacity>
    );
  };
};

class Choices extends React.PureComponent {
  static propTypes = {
    choices: PropTypes.array,
    answer: PropTypes.string,
  };

  static styles =  StyleSheet.create({
    container: {
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: PURPLE[500],
    },
  });

  constructor(props){
    super(props);

    const { choices, answer } = props;
    //extract choices nested inside object
    const extracted = choices.map(choice => choice.value);

    //combine ans/choices then random order
    const combined = [answer, ...extracted];
    const shuffled = shuffleArray(combined);

    this.state = {
      choices: shuffled,
      selected: null,
    };
  };

  _handleOnPressChoice = ({choice, answer, isCorrect}) => {
    this.setState({selected: choice});
  };

  _renderChoices(){
    const { answer } = this.props;
    const { selected, choices } = this.state;

    return choices.map((choice, index) => {
      //component must have unique key
      const key = `${index}-${answer}-${choice}`;
      const isLast = (index == (choices.length - 1));

      return(
        <ChoiceItem
          onPressChoice={this._handleOnPressChoice}
          {...{choice, key, index, answer, isLast, selected}}
        />
      );
    });
  };

  render(){
    const { styles } = Choices;

    return(
      <View style={styles.container}>
        {this._renderChoices()}
      </View>
    );
  };
};

class Question extends React.PureComponent {
  static propTypes = {
    question: PropTypes.string,
    index: PropTypes.number,
  };

  static defaultProps = {
    question: 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.',
  };
  
  static styles = StyleSheet.create({
    question: {
      flex: 1,
      fontSize: 18,
      fontWeight: '200',
    },
    number: {
      fontWeight: '500'
    },
  });

  render(){
    const { styles } = Question;
    const { question, index } = this.props;

    return(
      <Text style={styles.question}>
        <Text style={styles.number}>{index + 1}. </Text>
        {question}
      </Text>
    );
  };
};

class QuestionItem extends React.PureComponent {
  static propTypes = {
    question: PropTypes.object,
    isLast: PropTypes.bool,
    index: PropTypes.number,
  };

  static styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
      margin: 12,
      padding: 10,
      borderRadius: 20,
      shadowColor: 'black',
      shadowRadius: 5,
      shadowOpacity: 0.5,
      shadowOffset: {  
        width: 2,  
        height: 4,  
      },
    }
  });

  constructor(props){
    super(props);
  };

  render(){
    const { styles } = QuestionItem;
    const {index, question: {question, choices, answer}} = this.props;

    return(
      <View style={styles.container}>
        <Question {...{question, index }}/>
        <Choices  {...{choices , answer}}/>
      </View>
    );
  };  
};

export class CustomQuizList extends React.Component {
  static propTypes = {
    quiz: PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  constructor(props){
    super(props);

    //extract questions and assign default value
    const {quiz: {questions = []}} = props;

    this.state = {
      questions: [...questions],
    };
  };

  _renderItem = ({item, index}) => {
    const isLast = false;
    
    return (
      <QuestionItem
        question={item}
        onPressNextQuestion={this._onPressNextQuestion}
        onEndReached={this.props.onEndReached}
        onAnswerSelected={this._onAnswerSelected}
        {...{isLast, index}}
      />
    );
  };

  render(){
    const { styles } = CustomQuizList;
    const { ...otherProps } = this.props;

    //get screen height/width
    const dimensions   = Dimensions.get('window');
    const screenHeight = dimensions.height;
    const screenWidth  = dimensions.width ;
    
    //ui values for carousel
    const headerHeight = Platform.select({
      ios    : Header.HEIGHT,
      android: Header.HEIGHT + StatusBar.currentHeight,
    });

    const carouseProps = {
      scrollEnabled: true,
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
      ...otherProps,
    };

    return(
      <View style={styles.container}>
        <Carousel
          ref={r => this._carousel = r }
          data={this.state.questions}
          renderItem={this._renderItem}
          //onSnapToItem={this._handleOnSnapToItem}
          //scrollview props
          showsHorizontalScrollIndicator={true}
          bounces={true}
          lockScrollWhileSnapping={true}
          //other props
          {...carouseProps}
        />
      </View>
    );
  };
};