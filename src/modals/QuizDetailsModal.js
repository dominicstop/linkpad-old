import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated, TextInput, TouchableWithoutFeedback, Keyboard, Alert, Dimensions, ScrollView, Switch } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../Constants';
import { PURPLE } from '../Colors';

import { setStateAsync, isEmpty , hexToRgbA, spreadIfTrue} from '../functions/Utils';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconText, AnimateInView } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';

import Lottie from 'lottie-react-native'
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Divider } from 'react-native-elements';

import * as _Reanimated from 'react-native-reanimated';
import * as Animatable from 'react-native-animatable';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import {CustomQuizStore} from '../functions/CustomQuizStore';
import { isIphoneX, ifIphoneX } from 'react-native-iphone-x-helper';

const { Easing } = _Reanimated;
const Reanimated = _Reanimated.default;
const { interpolate, defined, cond, eq } = Reanimated;

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

class CheckAnimation extends React.PureComponent {
  constructor(props){
    super(props);

    this.state = {
      mountAnimation: false,
    };

    this._source = require('../animations/checked_done_2.json');
    this._value = new Animated.Value(0.5);
    this._config = { 
      toValue: 1,
      duration: 500,
      useNativeDriver: true 
    };

    this._animated = Animated.timing(this._value, this._config);
  };

  //start animation
  start = () => {
    return new Promise(async resolve => {
      await setStateAsync(this, {mountAnimation: true});
      this._animated.start(() => resolve());
    });
  };

  render(){
    //dont mount until animation starts
    if(!this.state.mountAnimation) return null;

    return(
      <Lottie
        ref={r => this.animation = r}
        progress={this._value}
        source={this._source}
        loop={false}
        autoplay={false}
      />
    );
  };
}

class FormTitle extends React.PureComponent {
  static styles = StyleSheet.create({
    iconInputWrapper: {
      marginTop: 5,
      marginHorizontal: 10,
    },
    iconInputContainer: {
      flexDirection: 'row', 
      margin: 12,
    },
    borderInactive: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      borderColor: PURPLE[300],
      borderWidth: 1,
      borderRadius: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        },
        android: {
          backgroundColor: 'rgba(255, 255, 255, 0.75)',          
        },
      })
    },
    borderActive: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      borderColor: PURPLE[600],
      borderWidth: 2,
      borderRadius: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
        android: {
          backgroundColor: 'rgb(255, 255, 255)',          
        },
      })
    },
    input: {
      flex: 1,
      color: PURPLE[1100],
      backgroundColor: 'transparent',
      fontSize: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '500',
      marginHorizontal: 12,
      marginTop: 15,
      color: PURPLE[900],
      opacity: 0.85,
    }
  });

  constructor(props){
    super(props);
    this.state = {
      text: props.title,
    };
  };

  getText = () => {
    const { text } = this.state;
    return text;
  };

  _handleOnFocus = () => {
    this.activeBorder.transitionTo({opacity: 1}, 500);
    this.icon.transitionTo({opacity: 1}, 500);
    this.label.transitionTo({opacity: 1, transform: [{scale: 1.1}, {translateX: 15}]},
      500, 'ease-in-out'
    );
  };

  _handleOnBlur = () => {
    this.activeBorder.transitionTo({opacity: 0}, 500);
    this.icon.transitionTo({opacity: 0.3}, 500);
    this.label.transitionTo(
      {opacity: 0.85, transform: [{scale: 1}, {translateX: 0}]},
      500, 'ease-in-out'
    );
  };

  _handleOnChangeText = (text) => {
    this.setState({text});
  };

  _renderLabel(){
    const { styles } = FormTitle;

    const title = (global.usePlaceholder
      ? 'Condimentum Quam'
      : 'Quiz Title'
    );

    return(
      <Animatable.Text 
        style={styles.title}
        ref={r => this.label = r}
        useNativeDriver={true}
      >
        {title}
      </Animatable.Text>
    );
  };

  _renderBorder(){
    const { styles } = FormTitle;

    return(
      <Fragment>
        <View style={styles.borderInactive}/>
        <Animatable.View 
          style={[styles.borderActive, {opacity: 0}]}
          ref={r => this.activeBorder = r}
          useNativeDriver={true}
        />
      </Fragment>
    );
  };

  _renderIcon(){
    const { styles } = FormTitle;

    return(
      <Animatable.View 
        style={{marginRight: 10, opacity: 0.3}}
        ref={r => this.icon = r}
        useNativeDriver={true}
      >
        <Icon
          name={'feather'}
          type={'feather'}
          size={24}
          color={PURPLE[700]}
        />
      </Animatable.View>
    );
  };

  _renderInput(){
    const { styles } = FormTitle;

    const placeholder = (global.usePlaceholder
      ? 'Ipsum Condimentum Quam'
      : 'Custom Quiz Title'
    );

    return(
      <TextInput
        style={styles.input}
        underlineColorAndroid={'transparent'}
        onFocus={this._handleOnFocus}
        onBlur={this._handleOnBlur}
        onChangeText={this._handleOnChangeText}
        multiline={false}
        autoCorrect={false}
        maxLength={100}
        value={this.state.text}
        {...{placeholder}}
      />
    );
  };

  render(){
    const { styles } = FormTitle;
    
    return (
      <Fragment>
        {this._renderLabel()}
        <View style={styles.iconInputWrapper}>
          {this._renderBorder()}
          <View style={styles.iconInputContainer}>
            {this._renderIcon()}
            {this._renderInput()}
          </View>
        </View>
      </Fragment>
    );
  };
}

