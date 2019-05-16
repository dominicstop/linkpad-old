import React, { Fragment } from 'react';
import { View, ScrollView, Text, StyleSheet, FlatList, Platform, Alert, TouchableOpacity, TextInput, InteractionManager, Switch, Clipboard } from 'react-native';
import PropTypes from 'prop-types';
import EventEmitter from 'events';

import { STYLES, HEADER_HEIGHT } from '../Constants';
import { PURPLE, RED, GREY } from '../Colors';

import { plural, isEmpty, setStateAsync, timeout } from '../functions/Utils';
import { validateNotEmpty } from '../functions/Validation';
import { ModuleStore } from '../functions/ModuleStore';
import { SubjectItem, ModuleItemModel, } from '../models/ModuleModels';

import { AndroidHeader } from '../components/AndroidHeader';
import { ViewWithBlurredHeader, AnimatedListItem, Card , IconFooter} from '../components/Views' ;
import { PlatformTouchableIconButton, RippleBorderButton, IconButton } from '../components/Buttons';

import * as Animatable from 'react-native-animatable';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { BlurView } from 'expo';
import { NavigationEvents, Header } from 'react-navigation';
import { Divider, Icon } from 'react-native-elements';

import Animated, { Easing } from 'react-native-reanimated';
const { set, cond, block, Value, timing, interpolate, and, or, onChange, eq, call, Clock, clockRunning, startClock, stopClock, debug, divide, multiply } = Animated;

//android header text style
const titleStyle = { 
  flex: 1, 
  textAlign: 'center', 
  marginRight: 10,
  position: 'absolute',
  color: 'white',
};

class NextButton extends React.PureComponent {
  static styles = StyleSheet.create({
    button: {
      borderRadius: 15,
      marginRight: 7,
      backgroundColor: 'rgba(255,255,255,0.9)',
    },
    buttonLabel: {
      color: PURPLE[900], 
      marginHorizontal: 15,
      marginVertical: 2,
      ...Platform.select({
        ios: {
          fontSize: 17,
          fontWeight: '400'
        },
        android: {
          fontSize: 19,          
          margin: 15,
          fontWeight: '500'
        }
      })
    },
  });

  constructor(props){
    super(props);
    this.state = {
      active: false,
    };
  };

  setActive = (active) => {
    //store prev active state
    const prevActive = this.state.active;

    //did active change
    if(prevActive != active){
      InteractionManager.runAfterInteractions(async () => {
        await this.container.fadeOutRight(300);
        await setStateAsync(this, {active}); 
        await this.container.fadeInRight(500);
      });
    };
  };

  render(){
    const { styles } = NextButton;
    const { active } = this.state;
    const buttonStyle = {
      opacity: active? 1 : 0.75,      
    };

    return(
      <Animatable.View
        ref={r => this.container = r}
        animation={'zoomIn'}
        duration={750}
        delay={500}
        useNativeDriver={true}
      >
        <RippleBorderButton 
          containerStyle={[styles.button, buttonStyle]}
          {...this.props}
        >
          <Text style={styles.buttonLabel}>Next</Text>
        </RippleBorderButton>
      </Animatable.View>
    );
  };
};

class TitleDescription extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    distribution: PropTypes.string,
  };

  static styles = StyleSheet.create({
    headerTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    //default styles
    defaultHeaderTitle: {
      color: '#512DA8',
      fontSize: 20, 
      fontWeight: '800',
      textAlign: 'center',
    },
    defaultHeaderSubtitle: {
      flex: 1,
      fontSize: 16,
      textAlign: 'justify',
      textAlignVertical: 'top',
      marginBottom: 10,
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
    //alternate styles
    altHeaderText: {
      marginTop: 3,    
    },
    altHeaderTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#512DA8',      
    },
    altHeaderDesc: {
      fontSize: 16, 
      fontWeight: '300'   
    },
  });

  constructor(props){
    super(props);

    //set initial text
    this.state = {
      title: props.title,
      description: props.description,
      distribution: props.distribution,
      useDefault: true,
    };
  };

  changeText = async ({title, description, distribution}) => {
    const prevState = this.state;
    //check for changes
    const didChangeTitle        = (prevState.title        != title       );
    const didChangeDescription  = (prevState.description  != description );
    const didChangeDistribution = (prevState.distribution != distribution);

    if(!(didChangeTitle || didChangeDescription) && didChangeDistribution){
      //only distribution has changed
      await this.distribution.fadeOut(200);
      //change text
      this.setState({useDefault: false, distribution});
      //animate out
      await this.distribution.fadeIn(300);

    } else {
      //either title/desc./distribution has changed 
      await this.textContainer.fadeOut(250);
      //change text
      this.setState({
        useDefault: false,
        title, description, distribution, 
      });
      //animate in
      (Platform.OS == 'ios'
        ? await this.textContainer.fadeInUp(250)
        : await this.textContainer.fadeIn  (250)
      );
    };
  };

  _renderDefault(){
    const { styles } = TitleDescription;
    const { title, description } = this.state;

    const defaultTitle       = 'Create Quiz';
    const defaultDescription = 'Give your custom quiz a title and a description so you can easily find it later.';

    const defaultHeaderTitle = (title       == '')? defaultTitle       : title; 
    const headerDescription  = (description == '')? defaultDescription : `Quiz Descripton – ${description}`; 

    return(
      <Fragment>
        <Text 
          style={styles.defaultHeaderTitle} 
          numberOfLines={1} 
        >
          {defaultHeaderTitle}
        </Text>
        <Text style={styles.defaultHeaderSubtitle}>{headerDescription}</Text>
      </Fragment>
    );
  };

  _renderAlternate(){
    const { styles } = TitleDescription;
    const { title, description, distribution } = this.state;

    return(
      <Fragment>
        <Text 
          style={styles.altHeaderText} 
          numberOfLines={1}
        >
          <Text style={styles.altHeaderTitle}>
            {'Title: '}
          </Text>
          <Text style={styles.altHeaderDesc}>
            {title}
          </Text>
        </Text>
        <Animatable.Text 
          style={styles.altHeaderText}
          ref={r => this.distribution = r}
          numberOfLines={1}
          useNativeDriver={true}
        >
          <Text style={styles.altHeaderTitle}>
            {'Distribution: '}
          </Text>
          <Text style={styles.altHeaderDesc}>
            {distribution}
          </Text>
        </Animatable.Text>
        <Text style={styles.altHeaderText}>
          <Text style={styles.altHeaderTitle}>
            {'Description: '}
          </Text>
          <Text style={styles.altHeaderDesc}>
            {description}
          </Text>
        </Text>
      </Fragment>
    );
  };

  render(){
    const { styles } = TitleDescription;
    const { useDefault } = this.state;

    return(
      <Animatable.View 
        style={styles.headerTextContainer}
        ref={r => this.textContainer = r}
        useNativeDriver={true}
      >
        {useDefault? this._renderDefault() : this._renderAlternate()}
      </Animatable.View>
    );
  };
};

class HeaderCard extends React.PureComponent {
  static propTypes = {
    selected: PropTypes.array,
    //details prop
    title: PropTypes.string,
    description: PropTypes.string,
    itemsPerSubject: PropTypes.number,
    shouldDistributeEqually: PropTypes.bool,
    //event callbacks
    onPressEditDetails: PropTypes.func,
    onPressAddSubject : PropTypes.func,
  };
  
