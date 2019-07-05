import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated as NativeAnimated, Dimensions, ScrollView, FlatList, Clipboard } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES, FONT_STYLES } from '../Constants';
import { PURPLE, GREY, BLUE, GREEN, RED, ORANGE, AMBER, INDIGO, LIGHT_GREEN } from '../Colors';
import { setStateAsync, timeout, addLeadingZero } from '../functions/Utils';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconFooter } from '../components/Views';

import * as Animatable from 'react-native-animatable';
import _ from 'lodash';
import moment from "moment";
import TimeAgo from 'react-native-timeago';
import Chroma from 'chroma-js';

import Lottie from 'lottie-react-native'
import { Icon, Divider } from 'react-native-elements';

import { QuizAnswer, QuizQuestion, QUIZ_LABELS } from '../models/Quiz';
import { isIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';

import { BlurViewWrapper, StickyHeader, DetailRow, DetailColumn, ModalBottomTwoButton, ModalTitle, ModalSection, ExpanderHeader, NumberIndicator, StyledSwipableModal, StickyCollapsableScrollView, StickyCollapseHeader } from '../components/StyledComponents';

import Animated, { Easing } from 'react-native-reanimated';
import { CustomQuiz, CustomQuizStore } from '../functions/CustomQuizStore';
import { ContentExpander } from '../components/Expander';
import { CustomQuizResultItem } from '../functions/CustomQuizResultsStore';
import { LinearGradient } from 'expo-linear-gradient';
const { interpolate, Value } = Animated; 

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};


class QuizDetails extends React.PureComponent {
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
      fontSize: 20,
      color: PURPLE[600],
      fontWeight: '600',
    },
    date: {
      fontSize: 17,
      color: 'black',
      fontWeight: '300',
    },
    label: {
      color: PURPLE[1000],
      fontWeight: '500',
    },
    dateString: {
      color: 'rgb(80, 80, 80)',
      fontWeight: '100',
    },
    description: {
      fontSize: 17,
      fontWeight: '300'
    },
    descriptionLabel: {
      fontWeight: '400'      
    }
  });

  _renderTitle(){
    const { styles } = QuizDetails;
    const quiz = CustomQuiz.wrap(this.props.quiz);

    return(
      <Text 
        style={styles.title}
        numberOfLines={1}
      >
        {quiz.title || 'Unknown Title'}
      </Text>
    );
  };

  _renderDate(){
    const { styles } = QuizDetails;
    const quiz = CustomQuiz.wrap(this.props.quiz);
    const timestampCreated = quiz.timestampCreated || 0; 

    const time = timestampCreated * 1000;
    const date = new Date(time);

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const dateString = date.toLocaleDateString('en-US', options);

    return(
      <Text style={styles.date}>
        <Text style={styles.label}>Created: </Text>
        <TimeAgo {...{time}}/>
        <Text style={styles.dateString}>{` (${dateString})`}</Text>
      </Text>
    );
  };

  _renderDetails(){
    const { styles } = QuizDetails;
    const { quiz: _quiz } = this.props;

    const quiz = CustomQuiz.wrap(_quiz);
    const questionCount = quiz.questions.length || 0;
    const subtitle = (quiz.distributeEqually
      ? quiz.itemsPerSubject
      : 'Custom'
    );

    return(
      <DetailRow marginTop={7}>
        <DetailColumn
          title={'Questions:'}
          subtitle={`${questionCount} items`}
        />
        <DetailColumn
          title={'Allocation:'}
          {...{subtitle}}
        />
      </DetailRow>
    );
  };

  _renderDescription(){
    const { styles } = QuizDetails;
    const { quiz: _quiz } = this.props;
    const quiz = CustomQuiz.wrap(_quiz);

    return(
      <Text style={styles.description}>
        <Text style={styles.label}>Description: </Text>
        {quiz.description || 'No Description Available'}
      </Text>
    );
  };

  render(){
    const { styles } = QuizDetails;
    return(
      <ModalSection>
        {this._renderTitle()}
        {this._renderDate()}
        {this._renderDetails()}
        <View style={styles.divider}/>
        {this._renderDescription()}
      </ModalSection>
    );
  };
};

