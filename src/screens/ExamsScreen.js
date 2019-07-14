import React, { Fragment } from 'react';
import { View, ScrollView, StyleSheet, Text, Platform, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import EventEmitter from 'events';

import NavigationService from '../NavigationService';
import { plural, timeout, setStateAsync, capitalize } from '../functions/Utils';
import { ROUTES, HEADER_HEIGHT , STYLES, SCREENPROPS_KEYS} from '../Constants';
import { PURPLE, RED, GREY } from '../Colors';
import { CustomQuizStore, CustomQuiz } from '../functions/CustomQuizStore';

import { ViewWithBlurredHeader, IconFooter, AnimatedListItem } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';

import _ from 'lodash';
import moment from "moment";
import * as Animatable from 'react-native-animatable';
import TimeAgo from 'react-native-timeago';
import { Divider, Icon } from 'react-native-elements';
import { Header, NavigationEvents } from 'react-navigation';
import { PlatformButton, NumberIndicator, Pill } from '../components/StyledComponents';
import { CustomQuizResultsStore, CustomQuizResultItem, CustomQuizResults } from '../functions/CustomQuizResultsStore';
import { CustomQuizExamResultScreen } from './CustomQuizExamResultScreen';
import SubjectListScreen from './SubjectListScreen';
import { SubjectItem, ModuleItemModel } from '../models/ModuleModels';
import { ModuleStore } from '../functions/ModuleStore';
import { Surface, Card } from 'react-native-paper';
import { TransitionAB } from '../components/Transitioner';

//last item to animate in the list
const LAST_INDEX = 5;

// shown when no exams have been created yet
class EmptyCard extends React.PureComponent {
  static styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      paddingVertical: 10,
    },  
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    headerTextContainer: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
    },
    headerTitle: {
      color: '#512DA8',
      fontSize: 20, 
      fontWeight: '800'
    },
    headerSubtitle: {
      fontSize: 16, 
      ...Platform.select({
        ios: {
          fontWeight: '200'
        },
        android: {
          fontWeight: '100',
          color: '#424242'
        },
      })
    },
  });

  constructor(props){
    super(props);
    this.imageHeader = require('../../assets/icons/folder-castle.png');
  };

  render() {
    const { styles } = EmptyCard;
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <Card>
        <Animatable.View
          style={styles.card}
          duration={500}
          easing={'ease-in-out'}
          useNativeDriver={true}
          {...{animation}}
        >
          <Animatable.Image
            source={this.imageHeader}
            style={styles.image}
            animation={'pulse'}
            easing={'ease-in-out'}
            iterationCount={"infinite"}
            duration={5000}
            useNativeDriver={true}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle   }>No Items Yet</Text>
            <Text style={styles.headerSubtitle}>You haven't created any custom quiz yet. Press the "Create Custom Quiz" button to create your first quiz.</Text>
          </View>
        </Animatable.View>
      </Card>
    );
  };
};

class ExamHeader extends React.PureComponent {
  static propTypes = {
    onPress: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 15,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    headerTextContainer: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
    },
    headerTitle: {
      color: '#512DA8',
      fontSize: 20, 
      fontWeight: '800'
    },
    headerSubtitle: {
      fontSize: 16, 
      ...Platform.select({
        ios: {
          fontWeight: '200'
        },
        android: {
          fontWeight: '100',
          color: '#424242'
        },
      })
    },
    divider: {
      margin: 13,
    },
  });

  constructor(props){
    super(props);

    this.imageHeader = require('../../assets/icons/book-mouse.png');
  };
  
  _handleOnPressButton = () => {
    const { onPress } = this.props;
    onPress && onPress();
  };

  _renderDescription(){
    const { styles } = ExamHeader;

    const title = (global.usePlaceholder
      ? 'Lorum Ipsum'
      : 'Custom Quiz'
    );

    const description = (global.usePlaceholder
      ? 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem.'
      : 'Combine different modules and subjects together to create a unique set of questions.'
    ); 

    return(
      <View style={{flexDirection: 'row'}}>
        <Animatable.Image
          source={this.imageHeader}
          style={styles.image}
          animation={'pulse'}
          easing={'ease-in-out'}
          iterationCount={"infinite"}
          duration={5000}
          useNativeDriver={true}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle   }>{title}</Text>
          <Text style={styles.headerSubtitle}>{description}</Text>
        </View>
      </View>
    );
  };

  render() {
    const { styles } = ExamHeader;
  

    return(
      <View style={styles.container}>
        {this._renderDescription()}
        <Divider style={styles.divider}/>
        <PlatformButton
          title={'Create Quiz'}
          subtitle={'Create a new cutom quiz'}
          onPress={this._handleOnPressButton}
          iconName={'ios-add-circle'}
          iconType={'ionicon'}
          iconDistance={10}
          isBgGradient={true}
          showChevron={true}
        />
      </View>
    );
  };
};

