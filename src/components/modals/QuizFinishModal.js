import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, SectionList, Animated, TextInput, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../../Constants';
import { PURPLE } from '../../Colors';

import { plural , setStateAsync, timeout, isEmpty } from '../../functions/Utils';
import { CreateCustomQuiz, CustomQuizStore } from '../../functions/CustomQuizStore';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../SwipableModal';
import { IconText, AnimateInView, Card } from '../../components/Views';
import { IconButton } from '../../components/Buttons';

import { BlurView, LinearGradient, DangerZone } from 'expo';
import { Icon, Divider } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import {  } from 'react-native-paper';

const { Lottie } = DangerZone;

class CheckAnimation extends React.PureComponent {
  constructor(props){
    super(props);

    this.state = {
      mountAnimation: false,
    };

    this._source = require('../../animations/checked_done_2.json');
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

class QuizCard extends React.PureComponent {
  static PropTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    selected: PropTypes.array,
  };

  static styles = StyleSheet.create({
    image: {
      width: 70, 
      height: 70,
      marginRight: 12,
      marginVertical: 12,
    },
    textLabel: {
      fontWeight: '600', 
      fontSize: 16,
      marginBottom: 3,
    },
    textLabelValue: {
      fontWeight: '200',
    }
  });

  constructor(props){
    super(props);
    this.imageCard = require('../../../assets/icons/notes-pencil.png');
  };

  _renderTitleDesc(){
    const { styles } = QuizCard;
    const { title, description } = this.props;
 
    return(
      <View style={{flex: 1}}>
        <Text style={styles.textLabel} numberOfLines={1}>
          {'Title: '}
          <Text style={styles.textLabelValue}>
            {title}
          </Text>
        </Text>
        <Text style={styles.textLabel} numberOfLines={4}>
          {'Description: '}
          <Text style={styles.textLabelValue}>
            {description}
          </Text>
        </Text>
      </View>
    );
  };

  _renderDetails(){
    const { styles } = QuizCard;

    const labelSubjects = (global.usePlaceholder
      ? 'Ultricies Nibh: '
      : 'Total Subjects: '
    );

    const labelQuestions = (global.usePlaceholder
      ? 'Quam Vehicula Amet: '
      : 'Question per Subject: '
    );

    return(
      <Fragment>
        <Text style={styles.textLabel} numberOfLines={1}>
          {labelSubjects}
          <Text style={styles.textLabelValue}>
            {'16 Subjects'}
          </Text>
        </Text>
        <Text style={styles.textLabel} numberOfLines={4}>
          {labelQuestions}
          <Text style={styles.textLabelValue}>
            {'12 Questions'}
          </Text>
        </Text>
      </Fragment>
    );
  };

  render(){
    const { styles } = QuizCard;

    return(
      <Card>
        <View style={{flexDirection: 'row', marginBottom: 5}}>
          <Animatable.Image
            source={this.imageCard}
            style={styles.image}
            animation={'pulse'}
            easing={'ease-in-out'}
            iterationCount={"infinite"}
            duration={7000}
            useNativeDriver={true}
          />
          {this._renderTitleDesc()}
        </View>
        <Divider style={{marginTop: 3, marginBottom: 10}}/>
        {this._renderDetails()}
      </Card>
    );
  };
};

class ModalContents extends React.PureComponent {
  static PropTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    selected: PropTypes.array,
    onPressCreateQuiz: PropTypes.func,
    onPressCancel: PropTypes.func,
  };