class QuizSubjectList extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      paddingVertical: 0,
      paddingBottom: 2,
      paddingTop: 0,
    },
    itemContainer: {
      paddingVertical: 5,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    divider: {
      backgroundColor: 'rgba(0,0,0,0.25)',
    },
    itemTitle: {
      flex: 1,
      marginLeft: 6,
      color: PURPLE[1000],
    },
    detailsContainer: {
      flexDirection: 'row',
      marginTop: 3,
      alignItems: 'center',
    },
    moduleName: {
      flex: 1,
      marginBottom: 5,
      fontWeight: '200'
    },
    indicator: {
      fontWeight: '600',
      color: PURPLE[1000],
    },
    itemCountContainer: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderColor: PURPLE.A400,
      borderWidth: 1,
      borderRadius: 10,
      marginBottom: 2,
    },
    itemCount: {
      color: PURPLE.A400,
      fontWeight: '400',
    },
  });

  _handleKeyExtractor = (item, index) => {
    return item.subjectID || index;
  };

  _renderItem = ({item, index}) => {
    const { styles } = QuizSubjectList;
    const { quiz: _quiz } = this.props;

    const quiz = CustomQuiz.wrap(_quiz);
    const isLast = (index + 1) == quiz.subjects.length;

    const TITLE = (
      <View style={styles.titleContainer}>
        <NumberIndicator
          value={index + 1}
          initFontSize={14}
          size={20}  
        />
        <Text 
          style={[FONT_STYLES.heading7, styles.itemTitle]}
          numberOfLines={1}
        >
          {item.subjectname || 'subject name n/a'}
        </Text>
      </View>
    );

    const DETAILS = (
      <View style={styles.detailsContainer}>
        <Text style={[FONT_STYLES.subtitle1, styles.moduleName]}>
          <Text style={styles.indicator}>
            {'Module: '}
          </Text>
          <Text>
            {item.modulename || 'module name n/a'}
          </Text>
        </Text>
        <View style={styles.itemCountContainer}>
          <Text style={styles.itemCount}>
            {`${item.allocatedItems || 0} items`}
          </Text>
        </View>
      </View>
    );

    return(
      <Fragment>
        {(index != 0) && <Divider style={styles.divider}/>}
        <View style={styles.itemContainer}>
          {TITLE}
          {DETAILS}
        </View>
      </Fragment>
    );
  };

  render(){
    const { styles } = QuizSubjectList; 
    const { quiz: _quiz } = this.props;
    const quiz = CustomQuiz.wrap(_quiz);
    
    return(
      <ModalSection containerStyle={styles.container}>
        <FlatList
          data={quiz.subjects}
          renderItem={this._renderItem}
          keyExtractor={this._handleKeyExtractor}
        />
      </ModalSection>
    );
  };
};

class QuizResultItem extends React.PureComponent {
  static VALUES = {
    BAR_HEIGHT: 12,
  };

  static styles = StyleSheet.create({
    container: {
      paddingVertical: 10,
    },
    titleSubtitleWrapper: {
      flexDirection: 'row',
    },
    titleSubtitleContainer: {
      flex: 1,
    },
    itemContainer: {
      paddingVertical: 5,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    divider: {
      backgroundColor: 'rgba(0,0,0,0.25)',
    },
    title: {
      flex: 1,
      marginLeft: 6,
      color: PURPLE[1000],
    },
    detailsContainer: {
      flexDirection: 'row',
      marginTop: 3,
      alignItems: 'center',
    },
    subtitle: {
      flex: 1,
      marginTop: 3,
      fontWeight: '200'
    },
    indicator: {
      fontWeight: '600',
      color: PURPLE[1000],
    },
    resultContainer: {
      alignSelf: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderColor: PURPLE.A400,
      borderWidth: 1,
      borderRadius: 10,
      marginBottom: 2,
    },
    resultText: {
      color: PURPLE.A400,
      fontWeight: '400',
    },
    scoreBarWrapper: {
      opacity: 0.75,
      marginTop: 5,
      height: QuizResultItem.VALUES.BAR_HEIGHT,
      borderRadius: QuizResultItem.VALUES.BAR_HEIGHT/2,
      paddingVertical: 1.5,
      paddingHorizontal: 2,
      borderColor: PURPLE.A700,
      borderWidth: 1,
    },
    scoreBarContainer: {
      height: '100%',
      borderRadius: QuizResultItem.VALUES.BAR_HEIGHT/2,
      overflow: 'hidden',
    },
    scoreBar: {
      position: 'absolute', 
      width: Screen.width - 10, 
      height: '100%'
    },
  });

  _renderTitle(){
    const { styles } = QuizResultItem;
    const { result: _result, index } = this.props;
    const result = CustomQuizResultItem.wrap(_result);

    const date = moment(result.endTime);
    const dateString1 = date.format('MMMM D Y, dddd');
    const dateString2 = date.fromNow();

    const { correct, total } = result.results;
    const score = Math.floor((correct / total) * 100);
    const scoreText = (score >= 50)? 'Passed' : 'Failed';
  
    //shows the date created
    const TITLE = (
      <View style={styles.titleContainer}>
        <NumberIndicator
          value={index + 1}
          initFontSize={14}
          size={20}  
        />
        <Text 
          style={[FONT_STYLES.heading7, styles.title]}
          numberOfLines={1}
        >
          {dateString1}
        </Text>
      </View>
    );
    
    //shows the relative date created
    const SUBTITLE = (
      <Text style={[FONT_STYLES.subtitle1, styles.subtitle]}>
        <Text style={styles.indicator}>{'Taken: '}</Text>
        <Text>{dateString2}</Text>
      </Text>
    );

    return (
      <View style={styles.titleSubtitleWrapper}>
        <View style={styles.titleSubtitleContainer}>
          {TITLE}
          {SUBTITLE}
        </View>
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            {`${scoreText}: ${score}%`}
          </Text>
        </View>
      </View>
    );
  };

  _renderScoreBar(){
    const { styles, VALUES } = QuizResultItem;
    const { result: _result } = this.props;
    const result = CustomQuizResultItem.wrap(_result);

    const { correct, total } = result.results;
    const score = Math.floor((correct / total) * 100);
    
    const scoreBarContainerStyle = {
      width: (score < VALUES.BAR_HEIGHT)? VALUES.BAR_HEIGHT : `${score}%`,
    };

    return(
      <View style={styles.scoreBarWrapper}>
        <View style={[styles.scoreBarContainer, scoreBarContainerStyle]}>
          <LinearGradient
            style={styles.scoreBar}
            colors={[PURPLE.A700, BLUE.A700]}
            start={{ x: 0, y: 1 }}
            end  ={{ x: 1, y: 1 }}
          />
        </View>
      </View>
    );
  };

  render(){
    const { styles } = QuizResultItem;
    return(
      <View style={styles.container}>
        {this._renderTitle   ()}
        {this._renderScoreBar()}
      </View>
    );
  };
};

class QuizResultsList extends React.PureComponent {  
  static styles = StyleSheet.create({
    container: {
      paddingVertical: 0,
      paddingBottom: 2,
      paddingTop: 0,
    },
    //header styles
    headerContainer: {
      flexDirection: 'row',
      paddingVertical: 5,
      borderColor: GREY[200],
      borderBottomWidth: 1,
      alignItems: 'center',
    },
    headerImage: {
      width : 80,
      height: 80,
    },
    headerTextContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      marginLeft: 15,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: PURPLE[700],
    },
    headerSubtitle: {
      fontSize: 16,
      fontWeight: '300'
    },
  });

