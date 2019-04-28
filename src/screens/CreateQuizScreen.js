import React, { Fragment } from 'react';
import { View, ScrollView, Text, StyleSheet, FlatList, Platform, Alert, TouchableOpacity, TextInput, Switch, Clipboard } from 'react-native';
import PropTypes from 'prop-types';

import { plural, isEmpty, setStateAsync, timeout } from '../functions/Utils';
import { STYLES, HEADER_HEIGHT } from '../Constants';
import { PURPLE, RED } from '../Colors';
import { SubjectItem, } from '../models/ModuleModels';

import { AndroidHeader } from '../components/AndroidHeader';
import { ViewWithBlurredHeader, AnimatedListItem, Card , IconFooter} from '../components/Views' ;
import { PlatformTouchableIconButton, RippleBorderButton } from '../components/Buttons';

import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo';
import { NavigationEvents  } from 'react-navigation';
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
      marginRight: 5,
    },
    buttonLabel: {
      color: 'white', 
      ...Platform.select({
        ios: {
          fontSize: 18,
          margin: 10,
        },
        android: {
          fontSize: 19,          
          margin: 15,
          fontWeight: '500'
        }
      })
    },
  });
  
  

  render(){
    const { styles } = NextButton;
    return(
      <RippleBorderButton 
        containerStyle={styles.button}
        {...this.props}
      >
        <Text style={styles.buttonLabel}>Next</Text>
      </RippleBorderButton>
    );
  };
};

class TitleDescription extends React.PureComponent {
  static styles = StyleSheet.create({
    headerTextContainer: {
      flex: 1, 
    },
    headerTitle: {
      color: '#512DA8',
      fontSize: 20, 
      fontWeight: '800',
      textAlign: 'center',
    },
    headerSubtitle: {
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
  });

  constructor(props){
    super(props);

    //set initial text
    this.state = {
      title: props.title,
      description: props.description,
    };
  };

  changeText = async ({title, description}) => {
    await this.textContainer.fadeOut(250);
    this.setState({title, description});

    if(Platform.OS == 'ios'){
      await this.textContainer.fadeInUp(250);

    } else {
      await this.textContainer.fadeIn(250);
    };
  };

  render(){
    const { styles } = TitleDescription;
    const { title, description } = this.state;

    const defaultTitle = (global.usePlaceholder
      ? 'Ridiculus Eges'
      : 'Custom Quiz'
    );

    const defaultDescription = (global.usePlaceholder
      ? 'Nulla vitae elit libero, a pharetra augue. Maecenas faucibus mollis interdum.'
      : 'Give your custom quiz a title and a description so you can easily find it later.'
    );

    const headerTitle       = (title       == '')? defaultTitle       : title; 
    const headerDescription = (description == '')? defaultDescription : `Quiz Descripton – ${description}`; 

    return(
      <Animatable.View 
        style={styles.headerTextContainer}
        ref={r => this.textContainer = r}
        useNativeDriver={true}
      >
        <Text 
          style={styles.headerTitle} 
          numberOfLines={1} 
        >
          {headerTitle}
        </Text>
        <Text style={styles.headerSubtitle}>{headerDescription}</Text>
      </Animatable.View>
    );
  };
};

class TitleDescriptionCard extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    onPressEditDetails: PropTypes.func,
  };
  
  static styles = StyleSheet.create({
    card: {
      marginBottom: 10,
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    buttonWrapper: {
      backgroundColor: PURPLE.A700,
      marginTop: 10,
    },
    buttonContainer: {
      padding: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 17,
      fontWeight: '600',
    },
  });

  constructor(props){
    super(props);
    this.imageHeader = require('../../assets/icons/clipboard-circle.png');
  };

  async componentDidUpdate(prevProps){
    const {title, description} = this.props;

    const didTitleChange       = title       != prevProps.title;
    const didDescriptionChange = description != prevProps.description;

    const didChange = didTitleChange || didDescriptionChange;
    didChange && this.titleDescription.changeText({title, description});
  };

  animatePulse(){
    this._container.pulse(750);
  };

  _handleOnPressEditDetails = () => {
    const { onPressEditDetails } = this.props;
    onPressEditDetails && onPressEditDetails();
  };

  _renderDescription(){
    const { styles } = TitleDescriptionCard;
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

  _renderButton(){
    const { styles } = AddSubjectsCard;

    const text = (global.usePlaceholder
      ? 'Pharetra Tellu'
      : 'Edit Details'
    );

    return(
      <PlatformTouchableIconButton
        onPress={this._handleOnPressEditDetails}
        wrapperStyle={[styles.buttonWrapper, STYLES.lightShadow]}
        containerStyle={styles.buttonContainer}
        textStyle={styles.buttonText}
        iconName={'edit'}
        iconType={'entypo'}
        iconColor={'white'}
        iconSize={24}
        {...{text}}
      />
    );
  };

  render() {
    const { styles } = TitleDescriptionCard;
    
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
          <Divider/>
          {this._renderButton()}
        </Card>
      </Animatable.View>
    );
  };
};

