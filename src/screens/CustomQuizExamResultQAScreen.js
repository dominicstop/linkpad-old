import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback, Clipboard, FlatList, ActivityIndicator, Dimensions, Switch, InteractionManager} from 'react-native';
import PropTypes from 'prop-types';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView, IconFooter, AnimatedListItem } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader } from '../components/Header' ;

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import moment from "moment";
import Chroma from 'chroma-js'
import Pie from 'react-native-pie'
import { Header, NavigationEvents } from 'react-navigation';
import { Divider, Icon } from 'react-native-elements';
import SegmentedControlTab from "react-native-segmented-control-tab";

import * as shape from 'd3-shape'
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
import { LinearGradient, Stop, Defs, G } from 'react-native-svg'

import { STYLES, ROUTES , HEADER_HEIGHT, LOAD_STATE} from '../Constants';
import { plural, isEmpty, timeout , formatPercent, ifTrue, callIfTrue, setStateAsync, countOccurences} from '../functions/Utils';
import { BLUE , GREY, PURPLE, RED, GREEN, ORANGE} from '../Colors';
import {CustomQuizResultsStore,  CustomQuizResultItem, QuestionAnswerItem} from '../functions/CustomQuizResultsStore';

import Animated, { Easing } from 'react-native-reanimated';
import { ModuleStore } from '../functions/ModuleStore';
import { ModuleItemModel, QuestionItem, SubjectItem } from '../models/ModuleModels';
import { TextExpander, ContentExpander } from '../components/Expander';
const { set, cond, block, add, Value, timing, interpolate, and, or, onChange, eq, call, Clock, clockRunning, startClock, stopClock, concat, color, divide, multiply, sub, lessThan, abs, modulo, round, debug, clock } = Animated;

const headerTitle = (props) => <CustomHeader 
  name={'info'}
  type={'simple-line-icon'}
  size={22}
  {...props}  
/>

class TouchableViewPager extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      current: 0,
    };
  };

  _handleOnPress = () => {
    const { current } = this.state;
    const max = React.Children.count(this.props.children);
    const next = current + 1;
    this.setState({current: (next + 1) > max? 0 : next });
  };

  render(){
    const { current } = this.state;
    return(
      <TouchableOpacity 
        onPress={this._handleOnPress}
        {...this.props}
      >
        {this.props.children[current]}
      </TouchableOpacity>
    );
  };
};

