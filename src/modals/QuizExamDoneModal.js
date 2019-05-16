import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated, TextInput, TouchableWithoutFeedback, Keyboard, Alert, Dimensions, Clipboard, SectionList, Image } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../Constants';
import { PURPLE , GREY} from '../Colors';

import { setStateAsync, isEmpty , getTimestamp, plural, timeout, addLeadingZero} from '../functions/Utils';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconText, AnimateInView } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';

import _ from 'lodash';
import moment from "moment";
import TimeAgo from 'react-native-timeago';
import { LinearGradient, BlurView, DangerZone } from 'expo';
import { Icon, Divider } from 'react-native-elements';

import * as _Reanimated from 'react-native-reanimated';
import * as Animatable from 'react-native-animatable';
import { QuizAnswer } from '../models/Quiz';
import { ifIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';

const { Lottie } = DangerZone;
const { Easing } = _Reanimated;
const Reanimated = _Reanimated.default;

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

prevTimestamps = [];


function getAverage(nums = []){
  const numbers = [...nums];

  //remove duplicates
  const filtered = numbers.filter((number, index, array) => 
    array.indexOf(number) === index
  );

  //sort timestamps
  filtered.sort((a, b) => a - b);

  //subtract diff
  const diffs = filtered.map((value, index, array) => {
    //if not last item
    if(index < array.length - 1){
      const nextValue = array[index + 1];
      return Math.abs(value - nextValue);
    };
    //remove undefined values
  }).filter(item => item != undefined);

  const sum = diffs.reduce((acc, value) => acc + value, 0);
  const avg = Math.floor(sum / diffs.length);

  const min = Math.min(...diffs); 
  const max = Math.max(...diffs);

  return({ 
    avg, sum, 
    min: isFinite(min)? min : null,
    max: isFinite(max)? max : null, 
  });
};

class TimeElasped extends React.PureComponent {
  static propTypes = {
    startTime: PropTypes.number,
  };

  constructor(props){
    super(props);
    this.state = {
      time: this.getTimeElapsed(),
    };

    this.interval = null;
  };

  componentDidMount(){
    this.start();
  };

  getTimeElapsed = () => {
    const { startTime } = this.props;
    const currentTime = new Date().getTime();

    const diffTime = currentTime - startTime;
    const duration = moment.duration(diffTime, 'milliseconds');

    const hours    = addLeadingZero(duration.hours  ());
    const minutes  = addLeadingZero(duration.minutes());
    const seconds  = addLeadingZero(duration.seconds());

    return(`${hours}:${minutes}:${seconds}`);
  };

  componentWillUnmount(){
    this.stop();
  };

  start = () => {
    const { startTime } = this.props;
    //stop if there's already a timer
    if(this.interval) return;

    this.interval = setInterval(() => {
      const time = this.getTimeElapsed();
      this.setState({time});
    }, 1000);
  };

  stop(){
    if(this.interval){
      clearInterval(this.interval);
      this.interval = null;
    };
  };

  render(){
    const { startTime, ...textProps } = this.props;
    const { time } = this.state;
    return(
      <Text {...textProps}>{time}</Text>
    );
  };
};

class FireworksAnimation extends React.PureComponent {
  constructor(props){
    super(props);

    this.state = {
      mountAnimation: false,
    };

    this._source = require('../animations/checked_done_.json');
    this._value = new Animated.Value(0);
    this._config = { 
      toValue: 1,
      duration: 1000,
      useNativeDriver: true 
    };
    this._animated = Animated.timing(this._value, this._config);
  };

  //start animation
  start = () => {
    return new Promise(async resolve => {
      await setStateAsync(this, {mountAnimation: true});
      this._animated.start(() => resolve());
    });
  };

  render(){
    //dont mount until animation starts
    if(!this.state.mountAnimation) return null;

    return(
      <Animatable.View
        style={{width: '100%', height: '100%'}}
        animation={'bounceIn'}
        duration={1000}
        useNativeDriver={true}
      >
        <Lottie
          resizeMode={'contain'}
          ref={r => this.animation = r}
          progress={this._value}
          source={this._source}
          loop={false}
          autoplay={false}
        />
      </Animatable.View>
    );
  };
};

class ModalSectionItemQuestion extends React.PureComponent {
  static propTypes = {
    answerID: PropTypes.string,
    question: PropTypes.object,
    userAnswer: PropTypes.string,
    isCorrect: PropTypes.bool,
    index: PropTypes.number,
    currentIndex: PropTypes.number,
    timestampAnswered: PropTypes.number,
    onPressItem: PropTypes.func,
    isLast: PropTypes.bool,
  };

  static styles = StyleSheet.create({
    container: Platform.select({
      ios: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        backgroundColor: 'rgba(245, 245, 245, 0.5)',
        borderBottomColor: 'rgba(0, 0, 0, 0.1)', 
      },
      android: {
        paddingHorizontal: 12,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderColor: 'rgb(190,190,190)',
      },
    }),
    question: {
      fontSize: 18,
      fontWeight: '400'
    },
    questionNumber: {
      fontWeight: '600',
      color: PURPLE[1000],
    },
    answerContainer: {
      flexDirection: 'row',
      marginTop: 2,
      alignItems: 'center',
    },
    answer: {
      flex: 1,
      fontSize: 18,
      fontWeight: '400',
      color: 'rgb(50, 50, 50)',
    },
    answerLabel: {
      fontWeight: '600',
      color: PURPLE[1000],
    },
    answerTime: {
      fontSize: 16,
      fontWeight: '100',
      color: GREY[600]
    }
  });

  _handleOnPress = () => {
    const { onPressItem, index } = this.props;
    onPressItem && onPressItem({index});
  };

  _renderQuestion(){
    const { styles } = ModalSectionItemQuestion;
    const { index, question: {question}, currentIndex } = this.props;

    const isSelected = (index == currentIndex);
    const questionStyle = {
      ...isSelected? {
        fontSize: 20,
      } : null,
    };

    return(
      <Text style={[styles.question, questionStyle]} numberOfLines={1}>
        <Text style={styles.questionNumber}>{`${index+1}. `}</Text>
        {question}
      </Text>
    );
  };

  _renderDetails(){
    const { styles } = ModalSectionItemQuestion;
    const { userAnswer, index, currentIndex, timestampAnswered } = this.props;

    const isSelected = (index == currentIndex);
    const answerStyle = {
      ...isSelected? {
        fontSize: 20,
      } : null,
    };

    const answerTime = moment(timestampAnswered).format('LTS');

    return(
      <View style={styles.answerContainer}>
        <Text style={[styles.answer, answerStyle]} numberOfLines={1}>
          <Text style={styles.answerLabel}>{'Answer: '}</Text>
          {userAnswer}
        </Text>
        <Text style={styles.answerTime}>{answerTime}</Text>
      </View>
    );
  };

  render(){
    const { styles } = ModalSectionItemQuestion;
    const { index, currentIndex, isLast } = this.props;

    const isSelected = (index == currentIndex);

    const containerStyle = {
      ...isSelected? {
        backgroundColor: PURPLE[100],
      } : null,
    };

    return (
      <TouchableOpacity 
        style={[styles.container, containerStyle, {}]}
        onPress={this._handleOnPress}
        activeOpacity={0.75}
      >
        {this._renderQuestion()}
        {this._renderDetails()}
      </TouchableOpacity>
    );
  };
};

