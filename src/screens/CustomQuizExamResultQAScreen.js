import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback, Clipboard, FlatList, ActivityIndicator, Dimensions, Switch, InteractionManager, StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import EventEmitter from 'events';

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
import TimeAgo from 'react-native-timeago';
import Carousel from 'react-native-snap-carousel';

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
import { TransitionAB } from '../components/Transitioner';
import { ifIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper';
import { StickyHeader } from '../components/StyledComponents';
const { set, cond, block, add, Value, timing, interpolate, and, or, onChange, eq, call, Clock, clockRunning, startClock, stopClock, concat, color, divide, multiply, sub, lessThan, abs, modulo, round, debug, clock } = Animated;

const headerTitle = (props) => <CustomHeader 
  name={'info'}
  type={'simple-line-icon'}
  size={22}
  {...props}  
/>

const VIEW_MODES = {
  'LIST'    : 'LIST'    ,
  'CAROUSEL': 'CAROUSEL',
};

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
      const width = showPercentage? 40 : null;
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

class FilterButton extends React.PureComponent {
  static propTypes = {
    value  : PropTypes.number,
    kind   : PropTypes.string,
    mode   : PropTypes.string,
    onPress: PropTypes.func  ,
  };

  static styles = StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
      width: 137,
      height: 32,
      marginBottom: 8,
      //chart radius - inner chart radius
      paddingLeft: (32/2) - (25/2),
      alignItems: 'center',
      borderRadius: 32/2,
      borderWidth: 1,
    },
    label: {
      fontSize: 16,
      marginLeft: 7,
      width: 72,
      textAlign: 'center',
    },
    result: {
      fontSize: 16,
    }
  });

  getStateFromModeKind(){
    const { MODE } = ResultPieChart;
    const { kind } = this.props;
    switch (kind) {
      case MODE.CORRECT: return {
        label: 'Correct',
        color: GREEN[800],
        //icon props
        name: 'check-circle', 
        type: 'font-awesome', 
      };
      case MODE.INCORRECT: return {
        label: 'Wrong',
        color: RED[900],
        //icon props
        name: 'times-circle', 
        type: 'font-awesome', 
      };
      case MODE.UNANSWERED: return {
        label: 'Skipped',
        color: GREY[900],
        //icon props
        name: 'question-circle', 
        type: 'font-awesome', 
      };
    };
  };

  _handleOnPress = () => {
    const { onPress, kind } = this.props;
    onPress && onPress(kind);
  };

  _renderContents(){
    const { styles } = FilterButton;
    const { kind, mode, value } = this.props;

    const { label, name, type, color } = this.getStateFromModeKind();
    const isSelected = (kind == mode);

    const iconColor = isSelected? 'white' : color;

    const labelStyle = (isSelected
      ? { color: 'white'  , fontWeight: '500' }
      : { color: GREY[900], fontWeight: '300' }
    );

    return(
      <Fragment>
        <Icon
          size={25}
          color={iconColor}
          {...{name, type}}
        />
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
        <Text style={[styles.result, labelStyle]}>
          {value}
        </Text>
      </Fragment>
    );
  };

  render(){
    const { styles } = FilterButton;
    const { kind, mode } = this.props;

    const { color } = this.getStateFromModeKind();
    const isSelected = (kind == mode);

    const buttonContainerStyle = (isSelected
      ? { borderColor: color    , backgroundColor: color   }
      : { borderColor: GREY[300], backgroundColor: 'white' }
    );

    return(
      <TouchableOpacity
        style={[styles.buttonContainer, buttonContainerStyle]}
        onPress={this._handleOnPress}
      >
        {this._renderContents()}
      </TouchableOpacity>
    );
  };
};

class ResultPieChart extends React.PureComponent {
  static propTypes = {
    results: PropTypes.object,
  };

  static MODE = {
    DEFAULT   : 'DEFAULT'   , //initial state
    CORRECT   : 'CORRECT'   , //selected: correct
    INCORRECT : 'INCORRECT' , //selected: incorrect
    UNANSWERED: 'UNANSWERED', //selected: unanswered
  };