class AddSubjectsCard extends React.PureComponent {
  static propTypes = {
    onPressAddSubject: PropTypes.func,
  };

  static styles = StyleSheet.create({
    card: {
      marginBottom: 10,
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
    buttonWrapper: {
      backgroundColor: PURPLE.A700,
      marginTop: 10,
    },
    buttonContainer: {
      padding: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 17,
      fontWeight: '600',
    },
  });

  constructor(props){
    super(props);

    this.imageHeader = require('../../assets/icons/file-circle.png');
  };

  animatePulse(){
    this._container.pulse(750);
  };

  _handleOnPressAddSubject = () => {
    const { onPressAddSubject } = this.props;
    onPressAddSubject && onPressAddSubject();
  };

  _renderDescription(){
    const { styles } = AddSubjectsCard;

    const title = (global.usePlaceholder
      ? 'Purus Ligula Sem'
      : 'Add an Quiz Item'
    );

    const description = (global.usePlaceholder
      ? 'Sed posuere consectetur est at lobortis. Maecenas faucibus mollis interdum.'
      : "100 questions in total will be selected across all the subjects you've selected."
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

  _renderButtons(){
    const { styles } = AddSubjectsCard;

    const text = (global.usePlaceholder
      ? 'Vehicula Commodo'
      : 'Add Subjects'
    );

    return(
      <PlatformTouchableIconButton
        onPress={this._handleOnPressAddSubject}
        wrapperStyle={[styles.buttonWrapper, STYLES.lightShadow]}
        containerStyle={styles.buttonContainer}
        textStyle={styles.buttonText}
        iconName={'bookmark'}
        iconType={'entypo'}
        iconColor={'white'}
        iconSize={24}
        {...{text}}
      />
    );
  };

  render() {
    const { styles } = AddSubjectsCard;
    
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'fadeInRight',
    });

    return(
      <Animatable.View
        ref={r => this._container = r}
        duration={500}
        delay={100}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <Card style={styles.card}>
          {this._renderDescription()}
          <Divider/>
          {this._renderButtons()}
        </Card>
      </Animatable.View>
    );
  };
};

class TopInidcator extends React.PureComponent {
  static propTypes = {
    collapsedHeight: PropTypes.number,
    initiallyCollapsed: PropTypes.bool,
    value: PropTypes.number,
    valueMax: PropTypes.number,
  };

  static defaultProps = {
    collapsedHeight: 0,
    initiallyCollapsed: true,
  };