class FormDescription extends React.PureComponent {
  static styles = StyleSheet.create({
    iconInputWrapper: {
      marginTop: 5,
      marginHorizontal: 10,
    },
    iconInputContainer: {
      flexDirection: 'row', 
      margin: 12,
    },
    borderInactive: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      borderColor: PURPLE[300],
      borderWidth: 1,
      borderRadius: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        },
        android: {
          backgroundColor: 'rgba(255, 255, 255, 0.75)',          
        },
      })
    },
    borderActive: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      borderColor: PURPLE[600],
      borderWidth: 2,
      borderRadius: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
        android: {
          backgroundColor: 'rgb(255, 255, 255)',          
        },
      })
    },
    input: {
      flex: 1,
      color: PURPLE[1100],
      backgroundColor: 'transparent',
      fontSize: 20,
      ...Platform.select({
        ios: {
          maxHeight: 100,
        }
      })
    },
    title: {
      fontSize: 22,
      fontWeight: '500',
      marginHorizontal: 12,
      marginTop: 15,
      color: PURPLE[900],
      opacity: 0.85,
    }
  });

  constructor(props){
    super(props);
    this.state = {
      text: props.description,
    };
  };

  getText = () => {
    const { text } = this.state;
    return text;
  };

  _handleOnFocus = () => {
    this.activeBorder.transitionTo({opacity: 1}, 500);
    this.icon.transitionTo({opacity: 1}, 500);
    this.label.transitionTo(
      {opacity: 1, transform: [{scale: 1.1}, {translateX: 15}]}, 
      500, 'ease-in-out'
    );
  };

  _handleOnBlur = () => {
    this.activeBorder.transitionTo({opacity: 0}, 500);
    this.icon.transitionTo({opacity: 0.3}, 500);
    this.label.transitionTo(
      {opacity: 0.85, transform: [{scale: 1}, {translateX: 0}]}, 
      500, 'ease-in-out'
    );
  };

  _handleOnChangeText = (text) => {
    this.setState({text});
  };

  _renderLabel(){
    const { styles } = FormTitle;

    const description = (global.usePlaceholder
      ? 'Ornaredi Ipsum'
      : 'Quiz Description'
    );

    return(
      <Animatable.Text 
        style={styles.title}
        ref={r => this.label = r}
        useNativeDriver={true}
      >
        {description}
      </Animatable.Text>
    );
  };

  _renderBorder(){
    const { styles } = FormTitle;

    return(
      <Fragment>
        <View style={styles.borderInactive}/>
        <Animatable.View 
          style={[styles.borderActive, {opacity: 0}]}
          ref={r => this.activeBorder = r}
          useNativeDriver={true}
        />
      </Fragment>
    );
  };

  _renderIcon(){
    const { styles } = FormTitle;

    return(
      <Animatable.View 
        style={{marginRight: 10, opacity: 0.3}}
        ref={r => this.icon = r}
        useNativeDriver={true}
      >
        <Icon
          name={'align-center'}
          type={'feather'}
          size={26}
          color={PURPLE[700]}
        />
      </Animatable.View>
    );
  };

  _renderInput(){
    const { styles } = FormTitle;

    const placeholder = (global.usePlaceholder
      ? 'Justo Ornaredi Ipsum'
      : 'Custom Quiz Description'
    );

    const platformSpecificProps = Platform.select({
      ios: {
        numberOfLines: 3,
        multiline: true
      },
      android: {
        multiline: false,
      }
    });

    return(
      <TextInput
        style={[styles.input]}
        underlineColorAndroid={'transparent'}
        onFocus={this._handleOnFocus}
        onBlur={this._handleOnBlur}
        onChangeText={this._handleOnChangeText}
        autoCorrect={false}
        maxLength={100}
        value={this.state.text}
        {...{placeholder, ...platformSpecificProps}}
      />
    );
  };

  render(){
    const { styles } = FormTitle;
    
    return (
      <Fragment>
        {this._renderLabel()}
        <View style={styles.iconInputWrapper}>
          {this._renderBorder()}
          <View style={styles.iconInputContainer}>
            {this._renderIcon()}
            {this._renderInput()}
          </View>
        </View>
      </Fragment>
    );
  };
}

