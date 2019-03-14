import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, FlatList, Dimensions, Clipboard, Platform, StatusBar, ActivityIndicator, Image } from 'react-native';
import PropTypes from 'prop-types';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import Carousel from 'react-native-snap-carousel';

import { LinearGradient } from 'expo';
import { Header } from 'react-navigation';
import { Icon } from 'react-native-elements';

import { getLetter , shuffleArray, setStateAsync, timeout, hexToRgbA, getTimestamp, isBase64Image} from '../functions/Utils';
import { PURPLE } from '../Colors';
import { QuizAnswer } from '../models/Quiz';
import { ifIphoneX, getStatusBarHeight, getBottomSpace } from 'react-native-iphone-x-helper';

class ChoiceItem extends React.PureComponent {
  static propTypes = {
    choice: PropTypes.string, 
    answer: PropTypes.string, 
    index: PropTypes.number,
    isLast: PropTypes.bool,
    selected: PropTypes.string,
    selectedInex: PropTypes.number,
    onPressChoice: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      minHeight: 38,
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
  ].map(color => hexToRgbA(color, 0.75));

  _handleOnPress = () => {
    const { onPressChoice, choice, answer, selected, index } = this.props;
    const isCorrect = choice === answer;

    //call callback with params
    onPressChoice && onPressChoice({
      choice, answer, isCorrect, selected, index
    });
  };

  _renderChoiceText(){
    const { styles } = ChoiceItem;
    const { index, selectedIndex, choice } = this.props;

    const answerKey  = getLetter(index);
    const isSelected = index == selectedIndex;

    return(
      <Text style={isSelected? styles.choiceTextSelected : styles.choiceText}>
        <Text style={styles.keyText}>{answerKey}. </Text>
        {choice}
      </Text>
    );
  };

  _renderIndicator(){
    const { index, selectedIndex } = this.props;
    const isSelected = index == selectedIndex;

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
    const { index, selectedIndex } = this.props;

    const isSelected = index == selectedIndex;

    const containerStyle = {
      //diff bg color based on index
      backgroundColor: (isSelected
        ? PURPLE.A700
        : colors[index]
      ),
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
    onPressChoice: PropTypes.func,
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
      selectedIndex: -1,
    };
  };

  _handleOnPressChoice = ({choice, answer, isCorrect, index}) => {
    const { onPressChoice } = this.props;

    //store prev selected and update selected
    const prevSelected = this.state.selected;
    this.setState({selected: choice, selectedIndex: index});

    //pass params to callback prop
    onPressChoice && onPressChoice({
      prevSelected, choice, answer, isCorrect
    });
  };

  _renderChoices(){
    const { answer } = this.props;
    const { selected, selectedIndex, choices } = this.state;

    return choices.map((choice, index) => {
      //component must have unique key
      const key = `${index}-${answer}-${choice}`;
      const isLast = (index == (choices.length - 1));

      return(
        <ChoiceItem
          onPressChoice={this._handleOnPressChoice}
          {...{choice, key, index, answer, isLast, selected, selectedIndex}}
        />
      );
    });
  };

  render(){
    const { styles } = Choices;

    const gradientProps = Platform.select({
      ios: {
        start: {x: 0.0, y: 0.25}, 
        end  : {x: 0.5, y: 1.00}
      },
      android: {
        start: {x: 0, y: 0}, 
        end  : {x: 1, y: 0}
      }
    });

    return(
      <LinearGradient 
        style={styles.container}
        colors={[PURPLE[500], PURPLE[1000]]}
        {...gradientProps}
      >
        {this._renderChoices()}
      </LinearGradient>
    );
  };
};

