import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback, Clipboard, FlatList, ActivityIndicator, Dimensions, Switch, InteractionManager} from 'react-native';
import PropTypes from 'prop-types';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView, IconFooter, AnimatedListItem } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader } from '../components/Header' ;

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import moment from "moment";
import Pie from 'react-native-pie'
import { Header, NavigationEvents } from 'react-navigation';
import { Divider, Icon } from 'react-native-elements';
import SegmentedControlTab from "react-native-segmented-control-tab";

import * as shape from 'd3-shape'
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
import { LinearGradient, Stop, Defs, G } from 'react-native-svg'

import { STYLES, ROUTES , HEADER_HEIGHT, LOAD_STATE} from '../Constants';
import { plural, isEmpty, timeout , formatPercent, ifTrue, callIfTrue, setStateAsync, countOccurences} from '../functions/Utils';
import { BLUE , GREY, PURPLE, RED, GREEN} from '../Colors';
import {CustomQuizResultsStore,  CustomQuizResultItem, QuestionAnswerItem} from '../functions/CustomQuizResultsStore';

import Animated, { Easing } from 'react-native-reanimated';
import { ModuleStore } from '../functions/ModuleStore';
import { ModuleItemModel, QuestionItem, SubjectItem } from '../models/ModuleModels';
const { set, cond, block, add, Value, timing, interpolate, and, or, onChange, eq, call, Clock, clockRunning, startClock, stopClock, concat, color, divide, multiply, sub, lessThan, abs, modulo, round, debug, clock } = Animated;


const headerTitle = (props) => <CustomHeader 
  name={'info'}
  type={'simple-line-icon'}
  size={22}
  {...props}  
/>

class Expander extends React.PureComponent {
  static propTypes = {
    renderHeader: PropTypes.func,
    contentContainer: PropTypes.object,
  };

