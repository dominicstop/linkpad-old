import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated, TextInput, TouchableWithoutFeedback, Keyboard, Alert, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../Constants';
import { PURPLE } from '../Colors';

import { setStateAsync, isEmpty } from '../functions/Utils';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconText, AnimateInView } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';

import { LinearGradient, DangerZone } from 'expo';
import { Icon } from 'react-native-elements';

import * as _Reanimated from 'react-native-reanimated';
import * as Animatable from 'react-native-animatable';

const { Lottie } = DangerZone;
const { Easing } = _Reanimated;
const Reanimated = _Reanimated.default;

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
};

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
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
};

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
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderColor: PURPLE[300],
      borderWidth: 1,
      borderRadius: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
};

class ModalContents extends React.PureComponent {
  static PropTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    onPressSaveChanges: PropTypes.func,
  };

  static styles = StyleSheet.create({
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
      marginLeft: 7, 
      marginRight: 25, 
      marginBottom: 10,
    },
    subtitle: {
      fontWeight: '200',
      fontSize: 16,
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
      borderRadius: 12,
      padding: 15,
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

  _handleOnPressWrapper(){
    Keyboard.dismiss();
  };

  _handleOnPress = async () => {
    //get text from forms
    const title = this.inputTitle.getText();
    const description = this.inputDescription.getText();

    //check if the text is empty
    const isTitleEmpty       = isEmpty(title);
    const isDescriptionEmpty = isEmpty(description);

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

    } else {
      const { onPressSaveChanges } = this.props;
      onPressSaveChanges && onPressSaveChanges({title, description});
    };
  };

  _renderTitle(){
    const { styles } = ModalContents;

    const text = (global.usePlaceholder
      ? 'Tristique Dolor Aenean'
      : 'Custom Quiz Details'
    );

    const subtitle = (global.usePlaceholder
      ? 'Tortor Inceptos Cursus Etiam Vestibulum.'
      : 'Give your quiz a title and description.'
    );

    return(
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
    );
  };

  _renderForms(){
    const { styles } = ModalContents;
    const {title, description} = this.props;

    return(
      <View style={styles.body}>
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
      </View>
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
        easing={'easeIn'}
        useNativeDriver={true}
      >
        <TouchableOpacity onPress={this._handleOnPress}>
          <LinearGradient
            style={[styles.button, STYLES.mediumShadow]}
            colors={[PURPLE[800], PURPLE[500]]}
            start={[0, 1]} end={[1, 0]}
          >
            <Icon
              name={'ios-checkmark-circle-outline'}
              type={'ionicon'}
              color={'white'}
              size={24}
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
      <TouchableWithoutFeedback 
        style={{flex: 1}}
        onPress={this._handleOnPressWrapper}
        accessible={false}
      >
        <View style={{flex: 1}}>
          <View style={{flex: 1}}>
            {this._renderTitle()}
            {this._renderForms()}
          </View>
          {this._renderFinishButton()}
        </View>
      </TouchableWithoutFeedback>
    );
  };
};

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
    }
  });

  constructor(props){
    super(props);

    this.state = {
      mountContent: false,
      title: '',
      description: '',
    };

    this._deltaY = null;
    //called when save changes is pressed
    this.onPressSaveChanges = null;
  };

  componentDidMount(){
    this._deltaY = this._modal._deltaY
  };

  openModal = async ({title, description}) => {
    this.setState({mountContent: true, title, description});
    this._modal.showModal();
  };

  _handleOnModalShow = () => {
  };

  _handleOnModalHide = () => {
    this.setState({mountContent: false});
  };

  _handleOnPressSaveChanges = async ({title, description}) => {
    const overlayOpacity = Platform.select({
      ios: 0.4, android: 0.7,
    });

    if(this.onPressSaveChanges != null){
      //wait to finish
      await Promise.all([
        //show overlay
        this.overlay.transitionTo({opacity: overlayOpacity}, 500),
        //show check animation
        this.animatedCheck.start(),
      ]);

      await this._modal.hideModal();
      this.onPressSaveChanges({title, description});
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
    const {title, description} = this.state;

    const style = {
      flex: 1,
      opacity: this._deltaY.interpolate({
        inputRange: [0, Screen.height - MODAL_DISTANCE_FROM_TOP],
        outputRange: [1, 0.25],
        extrapolateRight: 'clamp',
      }),
    };

    return(
      <Reanimated.View {...{style}}>
        <ModalContents 
          onPressSaveChanges={this._handleOnPressSaveChanges}
          {...{title, description}}
        />
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
            <ModalTopIndicator/>
            {mountContent && this._renderContent()}
          </ModalBackground>
          {this._renderOverlay()}
        </Fragment>
      </SwipableModal>
    );
  };
};