class ModalSectionItemStats extends React.PureComponent {
  static propTypes = {
    startTime: PropTypes.number,
    answers: PropTypes.array,
    questions: PropTypes.array,
    quiz: PropTypes.object,
  };

  static styles = StyleSheet.create({
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
    detailsCompContainer: {
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
  });

  constructor(props){
    super(props);

    const answers = QuizAnswer.wrapArray(props.answers);
    
    //extract timestamps
    const new_timestamps = answers.map(answer => answer.timestampAnswered);
    const timestamps = [...new Set([...prevTimestamps, ...new_timestamps])];

    console.log(timestamps);

    //update old timestamps
    prevTimestamps = [...timestamps];

    //compute avg time to answer
    const { min, max, avg, sum } = getAverage(timestamps);

    this.state = { 
      min: min? min / 1000 : null, 
      max: max? max / 1000 : null, 
      avg: avg? avg / 1000 : null, 
      sum: sum? sum / 1000 : null,
      timestamps,
    };
  };

  getState = () => {
    return(this.state);
  };

  _renderDetailsTime(){
    const { styles } = ModalSectionItemStats;
    const { startTime, answers, quiz, questions } = this.props;

    const timeStarted = moment(startTime).format('LT');
    const total = quiz.questions.length || 'N/A';

    const progress = `${answers.length}/${total} items`;
    const left     = `${total - answers.length} remaining`;

    return(
      <Fragment>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Started: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{timeStarted}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text        numberOfLines={1} style={styles.detailTitle   }>{'Elapsed: '}</Text>
            <TimeElasped numberOfLines={1} style={styles.detailSubtitle} {...{startTime}}/>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginTop: 10}}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Progress: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{progress}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Questions: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{left}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginTop: 10}}>
          
        </View>
      </Fragment>
    );
  };

  _renderDetailsComp(){
    const { styles } = ModalSectionItemStats;
    const { min, max, avg, sum, timestamps } = this.state;

    const timesAnswered = `${timestamps.length} times`;

    const minText = min? `${min.toFixed(1)} Seconds` : 'N/A';
    const maxText = max? `${max.toFixed(1)} Seconds` : 'N/A';
    const avgText = avg? `${avg.toFixed(1)} Seconds` : 'N/A';
    
    return(
      <View style={styles.detailsCompContainer}>
        <Text style={styles.title}>Time Per Answer</Text>
        <Text style={styles.subtitle}>Computes the amount of time it took to answer each question.</Text>
        <View style={{flexDirection: 'row', marginTop: 10}}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Shortest:'}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{minText}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Longest:'}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{maxText}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginTop: 10}}>
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
    const { styles } = ModalSectionItemStats;
    const { startTime } = this.props;

    const timeStarted = moment(startTime).format('LT');

    return(
      <View style={styles.container}>
        {this._renderDetailsTime()}
        <View style={styles.divider}/>
        {this._renderDetailsComp()}
      </View>
    );
  };
};