  static styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    indicatorContainer: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: 'center',
    },
    label: {
      flex: 1,
      marginLeft: 7,
      fontSize: 18,
    },
    indicatorCountContainer: {
      paddingHorizontal: 13,
      paddingVertical: 4,
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
    const { initiallyCollapsed } = props;

    //animation values
    this.expandedHeight = new Value(-1);
    this.progress = new Value(initiallyCollapsed? 0 : 100);

    //interpolated values
    this.height = cond(eq(this.expandedHeight, -1), 0, interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, this.expandedHeight],
      extrapolate: 'clamp',
    }));
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
    this.translateY = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [multiply(divide(this.expandedHeight, 2), -1), 0],
      extrapolate: 'clamp',
    });

    this.isHeightSet = false;
    this.isExpanded = !initiallyCollapsed;
  };

  /** expand or collapse the forms */
  expand(expand){
    const config = {
      duration: 350,
      toValue : expand? 100 : 0,
      easing  : Easing.inOut(Easing.ease),
    };

    if(this.isExpanded != expand){
      this.isExpanded = expand;
      //start animation
      const animation = timing(this.progress, config);
      animation.start();
    };
  };

  _handleOnLayout = ({nativeEvent}) => {
    const { x, y, width, height } = nativeEvent.layout;
    if(height != 0 && !this.isHeightSet){
      this.expandedHeight.setValue(height);
      this.isHeightSet = true;
    };
  };

  _renderContent(){
    const { styles } = TopInidcator;
    const { value, valueMax } = this.props;

    return(
      <Fragment>
        <Icon
          name={'ios-information-circle'}
          type={'ionicon'}
          size={26}
          color={PURPLE.A700}
        />
        <Text style={styles.label}>Remaining Items</Text>
        <View style={styles.indicatorCountContainer}>
          <Text style={styles.indicatorCountText}>
            {`${value || '?'}/${valueMax || '?'}`}
          </Text>
        </View>
      </Fragment>
    );
  };

  _renderContainer(){
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

  render(){
    const { styles } = TopInidcator;
    const containerStyle = {
      height: this.height,
      opacity: this.opacity,
      transform: [
        { scale: this.scale },
        { translateY: this.translateY, }
      ],
    };
    
    return(
      <Animated.View style={[this.props.style, containerStyle]}>
        <View style={styles.container} onLayout={this._handleOnLayout}>
          {this._renderContainer()}
        </View>
      </Animated.View>
    );
  };
};

