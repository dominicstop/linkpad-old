import React, { Fragment } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform , Alert, ActivityIndicator, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';

import { ViewWithBlurredHeader } from '../components/Views';
import { RippleBorderButton } from '../components/Buttons';
import { AndroidHeader, AndroidBackButton } from '../components/AndroidHeader';
import { CustomQuizList } from '../components/CustomQuizExam';

import { ViewImageScreen } from './ViewImageScreen';
import { CustomQuizExamResultScreen } from './CustomQuizExamResultScreen';

import { QuizExamDoneModal } from '../modals/QuizExamDoneModal';

import Constants, { LOAD_STATE, SCREENPROPS_KEYS } from '../Constants'
import { ROUTES, STYLES } from '../Constants';
import { PURPLE } from '../Colors';

import { QuizQuestion } from '../models/Quiz';

import { timeout, getTimestamp, convertHoursToMS, hexToRgbA, plural} from '../functions/Utils';
import { CustomQuizResults } from '../functions/CustomQuizResultsStore';
import { CustomQuiz, CustomQuizStore } from '../functions/CustomQuizStore';

import * as Animatable from 'react-native-animatable';
import { createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { PreboardExamStore } from '../functions/PreboardExamStore';
import { PreboardExamItem, PreboardExamQuestion, PreboardExam } from '../models/PreboardModel';
import { EXAM_TYPE, TestQuestion, TestInformation, TestDuration, TestStat } from '../models/TestModels';
import { LoadingPill } from '../components/StyledComponents';
import { ExamTestList } from '../components/ExamTestList';
import { ExamTestDoneModal } from '../modals/ExamTestDoneModal';

//custom header left component
class CancelButton extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      alignItems: 'center',
    },
    label: {
      fontSize: 17,
      fontWeight: '100',
      marginLeft: 7,
      marginBottom: 2,
      color: 'white',
    },
  });

  constructor(props){
    super(props);
    //assignable callback
    this.onPress = null;
  };

  _handleOnPress = () => {
    this.onPress && this.onPress();
  };

  _renderIOS(){
    const { styles } = CancelButton;
    
    return(
      <TouchableOpacity 
        style={styles.container}
        onPress={this._handleOnPress}
      >
        <Icon
          name={'ios-close-circle'}
          type={'ionicon'}
          color={'white'}
          size={22}
        />
        <Text style={styles.label}>Cancel</Text>
      </TouchableOpacity>
    );
  };

  _renderAndroid(){
    return(
      <AndroidBackButton onPress={this._handleOnPress}/>
    );
  };

  render(){
    return Platform.select({
      ios    : this._renderIOS(),
      android: this._renderAndroid(),
    });
  };
};

//custom header title
class HeaderTitle extends React.PureComponent {
  static styles = StyleSheet.create({
    wrapper: {
      shadowOffset:{ height: 0, width: 0 },
      shadowColor: PURPLE[50],
      shadowRadius: 8,
      shadowOpacity: 0.1,
    },
    container: Platform.select({
      ios: {
        overflow: 'hidden',
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        borderColor: PURPLE.A700,
        borderWidth: 1,
      }
    }),
    title: {
      paddingHorizontal: 7,
      paddingVertical: 4,
      ...Platform.select({
        ios: {
          fontSize: 16,
          fontWeight: '200',
        },
        android: {
          fontSize: 19,
          fontWeight: '400',
          color: 'white',
        },
      })
    },
    titleCount: {
      fontWeight: '700'
    },
    bgContainer: {
      position: 'absolute',
      height: '100%',
      backgroundColor: hexToRgbA(PURPLE.A700, 0.15),
    },
  });

  constructor(props){
    super(props);
    this.state = {
      index: props.index || 1,
      total: props.total || 1,
      percent: 0,
    };
  };

  setIndex = (index) => {
    this.wrapper.pulse(300);
    this.setState({index});
  };
  
  setTotal = (total) => {
    this.setState({total});
  };

  setPercentage = (percent) => {
    this.setState({
      percent: isNaN(percent)? 0 : percent
    });
  };