class ModalSectionItemDetails extends React.PureComponent {
  static propTypes = {
    quiz: PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: Platform.select({
      ios: {
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
      margin: 10,
      height: 1,
      backgroundColor: 'rgba(0,0,0, 0.12)'
    },
    title: {
      fontSize: 24,
      color: PURPLE[600],
      fontWeight: '600',
    },
    date: {
      fontSize: 17,
      color: 'black',
      fontWeight: '300',
    },
    dateLabel: {
      color: PURPLE[1100],
      fontWeight: '600',
    },
    dateString: {
      color: 'rgb(80, 80, 80)',
      fontWeight: '100',
    },
    description: {
      fontSize: 18,
      fontWeight: '300'
    },
    descriptionLabel: {
      fontWeight: '400'      
    }
  });

  _renderTitle(){
    const { styles } = ModalSectionItemDetails;
    const { quiz: {title} } = this.props;

    return(
      <Text 
        style={styles.title}
        numberOfLines={1}
      >
        {title}
      </Text>
    );
  };

  _renderDate(){
    const { styles } = ModalSectionItemDetails;
    const { quiz: {timestampCreated} } = this.props;

    const time = timestampCreated * 1000;
    const date = new Date(time);

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const dateString = date.toLocaleDateString('en-US', options);

    return(
      <Text style={styles.date}>
        <Text style={styles.dateLabel}>Created: </Text>
        <TimeAgo {...{time}}/>
        <Text style={styles.dateString}>{` (${dateString})`}</Text>
      </Text>
    );
  };

  _renderDescription(){
    const { styles } = ModalSectionItemDetails;
    const { quiz: {description} } = this.props;

    return(
      <Text style={styles.description}>
        <Text style={styles.descriptionLabel}>Description - </Text>
        {description}
      </Text>
    );
  };

  render(){
    const { styles } = ModalSectionItemDetails;
    const { quiz: {title, description, timestampCreated} } = this.props;

    return(
      <View style={styles.container}>
        {this._renderTitle()}
        {this._renderDate()}
        <View style={styles.divider}/>
        {this._renderDescription()}
      </View>
    );
  };
};

class ModalSectionFooter extends React.PureComponent {
  static propTypes = {
    type: PropTypes.string, 
    data: PropTypes.array, 
    currentIndex: PropTypes.number, 
    questionList: PropTypes.array,
  };

