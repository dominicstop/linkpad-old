import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated as NativeAnimated, Dimensions, ScrollView, FlatList, Clipboard } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES, FONT_STYLES } from '../Constants';
import { PURPLE, GREY, BLUE, GREEN, RED, ORANGE, AMBER, INDIGO } from '../Colors';
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
const { interpolate, Value } = Animated; 


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
      backgroundColor: PURPLE.A200,
      borderRadius: 10,
      marginBottom: 2,
    },
    itemCount: {
      color: 'white',
      fontWeight: '200',
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
          size={18}  
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
          key={this._handleKeyExtractor}
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
      selectedQuiz: null,
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
      selectedQuiz: quiz,
    });

    this.modal.openModal();
  };

  //#region ------ events/handlers ------

  //#endregion 

  //#region ------ render functions ------

  render(){
    const { styles } = ViewCustomQuizModal;
    const { selectedQuiz } = this.state;

    const quiz = CustomQuiz.wrap(selectedQuiz);
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
            subtitle={'list of the selected subjects'}
            iconName={'eye'}
            iconType={'feather'}
          />
          <QuizSubjectList {...{quiz}}/>
          
          <StickyCollapseHeader
            title={'Questions & Answers'}
            subtitle ={'Overview of your answer.'}
            iconName={'list'}
            iconType={'feather'}
          />
          <Text>test</Text>
        </StickyCollapsableScrollView>
      </StyledSwipableModal>
    );
  };
  //#endregion 
};