  _renderText(){
    const { styles } = HeaderTitle;
    const { index, total } = this.state;

    return(
      <Text style={styles.title}>
        {'Question: '}
        <Text style={styles.titleCount}>
          {`${index}/${total}`}
        </Text>
      </Text>
    );
  };

  _renderBG(){
    const { styles } = HeaderTitle;
    const { percent } = this.state;

    const bgContainerStyle = {
      width: `${percent}%`,
    };

    return(
      <View style={[styles.bgContainer, bgContainerStyle]}>

      </View>
    );
  };

  render(){
    const { styles } = HeaderTitle;

    return(
      <Animatable.View
        style={styles.wrapper}
        ref={r => this.wrapper = r}
        animation={'fadeIn'}
        duration={750}
        delay={500}
        useNativeDriver={true}
      >
        <Animatable.View 
          style={styles.container}
          animation={'pulse'}
          duration={15000}
          delay={3000}
          iterationCount={'infinite'}
          iterationDelay={2000}
          useNativeDriver={true}
        >
          {this._renderBG()}
          {this._renderText()}
        </Animatable.View>
      </Animatable.View>
    );
  };
};

//custom header right component
class DoneButton extends React.PureComponent {
  static styles = StyleSheet.create({
    button: {
      marginRight: 5,
    },
    buttonContainer: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      alignItems: 'center',
    },
    label: {
      marginLeft: 7,
      color: 'white',
      ...Platform.select({
        ios: {
          marginBottom: 2,
          fontSize: 17,
          fontWeight: '100',
        },
        android: {
          fontSize: 18,
          fontWeight: '400',
        }
      })
    },
  });

  constructor(props){
    super(props);
    //assignable callback
    this.onPress = null;
  };

  _handleOnPress = () => {
    this.onPress && this.onPress();
  };

  animate = () => {
    this._animatable.rubberBand(1250);
  };

  render(){
    const { styles } = DoneButton;
    
    return(
      <Animatable.View
        ref={r => this._animatable = r}
        useNativeDriver={true}
      >
        <RippleBorderButton 
          containerStyle={styles.button}
          onPress={this._handleOnPress}
        >
          <View style={styles.buttonContainer}>
            <Icon
              name={'ios-checkmark-circle'}
              type={'ionicon'}
              color={'white'}
              size={24}
            />
            <Text style={styles.label}>Done</Text>
          </View>
        </RippleBorderButton>
      </Animatable.View>
    );
  };
};

//access callbacks and references
let References = {
  CancelButton: null,
  HeaderTitle : null,
  DoneButton  : null,
};

class CountdownTimer extends React.PureComponent {
  static propTypes = {
    startTime: PropTypes.number,
    duration : PropTypes.number,
    onTick   : PropTypes.func  ,
  };

  constructor(props){
    super(props);

    this.endTime = (props.startTime + props.duration);

    this.isFinished = false;
    this.interval   = null;
  };

  componentDidMount(){
    this.start();
  };

  componentWillUnmount(){
    this.stop();
  };

  start = () => {
    const { onTimerEnd, onTick, duration } = this.props;
    //stop if there's already a timer
    if(this.interval) return;

    this.interval = setInterval(() => {
      const currentTime = new Date().getTime();

      let remaining = (this.endTime - currentTime );
      remaining = (remaining >= 0? remaining : 0);

      const progress = (duration - remaining);

      //progress  = (progress  >= 0? progress  : 0);

      //compute progress percent
      const percent = Math.ceil((progress / duration) * 100);

      console.log(`currentTime: ${currentTime}`);
      console.log(`progress   : ${progress   }`);
      console.log(`remaining  : ${remaining  }`);
      console.log(`percent    : ${percent    }\n\n`);
      

      onTick && onTick({
        percent,
        msRemaining: remaining,
        msProgress : progress ,
      });
      
      if(currentTime >= this.endTime){
        onTimerEnd && onTimerEnd(currentTime);
        
        this.isFinished = true;
        this.stop();
      };
    }, 1000);
  };