  static styles = StyleSheet.create({
    seperator: Platform.select({
      ios: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)', 
      },
      android: {
        padding: 15,
        backgroundColor: 'white'        
      }
    }),
    container: {  
      flexDirection: 'row',
      ...Platform.select({
        ios:{
          paddingHorizontal: 17,
          paddingVertical: 20,
          borderBottomWidth: 1,
          backgroundColor: 'rgba(245, 245, 245, 0.5)',
          borderBottomColor: 'rgba(0, 0, 0, 0.1)', 
        },
        android: {
          alignItems: 'center',
          backgroundColor: 'white',
          borderColor: 'rgb(190,190,190)',
          borderBottomWidth: 1,
          paddingVertical: 20,
          paddingHorizontal: 15,
        },
      }),
    },
    image: {
      width: 75,
      height: 75,
    },
    textContainer: {
      flex: 1,
      marginLeft: 12,
    },
    title: {
      textAlign: 'center',
      fontSize: 21,
      fontWeight: '700',
      color: PURPLE[700],
    },
    description: {
      fontSize: 16,
      fontWeight: '300'
    },
    jumpButtonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    jumpButton: {
      flexDirection: 'row',
      borderRadius: 15,
      marginHorizontal: 10,
      marginVertical: 15,
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: PURPLE[700],
      alignItems: 'center',
      elevation: 5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '400',
      color: 'white',
      marginLeft: 10,
      marginRight: 5,
      marginBottom: 1,
    },
  });

  constructor(props){
    super(props);
    this.image = require('../../assets/icons/exam.png');
  };

  _renderSeperator(){
    const { styles } = ModalSectionFooter;
    return (
      <View style={styles.seperator}/>
    );
  };

  _renderJumpToCurrent(){
    const { styles } = ModalSectionFooter;
    const { currentIndex, questionList } = this.props;

    const showJumpToCurrent = (currentIndex + 1) < questionList.length;
    if(!showJumpToCurrent) return this._renderSeperator();

    return(
      <Animatable.View 
        style={styles.jumpButtonContainer}
        animation={'pulse'}
        duration={7000}
        iterationCount={'infinite'}
        iterationDelay={750}
        useNativeDriver={true}
      >
        <TouchableOpacity style={styles.jumpButton}>
          <Icon
            name={'arrow-down'}
            type={'feather'}
            color={'rgba(255, 255, 255, 0.75)'}
            size={25}
          />
          <Text style={styles.buttonText}>Jump to Last</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  _renderEmptyQuestion(){
    const { styles } = ModalSectionFooter;
    return(
      <View style={styles.container}>
        <Animatable.Image 
          style={styles.image}
          source={this.image}
          animation={'pulse'}
          iterationCount={'infinite'}
          iterationDelay={1000}
          duration={10000}
          useNativeDriver={true}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{'No Answers Yet'}</Text>
          <Text style={styles.description}>{'Nothing to show here (when you answer a question, your answers will appear here.)'}</Text>
        </View>
      </View>
    );
  };

  render(){
    const { SECTION_TYPES } = ModalContents;
    const { type, data } = this.props;

    const isSectionEmpty = data.length == 0;

    switch (type) {
      case SECTION_TYPES.QUESTIONS: return(isSectionEmpty
        ? this._renderEmptyQuestion() 
        : this._renderJumpToCurrent()
      );
      default: return (
        this._renderSeperator()
      );
    };
  };
};

class ModalSectionHeader extends React.PureComponent {
  static propTypes = {
    type: PropTypes.string,
  };

  static styles = StyleSheet.create({
    container: Platform.select({
      ios: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.20)',
      },
      android: {
        backgroundColor: 'white',
        borderColor: 'rgb(190,190,190)',
        borderBottomWidth: 1,
        borderTopWidth: 1,
      }
    }),
    wrapper: {
      padding: 10,
      backgroundColor: 'white', 
    },
    contentContainer: {
      flexDirection: 'row',
    },
    titleContainer: {
      flex: 1,
      marginLeft: 8,
    },
    headerTitle: {
      fontWeight: '600',
      fontSize: 20,
      color: PURPLE[900],
    },
    headerSubtitle: {
      fontSize: 18,
      fontWeight: '300'
    },
  });

  getIconProps(type){
    const { SECTION_TYPES } = ModalContents;
    switch (type){
      case SECTION_TYPES.DETAILS: return {
        name: 'message-circle',
        type: 'feather'
      };
      case SECTION_TYPES.STATS: return {
        name: 'eye',
        type: 'feather'
      };
      case SECTION_TYPES.QUESTIONS: return {
        name: 'list',
        type: 'feather'
      };
    };
  };

  getHeaderDetails(type){
    const { SECTION_TYPES } = ModalContents;
    switch (type){
      case SECTION_TYPES.DETAILS: return {
        title: 'Quiz Details',
        description: 'Details about the current quiz',
      };
      case SECTION_TYPES.STATS: return {
        title: 'Quiz Statistics',
        description: 'How well are you doing so far?',
      };
      case SECTION_TYPES.QUESTIONS: return {
        title: 'Questions & Answers',
        description: 'Overview of your answers.',
      };
    };
  };

  _renderIcon(){
    const { type } = this.props;
    const iconProps = this.getIconProps(type);
    return (
      <Icon
        {...iconProps}
        color={PURPLE[500]}
        size={27}
      />
    );
  };

  _renderContent(){
    const { styles } = ModalSectionHeader;
    const { type } = this.props;

    const { title, description } = this.getHeaderDetails(type);

    return(
      <Animatable.View 
        style={styles.contentContainer}
        animation={'pulse'}
        duration={10000}
        delay={2000}
        iterationCount={'infinite'}
        iterationDelay={5000}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        {this._renderIcon()}
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
          <Text numberOfLines={2} style={styles.headerSubtitle}>{description}</Text>
        </View>
      </Animatable.View>
    );
  };

  _renderIOS(){
    const { styles } = ModalSectionHeader;

    return(
      <BlurView
        style={{marginBottom: 2, borderBottomColor: 'black'}}
        tint={'default'}
        intensity={100}
      >
        <View style={styles.container}>
          {this._renderContent()}
        </View>
      </BlurView>
    );
  };

  _renderAndroid(){
    const { styles } = ModalSectionHeader;

    return(
      <View style={styles.container}>
        <View style={styles.wrapper}>
          {this._renderContent()}
        </View>
      </View>
    );
  };

  render(){
    return Platform.select({
      ios    : this._renderIOS(),
      android: this._renderAndroid(),
    });
  };
};

