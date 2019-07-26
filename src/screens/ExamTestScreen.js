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

import { timeout, getTimestamp} from '../functions/Utils';
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
    container: Platform.select({
      ios: {
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
      }
    }),
    title: Platform.select({
      ios: {
        fontSize: 16,
        fontWeight: '200',
      },
      android: {
        fontSize: 19,
        fontWeight: '400',
        color: 'white',
      },
    }),
    titleCount: {
      fontWeight: '700'
    },
  });

  constructor(props){
    super(props);
    this.state = {
      index: props.index || 1,
      total: props.total || 1,
    };
  };

  setIndex = (index) => {
    this.setState({index});
  };
  
  setTotal = (total) => {
    this.setState({total});
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

  render(){
    const { styles } = HeaderTitle;

    return(
      <Animatable.View
        animation={'fadeIn'}
        duration={750}
        delay={500}
        useNativeDriver={true}
      >
        <Animatable.View 
          style={styles.container}
          animation={'pulse'}
          duration={10000}
          delay={3000}
          iterationCount={'infinite'}
          iterationDelay={1000}
          useNativeDriver={true}
        >
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
    container: {
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

    this.initialize();
    this.state = {
      loading: LOAD_STATE.LOADING,
    };
  };

  componentDidMount = async () => {
    const { NAV_PARAMS } = ExamTestScreen;
    const { navigation, screenProps } = this.props;

    //get questions passed from prev. screen
    const questions = TestQuestion.wrapArray(
      navigation.getParam(NAV_PARAMS.questions, [])
    );

    //show loading indicator
    await this.loadingPill.setVisibility(true);

    //get modal ref from screenprops
    const key = SCREENPROPS_KEYS.getRefTestExamDoneModal;
    this.doneModal = (screenProps[key])();

    //assign callbacks to header buttons
    References.CancelButton.onPress = this._handleOnPressHeaderCancel;
    References.DoneButton  .onPress = this._handleOnPressHeaderDone;

    //wait for animations to finish
    InteractionManager.runAfterInteractions(async () => {
      //load images and data
      await this.loadData();

      //initialize durations with first q item
      this.recordDuration(0, questions[0].questionID);
    });    
  };

  initialize(){
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

    this.base64Images = {};
    this.didShowLastQuestionAlert = false;
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
    });
  };

  _handleOnSnapToItem = (index) => {
    //update header title index
    const header = References.HeaderTitle;
    header && header.setIndex(index + 1);

    const questionID = this.indexIDMap[index];
    this.recordDuration(index, questionID);
    
  };

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
  //#endregion

  render(){
    const { NAV_PARAMS } = ExamTestScreen;
    const { navigation } = this.props;
    const { loading } = this.state;

    const questions = navigation.getParam(NAV_PARAMS.questions, {});
    const examType  = navigation.getParam(NAV_PARAMS.examType , '');

    const content = (() => {
      switch (loading) {
        case LOAD_STATE.SUCCESS: return(
          <ExamTestList
            ref={r => this.examList = r}
            onSnapToItem={this._handleOnSnapToItem}
            onAnsweredLastQuestion={this._handleOnAnsweredLastQuestion}
            {...{questions, examType}}
          />
        );
      };
    })();
    
    return (
      <ViewWithBlurredHeader hasTabBar={false}>
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