class ChoicesCountStat extends React.PureComponent {
  static propTypes = {
    choicesCount: PropTypes.array,
    questionID: PropTypes.string,
    totalResults: PropTypes.number,
    answer: PropTypes.object,
    question: PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    itemContainer: {
      flexDirection: 'row',
      backgroundColor: PURPLE[100],
      paddingHorizontal: 7,
      paddingVertical: 8,
    },
    choiceContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    countContainer: {
      marginLeft: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    numberContainer: {
      width: 17,
      height: 17,
      borderRadius: 17/2,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 7,
    },
    numberText: {
      color: PURPLE[800],
      fontWeight: '700',
    },
    choiceText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '200',
    },
    countText: {
      color: 'white',
      fontSize: 15,
      fontWeight: '500',
    },
  });

  constructor(props){
    super(props);
    const count = (props.choicesCount || []).length;
    this.colors = Chroma.scale([PURPLE[500], PURPLE[900]]).colors(count);
    
    this.state = {
      showPercentage: true,
    };
  };

  _handleOnPress = () => {
    const { showPercentage } = this.state;
    this.setState({showPercentage: !showPercentage});
  };

  _renderItems(){
    const { styles } = ChoicesCountStat;
    const { choicesCount, questionID, totalResults, answer, question } = this.props;
    const { showPercentage } = this.state;

    const answerCorrect = question.answer;
    const answerUser    = answer? answer.userAnswer : null;

    const styleDefault = {BGColor: PURPLE[50 ], textColor: PURPLE[800]};
    const styleCorrect = {BGColor: GREEN [100], textColor: GREEN [900]};
    const styleWrong   = {BGColor: RED   [100], textColor: RED   [900]};

    const choices = (choicesCount || []);
    //sort from lowest to highest
    choices.sort((a, b) => (a.count || 0) - (b.count || 0));

    return choices.map((item, index) => {
      const choice = item.choice || 'N/A';
      const width = showPercentage? 38 : null;
      const itemBGColor = this.colors[index];
      const numberColors = ((answer == null)
        ? answerCorrect == (choice)? styleCorrect : styleDefault
        : (choice == answerCorrect)? styleCorrect : 
          (choice == answerUser   )? styleWrong   : styleDefault
      );

      //number of times selected as answer over the total time answered
      const countText = (item.count != undefined)? item.count : 'N/A';
      //compute percentage of number times selected as answer
      const percent = Math.round((item.count || 0) /(totalResults || 0) * 100);
      
      return(
        <View 
          style={[styles.itemContainer, {backgroundColor: itemBGColor}]}
          key={`${questionID}-${choice}-${countText}-${index}`}
        >
          <View style={styles.choiceContainer}>
            <View style={[styles.numberContainer, {backgroundColor: numberColors.BGColor}]}>
              <Text style={[styles.numberText, {color: numberColors.textColor}]}>
                {index + 1}
              </Text>
            </View>
            <Text style={styles.choiceText}>
              {choice}
            </Text>
          </View>
          <View style={[styles.countContainer, {width}]}>
            {showPercentage? (
                <Text style={styles.countText}>
                  {`${percent}%`}
                </Text>
              ):(
                <Text style={styles.countText}>
                  {countText}
                  <Text style={{fontWeight: '100'}}>
                    {`/${totalResults}`}
                  </Text>
                </Text>
              )
            }
          </View>
        </View>
      );
    });
  };

  render(){
    const { styles } = ChoicesCountStat;
    return(
      <TouchableOpacity 
        style={[styles.container, this.props.style]}
        onPress={this._handleOnPress}
        activeOpacity={0.95}
      >
        {this._renderItems()}
      </TouchableOpacity>
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
    totalDurations: PropTypes.object,
    questionID: PropTypes.string,
    totalResults: PropTypes.number,
  };

  static styles = StyleSheet.create({
    //divider styles
    divider: {
      marginVertical: 8,
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
    //stats styles
    statsContainer: {
      marginTop: 7,
    },
    statsTitle: {
      fontWeight: '600',
      fontSize: 18,
      color: PURPLE[900],
    },
    statsSubtitle: {
      fontSize: 16,
      fontWeight: '200',
      marginBottom: 7,
    },
    //stats row/column styles
    detailRow: {
      flexDirection: 'row',
      marginBottom: 5,
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

  _renderQuestionHeader(isExpanded){
    const { styles } = ResultItem;
    const suffix = isExpanded? 'collapse' : 'expand';

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
          <Text style={styles.expanderHeaderSubtitle}>{`Tap here to ${suffix}`}</Text>          
        </View>
      </View>
    );
  };

  _renderExplanationHeader(isExpanded){
    const { styles } = ResultItem;
    const suffix = isExpanded? 'collapse' : 'expand';

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
          <Text style={styles.expanderHeaderSubtitle}>{`Tap here to ${suffix}`}</Text>          
        </View>
      </View>
    );
  };

  _renderAnswerHeader = (isExpanded) => {
    const { styles } = ResultItem;
    const { answer } = this.props;
    const suffix = isExpanded? 'collapse' : 'expand';  

    const isCorrect  = answer? answer.isCorrect  : false;
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
          <Text style={styles.expanderHeaderSubtitle}>{`Tap here to ${suffix}`}</Text>
        </View>
      </View>
    );
  };

  _renderAnswer(){
    const { styles } = ResultItem;
    const { question, answer } = this.props;

    const questionItem = QuestionItem.wrap(question);
    
    const isCorrect  = answer? answer.isCorrect  : false;
    const userAnswer = answer? answer.userAnswer : 'No Answer.';

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
  };

  _renderStatsHeader(isExpanded) {
    const { styles } = ResultItem;
    const suffix = isExpanded? 'collapse' : 'expand';
    return(
      <View style={styles.exapnderHeaderContainer}>
        <Icon
          name={'plus-circle'}
          type={'feather'}
          color={PURPLE[500]}
          size={25}
        />
        <View style={styles.exapnderHeaderTextContainer}>
          <Text style={styles.expanderHeaderTitle}>Statistics</Text>
          <Text style={styles.expanderHeaderSubtitle}>{`Tap here to ${suffix}`}</Text>
        </View>
      </View>
    );
  };

  _renderStatsDuration(){
    const { styles } = ResultItem;
    const { answerStats, durations, totalDurations } = this.props;

    //current durations
    const totalTime = (durations !== undefined)? durations.totalTime || 0 : 0;
    const viewCount = (durations !== undefined)? durations.viewCount || 0 : 0;
    //aggregate durations
    const sumTotalTime = (durations !== undefined)? totalDurations.totalTime || 0 : 0;
    const sumviewCount = (durations !== undefined)? totalDurations.viewCount || 0 : 0;
    //dont show if current and aggregate are the same
    const showTotalRow = (totalTime != sumTotalTime) && (viewCount != sumviewCount);
    
    //format totalTime
    const duration      = moment(totalTime).format('mm:ss');
    const totalDuration = moment(sumTotalTime).format('mm:ss');

    return(
      <Fragment>
        <Text style={styles.statsTitle}>Duration and Views</Text>
        <Text style={styles.statsSubtitle}>Tap to toggle between showing the current or aggregate duration and view count.</Text>
        <View style={styles.detailRow}>
          <TouchableViewPager style={{flex: 1}}>
            <Fragment>
              <Text numberOfLines={1} style={styles.detailTitle   }>{'Duration: '}</Text>
              <Text numberOfLines={1} style={styles.detailSubtitle}>{duration}</Text>
            </Fragment>
            <Fragment>
              <Text numberOfLines={1} style={styles.detailTitle   }>{'Total Duration: '}</Text>
              <Text numberOfLines={1} style={styles.detailSubtitle}>{totalDuration}</Text>
            </Fragment>
          </TouchableViewPager>
          <TouchableViewPager style={{flex: 1}}>
            <Fragment>
              <Text numberOfLines={1} style={styles.detailTitle   }>{'View Count: '}</Text>
              <Text numberOfLines={1} style={styles.detailSubtitle}>{`${viewCount} times`}</Text>
            </Fragment>
            <Fragment>
              <Text numberOfLines={1} style={styles.detailTitle   }>{'Total Views: '}</Text>
              <Text numberOfLines={1} style={styles.detailSubtitle}>{`${sumviewCount} times`}</Text>
            </Fragment>
          </TouchableViewPager>
        </View>
      </Fragment>
    );
  };

  _renderStatsAnswer(){
    const { styles } = ResultItem;
    const { answerStats, choicesCount, questionID, totalResults, answer, question } = this.props;

    return(
      <Fragment>
        <Text style={styles.statsTitle}>Choices Frequency</Text>
        <Text style={styles.statsSubtitle}>Shows how many times a choice has been selected. Tap to toggle percentage.</Text>
        <ChoicesCountStat
          style={{marginTop: 5}}
          {...{choicesCount, questionID, totalResults, answer, question}}
        />
      </Fragment>
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
        <TextExpander renderHeader={this._renderQuestionHeader}>
          <Text style={styles.expanderText}>{textQuestion}</Text>
        </TextExpander>
        <Divider style={styles.divider}/>
        <TextExpander renderHeader={this._renderExplanationHeader}>
          <Text style={styles.expanderText}>{textExplanation}</Text>
        </TextExpander>
        <Divider style={styles.divider}/>
        <TextExpander renderHeader={this._renderAnswerHeader}>
          {this._renderAnswer()}
        </TextExpander>
        <Divider style={styles.divider}/>
        <ContentExpander renderHeader={this._renderStatsHeader}>
          <View style={styles.statsContainer}>
            {this._renderStatsDuration()}
            <Divider style={styles.divider}/>
            {this._renderStatsAnswer()}
          </View>
        </ContentExpander>
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
    loadingContainer: {
      marginTop: HEADER_HEIGHT + 15,
      alignSelf: 'center',
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

  static NAV_PARAMS = {
    /** the previous results */
    quizResults: 'quizResults',
    /** the current QA list */
    QAList: 'questionAnswersList',
    /** which item to show */
    initIndex: 'initIndex'
  };

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
      const totalDurations = {
        totalTime: 0,
        viewCount: 0,
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

        if(result.durations){
          const { totalTime, viewCount } = result.durations;
          totalDurations.totalTime += (totalTime || 0);
          totalDurations.viewCount += (viewCount || 0);
        };

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


      //get the last/latest/current results
      const result = results.pop() || {};
      return {
        answerStats: stats,
        choicesCount,
        totalDurations,
        ...result,
      };
    });
  };

  constructor(props){
    super(props);
    const { NAV_PARAMS } = CustomQuizExamResultQAScreen;
    const { navigation } = props;

    //get data from prev. screen - quiz results
    const quizResults = navigation.getParam(NAV_PARAMS.quizResults, []);
    const totalResults = quizResults.length;
    
    this.state = {
      data: [],
      loading: LOAD_STATE.LOADING,
      initialNumToRender: 6,
      totalResults,
    };
  };

  componentDidMount(){
    const { NAV_PARAMS } = CustomQuizExamResultQAScreen;
    const { navigation } = this.props;
    //get data from prev. screen - quiz results
    const quizResults = navigation.getParam(NAV_PARAMS.quizResults     , []);
    const itemIndex   = navigation.getParam(NAV_PARAMS.initIndex, 0 );

    InteractionManager.runAfterInteractions(async () => {
      try {
        //combine the same QA items across all results
        const QAList      = CustomQuizExamResultQAScreen.combineSameQuestionsAndAnswers(quizResults);
        const QAStatsList = CustomQuizExamResultQAScreen.appendAnswerStats(QAList);

        //hide loading indicator
        await this.container.fadeOutUp(300);

        //update flatlist data and mount
        if(itemIndex == 0){
          await setStateAsync(this, {data: QAStatsList, loading: LOAD_STATE.SUCCESS});
          await this.container.fadeInUp(400);

        } else {
          setStateAsync(this, {data: QAStatsList, loading: LOAD_STATE.SUCCESS, initialNumToRender: itemIndex + 1});
          await timeout(500);
          this.flatlist.scrollToIndex({
            index: itemIndex, 
            animated: false,
            ...Platform.select({ios: {viewOffset: HEADER_HEIGHT}}),
          });
          await timeout(500);
          setStateAsync(this, {initialNumToRender: 6});
          await this.container.fadeInUp(400);
        };

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
    const { totalResults } = this.state;
    const { answerStats, choicesCount, durations, totalDurations, answer, hasMatchedAnswer, question, questionID } = item;

    return(
      <ResultItem 
        //pass down items
        {...{index, answerStats, choicesCount, durations, totalDurations, answer, hasMatchedAnswer, question, questionID, totalResults}}
      />
    );
  };

  _renderContents(){
    const { styles } = CustomQuizExamResultQAScreen;
    const { loading, data, initialNumToRender } = this.state;

    switch (loading) {
      case LOAD_STATE.INITIAL:
      case LOAD_STATE.LOADING: return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size={'small'}
            color={'white'}
          />
          <Text style={styles.loadingText}>Loading</Text>
        </View>
      );
      case LOAD_STATE.SUCCESS: return (
        <FlatList
          ref={r => this.flatlist = r}
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
          //adjust top distance
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
          {...{data, initialNumToRender}}
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
        <Animatable.View
          ref={r => this.container = r}
          animation={'fadeInUp'}
          duration={500}
          useNativeDriver={true}
        >
          {this._renderContents()}
        </Animatable.View>
      </ViewWithBlurredHeader>
    );
  };
};