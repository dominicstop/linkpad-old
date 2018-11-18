import React, { Component, Fragment } from 'react';
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, ScrollView, Platform, Alert, LayoutAnimation, UIManager } from 'react-native';
import PropTypes from 'prop-types';

import Animated from 'react-native-reanimated';
import { BlurView } from 'expo';

import   Interactable                   from './Interactable';
import { AnimatedCollapsable          } from './Buttons';
import { IconText, AnimateInView      } from '../components/Views';
import { IconButton                   } from '../components/Buttons';
import { SubjectItem, ModuleItemModel } from '../functions/ModuleStore';
import { timeout, setStateAsync       } from '../functions/Utils';

import * as Animatable from 'react-native-animatable';
import NavigationService from '../NavigationService';
import IncompletePracticeExamStore, { IncompletePracticeExamModel } from '../functions/IncompletePracticeExamStore';
import TimeAgo from 'react-native-timeago';
import { Icon } from 'react-native-elements';

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

const MODAL_DISTANCE_FROM_TOP = 40;
const MODAL_EXTRA_HEIGHT = 100;

//enable layout animation on android
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export class SwipableModal extends React.PureComponent {
  static propTypes = {
    onModalShow: PropTypes.func,
    onModalHide: PropTypes.func,
    snapPoints: PropTypes.arrayOf(PropTypes.shape({
      //y: distance from top
      y: PropTypes.number,
    })),
  }

  static defaultProps = {
    snapPoints: [
      //full screen
      { y: MODAL_DISTANCE_FROM_TOP },
      //hidden
      { y: Screen.height * 1 },
      //half screen
      { y: Screen.height - (Screen.height * 0.6) },
    ],
    ...Platform.select({
      android: {
        hitSlop: { bottom: -(Screen.height + MODAL_EXTRA_HEIGHT - 60) }
      }
    })
  }

  constructor(props) {
    super(props);
    this._deltaY = new Animated.Value(Screen.height - 100);
    this.state = {
      mountModal: false,
    };
  }

  showModal = () => {
    const { mountModal } = this.state;
    if(!mountModal){
      this.setState({mountModal: true});
    }
  };

  hideModal = async () => {
    const { mountModal } = this.state;
    if(mountModal){
      this._modalShadow.fadeOut(750);
      await this._rootView.bounceOutDown(750);
      this.setState({mountModal: false});
    };
  };

  //called when modal is visible
  onModalShow = () => {
    const { onModalShow } = this.props;
    onModalShow && onModalShow();
  }
  
  //called when modal is hidden
  onModalHide = () => {
    const { onModalHide } = this.props;
    onModalHide && onModalHide();
  }

  _handleOnSnap = ({nativeEvent}) => {
    const { index, x , y } = nativeEvent;
    
    const isHidden = y >= Screen.height;
    if(isHidden){
      //unmount modal when hidden
      this.setState({mountModal: false});
      this.onModalHide();
    }

    //call callback in props
    const { onSnap } = this.props;
    onSnap && onSnap(nativeEvent, {isHidden});
  }

  _renderShadow = () => {
    //shadow behind panel
    const shadowStyle = {
      backgroundColor: 'black',
      opacity: this._deltaY.interpolate({
        inputRange: [0, Screen.height - 100],
        outputRange: [0.5, 0],
        extrapolateRight: 'clamp',
      }),
    };

    return(
      <Animatable.View
        ref={r => this._modalShadow = r}
        style={styles.float}
        animation={'fadeIn'}
        duration={750}
        useNativeDriver={true}
      >
        <Animated.View
          pointerEvents={'box-none'}
          style={[styles.float, shadowStyle]}
        >
          <TouchableOpacity
            style={[styles.float]}
            activeOpacity={1}
            onPress={this._handleOnPressShadow}
          />
        </Animated.View>
      </Animatable.View>
    );
  };

  _handleOnPressShadow = () => {
    this.hideModal();
  };

  render(){
    const { snapPoints, hitSlop } = this.props;
    if(!this.state.mountModal) return null;
    return (
      <View style={styles.float}>
        {this._renderShadow()}
        <Animatable.View
          ref={r => this._rootView = r}
          style={{position: 'absolute', width: '100%', height: '100%'}}
          animation={'bounceInUp'}
          duration={750}
          easing={'ease-in-out'}
          pointerEvents={'box-none'}
        >
          <Interactable.View
            verticalOnly={true}
            boundaries={{ top: -300 }}
            initialPosition={snapPoints[0]}
            animatedValueY={this._deltaY}
            ref={r => this._interactable = r}
            onSnap={this._handleOnSnap}
            {...{snapPoints, hitSlop}}
          >
            <View style={styles.panelContainer}>
              <View style={styles.panel}>
                {this.props.children}
              </View>
            </View>
          </Interactable.View>
        </Animatable.View>
      </View>
    );
  };
};