class Stepper extends React.PureComponent {
  static propTypes = {
    value     : PropTypes.number,
    valueMin  : PropTypes.number,
    valueMax  : PropTypes.number,
    valueSteps: PropTypes.number,
    shouldDistributeEqually: PropTypes.bool,
    onChangeValue: PropTypes.func,
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
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: PURPLE[700],
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
      paddingVertical: 5,
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    textinputLabel: {
      marginLeft: 5,
      fontSize: 19,
      textAlign: 'center',
      textAlignVertical: 'center',
      fontWeight: '400',
      color: PURPLE[900],
    },
    textinput: {
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: 19.25,
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
    const { MODES } = Stepper;

    this.state = {
      mode: MODES.NORMAL,
      value: props.value,
    };
  };

  getValues(){
    const { value, shouldDistributeEqually } = this.state;
    return({ value, shouldDistributeEqually });
  };

  _handleOnChangeText = (text) => {
    const value = parseInt(isEmpty(text)? 0 : text);
    this.setState({value});
  };

  _handleOnPressTextInputContainer = () => {
    this.textinput.focus();
  };

  _handleOnBlur = () => {
    const { MODES } = Stepper;
    const { valueMin, valueMax, onChangeValue } = this.props;
    const { value } = this.state;

    if(value < valueMin){
      onChangeValue && onChangeValue(valueMin);
      this.textinputContainer.shake(500);
      this.setState({
        value: valueMin,
        mode : MODES.MIN,
      });

    } else if(value > valueMax){
      onChangeValue && onChangeValue(valueMax);
      this.textinputContainer.shake(500);
      this.setState({
        value: valueMax,
        mode : MODES.MAX,
      });

    } else {
      onChangeValue && onChangeValue(value);
      this.setState({mode: MODES.NORMAL});
    };
  };

  _handleOnPressStepperLeft = () => {
    const { MODES } = Stepper;
    const { valueMin, valueSteps, onChangeValue } = this.props;
    const { value } = this.state;

    const nextValue = (value - valueSteps);
    if( nextValue >= valueMin){
      onChangeValue && onChangeValue(nextValue);
      this.textinputContainer.pulse(300);
      this.setState({
        value: nextValue,
        mode : MODES.NORMAL,
      });

    } else if(nextValue < valueMin ){
      onChangeValue && onChangeValue(valueMin);
      this.textinputContainer.shake(500);
      this.setState({
        value: valueMin,
        mode : MODES.MIN,
      });
    };
  };

  _handleOnPressStepperRight = () => {
    const { MODES } = Stepper;
    const { valueMax, valueSteps, onChangeValue } = this.props;
    const { value } = this.state;
    
    const nextValue = (value + valueSteps);
    if( nextValue <= valueMax){
      onChangeValue && onChangeValue(nextValue);
      this.textinputContainer.pulse(300);
      this.setState({
        value: nextValue,
        mode : MODES.NORMAL,
      });

    } else if(nextValue > valueMax){
      onChangeValue && onChangeValue(valueMax);
      this.textinputContainer.shake(500);
      this.setState({
        value: valueMax,
        mode : MODES.MAX,
      });
    };
  };

  _renderTextInput(){
    const { styles } = Stepper;
    const { valueMax } = this.props;

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
            value={`${this.state.value}`}
            selectTextOnFocus={false}
            contextMenuHidden={true}
          />
          <Text style={styles.textinputLabel}>
            {`of ${valueMax} items`}
          </Text>
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  _renderStepper(){
    const { styles, MODES } = Stepper;
    const { mode } = this.state;
    
    const leftStepperStyle = {
      ...(mode === MODES.MIN
        ? {backgroundColor: PURPLE[300]} 
        : {backgroundColor: PURPLE[500]} 
      ),
    };
    const rightStepperStyle = {
      ...(mode === MODES.MAX
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
    return(
      <View style={styles.container}>
        <Text style={styles.title}>{'Number of Items'}</Text>
        <Text style={styles.subtitle}>{'Number of questions to add.'}</Text>
        {this._renderStepper()}
      </View>
    );
  };
};

class QuizItem extends React.PureComponent {
  static propTypes = {
    subjectData            : PropTypes.object,  
    onPressDelete          : PropTypes.func  ,
    maxItems               : PropTypes.number,
    shouldDistributeEqually: PropTypes.bool  ,
    onChangeValueStepper   : PropTypes.func  ,
  };

  static styles = StyleSheet.create({
    card: {
      //animated styles
      opacity: 1,
      transform: [
        { scaleX : 1      }, 
        { scaleY : 1      },
        { rotateX: '0deg' }
      ],
      //layout styles
      marginBottom: 12, 
      marginTop: 5, 
      overflow: 'visible', 
      marginHorizontal: 12, 
      paddingHorizontal: 15, 
      paddingVertical: 10, 
      borderRadius: 10,
      backgroundColor: 'white', 
      elevation: 7,
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
      marginTop: 5,
      backgroundColor: RED[800],
    },
    buttonContainer: {
      padding: 10,
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
      width : null,
      height: null,
    };
  };

  _handleOnChangeValueStepper = (value) => {
    const { onChangeValueStepper, subjectData } = this.props;
    onChangeValueStepper && onChangeValueStepper(value, subjectData);
  };

  _handleOnPressDeleteButton = async () => {
    const { onPressDelete } = this.props;

    const exitStyle = {
      opacity: 0, 
      height: 0,
      marginTop: 0, 
      marginBottom: 0, 
      paddingVertical: 0,
      transform: [
        { scaleX : 0.75    },
        { scaleY : 0.50    },
        { rotateX: '-45deg'},
      ]
    };

    await this._rootContainer.transitionTo(exitStyle, 300, 'ease-in-out');
    onPressDelete && onPressDelete();
  };

  _handleOnLayout = (event) => {
    const {x, y, width, height} = event.nativeEvent.layout;
    this.setState({width, height});
  };

  _renderDescription(){
    const { styles } = QuizItem;
    const { subjectData } = this.props;

    const { subjectname, description, questions } = SubjectItem.wrap(subjectData);
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
          numberOfLines={3}
          ellipsizeMode={'tail'}
        >
          {`${questionCount} questions`}
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

  _renderStepper(){
    const { subjectData, shouldDistributeEqually } = this.props;
    if(shouldDistributeEqually) return null;

    const { questions, itemsPerSubject, allocatedItems } = SubjectItem.wrap(subjectData);
    const valueMax = (questions || []).length;
    console.log(itemsPerSubject)

    return(
      <Stepper
        valueMin={0}
        value={allocatedItems}
        valueSteps={5}
        onChangeValue={this._handleOnChangeValueStepper}
        {...{valueMax}}
      />
    );
  };

  render(){
    const { styles } = QuizItem;
    const { width, height } = this.state;

    return(
      <Animatable.View
        style={[{width, height}, STYLES.mediumShadow,  styles.card]}
        easing={'ease-in-out'}
        ref={r => this._rootContainer = r}
        onLayout={this._handleOnLayout}
        useNativeDriver={false}
      >
        {this._renderDescription()}
        <Divider style={styles.divider}/>
        {this._renderStepper()}
        {this._renderDeleteButton()}
      </Animatable.View>
    );
  };
};

class CreateCustomQuizList extends React.PureComponent {
  static propTypes = {
    quizItems: PropTypes.array ,
    maxItems : PropTypes.number,
    shouldDistributeEqually: PropTypes.bool,
    onChangeValueStepper   : PropTypes.func,
  };

  static styles = StyleSheet.create({
    indicatorText: {
      fontSize: 26,
      fontWeight: '400',
      marginTop: 15,
      marginBottom: 5,
      marginLeft: 12,
    },
  });

  constructor(props){
    super(props);
  };

  _handleOnPressDelete = () => {
  };
  
  _keyExtractor(item, index){
    return `${item.indexid}-${item.subjectname}`;
  };

  _renderItem = ({item, index}) => {
    const { maxItems, shouldDistributeEqually, onChangeValueStepper } = this.props;
    return(
      <AnimatedListItem
        duration={500}
        last={5}
        {...{index}}
      >
        <QuizItem 
          subjectData={item} 
          onPressDelete={this._handleOnPressDelete}
          {...{maxItems, shouldDistributeEqually, onChangeValueStepper}}
        />
      </AnimatedListItem>
    );
  };

  _renderHeader = () => {
    const { styles } = CreateCustomQuizList;

    const { quizItems } = this.props;
    if(quizItems.length == 0) return null;

    const animation = Platform.select({
      ios: 'fadeInUp', 
      android: 'fadeInRight'
    });

    return(
      <Animatable.Text
        style={styles.indicatorText}
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        {`${quizItems.length} ${plural('Subject', quizItems.length)}`}
      </Animatable.Text>
    );
  };

  _renderFooter(){
    return(
      <IconFooter
        animateIn={false}
        hide={false}
      />
    );
  };

  render(){
    const {quizItems, maxItems, shouldDistributeEqually, ...otherProps} = this.props;
    //re-render flatlist when these items changes
    const extraData = { maxItems, shouldDistributeEqually };

    return(
      <FlatList
        data={quizItems}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
        ListHeaderComponent={this._renderHeader}
        ListFooterComponent={this._renderFooter}
        {...{extraData, ...otherProps}}
      />
    );
  };
};

let _onPressNext;
const headerRight = <NextButton onPress={() => _onPressNext && _onPressNext()}/>

export class CreateQuizScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    //set header title
    let title = (global.usePlaceholder
      ? 'Nibh Mattis'
      : 'Custom Quiz'
    );
    
    if(state.params) title = state.params.title;

    return ({
      title, 
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
    }
  });

  static computeDistributions({maxItems, subjects}){
    const items = SubjectItem.wrapArray(subjects);

    const itemsPerSubject = Math.round(maxItems / subjects.length);
    let remainingItems = maxItems;

    return items.map((subject, index) => {
      const isLast = (index == subjects.length - 1);
      const allocatedItems = isLast? remainingItems : itemsPerSubject;
      //update remaining items
      remainingItems -= itemsPerSubject;

      return {
        ...subject,
        itemsPerSubject,
        allocatedItems,
      };
    });
  };

  constructor(props){
    super(props);

    this.state = {
      mountList: true,
      //values for quizdetails modal
      title: '',
      description: '',
      maxItems: 50, 
      shouldDistributeEqually: true,
      //values for createquiz modal
      selected: [],
      selectedModules: [],
      //used for top inidcator
      remainingItems: 0,
    };

    //get ref from screenprops
    const { getRefCreateQuizModal, getRefQuizDetailsModal, getRefQuizFinishModal } = props.screenProps;
    
    //get ref of modal from homescreen wrapper
    this.quizModal    = getRefCreateQuizModal ();
    this.finishModal  = getRefQuizFinishModal ();
    this.detailsModal = getRefQuizDetailsModal();
    
    _onPressNext = this._handleOnPressNext;
  };

  componentDidFocus = () => {
    const { setDrawerSwipe } = this.props.screenProps;
    setDrawerSwipe(false);
  };

  _onPressAlertOK = () => {
    const {selected, title, description} = this.state;
    const isValid = (isEmpty(title) || isEmpty(description));

    if(selected <= 0){
      this._headerAddCard.animatePulse();

    } else if(isValid){
      this._headerTitleCard.animatePulse();      
    };
  };

  _handleOnPressNext = () => {
    const {selected, selectedModules, title, description} = this.state;

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
        selected, selectedModules, title, description
      });
    };
  };

  _handleOnPressEditDetails = () => {
    const {title, description, maxItems, shouldDistributeEqually} = this.state;

    if(this.detailsModal != null){
      //assign callback to modal
      this.detailsModal.onPressSaveChanges = this._handleModalOnPressSaveChanges;

      //show modal
      this.detailsModal.openModal({
        value: maxItems,
        //pass down other state
        title, description, shouldDistributeEqually
      });
    };
  };

  _handleOnPressAddSubject = () => {
    if(this.quizModal != null){
      //assign callback to modal
      this.quizModal.onPressAddSubject = this._handleModalOnPressAddSubject;

      const {selected, selectedModules} = this.state;
      //show modal
      this.quizModal.openModal({selected, selectedModules});
    };
  };

  _handleOnChangeValueStepper = (value, subjectData) => {
    alert(value);
  };

  //callback from createquiz modal
  _handleModalOnPressAddSubject = async ({selected, selectedModules}) => {
    const { maxItems } = this.state;
    const prevCount = this.state.selected.length;
    const nextCount = selected.length;

    const selectedWithAllocation = CreateQuizScreen.computeDistributions({maxItems, subjects: selected});

    if(prevCount > nextCount){
      await this.listContainer.fadeOut(300);
      await setStateAsync(this, {
        selected: selectedWithAllocation, 
        selectedModules
      });
      await this.listContainer.fadeInUp(300);

    } else {
      this.setState({
        selected: selectedWithAllocation, 
        selectedModules
      });
    };
  };

  //callback from quizdetails modal
  _handleModalOnPressSaveChanges = async ({title, description, value, shouldDistributeEqually}) => {
    const prevState = this.state;

    //check shouldDistributeEqually has changed
    const didChange = shouldDistributeEqually != prevState.shouldDistributeEqually;

    if(didChange){
      //hide and umount list
      await this.listContainer.fadeOut(300);
      await setStateAsync(this, {
        mountList: false,
        maxItems: value,
        //pass down params to state
        title, description, shouldDistributeEqually
      });
      //show and mount list
      await Promise.all([
        setStateAsync(this, {mountList: true}),
        this.listContainer.fadeIn(300),      
      ]);
      await this.topInidcator.expand(!shouldDistributeEqually);

    } else {
      this.setState({
        maxItems: value,
        //pass down params to state
        title, description, shouldDistributeEqually
      });
    };
  };

  _renderHeader = () => {
    const {title, description} = this.state;
    
    return(
      <View style={{marginTop: 12}}>
        <TitleDescriptionCard
          ref={r => this._headerTitleCard = r}
          onPressEditDetails={this._handleOnPressEditDetails}
          {...{title, description}} 
        />
        <AddSubjectsCard
          ref={r => this._headerAddCard = r}
          onPressAddSubject={this._handleOnPressAddSubject}
        />
      </View>
    );
  };

  render(){
    const { styles } = CreateQuizScreen;
    const { mountList, maxItems, shouldDistributeEqually } = this.state;

    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <ScrollView
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
          stickyHeaderIndices={[0]}
        >
          <TopInidcator
            ref={r => this.topInidcator = r}
            initiallyCollapsed={true}
            valueMax={maxItems}
            value={10}
          />
          {this._renderHeader()}
          <Animatable.View
            ref={r => this.listContainer = r}
            useNativeDriver={true}
          >
            {mountList && <CreateCustomQuizList 
              quizItems={this.state.selected}
              onChangeValueStepper={this._handleOnChangeValueStepper}
              {...{maxItems, shouldDistributeEqually}}
            />}
          </Animatable.View>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};