class Stepper extends React.PureComponent {
  static propTypes = {
    value     : PropTypes.number,
    valueMin  : PropTypes.number,
    valueMax  : PropTypes.number,
    valueSteps: PropTypes.number,
    shouldDistributeEqually: PropTypes.bool,
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
      marginHorizontal: 12,
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
    const { MODES } = Stepper;

    this.state = {
      mode: MODES.NORMAL,
      value: props.value,
      shouldDistributeEqually: props.shouldDistributeEqually,
    };
  };

  getValues(){
    const { value, shouldDistributeEqually } = this.state;
    return({ value, shouldDistributeEqually });
  };

  _handleOnValueChangeSwitch = (value) => {
    this.setState({shouldDistributeEqually: value}); 
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
    const { valueMin, valueMax } = this.props;
    const { value } = this.state;

    if(value < valueMin){
      this.setState({value: valueMin});
      this.setState({
        value: valueMax,
        mode : MODES.MIN,
      });

    } else if(value > valueMax){
      this.setState({
        value: valueMax,
        mode : MODES.MAX,
      });

    } else {
      this.setState({mode : MODES.NORMAL});
    };
  };

  _handleOnPressStepperLeft = () => {
    const { MODES } = Stepper;
    const { valueMin, valueSteps } = this.props;
    const { value } = this.state;

    const nextValue = (value - valueSteps);
    if( nextValue >= valueMin){
      this.textinputContainer.pulse(300);
      this.setState({
        value: nextValue,
        mode : MODES.NORMAL,
      });

    } else if(nextValue < valueMin ){
      this.textinputContainer.shake(500);
      this.setState({
        value: valueMin,
        mode : MODES.MIN,
      });
    };
  };

  _handleOnPressStepperRight = () => {
    const { MODES } = Stepper;
    const { valueMax, valueSteps } = this.props;
    const { value } = this.state;
    
    const nextValue = (value + valueSteps);
    if( nextValue <= valueMax){
      this.setState({
        value: nextValue,
        mode : MODES.NORMAL,
      });
      this.textinputContainer.pulse(300);

    } else if(nextValue > valueMax){
      this.textinputContainer.shake(500);
      this.setState({
        value: valueMax,
        mode : MODES.MAX,
      });
    };
  };

  _renderSwitch(){
    const { styles } = Stepper;
    return(
      <View style={styles.switchContainer}>
        <View style={styles.switchLabelContainer}>
          <Text style={styles.switchLabelTitle}>{'Equal Items'}</Text>
          <Text style={styles.switchLabelSubtitle}>{'Distribute items equally: same number of questions per subject.'}</Text>
        </View>
        <Switch
          value={this.state.shouldDistributeEqually}
          trackColor={{true: PURPLE.A700}}
          onValueChange={this._handleOnValueChangeSwitch}
        />
      </View>
    );
  };

  _renderTextInput(){
    const { styles } = Stepper;
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
          <Text style={styles.textinputLabel}>Items</Text>
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
        <Text style={styles.title}>{'Question Limit'}</Text>
        <Text style={styles.subtitle}>{'Set a limit for the max number of questions that you want in your custom quiz.'}</Text>
        {this._renderStepper()}
        {this._renderSwitch()}
      </View>
    );
  };
}