class ModalContents extends React.PureComponent {
  static propTypes = {
    quiz: PropTypes.object, 
    questions: PropTypes.array, 
    questionList: PropTypes.array, 
    answers: PropTypes.array, 
    currentIndex: PropTypes.number,
    onPressQuestionItem: PropTypes.func,
    onPressFinish: PropTypes.func,
    startTime: PropTypes.number
  };

  static SECTION_TYPES = {
    QUESTIONS: 'QUESTIONS',
    DETAILS: 'DETAILS',
    STATS: 'STATS'
  };
  
  static styles = StyleSheet.create({
    scrollview: {
      flex: 1,
      //borderTopColor: 'rgb(200, 200, 200)', 
      //borderTopWidth: 1
    },
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
      marginLeft: 7, 
      marginRight: 25, 
      marginBottom: 10,
    },
    subtitle: {
      fontWeight: '200',
      fontSize: 16,
    },
    body: {
      borderTopColor: 'rgb(200, 200, 200)', 
      borderTopWidth: 1
    },
    buttonContainer: {
      borderTopColor: 'rgba(0, 0, 0, 0.25)',
      borderBottomColor: 'rgba(0, 0, 0, 0.25)',
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: PURPLE[700], 
      borderRadius: 12,
      margin: 12,
      padding: 15,
      elevation: 10,
      ...ifIphoneX({
        marginBottom: getBottomSpace(),
        borderRadius: 17,
      }),
    },
    buttonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: 'white',
      textAlign: 'left',
      textAlignVertical: 'center',
      marginLeft: 13,
    },
  });

  constructor(props){
    super(props);

    const { SECTION_TYPES } = ModalContents;
    const { quiz, questions, questionList, answers, currentIndex } = props;

    this.state = {
      sections: [
        {type: SECTION_TYPES.DETAILS  , data: [{quiz}]},
        {type: SECTION_TYPES.STATS    , data: [{}]},
        {type: SECTION_TYPES.QUESTIONS, data: [...answers]},
      ],
    };
  };

  _handleOnPressQuestionItem = ({index}) => {
    const { onPressQuestionItem } = this.props;
    onPressQuestionItem && onPressQuestionItem({index});
  };

  _handleOnPressFinish = () => {
    const { onPressFinish } = this.props;
    //get computed time stats
    const timeStats = this.modalSectionItemStats.getState();
    //pass down timestats to callback
    onPressFinish && onPressFinish({timeStats});
  };

  _renderTitle(){
    const { styles } = ModalContents;

    return(
      <IconText
        containerStyle={styles.titleContainer}
        textStyle={styles.title}
        text={'Custom Quiz Details'}
        subtitleStyle={styles.subtitle}
        subtitle={"When you're done, press finish. "}
        iconName={'notebook'}
        iconType={'simple-line-icon'}
        iconColor={'#512DA8'}
        iconSize={26}
      />
    );
  };

  _renderFinishButton(){
    const { styles } = ModalContents;
    return(
      <Animatable.View
        style={styles.buttonContainer}
        animation={'fadeInUp'}
        duration={300}
        delay={300}
        useNativeDriver={true}
      >
        <TouchableOpacity onPress={this._handleOnPressFinish}>
          <LinearGradient
            style={[styles.button, STYLES.mediumShadow]}
            colors={[PURPLE[800], PURPLE[500]]}
            start={[0, 1]} end={[1, 0]}
          >
            <Icon
              name={'ios-checkmark-circle-outline'}
              type={'ionicon'}
              color={'white'}
              size={24}
            />
            <Text style={styles.buttonText}>{"Finish Quiz"}</Text>
            <Icon
              name={'chevron-right'}
              type={'feather'}
              color={'white'}
              size={30}
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  _renderSectionHeader = ({section: {type, data}}) => {
    return (
      <ModalSectionHeader {...{type}}/>
    );
  };

  _renderSectionFooter = ({section: {type, data}}) => {
    const { currentIndex, questionList } = this.props;
    return (
      <ModalSectionFooter 
        {...{type, data, currentIndex, questionList}}
      />
    );
  };

  _renderItem = ({item, index, section: {type}}) => {
    const { SECTION_TYPES } = ModalContents;
    const { currentIndex, answers, quiz, startTime, questions } = this.props;

    const isLast = (index == (answers.length - 1));
    
    switch (type) {
      case SECTION_TYPES.DETAILS: return(
        <ModalSectionItemDetails {...item}/>
      );
      case SECTION_TYPES.STATS: return(
        <ModalSectionItemStats
          ref={r => this.modalSectionItemStats = r}
          {...{startTime, answers, questions, quiz}}
        />
      );
      case SECTION_TYPES.QUESTIONS: return(
        <ModalSectionItemQuestion 
          onPressItem={this._handleOnPressQuestionItem}
          {...{index, currentIndex, isLast, ...item}}
        />
      );
      default: return null;
    };
  };

  _renderListFooter = () => {
    return(
      <View style={{marginBottom: 75}}/>
    );
  };

  render(){
    const { styles } = ModalContents;
    const { sections } = this.state;

    return(
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
          {this._renderTitle()}
          <SectionList
            style={styles.scrollview}
            renderItem={this._renderItem}
            renderSectionHeader={this._renderSectionHeader}
            renderSectionFooter={this._renderSectionFooter}
            ListFooterComponent={this._renderListFooter}
            SectionSeparatorComponent={this._renderSectionSeperator}
            keyExtractor={(item, index) => item + index}
            stickySectionHeadersEnabled={true}
            {...{sections}}
          />
        </View>
        {this._renderFinishButton()}
      </View>
    );
  };
};

export class QuizExamDoneModal extends React.PureComponent {
  static propTypes = {
    onPressQuestionItem: PropTypes.func,
  };

  static styles = StyleSheet.create({
    overlayContainer: {
      flex: 1,
      position: 'absolute',
      height: '100%',
      width: '100%',
    },
    overlay: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      opacity: 0,
      backgroundColor: 'white',
    },
    fireworksContainer: {
      width: '100%',
      height: '100%',
      //alignItems: 'flex-start',
      //justifyContent: 'flex-start',
      //width: '100%', 
      //height: '100%', 
      //backgroundColor: 'red'
    },
    modalBackground: {
      backgroundColor: 'rgb(175, 175, 175)'
    },
  });

  constructor(props){
    super(props);

    this.state = {
      mountContent: false,
      currentIndex: -1,
      startTime: -1,
      questionList: [], 
      answers: [],
      questions: [], 
      quiz: null,
    };

    this._deltaY = null;
    //callbacks
    this.onPressFinishButton = null;
    this.onPressQuestionItem = null;
  };

  componentDidMount(){
    this._deltaY = this._modal._deltaY;
  };

  openModal = async ({currentIndex, questionList, answers, questions, quiz, startTime}) => {
    //Clipboard.setString(JSON.stringify(answers));
    //this.resetPrevTimestamps();
    this.setState({mountContent: true, currentIndex, questionList, answers, questions, quiz, startTime});
    this._modal.showModal();
  };

  resetPrevTimestamps = () => {
    prevTimestamps = [];
  };

  _handleOnModalShow = () => {
  };

  _handleOnModalHide = () => {
    //reset state
    this.setState({mountContent: false, });
  };

  _handleOnPressQuestionItem = async ({index}) => {
    await this._modal.hideModal();
    this.onPressQuestionItem && this.onPressQuestionItem({index});
  };

  _handleOnPressFinishButton = async ({timeStats}) => {
    const overlayOpacity = Platform.select({
      ios: 0.5, android: 0.7,
    });

    this.overlay.transitionTo({opacity: overlayOpacity}, 500);
    this.animationFireworks.start();
    await timeout(750);
    await this._modal.hideModal();

    //call callback and pass down params
    this.onPressFinishButton && this.onPressFinishButton({timeStats});
  };

  _renderContent(){
    const { quiz, questions, questionList, answers, currentIndex, startTime } = this.state;

    const style = {
      flex: 1,
      opacity: this._deltaY.interpolate({
        inputRange: [0, Screen.height - MODAL_DISTANCE_FROM_TOP],
        outputRange: [1, 0.25],
        extrapolateRight: 'clamp',
      }),
    };

    return(
      <Reanimated.View {...{style}}>
        <ModalContents
          onPressQuestionItem={this._handleOnPressQuestionItem}
          onPressFinish={this._handleOnPressFinishButton}
          {...{quiz, questions, questionList, answers, currentIndex, startTime}}
        />
      </Reanimated.View>
    );
  };

  _renderOverlay(){
    const { styles } = QuizExamDoneModal;
    const paddingBottom = (MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP);

    return (
      <View 
        style={[styles.overlayContainer, {paddingBottom}]}
        pointerEvents={'none'}
      >
        <Animatable.View 
          ref={r => this.overlay = r}
          style={styles.overlay}
          useNativeDriver={true}
        />
        <View style={styles.fireworksContainer}>
          <FireworksAnimation ref={r => this.animationFireworks = r}/>
        </View>
      </View>
    );
  };

  render(){
    const { styles } = QuizExamDoneModal;
    const { mountContent } = this.state;
    const paddingBottom = (
      MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP
    );

    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <Fragment>
          <ModalBackground style={[{paddingBottom}, styles.modalBackground]}>
            <ModalTopIndicator/>
            {mountContent && this._renderContent()}
          </ModalBackground>
          {this._renderOverlay()}
        </Fragment>
      </SwipableModal>
    );
  };
};