  static styles = StyleSheet.create({
    containerStyle: {
      marginLeft: 10, 
      marginRight: 25, 
      marginBottom: 10
    },
    titleContainer: {
      flexDirection: 'row',
      marginBottom: 3,
    },
    title: {
      color: '#160656',
      marginLeft: 7,
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
    subtitle: {
      fontWeight: '200', 
      fontSize: 16
    },
    body: {
      borderTopColor: 'rgb(200, 200, 200)',
      borderTopWidth: 1,
      paddingTop: 10,
    },
    buttonsWrapper: {
      padding: 15,
      borderTopColor: 'rgb(200, 200, 200)',
      borderBottomColor: 'rgb(200, 200, 200)',
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    buttonsContainer: {
      flexDirection: 'row',
    },
    buttonContainer: {
      flex: 1,
      paddingHorizontal: 10,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
    },
    buttonText: {
      flex: 0,
      color: 'white',
      fontSize: 17,
      textDecorationLine: 'underline'
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
  });

  constructor(props){
    super(props);
  };

  _handleOnPressCreateQuiz = () => {
    const { onPressCreateQuiz } = this.props;
    onPressCreateQuiz && onPressCreateQuiz();
  };

  _handleOnPressCancel = () => {
    const { onPressCancel } = this.props;
    onPressCancel && onPressCancel();
  };

  _renderTitle(){
    const { styles } = ModalContents;

    const title = (global.usePlaceholder
      ? 'Mollis Egestas Matt'
      : "Custom Quiz Summary"
    );

    const description = (global.usePlaceholder
      ? 'Cras justo odio, dapibus ac facilisis in, egestas eget quam. Praesent commodo.'
      : "If you're done, press 'Create Quiz' to finalize and create your custom quiz."
    );

    return(
      <View style={styles.containerStyle}>
        <View style={styles.titleContainer}>
          <Icon
            name={'note'}
            type={'simple-line-icon'}
            color={'#512DA8'}
            size={26}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.subtitle}>{description}</Text>
      </View>      
    );
  };

  _renderBody(){
    const { styles } = ModalContents;
    const {title, description, selected} = this.props;

    return(
      <View style={styles.body}>
        <QuizCard {...{title, description, selected}}/>
      </View>
    );
  };

  _renderButtons(){
    const { styles } = ModalContents;

    const borderRadius = 10;
    //shared props
    const buttonProps = {
      iconSize: 22,
      iconColor: 'white',
      textStyle: styles.buttonText,
    };

    return(
      <View style={[styles.buttonsWrapper, STYLES.mediumShadow]}>
        <View style={styles.buttonsContainer}>
          <IconButton
            text={'Create'}
            wrapperStyle={{flex: 1}}
            containerStyle={[styles.buttonContainer, {borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius, backgroundColor: '#6200EA'}]}
            onPress={this._handleOnPressCreateQuiz}
            iconName={'pencil-square-o'}
            iconType={'font-awesome'}
            {...buttonProps}
          />
          <IconButton
            text={'Cancel'}
            wrapperStyle={{flex: 1}}
            containerStyle={[styles.buttonContainer, {borderTopRightRadius: borderRadius, borderBottomRightRadius: borderRadius, backgroundColor: '#C62828'}]}
            onPress={this._handleOnPressCancel}            
            iconName={'close'}
            iconType={'simple-line-icon'}
            {...buttonProps}
          />
        </View>
      </View>
    );
  };

  render(){
    const paddingBottom = SwipableModal.snapPoints.halfscreen.y - MODAL_DISTANCE_FROM_TOP;
    return(
      <View style={{flex: 1, paddingBottom}}>
        <ModalTopIndicator/>
        {this._renderTitle()}
        <View style={{flex: 1}}>
          {this._renderBody()}
        </View>
        {this._renderButtons()}
      </View>
    );
  };
};

export class QuizFinishModal extends React.PureComponent {
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
      selected: [], 
    };
  };

  openModal = async ({selected, title, description}) => {
    this.setState({
      mountContent: true, 
      selected, title, description
    });

    this._modal.showModal();
  };

  _handleOnModalShow = () => {
  };

  _handleOnModalHide = () => {
    this.setState({mountContent: false});
  };

  _handleOnPressCreateQuiz = async () => {
    const { title, description, selected } = this.state;
    const customQuiz = CreateCustomQuiz.createQuiz({title, description, selected});
    let t = [customQuiz.quiz];
    await CustomQuizStore.set(t);
  };

  _handleOnPressCancel = () => {
    this._modal.hideModal();
  };

  _renderContent(){
    const {title, description, selected} = this.state;
    return(
      <ModalContents 
        onPressCreateQuiz={this._handleOnPressCreateQuiz}
        onPressCancel={this._handleOnPressCancel}
        {...{title, description, selected}}
      />
    );
  };

  render(){
    const { mountContent } = this.state;

    const paddingBottom = (
      MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP
    );

    const snapPoints = [
      SwipableModal.snapPoints.halfscreen,
      SwipableModal.snapPoints.hidden,
    ];
    
    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
        {...{snapPoints}}
      >
        <Fragment>
          <ModalBackground style={{paddingBottom}}>
            {mountContent && this._renderContent()}
          </ModalBackground>
        </Fragment>
      </SwipableModal>
    );
  };
};