class ModalContents extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    value: PropTypes.number,
    shouldDistributeEqually: PropTypes.bool,
    onPressSaveChanges: PropTypes.func,
  };

  static styles = StyleSheet.create({
    divider: {
      height: 1,
      margin: 17,
      backgroundColor: PURPLE[900],
      opacity: 0.4,
    },
    body: {
      borderTopColor: 'rgb(200, 200, 200)', 
      borderTopWidth: 1
    },
    buttonContainer: {
      padding: 12,
      borderTopColor: 'rgba(0, 0, 0, 0.25)',
      borderBottomColor: 'rgba(0, 0, 0, 0.25)',
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: PURPLE[700], 
      borderRadius: 15,
      padding: 15,
      ...ifIphoneX({
        marginBottom: 10,
        borderRadius: 17,
      }),
    },
    buttonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: 'white',
      textAlign: 'left',
      textAlignVertical: 'center',
      marginLeft: 13,
    },
  });

  _handleOnPress = async () => {
    //get text from forms
    const title = this.inputTitle.getText();
    const description = this.inputDescription.getText();
    //get stepper values
    const {value, shouldDistributeEqually} = this.stepper.getValues();

    //check if the text is empty
    const isTitleEmpty       = isEmpty(title);
    const isDescriptionEmpty = isEmpty(description);

    //check if title already exists
    const quizes   = CustomQuizStore.get() || [];
    const titles   = quizes.map(quiz => quiz.title);
    const hasMatch = titles.includes(title);

    if(isTitleEmpty || isDescriptionEmpty){
      await Promise.all([
        //animate input when empty
        isTitleEmpty       && this.formTitleContainer      .shake(500),
        isDescriptionEmpty && this.formDescriptionContainer.shake(500),
      ]);
      Alert.alert(
        'Invalid Title/Description',
        "Make sure that all fields have been filled.",
      );
    } else if(hasMatch) {
      await this.formTitleContainer.shake(500);
      Alert.alert(
        'Title Already Exists',
        "Please thimk of another title for your quiz.",
      );
    } else {
      Keyboard.dismiss();
      const { onPressSaveChanges } = this.props;
      onPressSaveChanges && onPressSaveChanges({title, description, value, shouldDistributeEqually});
    };
  };

  _renderForms(){
    const { styles } = ModalContents;
    const { title, description, value, shouldDistributeEqually } = this.props;

    return(
      <AnimateInView
        duration={300}
        difference={100}
      >
        <Animatable.View
          ref={r => this.formTitleContainer = r}
          useNativeDriver={true}
        >
          <FormTitle 
            ref={r => this.inputTitle = r}
            {...{title}}
          />
        </Animatable.View>
        <Animatable.View
          ref={r => this.formDescriptionContainer = r}
          useNativeDriver={true}
        >
          <FormDescription 
            ref={r => this.inputDescription = r}
            {...{description}}
          />
        </Animatable.View>
        <Divider style={styles.divider}/>
        <Stepper
          ref={r => this.stepper = r}
          {...{value, shouldDistributeEqually}}
        />
      </AnimateInView>
    );
  };

  _renderFinishButton(){
    const { styles } = ModalContents;

    const buttonText = (global.usePlaceholder
      ? 'Condimentum Amet'
      : 'Save Changes'
    );

    return(
      <Animatable.View
        style={styles.buttonContainer}
        animation={'fadeInUp'}
        duration={300}
        delay={300}
        useNativeDriver={true}
      >
        <TouchableOpacity onPress={this._handleOnPress}>
          <LinearGradient
            style={[styles.button, STYLES.mediumShadow]}
            colors={[PURPLE[800], PURPLE[500]]}
            start={[0, 1]} end={[1, 0]}
          >
            <Icon
              name={'ios-checkmark-circle'}
              type={'ionicon'}
              color={'rgba(255,255,255,0.95)'}
              size={26}
            />
            <Text style={styles.buttonText}>{buttonText}</Text>
            <Icon
              name={'chevron-right'}
              type={'feather'}
              color={'white'}
              size={30}
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  render(){
    return(
      <View style={{flex: 1}}>
        <ScrollView
          keyboardShouldPersistTaps={'never'}
          keyboardDismissMode={'on-drag'}
        >
          {this._renderForms()}
          <View style={{marginVertical: 50}}/>
        </ScrollView>
        {this._renderFinishButton()}
        <KeyboardSpacer/>
      </View>
    );
  };
}

export class QuizDetailsModal extends React.PureComponent {
  static styles = StyleSheet.create({
    overlayContainer: {
      flex: 1,
      position: 'absolute',
      height: '100%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlay: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      opacity: 0,
      backgroundColor: 'white',
    },
    checkContainer: {
      width: '50%', 
      height: '50%', 
      marginBottom: 325
    },
    //header styles
    headerContainer: {
      backgroundColor: 'rgba(255,255,255,0.2)'
    },
    title: {
      color: '#160656',
      ...Platform.select({
        ios: {
          fontSize: 24, 
          fontWeight: '800'
        },
        android: {
          fontSize: 26, 
          fontWeight: '900'
        }
      })
    },
    titleContainer: {
      paddingLeft: 7, 
      paddingRight: 25, 
      paddingBottom: 10,
      borderBottomColor: 'rgba(0, 0, 0, 0.25)',
      borderBottomWidth: 1,
    },
    subtitle: {
      fontWeight: '200',
      fontSize: 16,
    },
  });

  constructor(props){
    super(props);

    this.state = {
      mountContent: false,
      title: '',
      description: '',
      value: 50, 
      shouldDistributeEqually: true,
    };

    this._deltaY = null;
    //called when save changes is pressed
    this.onPressSaveChanges = null;
  };

  componentDidMount(){
    this._deltaY = this._modal._deltaY;
  };

  openModal = async ({title, description, value, shouldDistributeEqually}) => {
    this.setState({mountContent: true, title, description, value, shouldDistributeEqually});
    this._modal.showModal();
  };

  _handleOnModalShow = () => {
  };

  _handleOnModalHide = () => {
    this.setState({mountContent: false});
  };

  _handleOnPressSaveChanges = async ({title, description, value, shouldDistributeEqually}) => {
    const callback = this.onPressSaveChanges;
    const overlayOpacity = Platform.select({
      ios: 0.4, android: 0.7,
    });

    if(callback != null){
      //wait to finish
      await Promise.all([
        //show overlay
        this.overlay.transitionTo({opacity: overlayOpacity}, 500),
        //show check animation
        this.animatedCheck.start(),
      ]);
      await this._modal.hideModal();
      callback && callback({title, description, value, shouldDistributeEqually});
    };
  };

  _renderOverlay(){
    const { styles } = QuizDetailsModal;
    return (
      <View 
        style={styles.overlayContainer}
        pointerEvents={'none'}
      >
        <Animatable.View 
          ref={r => this.overlay = r}
          style={styles.overlay}
          useNativeDriver={true}
        />
        <View style={styles.checkContainer}>
          <CheckAnimation ref={r => this.animatedCheck = r}/>
        </View>
      </View>
    );
  };

  _renderContent(){
    const { styles } = QuizDetailsModal;
    const {title, description, value, shouldDistributeEqually} = this.state;
    
    const expandedHeight = (Screen.height - MODAL_DISTANCE_FROM_TOP);
    const headerStyle = {
      opacity: interpolate(this._deltaY, {
        inputRange : [0, expandedHeight],
        outputRange: [1, 0.5],
        extrapolateRight: 'clamp',
      }),
      transform:[
        {
          translateY: interpolate(this._deltaY, {
            inputRange : [0, expandedHeight],
            outputRange: [1, 15],
            extrapolateRight: 'clamp',
          })
        }, {
          translateX: interpolate(this._deltaY, {
            inputRange : [0, expandedHeight],
            outputRange: [1, 30],
            extrapolateRight: 'clamp',
          })
        },
      ],
    };
    const contentStyle = {
      flex: 1,
      opacity: interpolate(this._deltaY, {
        inputRange : [0, expandedHeight],
        outputRange: [1, 0.25],
        extrapolateRight: 'clamp',
      }),
      transform:[
        {
          scale: interpolate(this._deltaY, {
            inputRange : [0, expandedHeight],
            outputRange: [1, 0.95],
            extrapolateRight: 'clamp',
          })
        }, {
          translateY: interpolate(this._deltaY, {
            inputRange : [0, expandedHeight],
            outputRange: [1, 25],
            extrapolateRight: 'clamp',
          })
        },
      ],
    };

    //header title and subtitle
    const text     = 'Custom Quiz Details';
    const subtitle = 'Give your quiz a title and description.';


    return(
      <Fragment>
        <View style={styles.headerContainer}>
          <ModalTopIndicator/>
          <Reanimated.View style={headerStyle}>
            <IconText
              containerStyle={styles.titleContainer}
              textStyle={styles.title}
              subtitleStyle={styles.subtitle}
              iconName={'notebook'}
              iconType={'simple-line-icon'}
              iconColor={'#512DA8'}
              iconSize={26}
              {...{text, subtitle}}
            />
          </Reanimated.View>
        </View>
        <Reanimated.View style={[contentStyle]}>
          <ModalContents 
            onPressSaveChanges={this._handleOnPressSaveChanges}
            {...{title, description, value, shouldDistributeEqually}}
          />
        </Reanimated.View>
      </Fragment>
    );

    return(
      <Reanimated.View {...{style}}>
        <View >
          
        </View>
        
      </Reanimated.View>
    );
  };

  render(){
    const { mountContent } = this.state;
    const paddingBottom = (
      MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP
    );

    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <Fragment>
          <ModalBackground style={{paddingBottom}}>
            {mountContent && this._renderContent()}
          </ModalBackground>
          {this._renderOverlay()}
        </Fragment>
      </SwipableModal>
    );
  };
}