  constructor(props){
    super(props);
    
    this.headerImageActive = require('../../assets/icons/little-big-chart.png');
  };

  _handleKeyExtractor = (item, index) => {
    return item.endTime || index;
  };

  _renderItem = ({item: result, index}) => {
    const { quiz } = this.props;
    return(
      <QuizResultItem 
        {...{index, result, quiz}}
      />
    );
  };

  _renderHeader = () => {
    const { styles } = QuizResultsList;
    const { } = this.props;

    return(
      <View style={styles.headerContainer}>
        <Animatable.Image 
          style={styles.headerImage}
          source={this.headerImageActive}
          animation={'pulse'}
          iterationCount={'infinite'}
          iterationDelay={1000}
          duration={10000}
          useNativeDriver={true}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle   }>{'Showing last 10 results'}</Text>
          <Text style={styles.headerSubtitle}>{'You can tap on an item to view all of the result details and data.'}</Text>
        </View>
      </View>
    );
  };

  render(){
    const { styles } = QuizResultsList; 
    const { results: _results } = this.props;
    const data = CustomQuizResultItem.wrapArray(_results);
    
    return(
      <ModalSection containerStyle={styles.container}>
        <FlatList
          renderItem={this._renderItem}
          keyExtractor={this._handleKeyExtractor}
          ListHeaderComponent={this._renderHeader}
          {...{data}}
        />
      </ModalSection>
    );
  };
};


export class ViewCustomQuizModal extends React.Component {
  static propTypes = {
    onPressQuestionItem: PropTypes.func,
  };

  static styles = StyleSheet.create({

  });

  constructor(props){
    super(props);

    this.state = {
      //data from openModal
      quiz   : null,
      results: [],
    };
  };

  //------ public functions ------
  openModal = async ({quiz, results, onPressStart}) => {
    //assign onpress callback to button
    this._handleOnPressStart = () => {
      onPressStart && onPressStart();
    };

    await setStateAsync(this, {
      mountContent: true,
      //pass down to state
      quiz, results,
    });

    this.modal.openModal();
  };

  //#region ------ events/handlers ------

  //#endregion 

  //#region ------ render functions ------

  render(){
    const { styles } = ViewCustomQuizModal;
    const { quiz: _quiz, results } = this.state;

    const quiz = CustomQuiz.wrap(_quiz);
    const headerTitle = quiz.title || 'Quiz Title N/A';

    return(
      <StyledSwipableModal
        ref={r => this.modal = r}
        //header styles
        headerSubtitle={'Press start to begin quiz'}
        headerIconName={'ios-book'}
        headerIconType={'ionicon'}
        headerIconStyle={{marginTop: 2}}
        //footer buttons
        onPressLeft={this._handleOnPressStart}
        {...{headerTitle}}
      >
        <StickyCollapsableScrollView>
          <StickyCollapseHeader
            title={'Quiz Details'}
            subtitle={'Details about the current quiz.'}
            iconName={'message-circle'}
            iconType={'feather'}
          />
          <QuizDetails {...{quiz}}/>

          <StickyCollapseHeader
            title={'Coverage'}
            subtitle={'list of the selected subjects.'}
            iconName={'eye'}
            iconType={'feather'}
          />
          <QuizSubjectList {...{quiz}}/>
          
          <StickyCollapseHeader
            title={'Results History'}
            subtitle ={'List of your previous quiz results.'}
            iconName={'list'}
            iconType={'feather'}
          />
          <QuizResultsList {...{quiz, results}}/>          
        </StickyCollapsableScrollView>
      </StyledSwipableModal>
    );
  };
  //#endregion 
};