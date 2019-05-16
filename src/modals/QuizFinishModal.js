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
import { ifIphoneX, isIphoneX } from 'react-native-iphone-x-helper';
import { SubjectItem } from '../models/ModuleModels';

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

class ModalContents extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    selected: PropTypes.array,
    selectedModules: PropTypes.array,
    itemsPerSubject: PropTypes.number, 
    maxItemsQuiz: PropTypes.number, 
    questionsTotal: PropTypes.number,
    shouldDistributeEqually: PropTypes.bool, 
    //event callbacks
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
      marginBottom: 1,
      alignItems: 'center',
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
      paddingTop: 5,
    },
    //bottom button styles
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
      }),
      ...ifIphoneX({
        paddingBottom: 20,
      }),
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
    //card styles
    titleDescContainer: {
      flexDirection: 'row', 
      marginBottom: 5
    },
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
    //card details styles
    detailRow: {
      flexDirection: 'row', 
      marginTop: 7
    },
    detailColumn: {
      flex: 1,
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
        fontWeight: '300',
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
    this.imageCard = require('../../assets/icons/notes-pencil.png');

    const subjects = SubjectItem.wrapArray((props.selected || []));
    const questions = subjects.reduce((acc, curr) => {
      acc.push(...(curr.questions));
      return acc;
    },[]);

    this.state = {
      totalQuestions: questions.length,
    };
  };

  _handleOnPressCreateQuiz = () => {
    const { onPressCreateQuiz } = this.props;
    onPressCreateQuiz && onPressCreateQuiz();
  };

  _handleOnPressCancel = () => {
    const { onPressCancel } = this.props;
    onPressCancel && onPressCancel();
  };

  _handleOnPressQuestion = () => {
    Alert.alert(
      "Total Questions",
      "Shows how many questions will be taken across all of the available subjects you've selected."
    );
  };

  /** top: modal header title and description */
  _renderTitle(){
    const { styles } = ModalContents;

    //title and description
    const title = "Custom Quiz Summary";
    const description = "If you're done, press 'Create Quiz' to finalize and create your custom quiz.";

    return(
      <View style={styles.containerStyle}>
        <View style={styles.titleContainer}>
          <Icon
            name={'ios-checkmark-circle'}
            type={'ionicon'}
            color={'#512DA8'}
            size={28}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.subtitle}>{description}</Text>
      </View>      
    );
  };

  /** body card: title, desc etc.  */
  _renderCardTitleDesc(){
    const { styles } = ModalContents;
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

  /** body card: rows of details */
  _renderCardDetails(){
    const { styles } = ModalContents;
    const { questionsTotal, selected, selectedModules, maxItemsQuiz } = this.props;
    const { totalQuestions } = this.state;

    const moduleCount  = (selectedModules || []).length;
    const subjectCount = (selected || []).length;

    return(
      <Fragment>
        <View style={styles.detailRow}>
          <View style={styles.detailColumn}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Modules: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{`${moduleCount} ${plural('module', module)}`}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Subjects: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{`${subjectCount} ${plural('subject', subjectCount)}`}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <TouchableOpacity 
            style={styles.detailColumn}
            onPress={this._handleOnPressQuestion}
          >
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Questions: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{`${questionsTotal}/${totalQuestions} ${plural('item', questionsTotal)}`}</Text>
          </TouchableOpacity>
          <View style={styles.detailColumn}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Max Questions: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{`${maxItemsQuiz} ${plural('item', maxItemsQuiz)}`}</Text>
          </View>
        </View>
      </Fragment>
    );
  };

  /** center: contains the card details */
  _renderBody(){
    const { styles } = ModalContents;
    const {title, description, selected, selectedModules} = this.props;

    return(
      <View style={styles.body}>
        <Card>
          <View style={styles.titleDescContainer}>
            <Animatable.Image
              source={this.imageCard}
              style={styles.image}
              animation={'pulse'}
              easing={'ease-in-out'}
              iterationCount={"infinite"}
              duration={7000}
              useNativeDriver={true}
            />
            {this._renderCardTitleDesc()}
          </View>
          <Divider style={{marginTop: 3, marginBottom: 10}}/>
          {this._renderCardDetails()}
        </Card>
      </View>
    );
  };

  /** bottom: conatains the modal buttons */
  _renderButtons(){
    const { styles } = ModalContents;

    const borderRadius = isIphoneX? 17 : 10;
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
      itemsPerSubject: -1, 
      maxItemsQuiz: -1, 
      shouldDistributeEqually: false, 
      questionsTotal: -1,
    };
  };

  openModal = async ({selected, selectedModules, title, description, itemsPerSubject, maxItemsQuiz, shouldDistributeEqually, questionsTotal}) => {
    this.setState({
      mountContent: true, 
      selected, selectedModules, title, description, itemsPerSubject, maxItemsQuiz, shouldDistributeEqually, questionsTotal
    });

    this._modal.showModal();
  };

  _handleOnModalShow = () => {
  };

  _handleOnModalHide = () => {
    this.setState({mountContent: false});
  };

  _handleOnPressCreateQuiz = async () => {
    const { title, description, selected, itemsPerSubject, maxItemsQuiz, shouldDistributeEqually } = this.state;

    const customQuiz = CreateCustomQuiz.createQuiz({title, description, selected, itemsPerSubject, maxItemsQuiz, shouldDistributeEqually});
    const new_quiz = customQuiz.quiz;

    const old_quizes = await CustomQuizStore.read() || [];
    const quizes = [...old_quizes, new_quiz];
    await CustomQuizStore.set(quizes);

    this._modal.hideModal();
    Alert.alert('Quiz Created', `"${title}" quiz has been created and added to the list.`);
    NavigationService.navigateApp(ROUTES.TabExamsRoute);
  };

  _handleOnPressCancel = () => {
    this._modal.hideModal();
  };

  _renderContent(){
    const {title, description, selected, selectedModules, itemsPerSubject, maxItemsQuiz, shouldDistributeEqually, questionsTotal} = this.state;
    return(
      <ModalContents 
        onPressCreateQuiz={this._handleOnPressCreateQuiz}
        onPressCancel={this._handleOnPressCancel}
        {...{title, description, selected, selectedModules, itemsPerSubject, maxItemsQuiz, shouldDistributeEqually, questionsTotal}}
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