class QuestionImage extends React.PureComponent {
  static propTypes = {
    photofilename: PropTypes.string,
    photouri: PropTypes.string,
    onPressImage: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      height: 400,
      marginTop: 10,
      backgroundColor: PURPLE[100],
      overflow: 'hidden',
      borderRadius: 15,
    },
    loadingContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      height: 400,
    },
  });

  constructor(props){
    super(props);

    const hasImage = props.photouri != null;
    console.log(props.photouri);

    this.state = {
      hasImage,
      base64Image: null,
      loading: hasImage,
      showImage: false,
    };
  };

  async componentDidMount(){
    const { photouri } = this.props;
    const { hasImage, showImage } = this.state;

    try {
      if(hasImage){
        await timeout(750);
        const base64Image = await Expo.FileSystem.readAsStringAsync(photouri);
        const isValidBase64Image = isBase64Image(base64Image || '');
        this.setState({base64Image, loading: false, showImage: isValidBase64Image});
      };
    }catch(error){
      console.log('Unable to load image');
      console.log(error);
    };
  };

  _handleImageOnPress = () => {
    const { onPressImage, photofilename, photouri } = this.props;
    const { base64Image } = this.state;

    onPressImage && onPressImage({
      base64Image, photofilename, photouri
    });
  };

  _renderImage(){
    const { styles } = QuestionImage;
    const { base64Image } = this.state;

    return(
      <TouchableOpacity
        onPress={this._handleImageOnPress}
        activeOpacity={0.85}
      >
        <Animatable.View
          animation={'fadeIn'}
          duration={500}
          delay={500}
          useNativeDriver={true}
        >
          <Image
            style={[styles.image]}
            source={{uri: base64Image}} 
            resizeMode={'cover'}
          />
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  _renderLoading(){
    const { styles } = QuestionImage;
    return(
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={'large'}/>
      </View>
    );
  };

  render(){
    const { styles } = QuestionImage;
    const { loading, showImage, hasImage } = this.state;

    if(!hasImage) return null;

    return(
      <View style={styles.container}>
        {showImage && this._renderImage  ()}
        {loading   && this._renderLoading()}
      </View>
    );
  };
};

class Question extends React.PureComponent {
  static propTypes = {
    question: PropTypes.string,
    index: PropTypes.number,
    photofilename: PropTypes.string,
    photouri: PropTypes.string,
    onPressImage: PropTypes.func,
  };

  static defaultProps = {
    question: 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.',
  };
  
  static styles = StyleSheet.create({
    scrollview: {
      marginBottom: 10,
    },
    question: {
      flex: 1,
      fontSize: 18,
      fontWeight: '200',
    },
    number: {
      fontWeight: '500'
    },
  });

  _handleOnPressImage = ({base64Image, photofilename, photouri}) => {
    const { onPressImage, question, index } = this.props;
    onPressImage && onPressImage({
      question, index, base64Image, photofilename, photouri
    });
  };

  render(){
    const { styles } = Question;
    const { question, index, photofilename, photouri } = this.props;

    return(
      <ScrollView 
        style={styles.scrollview}
        alwaysBounceVertical={false}
      >
        <Text style={styles.question}>
          <Text style={styles.number}>{index + 1}. </Text>
          {question}
        </Text>
        <QuestionImage 
          onPressImage={this._handleOnPressImage}
          {...{photofilename, photouri}}
        />
      </ScrollView>
    );
  };
};

class QuestionItem extends React.PureComponent {
  static propTypes = {
    question: PropTypes.object,
    isLast: PropTypes.bool,
    index: PropTypes.number,
    onPressChoice: PropTypes.func,
    //pass down to Question
    onPressImage: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
      margin: 12,
      padding: 10,
      borderRadius: 20,
      ...Platform.select({
        ios: {
          shadowColor: 'black',
          shadowRadius: 5,
          shadowOpacity: 0.5,
          shadowOffset: {  
            width: 2,  
            height: 4,  
          },
          ...ifIphoneX({
            marginBottom: getBottomSpace(),
          }),
        },
        android: {
          elevation: 15,
        }
      }),
    }
  });

  constructor(props){
    super(props);
  };

  _handleOnPressChoice = (choicesProps = {prevSelected, choice, answer, isCorrect}) => {
    const { onPressChoice, ...questionItemProps } = this.props;

    //pass props to callback
    onPressChoice && onPressChoice({...choicesProps, ...questionItemProps});
  };

  render(){
    const { styles } = QuestionItem;
    const {index, onPressImage, question: {question, choices, answer, photofilename, photouri}} = this.props;

    return(
      <View style={styles.container}>
        <Question
          {...{question, index, photofilename, photouri, onPressImage}}
        />
        <Choices
          onPressChoice={this._handleOnPressChoice}
          {...{choices, answer}}
        />
      </View>
    );
  };  
};

export class CustomQuizList extends React.Component {
  static propTypes = {
    quiz: PropTypes.object,
    onAnsweredAllQuestions: PropTypes.func,
    onNewAnswerSelected: PropTypes.func,
    //passed down Question
    onPressImage: PropTypes.func,
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
    this.questions = [...questions];

    this.state = {
      questionList: [this.questions.pop()],
    };

    //store user answers
    this.answers = QuizAnswer.wrapArray([]);
  };

  async addQuestionToList(){
    const { questionList } = this.state;

    const nextQuestion = this.questions.pop();
    const newQuestionList = [...questionList, nextQuestion];

    await setStateAsync(this, {questionList: newQuestionList});
  };

  /** get a copy of all the questions */
  getQuestions = () =>  {
    return (_.cloneDeep(this.questions));
  };

  /** get a copy of all the current answers */
  getAnswers = () => {
    return _.cloneDeep(this.answers);
  };

  getQuestionList = () => {
    const { questionList } = this.state;
    return questionList;
  };

  getCarouselRef = () => {
    return this._carousel;
  };

  addAnswer({question, userAnswer, isCorrect}){
    //wrap object for vscode types/autocomplete
    const new_answer = QuizAnswer.wrap({
      //id used for comparison 
      answerID: `${question.indexID_module}-${question.indexID_subject}-${question.indexID_question}`,
      timestampAnswered: getTimestamp(true),
      //append params to object
      question, userAnswer, isCorrect
    });
    
    //wrap array for vscode autocomplete
    const answers = QuizAnswer.wrapArray(this.answers);

    const matchIndex = answers.findIndex(item => 
      item.answerID == new_answer.answerID
    );

    if(matchIndex != -1){
      //replace existing answer
      answers[matchIndex] = new_answer;
      this.answers = answers;

    } else {
      //append new answer to answers
      this.answers = [...answers, new_answer]
    };
  };

  _handleOnQuestionPressChoice = async ({prevSelected, choice, answer, isCorrect, question, isLast, index}) => {
    const { onAnsweredAllQuestions, onNewAnswerSelected} = this.props;

    if(isLast){
      onAnsweredAllQuestions && onAnsweredAllQuestions();

    } else if(prevSelected == null){
      onNewAnswerSelected && onNewAnswerSelected();
      
      await Promise.all([
        this.addQuestionToList(),
        timeout(400)
      ]);
      this._carousel.snapToNext();
    };

    this.addAnswer({question, userAnswer: choice, isCorrect});
  };

  _renderItem = ({item, index}) => {
    const {onPressImage, quiz: {questions = []}} = this.props;
    const isLast = (index == questions.length - 1);
    
    return (
      <QuestionItem
        question={item}
        onPressChoice={this._handleOnQuestionPressChoice}
        {...{isLast, index, onPressImage}}
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
      itemHeight: ifIphoneX(
        screenHeight - headerHeight - getStatusBarHeight(),
        screenHeight - headerHeight,
      ),
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
          data={this.state.questionList}
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