  static styles = StyleSheet.create({
    card: {
      marginLeft: 0,
      marginRight: 0,
      marginTop: 0,
      marginBottom: 10,
      paddingBottom: 15,
      borderRadius: 0,
    },
    divider: {
      margin: 5,
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    buttonContainer: {
      backgroundColor: PURPLE.A700,
      marginTop: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 12,
    },
    buttonText: {
      color: 'white',
      fontSize: 17,
      fontWeight: '800',
    },
    buttonSubtitle: {
      color: 'white',
      fontSize: 15,
      fontWeight: '500',
    },
  });

  constructor(props){
    super(props);
    this.imageHeader = require('../../assets/icons/file-circle.png');
    this.state = {
      showCheckDetails: false,
      showCheckSubject: false,
    };
  };

  async componentDidUpdate(prevProps){
    const { title, description, selected, shouldDistributeEqually, itemsPerSubject } = this.props;

    //check if title or desc changed
    const didChangeTitle       = (prevProps.title       != title      );
    const didChangeDescription = (prevProps.description != description);
    //check if either title/desc changed
    const didChangeDetails = (didChangeTitle || didChangeDescription); 
    //check if title or description not empty
    const detailsNotEmpty = validateNotEmpty(title) ||  validateNotEmpty(description);

    //check if switch and itemsPerSubject changed
    const didChangeSwitch = (prevProps.shouldDistributeEqually != shouldDistributeEqually);
    const didChangeItems  = (prevProps.itemsPerSubject         != itemsPerSubject        );
    //check if either switch/itemsPerSubject changed
    const didChangeDistributions = (didChangeSwitch || didChangeItems);

    //get prev and current selected count
    const currSelected = (selected           || []).length;
    const prevSelected = (prevProps.selected || []).length;
    
    //check if selected is currently and prev. emmpty
    const prevEmptySelected = (prevSelected == 0);
    const currEmptySelected = (currSelected == 0);

    //check if didChangeDetails is currently and prev. emmpty
    const currEmptyDetails = !(validateNotEmpty(title          ) || validateNotEmpty(description          ));
    const prevEmptyDetails = !(validateNotEmpty(prevProps.title) || validateNotEmpty(prevProps.description));

    //check if selected count has changed
    const didChangeSelected = (prevSelected != currSelected);

    //trans. and change title/desc
    if((didChangeDetails || didChangeDistributions) && detailsNotEmpty){
      const distributionText = (itemsPerSubject == null)? 'Equal' : `${itemsPerSubject} items per subject`;
      const distribution = shouldDistributeEqually? distributionText : 'Manual';
      this.titleDescription.changeText({title, description, distribution});
    };

    //handle edit details check transition
    if(didChangeDetails && currEmptyDetails && !prevEmptyDetails){
      //details trans. to unchecked
      await this.checkDetailsContainer.fadeOutRight(500);
      await setStateAsync(this, {showCheckDetails: false});
      await this.checkDetailsContainer.fadeInRight(500);

    } else if(didChangeDetails && !currEmptyDetails && prevEmptyDetails){
      //details trans. to check
      await this.checkDetailsContainer.fadeOutRight(500);
      await setStateAsync(this, {showCheckDetails: true});
      await this.checkDetailsContainer.fadeInRight(500);
    };

    //handle add subject check transition
    if(didChangeSelected && !prevEmptySelected && currEmptySelected){
      //set header next button to inactive
      _nextButtonRef && _nextButtonRef.setActive(false);
      //selected trans. to unchecked
      await this.checkSubjContainer.fadeOutRight(500);
      await setStateAsync(this, {showCheckSubject: false});
      await this.checkSubjContainer.fadeInRight(500);

    } else if(didChangeSelected && prevEmptySelected && !currEmptySelected){
      //selected trans. to check
      await this.checkSubjContainer.fadeOutRight(500);
      await setStateAsync(this, {showCheckSubject: true});
      await this.checkSubjContainer.fadeInRight(500);
    };
  };

  animatePulse(){
    this._container.pulse(750);
  };

  _handleOnPressEditDetails = () => {
    const { onPressEditDetails } = this.props;
    onPressEditDetails && onPressEditDetails();
  };

  _handleOnPressAddSubject = () => {
    const { onPressAddSubject } = this.props;
    onPressAddSubject && onPressAddSubject();
  };

  _renderDescription(){
    const { styles } = HeaderCard;
    const { title, description } = this.props;

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
        <TitleDescription
          ref={r => this.titleDescription = r}
          {...{title, description}}
        />
      </View>
    );
  };

  _renderEditDetailsButton(){
    const { styles } = HeaderCard;
    const { showCheckDetails } = this.state;
    
    const Checkmark = showCheckDetails?(
      <Icon
        name={'ios-checkmark-circle'}
        type={'ionicon'}
        color={'white'}
        size={24}
      />
    ):(
      <Icon
        name={'ios-radio-button-off'}
        type={'ionicon'}
        color={'white'}
        size={24}
      />
    );
    
    //title and subtitle
    const text     = 'Edit Details';
    const subtitle = 'Add a title and description';

    return(
      <IconButton 
        onPress={this._handleOnPressEditDetails}        
        containerStyle={[styles.buttonContainer, STYLES.lightShadow]}
        textStyle={styles.buttonText}
        subtitleStyle={styles.buttonSubtitle}
        iconName={'edit'}
        iconType={'entypo'}
        iconColor={'white'}
        iconSize={24}
        {...{text, subtitle}}
      >
        <Animatable.View
          ref={r => this.checkDetailsContainer = r}
          animation={'fadeIn'}
          delay={500}
          duration={1000}
          useNativeDriver={true}
        >
          {Checkmark}        
        </Animatable.View>
      </IconButton>
    );
  };

  _renderAddSubjectButton(){
    const { styles } = HeaderCard;
    const { showCheckSubject } = this.state;

    const Checkmark = showCheckSubject?(
      <Icon
        name={'ios-checkmark-circle'}
        type={'ionicon'}
        color={'white'}
        size={24}
      />
    ):(
      <Icon
        name={'ios-radio-button-off'}
        type={'ionicon'}
        color={'white'}
        size={24}
      />
    );
    //button title and subtitle
    const text     = 'Add Subjects';
    const subtitle = 'Select subjects to add';

    return(
      <IconButton 
        onPress={this._handleOnPressAddSubject}        
        containerStyle={[styles.buttonContainer, STYLES.lightShadow]}
        textStyle={styles.buttonText}
        subtitleStyle={styles.buttonSubtitle}
        iconName={'bookmark'}
        iconType={'entypo'}
        iconColor={'white'}
        iconSize={24}
        {...{text, subtitle}}
      >
        <Animatable.View
          ref={r => this.checkSubjContainer = r}        
          animation={'fadeIn'}
          delay={500}
          duration={2000}
          useNativeDriver={true}
        >
          {Checkmark}
        </Animatable.View>
      </IconButton>
    );
  };

  render() {
    const { styles } = HeaderCard;
    
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'fadeInRight',
    });

    return(
      <Animatable.View
        ref={r => this._container = r}
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <Card style={styles.card}>
          {this._renderDescription()}
          <Divider style={styles.divider}/>
          {this._renderEditDetailsButton()}
          {this._renderAddSubjectButton ()}
        </Card>
      </Animatable.View>
    );
  };
};

class TopInidcator extends React.Component {
  static propTypes = {
    questionsTotal: PropTypes.number, 
    maxItemsQuiz: PropTypes.number,
  };

  static defaultProps = {
  };