class SortOptionItem extends React.PureComponent {
  static styles = StyleSheet.create({
    //#region --- Render Item Styles
    itemContainer: {
      flexDirection: 'row',
      paddingVertical: 7,
      alignItems: 'center',
    },
    itemSeperator: {
      borderColor: 'rgba(0,0,0,0.2)',
      borderTopWidth: 1,
    },
    itemTitleContainer: {
      flex: 1,
      justifyContent: 'center',
      marginHorizontal: 10,
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: '500',
    },
    itemTitleLabel: {
      fontWeight: '800',
      color: GREY[900],
    },
    itemDesc: {
      fontSize: 15,
      fontWeight: '200',
    },
    //#endregion
  });

  _handleOnPress = () => {
    const { onPressOption, value } = this.props;
    onPressOption && onPressOption({value});
  };

  render(){
    const { styles } = SortOptionItem;
    const { index, isSelected, title, desc, isAsc, ...props } = this.props;
    const isFirst = (index == 0);
          
    const [name, color] = (isSelected
      ? ['ios-radio-button-on' , PURPLE.A400]
      : ['ios-radio-button-off', PURPLE.A200]
    );

    return(
      <TouchableOpacity
        onPress={this._handleOnPress}
        activeOpacity={0.8}
        {...props}
      >
        <View style={[styles.itemContainer, (!isFirst && styles.itemSeperator)]}>
          <Icon
            type={'ionicon'}
            size={25}
            {...{name, color}}
          />
          <View style={styles.itemTitleContainer}>
            <Text style={styles.itemTitle}>
              <Text style={styles.itemTitleLabel}>{`${index + 1}. `}</Text>
              {title}
            </Text>
            <Text style={styles.itemDesc}>{desc}</Text>
          </View>
          {isSelected && (
            <Icon
              containerStyle={styles.iconContainer}
              name={isAsc? 'arrow-up' : 'arrow-down'}
              type={'feather'}
              color={PURPLE.A200}
              size={22}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };
};

class SortOptions extends React.PureComponent {
  static propTypes = {
    activeSort     : PropTypes.number,
    sortEnum       : PropTypes.object,
    sortKeyValueMap: PropTypes.object,
    //events/callbacks
    onPressOption: PropTypes.func,
    onPressCancel: PropTypes.func,
  };

  static styles = StyleSheet.create({
    //#region --- Header Styles
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderColor: 'rgba(0,0,0,0.2)',
      borderBottomWidth: 1,
    },
    headerTitle: {
      flex: 1,
      fontWeight: '700',
      fontSize: 19,
    },
    closeButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 15,
      backgroundColor: PURPLE.A100
    },
    closeButtonText: {
      color: PURPLE[900],
      fontWeight: '900',
      fontSize: 15,
    },
    //#endregion
    optionContainer: {
      paddingVertical:2 ,
      marginHorizontal: 12,
    },
  });

  _renderHeader(){
    const { styles } = SortOptions;
    const props = this.props;
    return(
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{'Sort Items By'}</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={props.onPressCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.closeButtonText}>{'Cancel'}</Text> 
        </TouchableOpacity>
      </View>
    );
  };

  _renderOptions(){
    const { styles } = SortOptions;
    const { activeSort, sortEnum, sortKeyValueMap, isAsc, onPressOption, } = this.props;
    const keyValue = Object.entries(sortEnum);

    return(
      <View style={styles.optionContainer}>
        {keyValue.map(([key, value], index) => {
          const { title, desc } = (sortKeyValueMap[value] || {});
          const isSelected = (activeSort === value);
          return(
            <SortOptionItem 
              key={`${key}-${value}`}
              {...{index, value, isSelected, title, desc, isAsc, onPressOption}}
            />
          );
        })}
      </View>
    );
  };

  render(){
    const { styles } = SortOptions;
    return(
      <Fragment>
        {this._renderHeader ()}
        {this._renderOptions()}
      </Fragment>
    );
  };
};

class ExamStickyHeader extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      marginBottom: 12,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: GREY[200],
      elevation: 10,
      shadowColor: 'black',
      shadowRadius: 5,
      shadowOpacity: 0.2,
      shadowOffset:{
        width: 2,  
        height: 3,  
      },
    },
    inactiveContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
    },
    titleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleIconContainer: {
      width: 25,
    },
    loadingContainer: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      opacity: 0,
    },
    title: {
      flex: 1,
      fontSize: 17,
      marginHorizontal: 5,
      alignItems: 'flex-start',
    },
    label: {
      fontWeight: '700', 
      color: GREY[900],
    },
    count: {
      fontWeight: '300'
    },
    pillContainer: {
      overflow: 'hidden',
      flexDirection: 'row',
      borderRadius: 15,
      backgroundColor: PURPLE[500],
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 7,
    },
    pillText: {
      color: 'white',
      paddingVertical: 5,
      fontSize: 14,
    },
    pillPrefix: {
      paddingLeft: 2,
      paddingRight: 7,
      fontWeight: '400',
    },
    pillSuffix: {
      paddingLeft: 7,
      paddingRight: 12,
      backgroundColor: PURPLE.A400,
    },
  });

  constructor(props){
    super(props);
    this.visible   = true ;
    this.isLoading = false;

    const sharedOptions = [1000, {leading: true, trailing: false}];
    //prevent multiple presses
    this._handleOnPressPill = _.throttle(this._handleOnPressPill, ...sharedOptions);
    this.showSortOptions    = _.throttle(this.showSortOptions   , ...sharedOptions);
  };

  showLoading = async (nextLoading) => {
    const { title, loading, container, isLoading } = this;
    const didChange = (isLoading != nextLoading);

    const targetA = ( nextLoading? title : loading);
    const targetB = (!nextLoading? title : loading);

    if(didChange){
      this.isLoading = nextLoading;
      await Promise.all([
        container.pulse(300),
        //cross fade a and b
        targetA.fadeOut(300),
        targetB.fadeIn (300),
      ]);
    };
  };

  show = async (nextVisible) => {
    const { pill, title, visible } = this;
    const didChange = (visible != nextVisible);

    if(pill && title && didChange){
      const animation = pill [(nextVisible
        ? 'fadeInRight' 
        : 'fadeOutRight'
      )];
      
      await Promise.all([
        this.showLoading(!nextVisible),
        animation(300), 
      ]);

      //update visibility
      this.visible = nextVisible;
    };
  };

  showSortOptions = (show) => {
    this.transition.transition(show);
  };

  _handleOnPressPill = () => {
    const { onPressSort } = this.props;
    onPressSort && this.visible && onPressSort();
  };

  _handleOnPressTitle = () => {
    this.showSortOptions(true);
  };

  _handleOnPressCancel = () => {
    this.showSortOptions(false);
  };

  _handleOnPressOption = async ({value}) => {
    const { onPressOption } = this.props;
    await this.transition.transition(false);
    onPressOption && onPressOption({value});
  };

  _renderTitle(){
    const { styles } = ExamStickyHeader;
    const { quizes } = this.props;
    const count = quizes.length;

    return(
      <TouchableOpacity
        style={styles.titleContainer}
        onPress={this._handleOnPressTitle}
        activeOpacity={0.8}
      >
        <Animatable.View 
          style={styles.titleContainer}
          ref={r => this.title = r}
          useNativeDriver={true}
        >
          <Icon
            containerStyle={styles.titleIconContainer}
            iconStyle={{marginBottom: 1.5}}
            name={'list'}
            type={'feather'}
            size={22}
            color={PURPLE.A200}
          />
          <Text style={styles.title}>
            <Text style={styles.label}>
              {'Showing '}
            </Text>
            <Text style={styles.count}>
              {`${count} ${plural('item', count)}`}
            </Text>
          </Text>
        </Animatable.View>
        <Animatable.View 
          style={styles.loadingContainer}
          ref={r => this.loading = r}
          useNativeDriver={true}
        >
          <ActivityIndicator
            style={styles.titleIconContainer}
            size={'small'}
            color={PURPLE.A700}
          />
          <Text style={[styles.title, styles.label]}>
            {'Loading...'}
          </Text>
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  _renderSortPill(){
    const { SORT_BY } = ExamsScreen;
    const { styles } = ExamStickyHeader;
    const { sortBy, isAsc } = this.props;

    const sortStrings = Object.keys(SORT_BY);
    const sortText = ((sortBy === SORT_BY.last_taken)
      ? 'Last Taken' 
      : capitalize(sortStrings[sortBy])
    );

    const name = (isAsc
      ? 'arrow-up'
      : 'arrow-down'  
    );

    return(
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={this._handleOnPressPill}
        onLongPress={this._handleOnPressTitle}
      >
        <Animatable.View 
          style={styles.pillContainer}
          ref={r => this.pill = r}
          useNativeDriver={true}
        >
          <Icon
            containerStyle={styles.iconContainer}
            type={'feather'}
            color={'white'}
            size={15}
            {...{name}}
          />
          <Text style={[styles.pillText, styles.pillPrefix]}>{'Sort'}</Text>
          <Text style={[styles.pillText, styles.pillSuffix]}>{'By ' + sortText}</Text>
        </Animatable.View>
      </TouchableOpacity>
    );
  };
  
  render(){
    const { styles } = ExamStickyHeader;
    const { SORT_BY } = ExamsScreen;
    const { sortBy: activeSort, isAsc } = this.props;

    const sortKeyValueMap = {
      [SORT_BY.title     ]: {title: 'Quiz Title'     , desc: 'Sort by title alphabetically'   },
      [SORT_BY.created   ]: {title: 'Date Created'   , desc: 'Sort by quiz creation date'     },
      [SORT_BY.last_taken]: {title: 'Date Last Taken', desc: 'Sort by date last taken'        },
      [SORT_BY.questions ]: {title: 'Question Count' , desc: 'Sort by the number of questions'},
      [SORT_BY.subjects  ]: {title: 'Subject Count'  , desc: 'Sort by the number of subjects' },
    };

    return(
      <Animatable.View 
        style={styles.container}
        ref={r => this.container = r}
        useNativeDriver={true}
      >
        <TransitionAB 
          ref={r => this.transition = r}
          handlePointerEvents={true}
        >
          <View style={styles.inactiveContainer}>
            {this._renderTitle()}
            {this._renderSortPill()}
          </View>
          <SortOptions
            sortEnum={SORT_BY}
            onPressOption={this._handleOnPressOption}
            onPressCancel={this._handleOnPressCancel}
            {...{isAsc, activeSort, sortKeyValueMap}}
          />
        </TransitionAB>
      </Animatable.View>
    );
  };
};

class CustomQuizItem extends React.PureComponent {
  static propTypes = {
    index: PropTypes.number,
    quiz: PropTypes.object,
    onPressQuiz: PropTypes.func,
  }; 

  static styles = StyleSheet.create({
    container: {
      paddingHorizontal: 10,
      paddingVertical: 12,
      marginHorizontal: 8,
      marginBottom: 10,
      borderRadius: 12,
      elevation: 5,
    },  
    divider: {
      margin: 7,
    }, 
    //#region - Header Styles
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 3,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      marginLeft: 5,
      color: PURPLE[1000]
    },
    subtitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    subtitle: {
      marginLeft: 3,
      fontSize: 15,
    },
    subtitleLabel: {
      fontWeight: '600',
      color: GREY[800],
    },
    subtitleDate: {
      fontWeight: '300',
    },
    subtitleTime: {
      fontWeight: '100',
      color: GREY[700],
    },
    //#endregion
    //#region - Detail Styles
    detailsContainer: {
      flexDirection: 'row', 
      alignItems: 'center', 
      marginTop: 5,
    },
    detailLeftContainer: {
      flex: 1,
      marginRight: 10, 
    },
    detailRightContainer: {
      flex: 1, 
    },
    detailContainer: {
      flexDirection: 'row'
    },
    detailLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
    },
    detail: {
      fontWeight: '200',
    },
    //#endregion
    description: {
      fontSize: 17,
      fontWeight: '200',
    },
    descriptionLabel: {
      fontWeight: '700',
      color: PURPLE[1000],
    },
  });

  componentDidMount(){
    const { EVENTS } = ExamsScreen;
    const { emitter, index } = this.props;

    if(emitter && (index < LAST_INDEX)){
      emitter.addListener(
        EVENTS.animateOutItems,
        this._handleEventOnAnimateOut
      );
    };
  };

  _handleEventOnAnimateOut = async () => {
    const { EVENTS } = ExamsScreen;
    const { emitter, index, isLast } = this.props;
    const container = this.container;

    const delay    = (index * 50);
    const duration = (250 + (index * 50));
    
    await timeout(delay);

    if(isLast){
      container && await container.fadeOutUp(duration);
      emitter && emitter.emit(
        EVENTS.onFinishAnimateOutItems
      );

    } else {
      container && container.fadeOutUp(duration);
    };
  };

  _handleOnPressQuiz = () => {
    const { onPressQuiz, quiz } = this.props;
    onPressQuiz && onPressQuiz(quiz);
  };

  _renderTitle(){
    const { styles } = CustomQuizItem;
    const {index, quiz: _quiz } = this.props;
    
    const quiz = CustomQuiz.wrap(_quiz);
    const ts = quiz.timestampCreated;

    const timeCreated  = moment(ts).format("LT");
    const dateCreated  = moment(ts).format("MMM D ddd YYYY");
    const dateRelative = moment(ts).fromNow();

    return(
      <Fragment>
        <View style={styles.titleContainer}>
          <NumberIndicator 
            value={index + 1}
            size={20}
            initFontSize={14}
          />
          <Text style={styles.title}>
            {quiz.title}
          </Text>
        </View>
        <View style={styles.subtitleContainer}>
          <Icon
            iconStyle={{marginTop: 1}}
            name={'md-time'}
            type={'ionicon'}
            size={17}
            color={GREY[800]}
          />
          <Text style={styles.subtitle}>
            <Text style={styles.subtitleLabel}>
              {'Created: '}
            </Text>
            <Text style={styles.subtitleDate}>
              {`${dateCreated} `}
            </Text>
            <Text style={styles.subtitleTime}>
              {`(at ${timeCreated})`}
            </Text>
          </Text>
        </View>
      </Fragment>
    );
  };

  _renderDetails(){
    const { styles } = CustomQuizItem;
    const { quiz: _quiz, results: _results } = this.props;

    const quiz    = CustomQuiz          .wrap     (_quiz   );
    const results = CustomQuizResultItem.wrapArray(_results);

    const countResults  = (results        || []).length;
    const countQuestion = (quiz.questions || []).length;
    const countSubjects = (quiz.subjects  || []).length;

    const hasResults = results.length > 0;
    const lastResult = results[countResults - 1] || {};
    const timestamp  = lastResult.endTime;
    const lastTaken  = moment(timestamp).fromNow();

    return(
      <View style={styles.detailsContainer}>
        <View style={styles.detailLeftContainer}>
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>
              {'Taken'}
            </Text>
            <Text style={styles.detail}>
              {hasResults? `${countResults} Times` : 'Never'}
            </Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>
              {'Last'}
            </Text>
            <Text style={styles.detail}>
              {hasResults? lastTaken : 'Never'}
            </Text>
          </View>
        </View>
        <View style={styles.detailRightContainer}>
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>
              {'Questions'}
            </Text>
            <Text style={styles.detail}>
              {`${countQuestion} Items`}
            </Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>
              {'Subjects '}
            </Text>
            <Text style={styles.detail}>
              {`${countSubjects} Items`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  render(){
    const { styles } = CustomQuizItem;

    const {index, quiz: _quiz, results } = this.props;
    const quiz = CustomQuiz.wrap(_quiz);

    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return (
      <AnimatedListItem
        innerRef={r => this.container = r}
        duration={300}
        last={LAST_INDEX}
        {...{index, animation}}
      >
        <Surface  style={styles.container}>
          <TouchableOpacity onPress={this._handleOnPressQuiz}>
            {this._renderTitle()}
            {this._renderDetails()}
            <Divider style={styles.divider}/>
            <Text style={styles.description}>
              <Text style={styles.descriptionLabel}>
                {'Description  '}
              </Text>
              {quiz.description || 'No description to show'}
            </Text>
          </TouchableOpacity>
        </Surface>
      </AnimatedListItem>
    );
  };
};

export class ExamsScreen extends React.Component {
  static styles = StyleSheet.create({

  });

  static EVENTS = {
    animateOutItems        : 'animateOutItems'        ,
    onFinishAnimateOutItems: 'onFinishAnimateOutItems',
  };

  static SORT_BY = {
    title     : 0,
    created   : 1,
    last_taken: 2,
    questions : 3,
    subjects  : 4,
  };

  constructor(props){
    super(props);

    this.emitter = new EventEmitter();
    this.state = {
      sortBy : 0,
      isAsc  : false,
      data   : [],
      quizes : [],
      results: [],
    };  
  };

  componentDidMount(){
    this.loadData();
  };

  componentDidFocus = () => {
    //enable drawer when this screen is active
    const { setDrawerSwipe, getRefSubjectModal } = this.props.screenProps;
    setDrawerSwipe(true);
    this.loadData();
  };

  getNextSort(){
    const { SORT_BY } = ExamsScreen; 
    const { sortBy, isAsc } = this.state;
    
    const max  = Object.keys(SORT_BY).length;
    const next = ((sortBy + 1) % max);
    
    return({
      isAsc: !isAsc, 
      ...(isAsc && {sortBy: next}),
    });
  };

  combineQuizesAndResults({quizes, results}){
    //combine quizes with results
    return quizes.map(quiz => {
      const matches = results.filter(result =>
        result.indexID_quiz === quiz.indexID_quiz  
      );
      return { quiz, results: matches }
    });
  };

  async loadData(){
    const _quizes  = await CustomQuizStore       .read() || [];
    const _results = await CustomQuizResultsStore.read() || [];

    const quizes  = CustomQuiz          .wrapArray(_quizes );
    const results = CustomQuizResultItem.wrapArray(_results);

    const data = this.combineQuizesAndResults({quizes, results});

    const hasQuiz = (quizes.length > 0);
    this.setState({
      //fitst item is the sticky header
      data: [(hasQuiz && null), ...data], 
      //pass down to state
      quizes, results
    });
  };

  async sortItems(nextSort = {sortBy, isAsc}){
    const { EVENTS } = ExamsScreen;
    const emitter = this.emitter;

    //scroll to the top of the list
    this.flatlist.scrollToOffset({ 
      animated: true, offset: -100, 
    });

    //animate out items in quiz list
    emitter.emit(EVENTS.animateOutItems);

    //wait for animations to finish
    await Promise.all([
      //hide sort button
      this.stickyHeader.show(false),
      //hide quiz items
      new Promise(resolve => emitter.addListener(
        EVENTS.onFinishAnimateOutItems, resolve 
      )),
    ]);

    //clear unmounted event listeners
    emitter.removeAllListeners();
    await setStateAsync(this, {data: [null]});
    
    const { quizes, results } = this.state;
    const data = this.combineQuizesAndResults({quizes, results});
    const reverse = data.reverse();

    //show sort button
    this.stickyHeader.show(true);
    
    const hasQuiz = (quizes.length > 0);
    this.setState({
      //fitst item is the sticky header
      data: [(hasQuiz && null), ...reverse], 
      //pass down to state
      quizes, results, ...nextSort
    });
  };

  //#region ------ HANDLERS -------

  _handleKeyExtractor(item, index){
    const { quiz } = (item || {});
    return ((item == null)
      ? `header-${index}`
      : `item-${quiz.indexID_quiz}`
    );
  };

  _handleOnPressSort = async () => {
    const nextSort = this.getNextSort();
    this.sortItems(nextSort);
  };

  _handleOnPressOption = ({value}) => {
    const { sortBy, isAsc } = this.state;
    const didChange = (value != sortBy);

    this.sortItems(didChange
      ? { isAsc: false, sortBy: value }
      : { isAsc: !isAsc }  
    );
  };

  _handleOnPressCreateQuiz = () => {
    const { navigation } = this.props;
    navigation && navigation.navigate(ROUTES.CreateQuizRoute);
  };

  _handleOnPressQuiz = (_quiz) => {
    const { screenProps } = this.props;
    const { results: _results } = this.state;

    //get a ref for ViewCustomQuizModal comp. from HomeScreen
    const modal = screenProps[SCREENPROPS_KEYS.getRefViewCustomQuizModal]();
    //save a ref to the selected quiz
    this.selectedQuiz = _quiz;

    const quiz    = CustomQuiz.wrap(_quiz);
    const results = CustomQuizResultItem.wrapArray(_results);

    //get results related to this quiz
    const filtered = CustomQuizResults.filterByQuizID(quiz.indexID_quiz, results);

    //show ViewCustomQuizModal
    modal.openModal({
      results: filtered, quiz,
      //pass down event callbacks 
      onPressResultItem : this._handleOnPressResultItem , 
      onPressStart      : this._handleOnPressStart      ,
      onPressSubjectItem: this._handleOnPressSubjectItem,
    });
  };

  /** from ViewCustomQuizModal: 
   *  gets called when the modal's footer start button is pressed
   */
  _handleOnPressStart = () => {
    const { navigation } = this.props;
    const quiz = CustomQuiz.wrap(this.selectedQuiz);

    //randomize question order
    const randomized = CustomQuiz.randomizeQuestionOrder(quiz);
    //navigate to custom quiz exam screen
    navigation && navigation.navigate(
      ROUTES.CustomQuizExamRoute, 
      { quiz: randomized }
    );
  };

  /** from ViewCustomQuizModal: 
   *  gets called when a quiz result is pressed in the modal
   */
  _handleOnPressSubjectItem = ({subject: _subject, index}) => {
    const { NAV_PARAMS } = SubjectListScreen;
    const { navigation } = this.props;

    const subject  = SubjectItem.wrap(_subject);
    const moduleID = subject.indexID_module;

    const _modules = ModuleStore.readCached();
    const modules  = ModuleItemModel.wrapArray(_modules);

    const module = modules.find(module => 
      module.indexid == moduleID
    );
    
    navigation && navigation.navigate(ROUTES.SubjectListRoute, {
      [NAV_PARAMS.modules   ]: modules,
      [NAV_PARAMS.moduleData]: module ,
    });
  };

  /** from ViewCustomQuizModal: 
   *  gets called when a quiz result is pressed in the modal
   */
  _handleOnPressResultItem = ({result, index}) => {
    const { NAV_PARAMS } = CustomQuizExamResultScreen;
    const { navigation } = this.props;

    //goto exam results screen and pass params
    navigation && navigation.navigate(ROUTES.CustomQuizExamResultRoute, {
      [NAV_PARAMS.customQuizResult]: result,
      [NAV_PARAMS.saveResult      ]: false ,
      [NAV_PARAMS.quiz            ]: this.selectedQuiz,
    });
  };

  //#endregion
  //#region ------ RENDER FUNCTIONS ------
  _renderHeader = () => {
    return(
      <ExamHeader
        onPress={this._handleOnPressCreateQuiz}
      />
    );
  };

  _renderFooter(){
    return(
      <IconFooter hide={false}/>
    );
  };

  _renderEmpty(){
    return(
      <EmptyCard/>
    );
  };

  _renderItem = ({item, index: _index}) => {
    const { quizes, sortBy, isAsc } = this.state;

    const { quiz, results } = (item || {});
    const isLast = (_index == LAST_INDEX)
    const index  = (_index - 1);

    return (item == null)? (
      <ExamStickyHeader
        ref={r => this.stickyHeader = r}
        onPressSort={this._handleOnPressSort}
        onPressOption={this._handleOnPressOption}
        {...{quizes, sortBy, isAsc}}  
      />
    ):(
      <CustomQuizItem 
        onPressQuiz={this._handleOnPressQuiz}
        emitter={this.emitter}
        {...{index, quiz, results, isLast}}
      />
    );
  };

  render(){
    const { styles } = ExamsScreen;
    const { data, sortBy, isAsc } = this.state;
    const extraData = { sortBy, isAsc };

    return(
      <ViewWithBlurredHeader hasTabBar={true} enableAndroid={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <FlatList
          ref={r => this.flatlist = r}
          stickyHeaderIndices={[0,1]}
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
          renderItem={this._renderItem}
          keyExtractor={this._handleKeyExtractor}
          ListHeaderComponent={this._renderHeader}
          ListFooterComponent={this._renderFooter}
          ListEmptyComponent={this._renderEmpty}
          onPressQuiz={this._handleOnPressQuiz}
          onPressSort={this._handleOnPressSort}
          {...{data, extraData}}
        />
      </ViewWithBlurredHeader>
    );
  };
  //#endregion
};