  static styles = StyleSheet.create({
    cardContainer: {
      paddingBottom: 10,
    },
    divider: {
      marginVertical: 10,
    },
    headerTextContainer: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
    },
    //picture desc styles
    image: {
      width: 75, 
      height: 75,
      marginRight: 8,
    },
    pictureDescContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    pictureDescText: {
      flex: 1,
      textAlignVertical: 'center',
    },
    pictureDescResultText: {
      color: PURPLE[900],
      fontWeight: '500',
    },
    //results styles
    resultPieContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
    resultsContainer: {
      marginRight: 15,
    },
    //piechart styles
    pieContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pieInfoContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pieInfoFractionLabel: {
      fontSize: 18,
      fontWeight: '700',
    },
    //pie icon styles
    pieIconContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 5,
    },
    pieIcon: {
      width: 12,
      height: 12,
      borderRadius: 12/2,
    },
  });

  constructor(props){
    super(props);
    const { MODE } = ResultPieChart;

    const { correct, incorrect, unaswered, total } = props.results;
    this.state = {
      mode: MODE.DEFAULT,
      showPercentage: false,
    };


    //compute percentages
    this.resultPercentages = {
      perentageCorrect   : (correct   / total) * 100,
      perentageIncorrect : (incorrect / total) * 100,
      perentageUnanswered: (unaswered / total) * 100,
    };  
  };

  getStateFromMode(){
    const { MODE } = ResultPieChart;
    const { results } = this.props;
    const { mode, showPercentage } = this.state;
    //destruct percentages
    const { perentageCorrect, perentageIncorrect, perentageUnanswered } = this.resultPercentages;
    
    switch (mode) {
      case MODE.DEFAULT: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN.A700, RED.A700, GREY[500]],
        label : showPercentage? `${formatPercent(perentageCorrect)}` : `${results.correct}/${results.total}`,
        color : 'white',
        desc  : 'Tap on an item for more info.',
      };
      case MODE.CORRECT: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN.A700, RED[100], GREY[100]],
        label : showPercentage? `${formatPercent(perentageCorrect)}` : `${results.correct}/${results.total}`,
        color : GREEN.A700,
        desc  : 'Items you answered correctly',
      };
      case MODE.INCORRECT: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN[100], RED.A700, GREY[100]],
        label : showPercentage? `${formatPercent(perentageIncorrect)}` : `${results.incorrect}/${results.total}`,
        color : RED.A700,
        desc  : 'The items you got wrong.'
      };
      case MODE.UNANSWERED: return {
        series: [perentageCorrect, perentageIncorrect, perentageUnanswered],
        colors: [GREEN[100], RED[100], GREY[500]],
        label : showPercentage? `${formatPercent(perentageUnanswered)}` : `${results.unaswered}/${results.total}`,
        color : GREY[500],
        desc  : 'Questions with no answer.'
      };
    };
  };

  _handleOnPressResult = (type) => {
    const { MODE } = ResultPieChart;
    const { mode } = this.state;

    this.animatedChart.pulse(500);
    if(mode == type){
      //reset mode to default
      this.setState({mode: MODE.DEFAULT});
    } else {
      this.setState({mode: type});
    };
  };

  _handleOnPressPie = () => {
    const { showPercentage } = this.state;
    this.animatedChart.pulse(500);
    this.setState({showPercentage: !showPercentage});
  };
  
  _renderHeader(){
    const { desc } = this.getStateFromMode();
    return(
      <IconText
        containerStyle={sharedStyles.titleContainer}
        textStyle={sharedStyles.title}
        text={'Quiz Results'}
        subtitleStyle={sharedStyles.subtitle}
        subtitle={desc}
        iconName={'clipboard'}
        iconType={'feather'}
        iconColor={'#512DA8'}
        iconSize={30}
      />
    );
  };

  _renderResults(){
    const { styles, MODE } = ResultPieChart;
    const { results } = this.props;
    const { mode } = this.state;

    return(
      <View style={styles.resultsContainer}>
        <FilterButton
          kind={MODE.CORRECT}
          value={results.correct}
          onPress={this._handleOnPressResult}
          {...{mode}}
        />
        <FilterButton
          kind={MODE.INCORRECT}
          value={results.incorrect}
          onPress={this._handleOnPressResult}
          {...{mode}}
        />
        <FilterButton
          kind={MODE.UNANSWERED}
          value={results.unaswered}
          onPress={this._handleOnPressResult}
          {...{mode}}
        />
      </View>
    );
  };

  _renderPieIcon(){
    const { styles, MODE } = ResultPieChart;
    const { mode } = this.state;

    const { color } = this.getStateFromMode();
    const pieIconStyle = {
      backgroundColor: color,
    };

    //dont render icon when default
    if(mode == MODE.DEFAULT){
      return(
        <View style={styles.pieIconContainer}>
          <Text>Score</Text>
        </View>
      );
    } else {
      return(
        <Animatable.View 
          style={styles.pieIconContainer}
          animation={'pulse'}
          duration={1000}
          iterationCount={'infinite'}
          iterationDelay={1000}
          useNativeDriver={true}
        >
          <View style={[styles.pieIcon, pieIconStyle]}/>
        </Animatable.View>
      );
    };
  };

  _renderPieChart(){
    const { styles } = ResultPieChart;

    const radius = 60;
    const innerRadius = 45;

    const { series, colors, label } = this.getStateFromMode();
    
    const pieInfoContainerStyle = {
      width  : radius * 2,
      height : radius * 2,
      padding: radius - innerRadius,
    };

    return(
      <Animatable.View
        style={styles.pieContainer}
        ref={r => this.animatedChart = r}
        useNativeDriver={true}
      >
        <TouchableOpacity onPress={this._handleOnPressPie}>
          <Animatable.View
            animation={'rotate360'}
            duration={1000 * 80}
            iterationCount={'infinite'}
            delay={1000}
            useNativeDriver={true}
          >
            <Pie
              backgroundColor='#ddd'
              //pass down props
              {...{radius, innerRadius, series, colors}}
            />
          </Animatable.View>
          <View style={[styles.pieInfoContainer, pieInfoContainerStyle]}>
            {this._renderPieIcon()}
            <Text style={styles.pieInfoFractionLabel}>
              {label}
            </Text>
            <View style={{flex: 1}}/>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  render(){
    const { styles } = ResultPieChart;
    return (
      <View style={styles.resultPieContainer}>
        {this._renderResults ()}
        {this._renderPieChart()}
      </View>
    );
  };
};

class ScoreItem extends React.PureComponent {
  static styles = StyleSheet.create({
    indicator: {
      width: 10,
      height: 10,
      borderRadius: 10/2,
      backgroundColor: 'rgba(255,255,255, 0.75)'
    },
  });

  _handleOnPress = () => {
    const { onPress, timestampSaved, type, index, selected } = this.props;
    onPress && onPress({timestampSaved, type, index, selected});
  };

  render(){
    const { styles } = ScoreItem; 
    const { onPress, timestampSaved, type, index, selected, ...otherProps } = this.props;
    const isSelected = (`${timestampSaved}-${type}-${index}` == selected);

    return(
      <TouchableOpacity 
        onPress={this._handleOnPress}
        {...otherProps}
      >
        {isSelected && <View style={styles.indicator}/>}
      </TouchableOpacity>
    );
  };
};

class ScoreBar extends React.PureComponent {
  static propTypes = {
    scoreHistory: PropTypes.array,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    //styles
    containerStyle: PropTypes.object,
    titleStyle: PropTypes.object,
    subtitleStyle: PropTypes.object,
  };

  static TYPES = {
    correct: 'correct',
    wrong  : 'wrong'  ,
    skipped: 'skipped',
  };

  static VALUES = {
    SIZE  : 25 ,
    MARGIN: 0.75,
  };

  static styles = StyleSheet.create({
    //box styles
    boxContainer: {
      flexDirection: 'row',
      overflow: 'hidden',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      overflow: 'hidden',
      borderRadius: 12,
      marginTop: 7,
      backgroundColor: GREY[100],
    },
    box: (() => {
      const { MARGIN, SIZE } = ScoreBar.VALUES;
      return {
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: GREY[100],
        borderTopWidth  : MARGIN,
        borderRightWidth: MARGIN,
        width : SIZE - MARGIN,
        height: SIZE,
      };
    })(),
    //header styles
    detailsContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
      marginBottom: 10,
      paddingRight: 10,  
    },
    datesContainer: {
      flex: 1,
      marginRight: 7,
    },
    date: {
      fontSize: 16,
      fontWeight: '500',
      color: 'black',
    },
    time: {
      fontSize: 16,
      fontWeight: '300',
      color: GREY[900],
    },
    indicator: {
      width: 30,
      height: 30,
      borderRadius: 30/2,
      backgroundColor: 'red',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  constructor(props){
    super(props);
    this.state = {
      width: -1,
      selected: -1,
      timestampSaved: -1, 
      type: '',
    };
  };

  getColor(type){
    const { TYPES } = ScoreBar;
    switch (type) {
      case TYPES.wrong  : return RED  [500];
      case TYPES.correct: return GREEN[500];
      case TYPES.skipped: return GREY [500];
    };
  };

  _handeOnLayout = ({nativeEvent}) => {
    const {x, y, width, height} = nativeEvent.layout;
    if(this.state.width == -1){
      this.setState({width});
    };
  };

  _handleOnPress = ({timestampSaved, type, index}) => {
    const { selected } = this.state;
    const nextSelected = `${timestampSaved}-${type}-${index}`;
    const isSelected = (nextSelected == selected);

    this.trans.transition(!isSelected);
    this.setState({
      selected: isSelected? -1 : nextSelected,
      timestampSaved, type
    });
  };

  _renderBoxes(){
    const { styles, VALUES } = ScoreBar;
    const { scoreHistory } = this.props;
    const { selected, width } = this.state;
    const scores = scoreHistory || [];

    //how many items that can fit in a row (ex: 12)
    const columns = Math.floor(width / VALUES.SIZE);
    const extra_space = width - (columns * VALUES.SIZE);
    const actual_size = VALUES.SIZE + (extra_space / columns);

    scores.sort((a, b) => (a.timestampSaved || 0) - (b.timestampSaved || 0));
    const recentScores = scores.slice(columns * -4)

    return recentScores.map(({timestampSaved, type}, index) => {
      const boxStyle = {
        width: actual_size,
        height: actual_size,
        backgroundColor: this.getColor(type),
      };
      return( 
        <ScoreItem 
          key={`${timestampSaved}-${type}-${index}`}
          style={[styles.box, boxStyle]}
          collapsable={true}
          onPress={this._handleOnPress}
          {...{timestampSaved, type, selected, index}}
        /> 
      );
    });
  };

  _renderHeader(){
    const { styles, TYPES } = ScoreBar;
    const { titleStyle, subtitleStyle } = this.props;
    const { selected, timestampSaved, type } = this.state;
    
    const time = timestampSaved || 0;
    const date = moment(time).format('dddd, MMM D YYYY');
    //indicator bg color
    const backgroundColor = this.getColor(type || '');
    const iconProps = (
      type == TYPES.correct? {type: 'feather', name: 'check'} :
      type == TYPES.wrong  ? {type: 'feather', name: 'x'    } : {type: 'ionicon', name: 'md-help' }
    );

    return(
      <TransitionAB ref={r => this.trans = r}>
        <Fragment>
          <Text style={[styles.title, titleStyle]}>
            {'Result History'}
          </Text>
          <Text style={[styles.subtitle, subtitleStyle]}>
            {'Shows your recent results for this question in chronological order.'}
          </Text>
        </Fragment>
        <Fragment>
          <Text style={[styles.title, titleStyle]}>
            {'Result Item'}
          </Text>
          <Text style={[styles.subtitle, subtitleStyle]}>
            {'Tap on the selected result again to dismiss.'}
          </Text>
          <View style={[styles.detailsContainer]}>
            <View style={styles.datesContainer}>
              <Text numberOfLines={1} style={styles.date}>{date}</Text>
              <TimeAgo 
                style={styles.time}
                numberOfLines={1} 
                {...{time}}
              />
            </View>
            <View style={[styles.indicator, {backgroundColor}]}>
              <Icon
                size={20}
                color={'white'}
                {...iconProps}
              />
            </View>
          </View>
        </Fragment>
      </TransitionAB>
    );
  };

  render(){
    const { styles } = ScoreBar;
    const { containerStyle, boxContainerStyle } = this.props;
    const { width } = this.state;
    const isSizeSet = (width != -1);

    return(
      <View style={[styles.container, containerStyle]}>
        {this._renderHeader()}
        <View 
          style={[styles.boxContainer, boxContainerStyle]}
          onLayout={this._handeOnLayout}
        >
          {isSizeSet && this._renderBoxes()}
        </View>
      </View>
    );
  };
};

class ResultItem extends React.PureComponent {
  static propTypes = {
    index: PropTypes.number,
    initIndex: PropTypes.number,
    answerStats: PropTypes.object,
    scoreHistory: PropTypes.array,
    choicesCount: PropTypes.array,
    durations: PropTypes.object,
    answer: PropTypes.object,
    hasMatchedAnswer: PropTypes.bool,
    question: PropTypes.object,
    totalDurations: PropTypes.object,
    questionID: PropTypes.string,
    totalResults: PropTypes.number,
    viewMode: PropTypes.string,
  };

  static styles = StyleSheet.create({
    carouselCard: {
      flex: 1,
      //remove existing styles
      paddingVertical: 0, 
      paddingHorizontal: 0, 
      //overwrite exisint styles
      marginTop: 12, 
      marginBottom: 12,
      marginHorizontal: 12,
    },
    scrollview: {
      paddingHorizontal: 12,
    },
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
    expanderContainer: {
      marginTop: 7,
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
    statsChoices: {
      marginTop: 5,
      marginBottom: 5,
    },
    //history style
    historyGridContainer: {
      marginTop: 5,
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

  constructor(props){
    super(props);

    const isFirst = (props.index    == props.initIndex);
    const isList  = (props.viewMode == VIEW_MODES.LIST);

    this.state = {
      mount: isFirst || isList,
    };
  };

  componentWillMount() {
    const { EVENTS } = CustomQuizExamResultQAScreen;
    const { emitter } = this.props;

    //subscribe to events
    if(emitter){
      emitter.addListener(
        EVENTS.onIndexChanged,
        this._handleOnIndexChanged
      );
    };
  };

  _handleOnIndexChanged = ({index}) => {
    const { mount } = this.state;
    const props = this.props;

    const isFocused = (props.index == index);
    if(!mount && isFocused){
      this.setState({mount: true});
    };
  };

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
          style={styles.statsChoices}
          {...{choicesCount, questionID, totalResults, answer, question}}
        />
      </Fragment>
    );
  };

  _renderHistoryHeader(isExpanded) {
    const { styles } = ResultItem;
    const suffix = isExpanded? 'collapse' : 'expand';
    return(
      <View style={styles.exapnderHeaderContainer}>
        <Icon
          name={'rotate-ccw'}
          type={'feather'}
          color={PURPLE[500]}
          size={25}
        />
        <View style={styles.exapnderHeaderTextContainer}>
          <Text style={styles.expanderHeaderTitle}>History</Text>
          <Text style={styles.expanderHeaderSubtitle}>{`Tap here to ${suffix}`}</Text>
        </View>
      </View>
    );
  };

  _renderHistory(){
    const { styles } = ResultItem;
    const { answerStats, scoreHistory } = this.props;

    //compute total
    const values = Object.values(answerStats || {});
    const total = values.reduce((acc, cur) => acc + parseInt(cur) || 0, 0);

    const results = { 
      correct  : answerStats.correct || 0, 
      incorrect: answerStats.wrong   || 0, 
      unaswered: answerStats.skipped || 0,
      //pass down total
      total,
    };

    return(
      <View style={styles.expanderContainer}>
        <Text style={styles.statsTitle}>Overall Results</Text>
        <Text style={styles.statsSubtitle}>Shows how many times you got this question right or wrong.</Text>
        <ResultPieChart {...{results}}/>
        <Divider style={styles.divider}/>
        <ScoreBar
          titleStyle={styles.statsTitle}
          subtitleStyle={styles.statsSubtitle}
          {...{scoreHistory}}
        />
      </View>
    );
  };

  _renderContent(){
    const { styles } = ResultItem;
    const { question, index, initIndex, viewMode } = this.props;
    const questionWrapped = QuestionItem.wrap(question);

    const textQuestion    = questionWrapped.question    || "No Question";
    const textExplanation = questionWrapped.explanation || "No Explanation Available.";

    const expanderProps = {
      ...(viewMode === VIEW_MODES.CAROUSEL && {
        //dont collapse if it's the first item
        initCollpased       : index != initIndex,
        unmountWhenCollapsed: index != initIndex,
      }),
    };

    return(
      <Fragment>
        <Divider style={styles.dividerTop}/>
        <TextExpander 
          renderHeader={this._renderQuestionHeader}
          {...expanderProps}
        >
          <Text style={styles.expanderText}>{textQuestion}</Text>
        </TextExpander>

        <Divider style={styles.divider}/>
        <TextExpander 
          renderHeader={this._renderExplanationHeader}
          {...expanderProps}
        >
          <Text style={styles.expanderText}>{textExplanation}</Text>
        </TextExpander>

        <Divider style={styles.divider}/>
        <TextExpander 
          renderHeader={this._renderAnswerHeader}
          {...expanderProps}
        >
          {this._renderAnswer()}
        </TextExpander>

        <Divider style={styles.divider}/>
        <ContentExpander 
          renderHeader={this._renderStatsHeader}
          {...expanderProps}
        >
          <View style={styles.expanderContainer}>
            {this._renderStatsDuration()}
            <Divider style={styles.divider}/>
            {this._renderStatsAnswer()}
          </View>
        </ContentExpander>

        <Divider style={styles.divider}/>
        <ContentExpander 
          renderHeader={this._renderHistoryHeader}
          {...expanderProps}
        >
          {this._renderHistory()}
        </ContentExpander>
        <Divider style={styles.divider}/>
      </Fragment>
    );
  };

  render(){
    const { styles } = ResultItem;
    const { viewMode } = this.props;
    const { mount } = this.state;

    switch (viewMode) {
      case VIEW_MODES.LIST: return (
        <Card>
          {this._renderHeder()}
          {this._renderContent()}
        </Card>
      );
      case VIEW_MODES.CAROUSEL: return (
        <Card style={styles.carouselCard}>
          <ScrollView 
            style={styles.scrollview}
            contentInset={{top: 10, bottom: 10}}
            contentOffset={{y: -10}}
          >
            {this._renderHeder()}
            {mount && <Animatable.View
              animation={'fadeIn'}
              duration={400}
              useNativeDriver={true}
            >
              {this._renderContent()}
            </Animatable.View>}
          </ScrollView>
        </Card>
      );
    };
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
      position: 'absolute',
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
    /** the current result */
    quizResult: 'quizResult',
    /** the current QA list */
    QAList: 'questionAnswersList',
    /** which item to show */
    initIndex: 'initIndex',
  };

  /** event emitter event types */
  static EVENTS = {
    /** Carousel: called when a new item is in focus */
    onIndexChanged: 'onIndexChanged',
  };

  /** combines all qa across all of the results into 1 qa item */
  static combineSameQuestionsAndAnswers(items){
    const results = CustomQuizResultItem.wrapArray(items);
    const QALists = results.map(({questionAnswersList, timestampSaved}) => 
      //pass down timestampSaved to each QA item
      questionAnswersList.map(QAItem => ({ timestampSaved, ...QAItem }))  
    );

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
    const { TYPES } = ScoreBar;
    const questionIDs = Object.keys(items);

    return questionIDs.map(id => {
      const QAItems = QuestionAnswerItem.wrapArray(items[id]);
      const stats = {
        correct: 0,
        skipped: 0,
        wrong  : 0, 
      };
      const totalDurations = {
        totalTime: 0,
        viewCount: 0,
      };

      let scoreHistory = [];

      const { question } = QAItems[0];
      //extract choices from questions
      const choicesWrong = (question.choices || []).map(choice => choice.value);
      //get the correct answer/choice
      const choiceCorrect = question.answer;
      //combine correct answer with wrong choices
      const choices = [choiceCorrect, ...choicesWrong];
      
      //extract user's answers and count correct/wrong/skipped
      const answers = QAItems.map(QAItem => {
        const timestampSaved = QAItem.timestampSaved || 0;
        //check if there's an answer
        const hasMatchedAnswer = (QAItem.hasMatchedAnswer || false);
        const hasAnswer = (QAItem.answer != undefined);

        if(QAItem.durations){
          const { totalTime, viewCount } = QAItem.durations;
          totalDurations.totalTime += (totalTime || 0);
          totalDurations.viewCount += (viewCount || 0);
        };

        if(hasMatchedAnswer && hasAnswer){
          const { isCorrect, userAnswer } = QAItem.answer;
          //increment correct/wrong count
          isCorrect? stats.correct += 1 : stats.wrong += 1;
          //add to score history
          isCorrect? scoreHistory.push({timestampSaved, type: TYPES.correct }) : scoreHistory.push({timestampSaved, type: TYPES.wrong });
          //return user's answer
          return userAnswer || null;

        } else {
          //increment skipped count          
          stats.skipped += 1;
          //add to score history
          scoreHistory.push({timestampSaved, type: TYPES.skipped });
          //return null since there's no answer
          return null;
        };
      }).filter(ans => ans != null);
      
      //count how many times a particular choice has been chosen 
      const choicesCount = choices.map(choice => ({
        count: countOccurences(choice, answers),
        choice,
      }));


      //get the last/latest/current QAItems
      const result = QAItems.pop() || {};
      return {
        answerStats: stats,
        choicesCount,
        totalDurations,
        scoreHistory,
        ...result,
      };
    });
  };

  constructor(props){
    super(props);
    const { NAV_PARAMS } = CustomQuizExamResultQAScreen;
    const { navigation } = props;

    this.emitter = new EventEmitter();
    //get data from prev. screen - quiz results
    const quizResults = navigation.getParam(NAV_PARAMS.quizResults, []);
    const itemIndex   = navigation.getParam(NAV_PARAMS.initIndex  , 0 );
    
    this.state = {
      data: [],
      totalResults: quizResults.length,
      ...((itemIndex == 0)
        ? {loading: LOAD_STATE.LOADING, viewMode: VIEW_MODES.LIST    }
        : {loading: LOAD_STATE.INITIAL, viewMode: VIEW_MODES.CAROUSEL}
      ),
    };
  };

  componentDidMount(){
    const { NAV_PARAMS } = CustomQuizExamResultQAScreen;
    const { navigation } = this.props;
    //get data from prev. screen - quiz results
    const quizResults = navigation.getParam(NAV_PARAMS.quizResults, []);
    const itemIndex   = navigation.getParam(NAV_PARAMS.initIndex  , 0 );

    InteractionManager.runAfterInteractions(async () => {
      try {
        //combine the same QA items across all results
        const QAList      = CustomQuizExamResultQAScreen.combineSameQuestionsAndAnswers(quizResults);
        const QAStatsList = CustomQuizExamResultQAScreen.appendAnswerStats(QAList);

        //hide loading indicator
        await this.container.fadeOutUp(300);
        await setStateAsync(this, {data: QAStatsList, loading: LOAD_STATE.SUCCESS});
        await this.container.fadeInUp(500);

      } catch(error){
        this.setState({loading: LOAD_STATE.ERROR});
        console.log('Modules could not be loaded');
        console.log(error);
      };
    });
  };

  getStateFromMode(){
    const { loading } = this.state;
    
    switch (loading) {
      case LOAD_STATE.INITIAL: return {
        mount  : false,
        hidden : true ,
        loading: true ,
      };
      case LOAD_STATE.LOADING : return {
        mount  : true,
        hidden : true,
        loading: true,
      };
      case LOAD_STATE.SUCCESS : return {
        mount  : true,
        hidden : false,
        loading: false,
      };
      case LOAD_STATE.ERROR: return {
        mount  : true,
        hidden : false,
        loading: false,
      };
    };
  };

  _handleOnSnap = (index) => {
    const { EVENTS } = CustomQuizExamResultQAScreen;
    this.emitter.emit(EVENTS.onIndexChanged, {index});
  };

  _keyExtractor = (item, index) => {
    return(item.questionID || index);
  };

  _renderItem = ({item, index}) => {
    const { NAV_PARAMS } = CustomQuizExamResultQAScreen;
    const { navigation } = this.props;
    const { totalResults, viewMode } = this.state;
    const { answerStats, scoreHistory, choicesCount, durations, totalDurations, answer, hasMatchedAnswer, question, questionID } = item;

    const initIndex = navigation.getParam(NAV_PARAMS.initIndex, 0);

    return(
      <ResultItem 
        emitter={this.emitter}
        //pass down items
        {...{index, initIndex, viewMode, answerStats, scoreHistory, choicesCount, durations, totalDurations, answer, hasMatchedAnswer, question, questionID, totalResults}}
      />
    );
  };

  _renderLoading(){
    const { styles } = CustomQuizExamResultQAScreen;
    const { loading } = this.getStateFromMode();
    if(!loading) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size={'small'}
          color={'white'}
        />
        <Text style={styles.loadingText}>Loading</Text>
      </View>
    );
  };

  _renderError(){
    const { styles } = CustomQuizExamResultQAScreen;
    return (
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

  _renderContents(){
    const { NAV_PARAMS } = CustomQuizExamResultQAScreen;
    const { navigation } = this.props;
    const { data, viewMode } = this.state;

    const { mount, hidden } = this.getStateFromMode();
    const opacity = hidden? 0 : 1;
    if(!mount) return null;

    //get data from prev. screen
    const firstItem = navigation.getParam(NAV_PARAMS.initIndex, 0 );

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
      enableSnap: true,
      scrollEnabled: true,
      snapToAlignment: 'center',
      itemHeight: ifIphoneX(
        screenHeight - headerHeight - getStatusBarHeight(),
        screenHeight - headerHeight,
      ),
      //platform specific props
      ...Platform.select({
        //swipe vertical on ios
        ios: {
          sliderHeight: screenHeight,
          activeSlideAlignment: 'end',
          vertical: true,
        },
        //swipe horizontally on android
        android: {
          sliderHeight: screenHeight - headerHeight,
          sliderWidth : screenWidth,
          itemWidth   : screenWidth,
          vertical: false,
          activeSlideAlignment: 'center'
        }
      }),
    };

    switch (viewMode) {
      case VIEW_MODES.LIST: return (
        <FlatList
          ref={r => this.flatlist = r}
          style={{opacity}}
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
          //adjust top distance
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
          {...{data}}
        />
      );
      case VIEW_MODES.CAROUSEL: return(
        <Carousel
          ref={r => this._carousel = r }
          renderItem={this._renderItem}
          onSnapToItem={this._handleOnSnap}
          shouldOptimizeUpdates={true}
          //scrollview props
          showsHorizontalScrollIndicator={true}
          bounces={true}
          lockScrollWhileSnapping={true}
          //pass down props
          {...{data, firstItem, ...carouseProps}}
        />
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
          {this._renderLoading ()}
        </Animatable.View>
      </ViewWithBlurredHeader>
    );
  };
};