  static styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255,255,255,0.2)'
        },
      }),
    },
    indicatorContainer: {
      width: '100%',
      height: 55,
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: 'center',
    },
    iconTextContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    textContainer: {
      marginLeft: 7,
    },
    label: {
      fontSize: 17,
      fontWeight: '500'
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '300',
      color: GREY[900]
    },
    indicatorCountContainer: {
      paddingHorizontal: 13,
      paddingVertical: 7,
      backgroundColor: PURPLE.A700,
      borderRadius: 15,
    },
    indicatorCountText: {
      color: 'white',
      fontSize: 16,
    },
  });

  constructor(props){
    super(props);
  };

  componentWillMount() {
    const { events } = CreateQuizScreen;
    const { emitter } = this.props;

    if(emitter){
      emitter.addListener(
        events.onChangeRemainingQuizItems,
        this._handleOnChangeRemainingQuizItems
      );
      emitter.addListener(
        events.onQuestionTotalMaxed,
        this._handleOnQuestionTotalMaxed
      );
    };
  };

  //------ event handlers ------
  /** emitter: animate when remaining items change */
  _handleOnChangeRemainingQuizItems = () => {
    this.indicator.pulse(750);
  };
  
  /** emitter: animate when remaining items maxed out */
  _handleOnQuestionTotalMaxed = () => {
    this.indicator.shake(750);
  };

  /** indicator pressed: show alert dialog */
  _handleOnPressIndicator = () => {
    Alert.alert(
      'Remaining Items',
      'How many questions you can add to the quiz. Max amount can be adjusted in Edit Details.',
    );
  };

  //------ render ------
  _renderContent(){
    const { styles } = TopInidcator;
    const { questionsTotal, maxItemsQuiz } = this.props;

    return(
      <Fragment>
        <TouchableOpacity
          style={styles.iconTextContainer}
          onPress={this._handleOnPressIndicator}
          activeOpacity={0.7}
        >
          <Icon
            name={'ios-information-circle'}
            type={'ionicon'}
            size={26}
            color={PURPLE.A700}
          />
          <View style={styles.textContainer}>
            <Text style={styles.label}>
              {'Remaining Items'}
            </Text>
            <Text style={styles.subtitle}>
              {`${maxItemsQuiz - questionsTotal} questions remaining`}
            </Text>
          </View>
        </TouchableOpacity>
        <Animatable.View 
          ref={r => this.indicator = r}
          style={styles.indicatorCountContainer}
          useNativeDriver={true}
        >
          <Text style={styles.indicatorCountText}>
            {`${questionsTotal || '?'}/${maxItemsQuiz || '?'}`}
          </Text>
        </Animatable.View>
      </Fragment>
    );
  };

  render(){
    const { styles } = TopInidcator;
    return Platform.select({
      ios: (
        <BlurView
          style={styles.indicatorContainer}
          tint={'light'}
          intensity={100}
        >
          {this._renderContent()}
        </BlurView>
      ),
      android: (
        <View style={styles.indicatorContainer}>
          {this._renderContent()}
        </View>
      ),
    });
  };
};

class Stepper extends React.PureComponent {
  static propTypes = {
    value     : PropTypes.number,
    valueMin  : PropTypes.number,
    valueSteps: PropTypes.number,
    //max values
    valueMaxSubject: PropTypes.number,
    valueMaxQuiz   : PropTypes.number,
    //callback events
    onChangeValue: PropTypes.func,
    //for animation
    initiallyCollapsed: PropTypes.bool,
  };

  static defaultProps = {
    valueMin    : 10 ,
    valueMax    : 100,
    valueDefault: 50 ,
    valueSteps  : 10 ,
  };

  static MODES = {
    MAX     : 'MAX'     ,
    MIN     : 'MIN'     ,
    NORMAL  : 'NORMAL'  ,
    DISABLED: 'DISABLED',
  };

  static styles = StyleSheet.create({
    container: {
      marginBottom: 10,
      ...Platform.select({
        android: {
          backgroundColor: 'rgb(240,240,240)',
          padding: 12,
          paddingVertical: 15,
          borderRadius: 15,
          elevation: 10,
        }
      }),
    },
    title: {
      fontSize: 22,
      fontWeight: '500',
      color: PURPLE[900],
      opacity: 0.9,
    },
    subtitle: {
      fontSize: 17,
      marginTop: 1,
      fontWeight: '200',
    },
    //stepper styles
    stepperContainer: {
      flexDirection: 'row',
      borderRadius: 12,
      overflow: 'hidden',
      borderColor: PURPLE[500],
      borderWidth: 1.25,
      marginTop: 15,
    },
    //stepper button style
    stepperButton: {
      backgroundColor: PURPLE[500],
      paddingVertical: 7,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    //stepper textinput styles
    textinputButtonContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    textinputContainer: {
      flexDirection: 'row',
    },
    textinputLabel: {
      marginLeft: 5,
      fontSize: 19,
      fontWeight: '400',
      color: PURPLE[900],
    },
    textinput: {
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: 19,
      fontWeight: '700',
      color: PURPLE[900],
    },
    //switch styles
    switchContainer: {
      flexDirection: 'row',
      marginBottom: 15,
      marginTop: 15,
      alignItems: 'center',
    },
    switchLabelContainer: {
      flex: 1,
      marginRight: 20,
    },
    switchLabelTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: PURPLE[1000]
    },
    switchLabelSubtitle: {
      fontSize: 17,
      fontWeight: '200',
      marginTop: 1,
    },
  });

  constructor(props){
    super(props);
    this.setupAnimations();
    const { MODES } = Stepper;

    const mode = (
      props.valueMaxSubject <= 1? MODES.DISABLED :
      props.valueMaxQuiz    == 0? MODES.MAX      : MODES.NORMAL
    );

    this.state = {
      value: props.value,
      prevValue: null,
      shouldDistributeEqually: props.shouldDistributeEqually,
      mode,
    };
  };

  componentDidUpdate(prevProps){
    const { MODES } = Stepper;
    const { value, valueMaxQuiz } = this.props;
    const nextMode = this.getModeFromValue(value);

    const didChangeMode    = (prevProps.mode         != nextMode    );
    const didChangeValue   = (prevProps.value        != value       );
    const didChangeMaxQuiz = (prevProps.valueMaxQuiz != valueMaxQuiz);

    //new value has been computed, so update local value
    const nextState = {
      ...(didChangeValue && {value}),
    };

    if(didChangeMaxQuiz && valueMaxQuiz == 0){
      //new maxQuiz, update to MAX if no more remaining
      this.setState({mode: MODES.MAX, ...nextState});

    } else if(didChangeMaxQuiz && didChangeMode){
      //new maxQuiz, update to the apropriate mode
      this.setState({mode: nextMode, ...nextState});
    };
  };

