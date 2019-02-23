import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, SectionList, Animated, TextInput, TouchableWithoutFeedback, Keyboard, Alert, Dimensions, StatusBar } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES , ROUTES} from '../Constants';
import { PURPLE } from '../Colors';

import { plural , setStateAsync, timeout, isEmpty } from '../functions/Utils';
import { CreateCustomQuiz, CustomQuizStore } from '../functions/CustomQuizStore';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconText, AnimateInView, Card } from '../components/Views';
import { IconButton } from '../components/Buttons';

import { BlurView, LinearGradient, DangerZone } from 'expo';
import { Icon, Divider } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import {  } from 'react-native-paper';
import NavigationService from '../NavigationService';

const { Lottie } = DangerZone;

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

class QuizCard extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    selected: PropTypes.array,
    selectedModules: PropTypes.array,
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
      fontSize: 17,
      marginBottom: 3,
    },
    textLabelValue: {
      fontWeight: '200',
    },
    detailTitle: {
      color: '#0c0c0c',
      fontSize: 17,
      ...Platform.select({
        ios: {
          fontWeight: '500'
        },
        android: {
          fontWeight: '900'
        }
      }),
    },
    detailSubtitle: Platform.select({
      ios: {
        fontSize: 22,
        fontWeight: '200',
        color: '#161616',
      },
      android: {
        fontSize: 22,
        fontWeight: '100',
        color: '#424242'
      },
    }),
  });

  constructor(props){
    super(props);

    const { selected, selectedModules } = props;

    let questionCount = 0;
    selected.forEach((subject) => {
      const { questions = [] } = subject;
      questionCount += questions.length;
    });

    console.log(questionCount);


    this.state = {
      subjectCount: selected.length,
      moduleCount: selectedModules.length,
      questionCount, 
    };

    this.imageCard = require('../../assets/icons/notes-pencil.png');
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
    const { subjectCount, moduleCount, questionCount } = this.state;

    return(
      <View>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Modules: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{`${moduleCount} ${plural('moodule', module)}`}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Subjects: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{`${subjectCount} ${plural('subject', subjectCount)}`}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginTop: 7}}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Questions: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{`${questionCount} ${plural('question', questionCount)}`}</Text>
          </View>
        </View>
      </View>
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
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    selected: PropTypes.array,
    selectedModules: PropTypes.array,
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
      ...Platform.select({
        android: {
          height: 85,
        },
      })
    },
    buttonsContainer: {
      flexDirection: 'row',
      ...Platform.select({
        android: {
          flex: 1,
        },
      })
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
    const {title, description, selected, selectedModules} = this.props;

    return(
      <View style={styles.body}>
        <QuizCard {...{title, description, selected, selectedModules}}/>
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
    return(
      <View style={{flex: 1}}>
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
      selectedModules: [],
    };
  };

  openModal = async ({selected, selectedModules, title, description}) => {
    this.setState({
      mountContent: true, 
      selected, selectedModules, title, description
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

    const old_quizes = await CustomQuizStore.read(quizes);
    const quizes = [...old_quizes, customQuiz.quiz];
    await CustomQuizStore.set(quizes);

    this._modal.hideModal();
    Alert.alert('Quiz Created', `"${title}" quiz has been created and added to the list.`);
    NavigationService.navigateApp(ROUTES.TabExamsRoute);
  };

  _handleOnPressCancel = () => {
    this._modal.hideModal();
  };

  _renderContent(){
    const {title, description, selected, selectedModules} = this.state;
    return(
      <ModalContents 
        onPressCreateQuiz={this._handleOnPressCreateQuiz}
        onPressCancel={this._handleOnPressCancel}
        {...{title, description, selected, selectedModules}}
      />
    );
  };

  render(){
    const { mountContent } = this.state;

    const MODAL_SIZE = 500;

    const TOP_DISTANCE     = Screen.height - MODAL_SIZE;
    const CONTAINER_HEIGHT = Screen.height + MODAL_EXTRA_HEIGHT;

    const paddingBottom = (CONTAINER_HEIGHT - MODAL_SIZE);

    const snapPoints = [
      { y: TOP_DISTANCE },
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