  stop(){
    if(this.interval){
      clearInterval(this.interval);
      this.interval = null;
    };
  };

  render(){
    return null;
  };
};

export class ExamTestScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { NAV_PARAMS } = ExamTestScreen;
    const questions = TestQuestion.wrapArray(
      navigation.getParam(NAV_PARAMS.questions, [])
    );

    const headerTitle = (
      <HeaderTitle
        ref={r => References.HeaderTitle = r}
        total={questions.length}
      />
    );

    const headerLeft = (
      <CancelButton 
        ref={r => References.CancelButton = r}  
      />
    );

    const headerRight = (
      <DoneButton
        ref={r => References.DoneButton = r}  
      />
    );

    return ({
      title: 'Custom Quiz',
      headerTitleStyle: STYLES.glow,
      //pass down header buttons
      headerTitle, headerRight, headerLeft,
      //custom android header
      ...Platform.select({
        android: { header: props => 
          <AndroidHeader
            centerComponent={headerTitle}
            rightComponent={headerRight}
            {...props}
          />
      }}),
    });
  };

  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
    },
  });

  static NAV_PARAMS = {
    questions: 'questions', //TestQuestion item
    examType : 'examType' , //EXAM_TYPE enum
    testInfo : 'testInfo' , //TestInformation item
  };

  static createQuestionIDIndexMap(questions = [TestQuestion.structure]){
    return (questions || []).map((question = {}, index) => 
      question.questionID || '',
    );
  };
  
  constructor(props){
    super(props);

    this.initValues();
    this.state = {
      loading: LOAD_STATE.LOADING,
    };
  };

  componentDidMount = async () => {
    const { NAV_PARAMS } = ExamTestScreen;
    const { navigation } = this.props;

    //get questions passed from prev. screen
    const questions = TestQuestion.wrapArray(
      navigation.getParam(NAV_PARAMS.questions, [])
    );

    //show loading indicator
    await this.loadingPill.setVisibility(true);

    //wait for animations to finish
    InteractionManager.runAfterInteractions(async () => {
      //load images and data
      await this.loadData();

      //init. refs to comps
      this.initRefs();

      //initialize durations with first q item
      this.recordDuration(0, questions[0].questionID);
    });    
  };

  initValues(){
    const { createQuestionIDIndexMap, NAV_PARAMS } = ExamTestScreen;
    const { navigation } = this.props;

    //get questions passed from prev. screen
    const questions = navigation.getParam(NAV_PARAMS.questions, []);

    //record exam start timestamp
    this.startTime = (new Date()).getTime();
    //create an array of questionIDs from the questions
    this.indexIDMap = createQuestionIDIndexMap(questions);    

    //used for recording durations
    this.prevSnap  = null;
    this.durations = [];

    this.carousel = null;
    this.base64Images = {};

    this.didShowLastQuestionAlert = false;
    this.didShowTimerEndAlert     = false;
  };

  initRefs(){
    const { screenProps } = this.props;

    //get modal ref from screenprops
    const key = SCREENPROPS_KEYS.getRefTestExamDoneModal;
    this.doneModal = (screenProps[key])();
    //get SnapCarousel ref
    this.carousel = this.examList.getCarouselRef();

    //assign callbacks to header buttons
    References.CancelButton.onPress = this._handleOnPressHeaderCancel;
    References.DoneButton  .onPress = this._handleOnPressHeaderDone;

    //assign callbacks to modal
    this.doneModal.onPressQuestionItem = this._handleOnPressQuestionItem;
    this.doneModal.onPressFinishButton = this._handleOnPressFinishButton;
  };

  async loadData(){
    const { NAV_PARAMS } = ExamTestScreen;
    const { navigation } = this.props;
    const examType = navigation.getParam(NAV_PARAMS.examType, '');
    const questions  = TestQuestion.wrapArray(
      navigation.getParam(NAV_PARAMS.questions, [])
    );
    
    try {
      switch (examType) {
        case EXAM_TYPE.preboard:
          this.base64Images = await PreboardExamStore.getImages(questions);
          this.setState({loading: LOAD_STATE.SUCCESS});
          this.loadingPill.setVisibility(false);

          break;

        case EXAM_TYPE.customQuiz:
          break;
      };
    } catch(error){
      Alert.alert('Error', 'Unable to load image.');
      this.setState({loading: LOAD_STATE.ERROR});
      console.log('ExamTestScreen - Unable to Load Data');
      console.log(error);
    };
  };

  /** record how much time is spend on each item */
  recordDuration(index, questionID){
    const nextSnap = { 
      index, questionID,
      timestamp: Date.now(),
    };

    if(this.prevSnap){
      const prevSnap = this.prevSnap;
      this.prevSnap = nextSnap;

      this.durations.push(TestDuration.wrap({
        questionID,
        index    : prevSnap.index,
        timestamp: nextSnap.timestamp,
        duration : (nextSnap.timestamp - prevSnap.timestamp),
        //extra/misc data 
        indexNext    : index,
        timestampPrev: prevSnap.timestamp,
        timestampNext: nextSnap.timestamp,
      }));

    } else {
      this.prevSnap = nextSnap;
    };
  };

  //#region ----- EVENT HANDLERS -----
  /** From header navbar done button */
  _handleOnPressHeaderDone = () => {
    const { openModal: PARAM_KEYS } = ExamTestDoneModal.PARAM_KEYS;
    const { NAV_PARAMS } = ExamTestScreen;
    const { navigation } = this.props;

    const testInfo  = navigation.getParam(NAV_PARAMS.testInfo );
    const questions = navigation.getParam(NAV_PARAMS.questions);

    //compute avg, min, max etc. time spent
    const testStats = TestStat.computeAvgFromDurations(this.durations);
    
    //open ExamTestDoneModal and pass params
    this.doneModal.openModal({
      [PARAM_KEYS.testInfo ]: testInfo      ,
      [PARAM_KEYS.testStats]: testStats     ,
      [PARAM_KEYS.questions]: questions     ,
      [PARAM_KEYS.startTime]: this.startTime,
      //pass down examlist state/data
      [PARAM_KEYS.answersList       ]: this.examList.getAnswerList        (),
      [PARAM_KEYS.questionsList     ]: this.examList.getQuestionList      (),
      [PARAM_KEYS.answerHistoryList ]: this.examList.getAnswerHistoryList (),
      [PARAM_KEYS.questionsRemaining]: this.examList.getRemainingQuestions(),
      //pass down from examlist carousel
      [PARAM_KEYS.currentIndex]: this.carousel.currentIndex,
    });
  };

  _handleOnTick = ({percent, msRemaining, msProgress}) => {
    //update header title progress
    const header = References.HeaderTitle;
    header && header.setPercentage(percent);
  };

  _handleOnTimerEnd = () => {
    const { NAV_PARAMS } = ExamTestScreen;
    const { navigation } = this.props;
    const testInfo  = TestInformation.wrap(
      navigation.getParam(NAV_PARAMS.testInfo, {})
    );

    const { examType, preboardTimeLimit: limit = 0 } = testInfo;
    const timelimit = `${limit} ${plural('hour', limit)}`;

    //only show this once and only if preboard
    if(this.didShowTimerEndAlert && examType != EXAM_TYPE.preboard) return;
    this.didShowTimerEndAlert = true;

    Alert.alert(
      "Time's Up",
      `The time limit of ${timelimit} has been reached. The Preboard exam is now over.`,
      {cancelable: false},
    );

    //todo: disable exam
  };
  
  /** From ExamTestList */
  _handleOnSnapToItem = (index) => {
    const { NAV_PARAMS, styles } = ExamTestScreen;
    const { navigation } = this.props;
    const header = References.HeaderTitle;

    const examType = navigation.getParam(NAV_PARAMS.examType , '');
    const isPreboard = (examType == EXAM_TYPE.preboard);

    if(header && isPreboard){
      //update navbar header title
      header.setIndex(index + 1);
      
    } else if(header && !isPreboard){
      //update navbar header title + progress
      const questions = navigation.getParam(NAV_PARAMS.questions, []);
      const percent = Math.floor(((index + 1) / questions.length) * 100);

      header.setIndex(index + 1);
      header.setPercentage(percent);
    };

    const questionID = this.indexIDMap[index];
    this.recordDuration(index, questionID);
  };

  /** From ExamTestList */
  _handleOnAnsweredLastQuestion = async () => {
    //only show this once
    if(this.didShowLastQuestionAlert) return;
    this.didShowLastQuestionAlert = true;

    const choice = await new Promise(res => Alert.alert(
      "Last Question Answered",
      "If you're done answering, press 'OK', if not press 'Cancel' (You can press 'Done' on the upper right corner later when you're finished.)",
      [
        {onPress: () => res(true ), text: 'OK' },
        {onPress: () => res(false), text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: false},
    ));

    //todo: open done modal
  };

  /** From ExamTestList */
  _handleOnNewAnswerSelected = () => {
    if(this.rootContainer){
      this.rootContainer.pulse(750);
    };
  };

  /** From DoneModal - question item pressed */
  _handleOnPressQuestionItem = async ({index}) => {
    const container = this.rootContainer;
    this.carousel.snapToItem(index, true);

    await timeout(500);
    await container && container.pulse(750);
  };
  //#endregion

  render(){
    const { NAV_PARAMS, styles } = ExamTestScreen;
    const { navigation } = this.props;
    const { loading } = this.state;

    const questions = navigation.getParam(NAV_PARAMS.questions, []);
    const examType  = navigation.getParam(NAV_PARAMS.examType , '');
    const testInfo  = TestInformation.wrap(
      navigation.getParam(NAV_PARAMS.testInfo , {})
    );

    const timelimit = (testInfo.preboardTimeLimit || 0);
    const duration  = convertHoursToMS(timelimit); //10 * 1000

    const content = (() => {
      switch (loading) {
        case LOAD_STATE.SUCCESS: return(
          <Animatable.View
            ref={r => this.rootContainer = r}
            style={styles.rootContainer}
            animation={'fadeInUp'}
            duration={500}
            delay={750}
            useNativeDriver={true}
          >
          <ExamTestList
            ref={r => this.examList = r}
            onSnapToItem={this._handleOnSnapToItem}
            onNewAnswerSelected={this._handleOnNewAnswerSelected}
            onAnsweredLastQuestion={this._handleOnAnsweredLastQuestion}
            {...{questions, examType}}
          />
        </Animatable.View>
        );
      };
    })();

    return (
      <ViewWithBlurredHeader hasTabBar={false}>
        {(examType === EXAM_TYPE.preboard) && (
          <CountdownTimer
            startTime={this.startTime}
            //onTick={this._handleOnTick}
            onTimerEnd={this._handleOnTimerEnd}
            {...{duration}}
          />
        )}
        {content}
        <LoadingPill 
          ref={r => this.loadingPill = r}
          initialVisible={false}
        />
      </ViewWithBlurredHeader>
    );
  };
};

const ExamTestStack = createStackNavigator({
  [ROUTES.TestExamRoute]: ExamTestScreen,
  //[ROUTES.CustomQuizViewImageRoute]: ViewImageScreen, 
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: {
      gesturesEnabled: false,
      ...Constants.HEADER_PROPS
    },
  }
);

//container for the stacknav: ExamTestStack
export class ExamTestStackContainer extends React.PureComponent {
  static router = ExamTestStack.router;

  static navigationOptions = {
    header: null,
  };

  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1, 
      height: '100%', 
      width: '100%', 
      backgroundColor: 'rgb(233, 232, 239)'
    },
  });

  render = () => {
    const { styles } = ExamTestStackContainer;

    return (
      <View style={styles.rootContainer}>
        <ExamTestStack
          navigation={this.props.navigation}
          screenProps={{
            ...this.props.screenProps,
            [SCREENPROPS_KEYS.getRefTestExamDoneModal]: () => this.testExamDoneModal,
          }}
        />
        <ExamTestDoneModal 
          ref={r => this.testExamDoneModal = r}
        />    
      </View>
    );
  };
};