  setupAnimations(){
    //animation values
    this.expandedHeight = new Value(120);
    this.progress       = new Value(this.props.initiallyCollapsed? 0 : 100);

    //interpolated values
    this.height = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, this.expandedHeight],
      extrapolate: 'clamp',
    });
    this.opacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    this.scale = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.9, 1],
      extrapolate: 'clamp',
    });

    this.isExpanded = false;
  };

  expand = (expand) => {
    const { MODES } = Stepper;
    const { valueMaxQuiz } = this.props;  
    const { mode } = this.state;

    const shouldUpdate = (mode != MODES.MAX && mode != MODES.DISABLED);
    if(valueMaxQuiz == 0 && shouldUpdate){
      this.setState({mode: MODES.MAX});
    };

    const config = {
      duration: 350,
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

  getValues(){
    const { value, shouldDistributeEqually } = this.state;
    return({ value, shouldDistributeEqually });
  };

  getValueMax(){
    const { valueMaxSubject, valueMaxQuiz } = this.props;
    const { value } = this.state;
    //should not exceed max subject or max quiz
    return Math.min(valueMaxSubject, (value + valueMaxQuiz));
  };

  getValueStep(){
    const valueMax = this.getValueMax();
    
    if(valueMax <= 10){ return 1  };
    if(valueMax <= 20){ return 2  };
    if(valueMax <= 30){ return 5  };
    if(valueMax >= 50){ return 10 };
  };

  getModeFromValue(value){
    const { MODES } = Stepper;  
    const { valueMin, valueMaxSubject } = this.props;
    const valueMax = this.getValueMax();

    if(valueMaxSubject <= 1){
      return MODES.DISABLED;

    } else if(value <= valueMin){ 
      return MODES.MIN;

    } else if(value >= valueMax){
      return MODES.MAX;

    } else {
      return MODES.NORMAL;
    };
  };

  _handleOnLayout = (event) => {
    const {x, y, width, height} = event.nativeEvent.layout;
    //console.log('Stepper: ' + height);
  };
  
  _handleOnChangeText = (text) => {
    const value = parseInt(isEmpty(text)? 0 : text);
    this.setState({value});
  };

  _handleOnPressTextInputContainer = () => {
    this.textinput.focus();
  };

  _handleOnFocus = () => {
    const { value } = this.state;
    this.setState({prevValue: value});
    this.textinputContainer.pulse(300);
  };

  _handleOnBlur = () => {
    const { MODES } = Stepper;
    const { valueMin, onChangeValue, valueMaxQuiz } = this.props;
    const { value, prevValue } = this.state;

    const valueMax = this.getValueMax();
    const nextValue = (
      value > valueMax? valueMax : 
      value < valueMin? valueMin : value
    );

    const mode = this.getModeFromValue(nextValue);
    if(valueMaxQuiz == 0){
      this.textinputContainer.shake(500);
      onChangeValue && onChangeValue(prevValue, mode);
      this.setState({value: prevValue, mode});

    }else if(mode == MODES.NORMAL){
      this.textinputContainer.pulse(300);
      onChangeValue && onChangeValue(nextValue, mode);
      this.setState({nextValue, mode});

    } else if(mode == MODES.MIN){
      this.textinputContainer.shake(500);
      onChangeValue && onChangeValue(valueMin, mode);
      this.setState({value: valueMin, mode});

    } else if(mode == MODES.MAX){
      this.textinputContainer.shake(500);
      onChangeValue && onChangeValue(valueMax, mode);
      this.setState({value: valueMax, mode});
    };
  };

  _handleOnPressStepperLeft = () => {
    const { MODES } = Stepper;
    const { valueMin, onChangeValue } = this.props;
    const { value } = this.state;
    
    const valueSteps = this.getValueStep();
    const nextValue = (value - valueSteps);

    const mode = this.getModeFromValue(nextValue);
    if(value <= valueMin){
      this.textinputContainer.shake(500);

    } else if(mode == MODES.MIN){
      this.textinputContainer.pulse(300);
      onChangeValue && onChangeValue(valueMin, mode);
      this.setState({value: valueMin, mode: MODES.MIN});

    } else if(mode == MODES.NORMAL){
      this.textinputContainer.pulse(300);
      onChangeValue && onChangeValue(nextValue, mode);
      this.setState({value: nextValue, mode: MODES.NORMAL});

    } else if(mode == MODES.DISABLED){
      this.textinputContainer.shake(500);
    };
  };

  _handleOnPressStepperRight = () => {
    const { MODES } = Stepper;
    const { onChangeValue } = this.props;
    const { value } = this.state;

    const valueSteps = this.getValueStep();
    const valueMax   = this.getValueMax ();
    const nextValue  = (value + valueSteps);
    
    const mode = this.getModeFromValue(nextValue);
    if(value >= valueMax){
      this.textinputContainer.shake(500);

    } else if(mode == MODES.MAX){
      this.textinputContainer.pulse(300);
      onChangeValue && onChangeValue(valueMax, mode);
      this.setState({value: valueMax, mode});

    } else if(mode == MODES.NORMAL){
      this.textinputContainer.pulse(300);
      onChangeValue && onChangeValue(nextValue, mode);
      this.setState({value: nextValue, mode: MODES.NORMAL});

    } else if(mode == MODES.DISABLED){
      this.textinputContainer.shake(500);
    };
  };

  _renderTextInput(){
    const { styles } = Stepper;
    const { valueMaxSubject } = this.props;

    return(
      <TouchableOpacity
        style={styles.textinputButtonContainer}        
        activeOpacity={0.5}
        onPress={this._handleOnPressTextInputContainer}
      >
        <Animatable.View
          ref={r => this.textinputContainer = r}
          style={styles.textinputContainer}        
          useNativeDriver={true}
        >
          <TextInput
            style={styles.textinput}
            ref={r => this.textinput = r}
            keyboardType={'numeric'}
            numberOfLines={1}
            multiline={false}
            onChangeText={this._handleOnChangeText}
            onBlur={this._handleOnBlur}
            onFocus={this._handleOnFocus}
            value={`${this.state.value}`}
            selectTextOnFocus={false}
            contextMenuHidden={true}
          />
          <Text style={styles.textinputLabel}>
            {`of ${valueMaxSubject} items`}
          </Text>
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  _renderStepper(){
    const { styles, MODES } = Stepper;
    const { mode } = this.state;
    
    const leftStepperStyle = {
      ...(mode === MODES.MIN || mode === MODES.DISABLED
        ? {backgroundColor: PURPLE[300]} 
        : {backgroundColor: PURPLE[500]} 
      ),
    };
    const rightStepperStyle = {
      ...(mode === MODES.MAX || mode === MODES.DISABLED
        ? {backgroundColor: PURPLE[300]} 
        : {backgroundColor: PURPLE[500]} 
      ),
    };

    return(
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          style={[styles.stepperButton, leftStepperStyle]}
          onPress={this._handleOnPressStepperLeft}
          activeOpacity={0.5}
        >
          <Icon
            name={'ios-remove'}
            type={'ionicon'}
            color={'white'}
            size={26}
          />
        </TouchableOpacity>
        {this._renderTextInput()}
        <TouchableOpacity
          onPress={this._handleOnPressStepperRight}
          style={[styles.stepperButton, rightStepperStyle]}
          activeOpacity={0.5}
        >
          <Icon
            name={'ios-add'}
            type={'ionicon'}
            color={'white'}
            size={26}
          />
        </TouchableOpacity>
      </View>
    );
  }; 

  render(){
    const { styles } = Stepper;
    const style = {
      height: this.height,
      opacity: this.opacity,
      transform: [{scale: this.scale}]
    };

    return(
      <Animated.View {...{style}}>
        <View 
          style={styles.container}
          onLayout={this._handleOnLayout}
        >
          <Text style={styles.title}>{'Number of Items'}</Text>
          <Text style={styles.subtitle}>{'Number of questions to add.'}</Text>
          {this._renderStepper()}
        </View>
      </Animated.View>
    );
  };
};

class QuizItem extends React.PureComponent {
  static propTypes = {
    moduleData: PropTypes.object,
    subjectData: PropTypes.object,  
    maxItemsQuiz: PropTypes.number,
    questionsTotal: PropTypes.number,
    shouldDistributeEqually: PropTypes.bool,
    //event callbacks
    emitter: PropTypes.object,
    onPressDelete: PropTypes.func,
    onChangeValueStepper: PropTypes.func,
  };

  static styles = StyleSheet.create({
    card: {
      //layout styles
      marginBottom: 12, 
      marginTop: 5, 
      overflow: 'visible', 
      marginHorizontal: 12, 
      paddingHorizontal: 15, 
      paddingVertical: 12, 
      borderRadius: 10,
      backgroundColor: 'white', 
      elevation: 7,
      //animated styles
      opacity: 1,
      transform: [
        { scaleX    : 1 }, 
        { scaleY    : 1 },
        { translateY: 1 },
      ],
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    descriptionContainer: {
      flex: 1, 
      alignItems: 'flex-start', 
      justifyContent: 'center', 
    },
    textTitle: {
      color: PURPLE[500],
      fontSize: 20, 
      fontWeight: '700'
    },
    textSubtitle: {
      color: PURPLE[1000],
      fontSize: 18,
      ...Platform.select({
        ios: {
          fontWeight: '400'
        },
        android: {
          fontWeight: '300'
        },
      }),
    },
    textSubtitleQuestions: {
      opacity: 0.85,
      fontWeight: '200'
    },
    textBody: {
      fontSize: 18,
      marginTop: 3,
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
      marginVertical: 10,
    },
    buttonWrapper: {
      backgroundColor: RED[800],
    },
    buttonContainer: {
      padding: 12,
    },
    buttonText: {
      color: 'white',
      fontSize: 17,
      fontWeight: '600',
    }
  });

  constructor(props){
    super(props);
    this.state = {
      height: null
    };
  };

  componentWillMount = () => {
    const { events } = CreateQuizScreen;
    const { emitter } = this.props;

    //register events
    emitter && emitter.addListener(
      events.onEqualItemsToggled,
      this._handleOnEqualItemsToggled
    );
  };

  componentWillUnmount(){
    const { events } = CreateQuizScreen;
    const { emitter } = this.props;

    //unregister event
    false && emitter && emitter.removeEventListener(
      events.onEqualItemsToggled, 
      this._handleOnEqualItemsToggled
    );
  };

  //----- event handlers -----
  /** emiiter: handle when shouldDistributeEqually switch changes */
  _handleOnEqualItemsToggled = ({shouldDistributeEqually}) => {
    const stepper = this.stepper;
    if(shouldDistributeEqually){
      //hide stepper
      stepper && stepper.expand(false);

    } else {
      //show stepper
      stepper && this.stepper.expand(true);
    };
  };

  /** called whenever the stepper value changes */
  _handleOnChangeValueStepper = (value, mode) => {
    const { onChangeValueStepper, subjectData } = this.props;
    onChangeValueStepper && onChangeValueStepper(value, subjectData, mode);
  };

  /** delete button: when delete button is pressed */
  _handleOnPressDeleteButton = async () => {
    const { onPressDelete, subjectData } = this.props;

    //get current height
    const height = await new Promise(resolve => {
      this.container.measure((x, y, width, height) => {
        resolve(height);
      });
    });
    //set height
    await setStateAsync(this, {height});

    const exitStyle = {
      opacity: 0, 
      height: 0,
      marginTop: 0, 
      marginBottom: 0, 
      paddingVertical: 0,
      transform: [
        { scaleX: 0.75 },
        { scaleY: 0.50 },
        { translateY: -(height/2) }
      ]
    };

    this.rootContainer.transitionTo(exitStyle, 400, 'ease-in-out');
    await timeout(450);

    //call callback and pass subjectdata
    onPressDelete && onPressDelete(subjectData);
  };

  //------ render ------
  /** show details: title, desc., etc. */
  _renderDescription(){
    const { styles } = QuizItem;
    const { moduleData, subjectData, shouldDistributeEqually } = this.props;

    const { modulename } = ModuleItemModel.wrap(moduleData);
    const { subjectname, description, questions, lastupdated } = SubjectItem.wrap(subjectData);
    const questionCount = (questions || []).length;

    return(
      <View style={styles.descriptionContainer}>
        <Text 
          style={styles.textTitle}
          numberOfLines={1}
          ellipsizeMode={'tail'}
        >
          {subjectname}
        </Text>
        <Text 
          style={styles.textSubtitle}
          numberOfLines={1}
          ellipsizeMode={'tail'}
        >
          {`${modulename}`}
          <Text style={styles.textSubtitleQuestions}>
            {` • ${shouldDistributeEqually? `(${questionCount} questions)` : lastupdated}`}
          </Text>
        </Text>
        <Text 
          style={styles.textBody}
          numberOfLines={3}
          ellipsizeMode={'tail'}
        >
          {description}
        </Text>
      </View>
    );
  };

  /** delete button */
  _renderDeleteButton(){
    const { styles } = QuizItem;

    return(
      <PlatformTouchableIconButton
        onPress={this._handleOnPressDeleteButton}
        wrapperStyle={[styles.buttonWrapper, STYLES.lightShadow]}
        containerStyle={styles.buttonContainer}
        text={'Remove Item'}
        textStyle={styles.buttonText}
        iconName={'trash-2'}
        iconType={'feather'}
        iconColor={'white'}
        iconSize={24}
      />
    );
  };

  /** question +/- stepper */
  _renderStepper(){
    const { questionsTotal, maxItemsQuiz, subjectData, shouldDistributeEqually } = this.props;
    const { questions, itemsPerSubject, allocatedItems } = SubjectItem.wrap(subjectData);

    //max value should not exceed the number of questions in a subject
    const valueMaxSubject = questions.length;
    //max value should not exceed the quiz's remaining items 
    const valueMaxQuiz = (maxItemsQuiz - questionsTotal);
    
    return(
      <Stepper
        ref={r => this.stepper = r}
        value={allocatedItems}
        valueMin={1}
        onChangeValue={this._handleOnChangeValueStepper}
        initiallyCollapsed={shouldDistributeEqually}
        {...{subjectData, valueMaxSubject, valueMaxQuiz}}       
      />
    );
  };

  render(){
    const { styles } = QuizItem;
    const { height } = this.state;

    return(
      <Animatable.View
        ref={r => this.rootContainer = r}
        style={{height}}
        easing={'ease-in-out'}
        useNativeDriver={false}
      >
        <View 
          ref={r => this.container = r}
          style={[STYLES.mediumShadow, styles.card]}
        >
          {this._renderDescription()}
          <Divider style={styles.divider}/>
          {this._renderStepper()}
          {this._renderDeleteButton()}
        </View>
      </Animatable.View>
    );
  };
};

class CreateCustomQuizList extends React.Component {
  static propTypes = {
    maxItemsQuiz: PropTypes.number,
    questionsTotal: PropTypes.number,
    shouldDistributeEqually: PropTypes.bool,
    //data source
    modules: PropTypes.array,
    quizItems: PropTypes.array,
    selectedModules: PropTypes.array,
    //event callbacks
    emitter: PropTypes.object,
    onPressDelete: PropTypes.func,
    onChangeValueStepper: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      marginTop: 15,
      marginBottom: 5,
      marginLeft: 12,
    },
    //header styles
    indicatorText: {
      fontSize: 26,
      fontWeight: '700',
      color: PURPLE[1100],
    },
    indicatorSubtitle: {
      fontSize: 17,
      fontWeight: '400',
      color: PURPLE[1200],
      opacity: 0.9
    },
    //empty card styles
    card: {
      flexDirection: 'row',
      paddingVertical: 15,
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
    this.imageHeader = require('../../assets/icons/clipboard-circle.png');
    this.state = {
      showHeader: false,
    };
  };

  async componentDidUpdate(prevProps) {
    const { modules, quizItems } = this.props;

    //get previous values
    const prevModules   = prevProps.modules;
    const prevQuizItems = prevProps.quizItems;

    const didChangeModules   = ((prevModules   || []).length != (modules   || []).length);
    const didChangeQuizItems = ((prevQuizItems || []).length != (quizItems || []).length);
    const didChange = (didChangeModules || didChangeQuizItems);

    const isCurrentlyEmpty   = (quizItems    .length == 0);
    const wasPreviouslyEmpty = (prevQuizItems.length == 0);
 
    if(didChange && wasPreviouslyEmpty){
      //show header
      this.setState({showHeader: true});

    }else if(didChange && !wasPreviouslyEmpty && !isCurrentlyEmpty){
      //animate because of change
      this.container && await this.container.pulse(500);

    } else if(didChange && isCurrentlyEmpty){
      //animate out and hide header
      this.container && await this.container.fadeOut(300);
      this.setState({showHeader: false});
    };
  };

  _handleOnPressDelete = (subjectData) => {
    const { onPressDelete } = this.props;
    onPressDelete && onPressDelete(subjectData);
  };
  
  _keyExtractor(item, index){
    return `${item.indexid}-${item.subjectname}`;
  };

  _renderItem = ({item, index}) => {
    const { modules, emitter, maxItemsQuiz, shouldDistributeEqually, onChangeValueStepper, questionsTotal } = this.props;
    
    const wrappedSubject = SubjectItem.wrap(item);
    const wrappedModules = ModuleItemModel.wrapArray(modules);
    //find matching module
    const moduleData = wrappedModules.find(module => 
      //return if index id matches
      module.indexid == wrappedSubject.indexID_module
    );

    return(
      <AnimatedListItem
        duration={500}
        last={5}
        {...{index}}
      >
        <QuizItem 
          subjectData={wrappedSubject} 
          onPressDelete={this._handleOnPressDelete}
          {...{moduleData, emitter, maxItemsQuiz, shouldDistributeEqually, onChangeValueStepper, questionsTotal}}
        />
      </AnimatedListItem>
    );
  };

  _renderHeader = () => {
    const { styles } = CreateCustomQuizList;
    const { quizItems, selectedModules } = this.props;
    const { showHeader } = this.state;
    if(!showHeader) return null;

    const countModules = (selectedModules || []).length;
    const countQuiz    = (quizItems       || []).length;

    const animation = Platform.select({
      ios: 'fadeInUp', 
      android: 'fadeInRight'
    });

    return(
      <Animatable.View
        style={styles.container}
        ref={r => this.container = r}
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <Text style={styles.indicatorText}>
          {`${countQuiz} ${plural('Subject', countQuiz)}`}
        </Text>
        <Text style={styles.indicatorSubtitle}>
          {`From ${countModules} ${plural('module', countModules)}`}
        </Text>
      </Animatable.View>
    );
  };

  _renderFooter = () => {
    return(
      <IconFooter
        animateIn={false}
        hide={false}
      />
    );
  };

  _renderEmpty = () => {
    const { styles } = CreateCustomQuizList;
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <Animatable.View
        duration={750}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <Card style={styles.card}>
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
            <Text style={styles.headerSubtitle}>Press the "Add Subjects" button to insert some items here Random questions will then be selected from those subjects.</Text>
          </View>
        </Card>
      </Animatable.View>
    );
  };

  render(){
    const {quizItems, maxItemsQuiz, shouldDistributeEqually, ...otherProps} = this.props;

    return(
      <FlatList
        data={quizItems}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
        ListHeaderComponent={this._renderHeader}
        ListFooterComponent={this._renderFooter}
        ListEmptyComponent={this._renderEmpty}
        {...otherProps}
      />
    );
  };
};

//nextButton references
let _onPressNext   = null;
let _nextButtonRef = null;
//right header component: next button
const headerRight = <NextButton 
  ref={r => _nextButtonRef = r}
  onPress={() => _onPressNext && _onPressNext()}  
/>

export class CreateQuizScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    return ({
      title: 'Custom Quiz', 
      headerRight,
      headerTitleStyle: STYLES.glow,
      //custom android header
      ...Platform.select({
        android: { header: props => 
          <AndroidHeader
            rightComponent={headerRight}
            {...{titleStyle, ...props}}
          />
      }}),
    });
  };

  static styles = StyleSheet.create({
    indicatorText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    topIndicatorContainer: {
      position: 'absolute', 
      width: '100%', 
      marginTop: Header.HEIGHT,
    },
  });

  /** event emitter event types */
  static events = {
    /** when a stepper value has been changed */
    onChangeRemainingQuizItems: 'onChangeRemainingQuizItems',
    /** when the max amount of quiz items is reached */
    onQuestionTotalMaxed: 'onQuestionTotalMaxed',
    /** when equal items switch has changed */
    onEqualItemsToggled: 'onEqualItemsToggled',
  };

  //------ static methods ------
  static computeDistributions({maxItemsQuiz, subjects}){
    const subjectsWrapped = SubjectItem.wrapArray(subjects);

    const itemsPerSubject = Math.round(maxItemsQuiz / subjects.length);
    let remainingItems = maxItemsQuiz;
    let someItemsEmpty = false;

    const items = subjectsWrapped.map((subject, index) => {
      const { questions } = subject;
      const questionsCount = questions.length;
      const isLast = (index == subjects.length - 1);

      //max
      const computedAllocation = isLast? remainingItems : itemsPerSubject;
      const allocatedItems = (computedAllocation > questionsCount)? questionsCount : computedAllocation;
      if(allocatedItems <= 0) someItemsEmpty = true;

      /*
      console.log("questionsCount: " + questionsCount);
      console.log("itemsPerSubject: " + itemsPerSubject);
      console.log("computedAllocation: " + computedAllocation);
      console.log("allocatedItems: " + allocatedItems);
      console.log("remainingItems: " + remainingItems);
      console.log("\n\n");
      */

      //update remaining items
      remainingItems -= allocatedItems;
      return { ...subject, itemsPerSubject, allocatedItems };
    });
    return { items, itemsPerSubject, remainingItems, someItemsEmpty };
  };

  static computeTotalAllocated(subjects){
    const items = SubjectItem.wrapArray(subjects);

    const allocatedItems = items.map(subject => subject.allocatedItems || 0);
    const totalAllocated = allocatedItems.reduce((acc, val) => (acc += val), 0);

    return (totalAllocated);
  };

  static combineModulesAndSubjects(modules, subjects){
    //get all unique module id's
    const uniqueModulesIndex = [...new Set(subjects.map(
      subject => subject.indexID_module
    ))];
    
    //array of modules with their corresponding subjects
    return uniqueModulesIndex.map((indexID_module) => {
      //find the matching module
      const match_module = modules.find(module => 
        module.indexid == indexID_module
      );
      //get all subjects that are from match_module
      const match_subjects = subjects.filter(subject => 
        subject.indexID_module == indexID_module
      );
      
      //wrap objects
      const module = ModuleItemModel.wrap(match_module);
      const subjectsWrapped = SubjectItem.wrapArray(match_subjects);

      //pass down module properties and overwrite subject property
      return { ...module, subjects: subjectsWrapped };
    });
  };

  //------ lifecycle events ------
  constructor(props){
    super(props);

    this.setupReferences();
    this.setupAnimations();
    this.emitter = new EventEmitter();

    this.state = {
      mountList: true,
      modules: null, 
      itemsPerSubject: null,  
      //values for quizdetails modal
      title: '',
      description: '',
      maxItemsQuiz: 90, 
      shouldDistributeEqually: true,
      //values for createquiz modal
      selected: [],
      selectedModules: [],
      //used for top inidcator
      questionsTotal: 0,
    };    
  };

  async componentDidUpdate(prevProps, prevState) {
    const { title, description, selected } = this.state;

    //get previous values
    const prevTitle    = prevState.title;
    const prevDesc     = prevState.description;
    const prevSelected = prevState.selected;

    //check if details has changed
    const didChangeTitle = (prevTitle != title      );
    const didChangeDesc  = (prevDesc  != description);

    //check if subjects has changed
    const didChangeSubject = (prevSelected.length != selected.length);
    //check if either items has changed
    const didChange = (didChangeTitle || didChangeDesc || didChangeSubject);

    //check if subjects/selected was empty
    const subjectsIsCurrentlyEmpty   = (selected    .length == 0);
    const subjectsWasPreviouslyEmpty = (prevSelected.length == 0);

    //check if details were previously empty
    const detailsIsCurrentlyEmpty   = !(validateNotEmpty(title    ) || validateNotEmpty(description ));
    const detailsWasPreviouslyEmpty = !(validateNotEmpty(prevTitle) || validateNotEmpty(prevSelected));
    
    //check if either subject/details empty
    const isCurrentlyEmpty   = (subjectsIsCurrentlyEmpty  || detailsIsCurrentlyEmpty );
    const wasPreviouslyEmpty = (subjectsWasPreviouslyEmpty|| detailsWasPreviouslyEmpty);

    //when details and add subject has been added the first time
    if(didChange && wasPreviouslyEmpty && !isCurrentlyEmpty){
      //change header nextButton style to active
      _nextButtonRef && _nextButtonRef.setActive(true);
    };
  };

  async componentDidMount(){
    const modules = await this.getModules();
    this.setState({modules});
  };

  componentWillUnmount(){
    this.emitter.removeAllListeners();
  };

  //------ functions ------
  setupReferences(){
    //get refs from screenprops
    const screenProps = this.props.screenProps;
    //get ref of modal from homescreen wrapper
    this.quizModal    = screenProps.getRefCreateQuizModal ();
    this.finishModal  = screenProps.getRefQuizFinishModal ();
    this.detailsModal = screenProps.getRefQuizDetailsModal();
    
    _onPressNext = this._handleOnPressNext;
  };

  setupAnimations(){
    //----- animated values ------
    /** height of the top indicator */
    this.expandedHeight = new Value(75);
    this.progress = new Value(0);

    //interpolated values
    this.height = interpolate(this.progress, {
      inputRange : [0, 1],
      outputRange: [0, this.expandedHeight],
      extrapolate: 'clamp',
    });
    this.scale = interpolate(this.progress, {
      inputRange : [0, 1],
      outputRange: [0.85, 1],
      extrapolate: 'clamp',
    });
    this.translateY = interpolate(this.progress, {
      inputRange : [0, 1],
      outputRange: [multiply(this.expandedHeight, -1), 0],
      extrapolate: 'clamp',
    });

    this.isHeightMeasured = false;
    this.isExpanded = false;
  };

  async expandTopIndicator(expand){
    //set height if not measured yet
    if(!this.isHeightMeasured){
      //get indicator height
      const height = await new Promise(resolve => 
        this.indicatorContainer.measure((x, y, w, h) => resolve(h))
      );
      //set indicator height
      this.expandedHeight.setValue(height);
    };

    const config = {
      duration: 300,
      toValue : expand? 1 : 0,
      easing  : Easing.inOut(Easing.ease),
    };

    if(this.isExpanded != expand){
      this.isExpanded = expand;
      //start animation
      const animation = timing(this.progress, config);
      await timeout(500);
      animation.start();
    };
  };

  async getModules(){
    const modules_raw = await ModuleStore.read();
    const modules = ModuleItemModel.wrapArray(modules_raw);

    return modules.map((module) => {
      const { indexid } = module;
      const new_subject = module.subjects.map(subject => {
        return { indexID_module: indexid, ...subject };
      });
      return { ...module, subjects: new_subject };
    });
  };

  componentDidFocus = () => {
    const { setDrawerSwipe } = this.props.screenProps;
    setDrawerSwipe(false);
  };

  //------ event handlers -------
  /** navbar: next button is pressed */
  _handleOnPressNext = () => {
    const {selected, selectedModules, title, description, itemsPerSubject, maxItemsQuiz, shouldDistributeEqually, questionsTotal} = this.state;

    const isValid = (isEmpty(title) || isEmpty(description));

    if(selected <= 0){
      Alert.alert(
        'Not Enough Items',
        "Please add at least one subject to continue.",
        [{text: 'OK', onPress: this._onPressAlertOK}],
        //{cancelable: false},
      );
    } else if(isValid){
      Alert.alert(
        'No Title/Description',
        "Press 'Edit Deatils' to add a title and description.",
        [{text: 'OK', onPress: this._onPressAlertOK}],
      );
    } else {
      this.finishModal.openModal({
        selected, selectedModules, title, description, itemsPerSubject, maxItemsQuiz, shouldDistributeEqually, questionsTotal
      });
    };
  };

  /** flatlist render item: when remove item button is pressed */
  _handleOnPressDelete = async (subjectData) => {
    const { events } = CreateQuizScreen;
    const { selected, maxItemsQuiz, shouldDistributeEqually } = this.state;

    const deletedSubject = SubjectItem.wrap(subjectData);
    const deletedSubjectID = `${deletedSubject.indexID_module}-${deletedSubject.indexid}`;

    //make a copy without deleted subject
    const newSelected = selected.filter(subject => {
      //create id from the current subject's indexid's
      const subjectID = `${subject.indexID_module}-${subject.indexid}`;
      //dont include deleted
      return (subjectID != deletedSubjectID);
    });

    //compute total questions allocated
    const questionsTotal = CreateQuizScreen.computeTotalAllocated(newSelected);
    this.emitter.emit(events.onChangeRemainingQuizItems);

    //compute distribution
    const { itemsPerSubject } = CreateQuizScreen.computeDistributions({maxItemsQuiz, subjects: selected});
    const nextState = {
      questionsTotal,
      selected: newSelected,
      ...(shouldDistributeEqually && {itemsPerSubject}),
    };

    if(newSelected.length == 0){
      this.expandTopIndicator(false);
      await this.listContainer.fadeOut(300);
      await setStateAsync(this, {mountList: false});
      await setStateAsync(this, {
        mountList: true,
        ...nextState,
      });
      await this.listContainer.fadeInUp(300);

    } else {
      //update selected items and questiontotal without deleted
      this.setState(nextState);
    };
  };

  /** when alert ok button is pressed */
  _onPressAlertOK = () => {
    const {selected, title, description} = this.state;
    const isValid = (isEmpty(title) || isEmpty(description));

    if(selected <= 0 || isValid){
      this.headerCard.animatePulse();
    };
  };

  /** header: Edit details button press */
  _handleOnPressEditDetails = () => {
    const {title, description, maxItemsQuiz, shouldDistributeEqually} = this.state;

    if(this.detailsModal != null){
      //assign callback to modal
      this.detailsModal.onPressSaveChanges = this._handleModalOnPressSaveChanges;

      //show modal
      this.detailsModal.openModal({
        value: maxItemsQuiz,
        //pass down other state
        title, description, shouldDistributeEqually
      });
    };
  };

  /** header: Add subjects button press */
  _handleOnPressAddSubject = () => {
    const { modules } = this.state;
    if(this.quizModal != null){
      //assign callback to modal
      this.quizModal.onPressAddSubject = this._handleModalOnPressAddSubject;

      const {selected, selectedModules} = this.state;
      //show modal
      this.quizModal.openModal({modules, selected, selectedModules});
    };
  };
  
  /** flatlist render item: stepper value change */
  _handleOnChangeValueStepper = (value, subjectData, mode) => {
    const { MODES } = Stepper;  
    const { events } = CreateQuizScreen;
    const { selected, questionsTotal, maxItemsQuiz } = this.state;

    const subjects  = SubjectItem.wrapArray(selected);
    const new_subject = SubjectItem.wrap(subjectData);
    //create id from new_subject's index id's
    const new_subjectID = `${new_subject.indexID_module}-${new_subject.indexid}`;

    //make a copy and replace matching subject
    const new_subjects = subjects.map(subject => {
      //create id from the current subject's indexid's
      const subjectID = `${subject.indexID_module}-${subject.indexid}`;
      //return updated subject
      return (subjectID != new_subjectID)? subject : {
        ...new_subject,
        allocatedItems: value,
      };
    });

    //total questions allocated
    const nextQuestionsTotal = CreateQuizScreen.computeTotalAllocated(new_subjects);
    const didChange  = (questionsTotal != nextQuestionsTotal);
    const isTotalMax = (nextQuestionsTotal >= maxItemsQuiz);
    
    if(isTotalMax){
      this.emitter.emit(events.onQuestionTotalMaxed);      

    } else if(didChange){
      this.emitter.emit(events.onChangeRemainingQuizItems);
    };

    //console.log('questionsTotal: ' + questionsTotal);
    //console.log('new_subject   : ' + new_subject.subjectname);

    this.setState({
      selected: new_subjects,
      questionsTotal: nextQuestionsTotal,
    });
  };

  //------ modal event handlers ------
  /** createquiz modal: add subject has been pressed */
  _handleModalOnPressAddSubject = async ({selected}) => {
    const { events } = CreateQuizScreen;
    const { maxItemsQuiz, modules } = this.state;

    const prevCount = this.state.selected.length;
    const nextCount = selected.length;
    const didChange = (prevCount != nextCount);

    const distributions = CreateQuizScreen.computeDistributions({subjects: selected, maxItemsQuiz});
    const items = (distributions.someItemsEmpty
      ? distributions.items.filter((item) => item.allocatedItems != 0 )
      : distributions.items
    );

    const questionsTotal  = CreateQuizScreen.computeTotalAllocated(items);
    const selectedModules = CreateQuizScreen.combineModulesAndSubjects(modules, selected);

    if(distributions.someItemsEmpty){
      await new Promise(resolve => Alert.alert(
        'Items Removed',
        'Some of the subjects were removed because the items exceeds the question limit.',
        [{text: 'OK', onPress: () => resolve()}],
      ));
    };

    if(prevCount > nextCount){
      await this.listContainer.fadeOut(300);
      await setStateAsync(this, {
        selected: items,
        itemsPerSubject: distributions.itemsPerSubject,
        //pass down to state
        selectedModules, questionsTotal
      });
      await this.listContainer.fadeInUp(300);

    } else {
      this.setState({
        selected: items,
        itemsPerSubject: distributions.itemsPerSubject,
        //pass down to state
        selectedModules, questionsTotal
      });
    };

    if(didChange){
      this.emitter.emit(events.onChangeRemainingQuizItems);       
    };

    if(selected.length > 0){
      //show top indicator
      this.expandTopIndicator(true);
    };
  };

  /** quizdetails modal: save changes button has been pressed */
  _handleModalOnPressSaveChanges = async ({title, description, value, shouldDistributeEqually}) => {
    const { events } = CreateQuizScreen;
    const prevState = this.state;

    let nextState = {title, description};
    //check shouldDistributeEqually has changed
    const didChangeSwitch  = (prevState.shouldDistributeEqually != shouldDistributeEqually);
    const didChangeStepper = (prevState.maxItemsQuiz != value);

    //only shouldDistributeEqually changed
    if(didChangeSwitch){
      nextState.shouldDistributeEqually = shouldDistributeEqually;
    };
    
    //only maxItemsQuiz changed
    if(didChangeStepper){
      //update max item quiz with stepper value
      nextState.maxItemsQuiz = value;

      //recompute the allocations for each subject
      const distributions = CreateQuizScreen.computeDistributions({
        subjects: prevState.selected,
        maxItemsQuiz: value,
      });

      //filter out empty items
      const items = (distributions.someItemsEmpty
        ? distributions.items.filter((item) => item.allocatedItems != 0 )
        : distributions.items
      );

      //if items were removed, show dialog
      if(distributions.someItemsEmpty){
        await new Promise(resolve => Alert.alert(
          'Items Removed',
          'Some of the subjects were removed because the items exceeds the question limit.',
          [{text: 'OK', onPress: () => resolve()}],
        ));
      };

      //update total question count
      nextState.questionsTotal = CreateQuizScreen.computeTotalAllocated(items);
      //append selected to nextState
      nextState.selected = items;
      //update itemsPerSubject
      nextState.itemsPerSubject = distributions.itemsPerSubject;
    };

    //update state
    await setStateAsync(this, nextState);
    //emit event: shouldDistributeEqually switch has changed and remaining items changed
    didChangeSwitch  && this.emitter.emit(events.onEqualItemsToggled, {shouldDistributeEqually});
    didChangeStepper && this.emitter.emit(events.onChangeRemainingQuizItems);     
  };

  //------ render ------
  /** create quiz header and items list */
  _renderContents = () => {
    const { title, description, selected, mountList, modules, selectedModules, questionsTotal, maxItemsQuiz, shouldDistributeEqually, itemsPerSubject } = this.state;

    return(
      <Fragment>
        <HeaderCard
          ref={r => this.headerCard = r}
          onPressEditDetails={this._handleOnPressEditDetails}
          onPressAddSubject={this._handleOnPressAddSubject}
          {...{title, description, selected, itemsPerSubject, shouldDistributeEqually}} 
        />
        <Animatable.View
          ref={r => this.listContainer = r}
          useNativeDriver={true}
        >
          {mountList && <CreateCustomQuizList 
            emitter={this.emitter}
            quizItems={selected}
            onChangeValueStepper={this._handleOnChangeValueStepper}
            onPressDelete={this._handleOnPressDelete}
            {...{modules, selectedModules, maxItemsQuiz, shouldDistributeEqually, questionsTotal}}
          />}
        </Animatable.View>
      </Fragment>
    );
  };

  render(){
    const { styles } = CreateQuizScreen;
    const { questionsTotal, maxItemsQuiz } = this.state;

    const topIndicatorContainerStyle = {
      opacity: this.progress,
      transform: [
        { scale: this.scale },
        { translateY: this.translateY },
      ],
    };

    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <ScrollView
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
          keyboardDismissMode={'on-drag'}
          keyboardShouldPersistTaps={'never'}
        > 
          <Animated.View style={{height: this.height}}/>
          {this._renderContents()}     
        </ScrollView>
        <Animated.View style={[styles.topIndicatorContainer, topIndicatorContainerStyle]}>
          <View ref={r => this.indicatorContainer = r}>
            <TopInidcator
              ref={r => this.topInidcator = r}
              initiallyCollapsed={true}
              emitter={this.emitter}
              {...{questionsTotal, maxItemsQuiz}}
            />
          </View>
        </Animated.View>
      </ViewWithBlurredHeader>
    );
  };
};