//transparent line on top of modal
export class ModalTopIndicator extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      width: '100%', 
      alignItems: 'center', 
      paddingTop: 8, 
      paddingBottom: 5
    },
    indicator: {
      width: 40, 
      height: 8, 
      borderRadius: 4, 
      backgroundColor: '#00000040',
    }
  });

  render(){
    const { styles } = ModalTopIndicator;
    
    return(
      <View style={styles.container}>
        <View style={styles.indicator}/>
      </View>
    );
  };
};

//used in welcome screen: wrap with SwipableModal
export class WelcomeScreenModalContent extends React.PureComponent {
  _renderBody(){
    return(
      <ScrollView style={{paddingTop: 5, paddingHorizontal: 15}} contentContainerStyle={{paddingBottom: 100}}>
        <IconText
          textStyle={styles.textTitle}
          iconSize ={32}
          text={'About'}
          iconColor='rgba(0, 0, 0, 0.5)'
          iconName ='ios-information-circle'
          iconType ='ionicon'
        />
        <Text style={styles.textBody}>
          {"Sed posuere consectetur est at lobortis. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor."}
        </Text>

        <IconText
          containerStyle={{marginTop: 25}}
          textStyle={styles.textTitle}
          iconSize ={32}
          text={'Contact'}
          iconColor='rgba(0, 0, 0, 0.5)'
          iconName ='ios-contact'
          iconType ='ionicon'
        />
        <Text style={styles.textBody}>
          {"Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
        </Text>

        <IconText
          containerStyle={{marginTop: 25}}
          textStyle={styles.textTitle}
          iconSize ={32}
          text={'Our Policy'}
          iconColor='rgba(0, 0, 0, 0.5)'
          iconName ='ios-checkmark-circle'
          iconType ='ionicon'
        />
        <Text style={styles.textBody}>
          {"Donec id elit non mi porta gravida at eget metus. Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor."}
        </Text>
      </ScrollView>
    );
  }

  render(){
    return(
      <BlurView style={{flex: 1}} intensity={100}>
        <View style={{flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
          <ModalTopIndicator/>
          {this._renderBody()}
          <View style={{marginBottom: 100}}/>
        </View>
      </BlurView>
    );
  }
};

//used in BoardExamScreen: shown when more info is pressed
export class BoardExamModalContent extends React.PureComponent {
  static styles = StyleSheet.create({
    scrollview: {
      paddingTop: 5, 
      padding: 15
    },
    image: {
      width: 100, 
      height: 90, 
      marginTop: 15
    },
    bigTitle: {
      fontSize: 32, 
      fontWeight: '700', 
      marginTop: 5, 
      color: '#311B92'
    },
    smallTitle: {
      flex: 1,
      fontSize: 26,
      fontWeight: '700',
      color: 'rgba(0, 0, 0, 0.7)',
    },
    body: {
      flex: 1, 
      fontSize: 20, 
      marginTop: 5, 
      textAlign: 'justify',
    }
  });

  static sharedImageProps = {
    animation      : 'pulse'      ,
    iterationCount : "infinite"   ,
    easing         : 'ease-in-out',
    duration       : 5000         ,
    useNativeDriver: true         ,
  };

  constructor(props){
    super(props);
    this.imageIntro    = require('../../assets/icons/cloud-book.png');
    this.imageQuestion = require('../../assets/icons/qa.png');
    this.imageHands    = require('../../assets/icons/hands.png');
  };

  _renderIntroduction(){
    const { styles, sharedImageProps } = BoardExamModalContent;
    return(
      <View style={{alignItems: 'center'}}>
        <Animatable.Image
          source={this.imageIntro}
          style={styles.image}
          {...sharedImageProps}
        />
        <Text style={styles.bigTitle}>
          {'What is Preboard?'}
        </Text>

        <IconText
          containerStyle={{marginTop: 10}}
          //text props
          text={'About'}
          textStyle={styles.smallTitle}
          //icon props
          iconName ='ios-information-circle'
          iconType ='ionicon'
          iconColor='rgba(0, 0, 0, 0.5)'
          iconSize ={28}
        />
        <Text style={styles.body}>
          {"Preboard Exam is an online mock exam that is updated yearly to asess the information you have learned whether its from the app's modules, practice quizes or the material discussed in class. The goal of this mock exam is to make sure you're prepared for the real thing and help you attain a passing score!"}
        </Text>
      </View>
    );
  };

  _renderQuestion(){
    const { styles, sharedImageProps } = BoardExamModalContent;
    return(
      <View style={{alignItems: 'center'}}>
        <Animatable.Image
          source={this.imageQuestion}
          style={styles.image}
          {...sharedImageProps}
        />
        <Text style={styles.bigTitle}>{'Realistic Questions'}</Text>

        <IconText
          containerStyle={{marginTop: 10}}
          textStyle={[styles.smallTitle, {marginBottom: 3}]}
          iconSize ={32}
          text={'Content'}
          iconColor='rgba(0, 0, 0, 0.5)'
          iconName ='ios-book'
          iconType ='ionicon'
        />
        <Text style={styles.body}>
          {"The questions in each Preboard exam is different every year and is hand selected amongst all the modules provided in the app. The questions selected are Etiam porta sem malesuada magna mollis euismod."}
        </Text>
      </View>
    );
  };

  _renderExplantion(){
    const { styles, sharedImageProps } = BoardExamModalContent;
    return(
      <View style={{alignItems: 'center', marginTop: 25}}>
        <Animatable.Image
          source={this.imageHands}
          style={styles.image}
          {...sharedImageProps}
        />
        <Text style={styles.bigTitle}>{'How it Works'}</Text>

        <IconText
          containerStyle={{marginTop: 10}}
          textStyle={[styles.smallTitle, {marginBottom: 3}]}
          iconSize ={32}
          text={'Mechanics'}
          iconColor='rgba(0, 0, 0, 0.5)'
          iconName ='ios-cog'
          iconType ='ionicon'
        />
        <Text style={styles.body}>
          {"You will be asked a series of questions and will select an answer from the choices. There is a time limit during the mock exam and when the timer runs out, the exam will end and you will be graded for the questions you managed to answer. Maecenas faucibus mollis interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus."}
        </Text>
      </View>
    );
  };

  _renderBody(){
    const { styles } = BoardExamModalContent;

    return(
      <ScrollView style={styles.scrollview}>
        {this._renderIntroduction()}
        {this._renderQuestion    ()}
        {this._renderExplantion  ()}
        <View style={{marginBottom: 250}}/>
      </ScrollView>
    );
  };

  render(){
    return Platform.select({
      ios: (
        <BlurView style={{flex: 1}} intensity={100} tint={'light'}>
          <ModalTopIndicator/>
          {this._renderBody()}
        </BlurView>
      ),
      android: (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <ModalTopIndicator/>
          {this._renderBody()}  
        </View>
      ),
    });
  };
};

//used in homescreen: when a subject is pressed in module list
export class SubjectModal extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: Platform.select({
        ios    : 'transparent',
        android: 'white',
      }),
    },
    scrollview: {
      flex: 1, 
      padding: 10, 
      borderTopColor: 'rgba(0, 0, 0, 0.15)', 
      borderTopWidth: 1
    },
    //conatainer for buttons
    buttonsContainer: {
      flexDirection: 'row', 
      height: 80, 
      padding: 10,
      paddingVertical: 15, 
      borderTopColor: 'rgba(0, 0, 0, 0.25)', 
      borderTopWidth: 1, 
      shadowOffset:{  width: 2,  height: 3,  }, 
      shadowColor: 'black', 
      shadowRadius: 3, 
      shadowOpacity: 0.5,
    },
    //shared styles for buttons
    buttonContainer: {
      flex: 1,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5
    },
    buttonText: {
      flex: 0,
      color: 'white',
      fontSize: 17,
      textDecorationLine: 'underline'
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
    textSubtitle: {
      fontSize: 18,
      fontWeight: '200',
      color: '#212121',
      textAlign: 'justify',
      marginBottom: 5,
    },
    textBody: {
      fontSize: 18, 
      textAlign: 'justify'
    },
    detailTitle: Platform.select({
      ios: {
        fontSize: 18,
        fontWeight: '500'
      },
      android: {
        fontSize: 18,
        fontWeight: '900'
      }
    }),
    detailSubtitle: Platform.select({
      ios: {
        fontSize: 24,
        fontWeight: '200'
      },
      android: {
        fontSize: 24,
        fontWeight: '100',
        color: '#424242'
      },
    }),
    image: {
      width: 75, 
      height: 75, 
      marginHorizontal: 15,
      marginVertical: 15
    },
    gradeTextContainer: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 10
    },
    gradeTitle: {
      color: '#512DA8',
      fontSize: 20, 
      fontWeight: '800'
    },
    gradeSubtitle: {
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

  static sharedImageProps = {
    animation      : 'pulse'      ,
    iterationCount : "infinite"   ,
    easing         : 'ease-in-out',
    duration       : 5000         ,
    useNativeDriver: true         ,
  };
  
  constructor(props){
    super(props);
    this.state = {
      moduleData  : null ,
      subjectData : null ,
      mountContent: false,
      //false while loading from store
      mountPracticeExams: false,
      mountGrades       : false,
    };

    //load images
    this.imageGradeInactive    = require('../../assets/icons/books-2.png');
    this.imagePreviousInactive = require('../../assets/icons/phone-book.png');

    this.modalClosedCallback = null;
    this.modalOpenedCallback = null;
  };

  initModels(moduleData, subjectData){
    //wrap inside model
    let moduleModel  = new ModuleItemModel(moduleData );
    let subjectModel = new SubjectItem    (subjectData);

    //get matching subject
    const indexID_subject = subjectModel.get().indexid;
    subjectModel = moduleModel.getSubjectByID(indexID_subject);

    //set as property
    this.moduleModel  = moduleModel ;
    this.subjectModel = subjectModel;
  };

  async loadPracticeExams(){
    const { subjectModel, moduleModel } = this;

    //load from store
    const model = await IncompletePracticeExamStore.getAsModel();
    //set as property
    this.practiceExamsModel = model;

    if(model != undefined){
      //extract id's
      const { indexID_module, indexID_subject } = subjectModel.getIndexIDs();

      const match = model.findMatchFromIDs({ indexID_module, indexID_subject });
      const hasMatch = match != undefined;
      
      //init. model and set match as property
      this.practiceExamModel = new IncompletePracticeExamModel(match);

      this.setState({mountPracticeExams: hasMatch});
    }
  };

  openSubjectModal = (moduleData, subjectData) => {
    this.initModels( moduleData, subjectData);

    this.setState({
      moduleData, subjectData, 
      mountContent: true
    });

    this.loadPracticeExams();
    this._modal.showModal();
  };

  closeSubjectModal = () => {
    this._modal.showModal();
  };

  isModalVisible = () => {
    const { mountContent } = this.state;
    return mountContent;
  };

  _handleOnModalShow = () => {
    //call callbacks if defined
    this.modalOpenedCallback && this.modalOpenedCallback();
  };

  _handleOnModalHide = () => {
    //call callbacks if defined
    this.modalClosedCallback && this.modalClosedCallback();

    //clean up state
    this.setState({
      moduleData  : null ,
      subjectData : null ,
      mountContent: false,
      mountPracticeExams: false,
    });

    //cleanup/reset models
    this.moduleModel        = undefined;
    this.subjectModel       = undefined;
    this.practiceExamsModel = undefined;
    this.practiceExamModel  = undefined;
  };

  _handleOnDelete = async () => {
    const { practiceExamsModel, practiceExamModel } = this;

    //remove current iPE from array
    practiceExamsModel.removeItem(practiceExamModel);
    //update store
    await IncompletePracticeExamStore.set(practiceExamsModel);

    //update state
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({mountPracticeExams: false});
  };

  _handleOnPressTitle = () => {
    const { subjectData } = this.state;
    //wrap data into helper object for easier access
    const subject = new SubjectItem    (subjectData).get();

    Alert.alert(
      'Subject Name', subject.subjectname,
    );
  };

  _handleOnPressDelete = () => {
    Alert.alert(
      'Do you want to reset?',
      "All of your progress will be lost.",
      [
        {text: 'Cancel', style  : 'cancel'            },
        {text: 'OK'    , onPress: this._handleOnDelete},
      ],
      { cancelable: false }
    );
  };

  _handleOnPressStart = () => {
    const { moduleData, subjectData } = this.state;
    NavigationService.navigateApp('PracticeExamRoute', {
      moduleData, subjectData,
    });
  };

  _handleOnPressClose = () => {
    this._modal.hideModal();
  };

  _renderTitle(){
    const { styles } = SubjectModal;
    const { subjectData, moduleData } = this.state;
    
    //wrap data into helper object for easier access
    const subject = new SubjectItem    (subjectData).get();
    const module  = new ModuleItemModel(moduleData ).get();

    const activeOpacity = Platform.select({
      ios    : 0.6,
      android: 0.8
    });
    
    return(
      <TouchableOpacity 
        onPress={this._handleOnPressTitle}
        {...{activeOpacity}}
      >
        <IconText
          containerStyle={{marginLeft: 7, marginRight: 25, marginBottom: 10}}
          textStyle={styles.title}
          subtitleStyle={{fontWeight: '200', fontSize: 16}}
          text     ={subject.subjectname}
          subtitle ={module .modulename }
          iconName ={'notebook'}
          iconType ={'simple-line-icon'}
          iconColor={'#512DA8'}
          iconSize ={26}
        />
      </TouchableOpacity>      
    );
  };

  _renderDescriptionTitle(){
    const { styles } = SubjectModal;
    return(
      <IconText
        //icon
        iconName={'info'}
        iconType={'feather'}
        iconColor={'#512DA8'}
        iconSize={26}
        //title
        text={'Description'}
        textStyle={styles.title}
      />
    );
  };

  _renderDescription(){
    const { styles } = SubjectModal;
    const { subjectData } = this.state;
    //wrap data into helper object for easier access
    const subject = new SubjectItem(subjectData).get();
    //title comp for collapsable
    return(
      <View style={{overflow: 'hidden', marginTop: 5}}>
        <AnimatedCollapsable
          extraAnimation={false}
          text={subject.description}
          maxChar={400}
          collapsedNumberOfLines={6}
          titleComponent={this._renderDescriptionTitle()}
          style={styles.textBody}
        />
      </View>
    );
  };

  _renderDetails(){
    const { styles } = SubjectModal;
    const { subjectData } = this.state;
    //wrap data into helper object for easier access
    const subject = new SubjectItem(subjectData).get();

    return(
      <Fragment>
        <IconText
          //icon
          iconName={'file-text'}
          iconType={'feather'}
          iconColor={'#512DA8'}
          iconSize={26}
          //title
          text={'Subject Details'}
          textStyle={styles.title}
        />
        <View style={{flexDirection: 'row', marginTop: 3}}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Questions: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{subject.questions.length + ' items'}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.detailTitle   }>{'Updated: '}</Text>
            <Text numberOfLines={1} style={styles.detailSubtitle}>{subject.lastupdated}</Text>
          </View>
        </View>
      </Fragment>
    );
  };

  _renderPreviousActive(){
    const { styles } = SubjectModal;
    const { subjectModel, practiceExamModel } = this;

    const { timestamp_started } = practiceExamModel.get();
    const time = timestamp_started * 1000;

    //count answered question over total questions
    const totalQuestions = subjectModel     .getQuestionLength();
    const totalAnswers   = practiceExamModel.getAnswersCount  ();
    const answered = `${totalAnswers}/${totalQuestions} items`;

    return(
      <View style={{flexDirection: 'row', marginTop: 3}}>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.detailTitle   }>{'Answered: '}</Text>
          <Text numberOfLines={1} style={styles.detailSubtitle}>{answered}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.detailTitle   }>{'Started: '}</Text>
          <TimeAgo 
            numberOfLines={1} 
            style={styles.detailSubtitle} 
            {...{time}}
          />
        </View>
        <TouchableOpacity onPress={this._handleOnPressDelete}>
          <Icon
            containerStyle={{flex: 1, alignSelf: 'center', justifyContent: 'center'}}
            name={'trash-2'}
            type={'feather'}
            color={'red'}
            size={30}
          />
        </TouchableOpacity>
      </View>
    );
  };

  _renderPreviousInactive(){
    const { styles, sharedImageProps } = SubjectModal;

    return(
      <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'row'}}>
        <Animatable.Image
          source={this.imagePreviousInactive}
          style={styles.image}
          {...sharedImageProps}
        />
        <View style={styles.gradeTextContainer}>
          <Text style={styles.gradeTitle   }>No Previous Session</Text>
          <Text style={styles.gradeSubtitle}>If you couldn't answer everthing, we'll save your progress so you can come back to it later.</Text>
        </View>
      </View>
    );
  };

  _renderPrevious(){
    const { styles } = SubjectModal;
    const { mountPracticeExams } = this.state;

    const descriptionActive   = 'You have answered some of the questions in this subject in a previous session.';
    const descriptionInactive = 'If you were unable to finish, your answers and progress will be saved here.';
    
    const description = mountPracticeExams? descriptionActive : descriptionInactive;

    return(
      <Fragment>
        <IconText
          //icon
          iconName={'clock'}
          iconType={'feather'}
          iconColor={'#512DA8'}
          iconSize={26}
          //title
          text={'Previous Session'}
          textStyle={styles.title}
        />
        <Text style={styles.textSubtitle}>
          {description}
        </Text>
        {mountPracticeExams? this._renderPreviousActive() : this._renderPreviousInactive()}
      </Fragment>
    );
  };

  _renderGradesInactive(){
    const { styles, sharedImageProps } = SubjectModal;
    return(
      <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'row'}}>
        <Animatable.Image
          source={this.imageGradeInactive}
          style={styles.image}
          {...sharedImageProps}
        />
        <View style={styles.gradeTextContainer}>
          <Text style={styles.gradeTitle   }>No Grades Available</Text>
          <Text style={styles.gradeSubtitle}>Your grades will be available here once you've completed a practice exam.</Text>
        </View>
      </View>
    );
  };

  _renderGradesActive(){
    
  };

  _renderGrades(){
    const { styles } = SubjectModal;
    const { mountGrades } = this.state;
    return(
      <Fragment>
        <IconText
          //icon
          iconName={'bar-chart'}
          iconType={'feather'}
          iconColor={'#512DA8'}
          iconSize={26}
          //title
          text={'Grades'}
          textStyle={styles.title}
          //subtitle
          subtitleStyle={{fontWeight: '200', fontSize: 16, }}
          subtitle ={'Previous grades'}
        />
        {mountGrades? this._renderGradesActive() : this._renderGradesInactive()}
      </Fragment>
    );
  };

  _renderButtons(){
    const { styles } = SubjectModal;
    const { mountPracticeExams } = this.state;

    const borderRadius = 10;
    //shared props
    const buttonProps = {
      iconSize: 22,
      iconColor: 'white',
      textStyle: styles.buttonText,
    };
    
    return(
      <View style={styles.buttonsContainer}>
        <IconButton
          text={mountPracticeExams? 'Resume' : 'Start'}
          wrapperStyle={{flex: 1}}
          containerStyle={[styles.buttonContainer, {borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius, backgroundColor: '#6200EA'}]}
          iconName={'pencil-square-o'}
          iconType={'font-awesome'}
          onPress={this._handleOnPressStart}
          {...buttonProps}
        />
        <IconButton
          text={'Cancel'}
          wrapperStyle={{flex: 1}}
          containerStyle={[styles.buttonContainer, {borderTopRightRadius: borderRadius, borderBottomRightRadius: borderRadius, backgroundColor: '#C62828'}]}
          iconName={'close'}
          iconType={'simple-line-icon'}
          onPress={this._handleOnPressClose}
          {...buttonProps}
        />
      </View>
      
    );
  };

  _renderFooter = () => {
    const delay = 1000;
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return (
      <Animatable.View 
        style={{paddingBottom: 80}}
        duration={750}
        useNativeDriver={true}
        {...{animation, delay}}
      >
        <Animatable.View
          animation={'pulse'}
          duration={1000}
          easing={'ease-in-out'}
          iterationCount={'infinite'}
          useNativeDriver={true}
          {...{delay}}
        >
          <Icon
            name={'heart'}
            type={'entypo'}
            color={'#B39DDB'}
            size={24}
          />
        </Animatable.View>
      </Animatable.View>
    );
  };

  _renderContent(){
    const { styles } = SubjectModal;
    const Separator = (props) =>  <View style={{alignSelf: 'center', width: '80%', height: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', margin: 15}} {...props}/>
    return(
      <Fragment>
        <ModalTopIndicator/>
        {this._renderTitle()}
        <ScrollView style={styles.scrollview}>
          <AnimateInView
            animation={'fadeInUp'}
            duration={350}
            difference={100}
            delay={150}
          >
            <Fragment>
              {this._renderDescription()}
              <Separator/>
            </Fragment>
            <Fragment>
              {this._renderDetails()}
              <Separator/>
            </Fragment>
            <Fragment>
              {this._renderPrevious()}
              <Separator/>
            </Fragment>
            {this._renderGrades()}
          </AnimateInView>
          {this._renderFooter()}
        </ScrollView>
        {this._renderButtons()}
      </Fragment>
    );
  };

  render(){
    const { styles } = SubjectModal;
    const { mountContent } = this.state;

    const paddingBottom = MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP;

    const Wrapper = (props) => Platform.select({
      ios: (
        <BlurView style={props.style} intensity={100} tint={'light'}>
          {props.children}
        </BlurView>
      ),
      android: (
        <View style={props.style}>
          {props.children}
        </View>
      ),
    });

    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <Wrapper style={[{flex: 1}, styles.container, {paddingBottom}]}>
          {mountContent && this._renderContent()}
        </Wrapper>
      </SwipableModal>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Platform.select({
      android: 'white',
      ios: '#efefef'
    }),
  },
  float: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  panelContainer: {
    height: Screen.height + MODAL_EXTRA_HEIGHT,
    shadowOffset: { width: -5, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
  },
  panel: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    overflow: 'hidden',
  },
  textTitle: {
    fontSize: 30, fontWeight: '700', alignSelf: 'center', marginBottom: 2, color: 'rgba(0, 0, 0, 0.75)'
  },
  textBody: {
    textAlign: 'justify', fontSize: 20, fontWeight: '300'
  }
});