  static styles = StyleSheet.create({
    contentWrapper: {
      overflow: 'hidden',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      marginRight: 10,
    },
    arrowContainer: {
      width: 25,
      height: 25,
      borderRadius: 25/2,
      backgroundColor: PURPLE[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  constructor(props){
    super(props);

    //animation values
    this.heightExpanded  = new Value(-1);
    this.heightCollapsed = new Value(0);
    this.progress        = new Value(100);

    this.height = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, this.heightExpanded],
      extrapolate: 'clamp',
    });
    this.opacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    this.indicatorOpacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });
    this.scale = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.9, 1],
      extrapolate: 'clamp',
    });
    this.rotation = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 180],
      extrapolate: 'clamp',
    });

    this.isExpanded = true;
    this.isHeightMeasured = false;
  };

  expand = async (expand) => {
    if(!this.isHeightMeasured){      
      //get current height of expanded
      const height = await new Promise(resolve => {
        this.contentContainer.measure((x, y, w, h) => resolve(h));
      });

      console.log('heightExpanded: ' + height);

      //set height measured flag to true
      this.isHeightMeasured = true;
      //set animated height values
      this.heightExpanded.setValue(height);
    };

    const config = {
      duration: 300,
      toValue : expand? 100 : 0,
      easing  : Easing.inOut(Easing.ease),
    };

    if(this.isExpanded != expand){
      //start animation
      const animation = timing(this.progress, config);
      animation.start();
      this.isExpanded = expand;
    };
  };

  _handleOnPressHeader = () => {
    this.expand(!this.isExpanded);
  };

  _renderHeader(){
    const { styles } = Expander;
    const { renderHeader } = this.props;

    const arrowContainerStyle = {
      opacity: this.indicatorOpacity,
      transform: [
        { rotate: concat(this.rotation, 'deg') },
        { scale: this.scale},
      ],
    };

    return(
      <TouchableOpacity 
        onPress={this._handleOnPressHeader}
        style={[styles.headerContainer, this.props.headerContainer]}
        activeOpacity={0.75}
      >
        <View style={styles.headerTitle}>
          {renderHeader && renderHeader()}
        </View>
        <Animated.View style={[styles.arrowContainer, arrowContainerStyle]}>
          <Icon
            name={'chevron-down'}
            type={'feather'}
            color={'white'}
            size={17}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  _renderContent(){
    const { styles } = Expander;
    const contentWrapperStyle = {
      opacity: this.opacity,
      height: this.height,
    };
    const contentContainer = {
      position: cond(eq(this.heightExpanded, -1), 'relative', 'absolute')
    };

    return(
      <Animated.View style={[styles.contentWrapper, contentWrapperStyle]}>  
        <Animated.View style={[this.props.contentContainer, contentContainer]}>
          <View ref={r => this.contentContainer = r}>
            {this.props.children}
          </View>
        </Animated.View>
      </Animated.View>
    );
  };

  render(){
    return(
      <View>
        {this._renderHeader()}
        {this._renderContent()}
      </View>
    );
  };
};

class ResultItem extends React.PureComponent {
  static propTypes = {
    index: PropTypes.number,
    answerStats: PropTypes.object,
    choicesCount: PropTypes.array,
    durations: PropTypes.object,
    answer: PropTypes.object,
    hasMatchedAnswer: PropTypes.bool,
    question: PropTypes.object,
  };

  static styles = StyleSheet.create({
    //divider styles
    divider: {
      marginVertical: 7,
      marginHorizontal: 10,
    },
    dividerTop: {
      marginTop: 8,
      marginBottom: 6,
      marginHorizontal: 10,
    },
    //header styles
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTextContainer: {
      marginLeft: 7,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: PURPLE[1000]
    },
    headerSubtitle: {
      fontSize: 16,
      fontWeight: '200',
      color: GREY[900],
    },
    //header number indicator styles
    headerNumberContainer: {
      width: 24,
      height: 24,
      borderRadius: 24/2,
      backgroundColor: PURPLE[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerNumber: {
      fontSize: 15,
      color: 'white',
      fontWeight: '500',
    },
    //expander styles
    exapnderHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    exapnderHeaderTextContainer: {
      marginLeft: 7,
    },
    expanderHeaderTitle: {
      fontSize: 18,
      fontWeight: '700'
    },
    expanderHeaderSubtitle: {
      fontSize: 16,
      fontWeight: '300',
      color: GREY[900]
    },
    expanderText: {
      marginTop: 5,
      fontSize: 17,
    },
    //answer text styles
    answerRowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    answerIcon: {
      width: 18,
      marginRight: 7,
    },
    answerText: {
      fontSize: 17,
    },
    answerLabelText: {
      fontWeight: '500'
    },
  });

  _renderHeder(){
    const { styles } = ResultItem;
    const { question, index } = this.props;
    const questionWrapped = QuestionItem.wrap(question);

    const moduleName  = questionWrapped.modulename  || 'Module Unknown' ;
    const subjectName = questionWrapped.subjectname || 'Subject Unknown';

    const fontSize = (
      (index + 1 < 10 )? 15 :
      (index + 1 < 100)? 13 : 11
    );

    return(
      <View style={styles.headerContainer}>
        <View style={styles.headerNumberContainer}>
          <Text style={[styles.headerNumber, {fontSize}]}>
            {index + 1}
          </Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            {moduleName}
          </Text>
          <Text style={styles.headerSubtitle}>
            {subjectName}
          </Text>
        </View>
      </View>
    );
  };

  _renderQuestionHeader(){
    const { styles } = ResultItem;
    return(
      <View style={styles.exapnderHeaderContainer}>
        <Icon
          name={'help-circle'}
          type={'feather'}
          color={PURPLE[500]}
          size={25}
        />
        <View style={styles.exapnderHeaderTextContainer}>
          <Text style={styles.expanderHeaderTitle}>Question</Text>
          <Text style={styles.expanderHeaderSubtitle}>Tap to expand or collapse</Text>
        </View>
      </View>
    );
  };

  _renderExplanationHeader(){
    const { styles } = ResultItem;
    return(
      <View style={styles.exapnderHeaderContainer}>
        <Icon
          name={'info'}
          type={'feather'}
          color={PURPLE[500]}
          size={25}
        />
        <View style={styles.exapnderHeaderTextContainer}>
          <Text style={styles.expanderHeaderTitle}>Explanation</Text>
          <Text style={styles.expanderHeaderSubtitle}>Tap to expand or collapse</Text>
        </View>
      </View>
    );
  };

  _renderAnswerHeader = () => {
    const { styles } = ResultItem;
    const { answer } = this.props;
    
    const isCorrect  = (answer.isCorrect  || false);
    const name = isCorrect? 'check-circle' : 'x-circle';

    return(
      <View style={styles.exapnderHeaderContainer}>
        <Icon
          type={'feather'}
          color={PURPLE[500]}
          size={25}
          {...{name}}
        />
        <View style={styles.exapnderHeaderTextContainer}>
          <Text style={styles.expanderHeaderTitle}>Answers</Text>
          <Text style={styles.expanderHeaderSubtitle}>Tap to expand or collapse</Text>
        </View>
      </View>
    );
  };

  _renderAnswer(){
    const { styles } = ResultItem;
    const { question, answer } = this.props;

    const questionItem = QuestionItem.wrap(question);
    
    const isCorrect  = (answer.isCorrect  || false       );
    const userAnswer = (answer.userAnswer || 'No Answer.');

    return (isCorrect?(
      <View style={styles.answerRowContainer}>
        <Icon
          containerStyle={styles.answerIcon}
          size={18}
          name={'check-circle'}
          type={'font-awesome'}
          color={'green'}
        />
        <Text numberOfLines={1} style={styles.answerText}>
          {questionItem.answer || "No Data"}
        </Text>
      </View>
    ):(
      <View>
        <View style={styles.answerRowContainer}>
          <Icon
            containerStyle={styles.answerIcon}
            size={18}
            name={'circle-with-cross'}
            type={'entypo'}
            color={'red'}
          />
          <Text style={styles.answerText}>
            <Text style={styles.answerLabelText}>{'Answered: '}</Text>
            {userAnswer}
          </Text>
        </View>
        <View style={styles.answerRowContainer}>
          <Icon
            containerStyle={styles.answerIcon}
            size={18}
            name={'check-circle'}
            type={'font-awesome'}
            color={'green'}
          />
          <Text style={styles.answerText}>
            <Text style={styles.answerLabelText}>{'Answer: '}</Text>
            {questionItem.answer}
          </Text>
        </View>
      </View>
    ));

    return (
      <View>
        <View style={styles.answerRowContainer}>
          <Icon
            name={''}
            type={''}
            size={20}
            color={'red'}
          />
        </View>
      </View>
    );
  };

  render(){
    const { styles } = ResultItem;
    const { question } = this.props;
    const questionWrapped = QuestionItem.wrap(question);

    const textQuestion    = questionWrapped.question    || "No Question";
    const textExplanation = questionWrapped.explanation || "No Explanation Available.";

    return(
      <Card>
        {this._renderHeder()}
        <Divider style={styles.dividerTop}/>
        <Expander renderHeader={this._renderQuestionHeader}>
          <Text style={styles.expanderText}>{textQuestion}</Text>
        </Expander>
        <Divider style={styles.divider}/>
        <Expander renderHeader={this._renderExplanationHeader}>
          <Text style={styles.expanderText}>{textExplanation}</Text>
        </Expander>
        <Divider style={styles.divider}/>
        <Expander renderHeader={this._renderAnswerHeader}>
          {this._renderAnswer()}
        </Expander>
        <Divider style={styles.divider}/>
      </Card>
    );
  };
};

export class CustomQuizExamResultQAScreen extends React.PureComponent {
  static navigationOptions = {
    title: 'Answers',
    headerTitle,
    //custom android header
    ...Platform.select({
      android: { header: props => <AndroidHeader {...props}/> }
    }),
  };

  static styles = StyleSheet.create({
    container: {
      marginTop: HEADER_HEIGHT,
    },
    loadingContainer: {
      alignSelf: 'center',
      marginTop: 15,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 15,
      backgroundColor: PURPLE.A700,
      borderRadius: 15, 
    },
    loadingText: {
      marginLeft: 7,
      fontSize: 16,
      fontWeight: '500',
      color: 'white',
    },
  });

  /** combines all qa across all of the results into 1 qa item */
  static combineSameQuestionsAndAnswers(items){
    const results = CustomQuizResultItem.wrapArray(items);
    const QALists = results.map(result => result.questionAnswersList);

    let list = {};
    QALists.forEach(QAList => {
      QAList.forEach(QAItem => {
        const { questionID } = QAItem;
        if(list[questionID]){
          //item already exists, so append
          list[questionID].push(QAItem);
        } else {
          //item doesnt exists, so initialize
          list[questionID] = [QAItem];
        };
      });
    });
    return list;
  };

  /** get stats */
  static appendAnswerStats(items){
    const questionIDs = Object.keys(items);

    return questionIDs.map(id => {
      const results = QuestionAnswerItem.wrapArray(items[id]);
      const stats = {
        correct: 0,
        skipped: 0,
        wrong  : 0, 
      };

      const { question } = results[0];
      //extract choices from questions
      const choicesWrong = (question.choices || []).map(choice => choice.value);
      //get the correct answer/choice
      const choiceCorrect = question.answer;
      //combine correct answer with wrong choices
      const choices = [choiceCorrect, ...choicesWrong];
      
      //extract user's answers and count correct/wrong/skipped
      const answers = results.map(result => {
        //check if there's an answer
        const hasMatchedAnswer = (result.hasMatchedAnswer || false);
        const hasAnswer = (result.answer != undefined);

        if(hasMatchedAnswer && hasAnswer){
          const { isCorrect, userAnswer } = result.answer;
          //increment correct/wrong count
          isCorrect? stats.correct += 1 : stats.wrong += 1;
          //return user's answer
          return userAnswer || null;

        } else {
          //increment skipped count          
          stats.skipped += 1;
          //return null since there's no answer
          return null;
        };
      }).filter(ans => ans != null);
      
      //count how many times a particular choice has been chosen 
      const choicesCount = choices.map(choice => ({
        count: countOccurences(choice, answers),
        choice,
      }));

      const result = results[0];
      return {
        answerStats: stats,
        choicesCount,
        ...result,
      };
    });
  };

  constructor(props){
    super(props);
    const {navigation  } = props;

    //get data from prev. screen - quiz results
    const quizResults = navigation.getParam('quizResults', []);
    
    //combine the same QA items across all results
    const QAList = CustomQuizExamResultQAScreen.combineSameQuestionsAndAnswers(quizResults);
    const QAStatsList = CustomQuizExamResultQAScreen.appendAnswerStats(QAList);

    this.state = {
      data: QAStatsList,
      modulesByID: null,
      subjectsByID: null,
      loading: LOAD_STATE.LOADING,
    };
  };

  componentDidMount(){
    InteractionManager.runAfterInteractions(async () => {
      try {
        const data = await ModuleStore.read();
        const modules = ModuleItemModel.wrapArray(data);

        //collapse module array into obj - access modules via dot not.
        const modulesByID = modules.reduce((acc, module) => {
          const id = (module.indexid != undefined)? module.indexid : -1; 
          //skip if moduleid does not exist - because id can be 0 thus, if(0) false
          if(id == -1) return acc;

          //append module data to acc
          acc[id] = module;
          return acc;
        }, {});

        //collapse module array into obj - access subjec via dot not.
        const subjectsByID = modules.reduce((acc, module) => {
          const moduleID = (module.indexid  || -1);
          const subjects = (module.subjects || []);

          //skip if moduleid does not exist
          if(moduleID === -1) return acc;

          //collapse subject array into obj
          const subjectsAcc = subjects.reduce((subjectAcc, subject) => {
            const subjectID = (subject.indexid != undefined)? subject.indexid : -1; 
            //skip if subjectid does not exist
            if(subjectID == -1) return subjectAcc;
            
            //append subject data to acc
            subjectAcc[`${moduleID}-${subjectID}`] = subject;
            return subjectAcc;
          }, {});
          
          return {...acc, ...subjectsAcc};
        }, {});

        this.setState({
          loading: LOAD_STATE.SUCCESS,
          modulesByID, subjectsByID,
        });
      } catch(error){
        this.setState({loading: LOAD_STATE.ERROR});
        console.log('Modules could not be loaded');
        console.log(error);
      };
    });
  };

  _keyExtractor = (item, index) => {
    return(item.questionID || index);
  };

  _renderItem = ({item, index}) => {
    const { answerStats, choicesCount, durations, answer, hasMatchedAnswer, question } = item;

    return(
      <AnimatedListItem
        last={5}
        duration={500}
        multiplier={300}
        {...{index}}
      >
        <ResultItem 
          //pass down items
          {...{index, answerStats, choicesCount, durations, answer, hasMatchedAnswer, question}}
        />
      </AnimatedListItem>
    );
  };

  _renderContents(){
    const { styles } = CustomQuizExamResultQAScreen;
    const { loading, data } = this.state;

    switch (loading) {
      case LOAD_STATE.INITIAL:
      case LOAD_STATE.LOADING: return (
        <Animatable.View
          style={styles.container}
          animation={'fadeInUp'}
          duration={500}
          useNativeDriver={true}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size={'small'}
              color={'white'}
            />
            <Text style={styles.loadingText}>Loading</Text>
          </View>
        </Animatable.View>
      );
      case LOAD_STATE.SUCCESS: return (
        <FlatList
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
          //adjust top distance
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
          {...{data}}
        />
      );
      case LOAD_STATE.ERROR: return (
        <Animatable.View
          style={styles.container}
          animation={'fadeInUp'}
          duration={300}
          useNativeDriver={true}
        >
          <Card>
            <Text>Error</Text>
          </Card>
        </Animatable.View>
      );
    };
  };

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        {this._renderContents()}
      </ViewWithBlurredHeader>
    );
  };
};