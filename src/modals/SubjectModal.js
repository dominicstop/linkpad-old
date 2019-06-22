import React, { Component, Fragment } from 'react';
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, ScrollView, Platform, Alert, LayoutAnimation, UIManager, SectionList, SafeAreaView, StatusBar } from 'react-native';
import PropTypes from 'prop-types';

import Animated, { Easing } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import   Interactable                   from '../components/Interactable';
import { AnimatedCollapsable          } from '../components/Buttons';
import { IconText, AnimateInView, IconFooter      } from '../components/Views';
import { IconButton                   } from '../components/Buttons';
import { ContentExpander, TextExpander } from '../components/Expander';

import { ModuleItemModel, SubjectItem } from '../models/ModuleModels';
import { timeout, setStateAsync, hexToRgbA, plural       } from '../functions/Utils';

import * as Animatable from 'react-native-animatable';

import NavigationService from '../NavigationService';
import IncompletePracticeExamStore, { IncompletePracticeExamModel } from '../functions/IncompletePracticeExamStore';
import TimeAgo from 'react-native-timeago';
import { Icon, Divider } from 'react-native-elements';
import { ROUTES, FONT_STYLES, STYLES } from '../Constants';
import {PURPLE, GREY, RED} from '../Colors';
import { isIphoneX, ifIphoneX, getStatusBarHeight, getBottomSpace } from 'react-native-iphone-x-helper';
import { SwipableModal, ModalTopIndicator, ModalBackground, MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT } from '../components/SwipableModal';


import { BlurViewWrapper, StickyHeader, DetailRow, DetailColumn, ModalBottomTwoButton } from '../components/StyledComponents';

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

/** used in homescreen: when a subject is pressed in module list */
class OLD_SubjectModal extends React.PureComponent {
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
      ...ifIphoneX({
        paddingBottom: 22,
        height: 90,
      }),
    },
    //shared styles for buttons
    buttonContainer: {
      flex: 1,
      padding: 10,
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
      textAlign: 'justify',
      color: '#202020',
    },
    detailTitle: {
      color: '#0c0c0c',
      ...Platform.select({
        ios: {
          fontSize: 18,
          fontWeight: '500'
        },
        android: {
          fontSize: 18,
          fontWeight: '900'
        }
      }),
    },
    detailSubtitle: Platform.select({
      ios: {
        fontSize: 24,
        fontWeight: '200',
        color: '#161616',
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

  componentWillUnmount(){
    alert('unmounted');
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
    NavigationService.navigateApp(ROUTES.PracticeExamRoute, {
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

    const borderRadius = isIphoneX? 17 : 10;
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

    const paddingBottom = (MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP);

    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <ModalBackground style={{paddingBottom}}>
          {mountContent && this._renderContent()}
        </ModalBackground>
      </SwipableModal>
    );
  };
};

const sharedImageProps = {
  animation      : 'pulse'      ,
  iterationCount : "infinite"   ,
  easing         : 'ease-in-out',
  duration       : 5000         ,
  useNativeDriver: true         ,
};

const sharedStyles = {
  image: {
    width: 65, 
    height: 65, 
  },
  iconContainer: {
    ...Platform.select({
      ios: {
        shadowColor: PURPLE.A700, 
        shadowRadius: 10, 
        shadowOpacity: 0.25,
        shadowOffset:{  
          width: 1,  
          height: 2,  
        }, 
      },
    }),
  },
};

const ExpanderHeader = (props) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textContainer: {
      marginLeft: 7,
    },
    title: {
      ...FONT_STYLES.heading6,
      color: PURPLE[900],
      fontWeight: '600'
    },
    subtitle: {
      ...FONT_STYLES.subtitle1,      
      ...Platform.select({
        ios: {
          fontWeight: '300',
          color: GREY[900]
        },
        android: {
          fontWeight: '100',
          color: GREY[800],
          marginTop: -2,
        },
      }),
    },
  });

  const suffix = props.isExpanded? 'collapse' : 'expand';
  return (
    <View style={styles.container}>
      <Icon
        containerStyle={sharedStyles.iconContainer}
        name={props.iconName}
        type={props.iconType}
        color={PURPLE.A700}
        size={24}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.title}</Text>
        <Text style={styles.subtitle}>{`Tap here to ${suffix}`}</Text>
      </View>
    </View>
  );
};

class SubjectDetails extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {

    },
    divider: {
      marginVertical: 10,
      marginHorizontal: 15,
    },
    description: {
      ...FONT_STYLES.body1,
      marginTop: 7,
      ...Platform.select({
        ios: {
          fontWeight: '200',
        },
        android: {
          fontWeight: '100',
          color: GREY[900],
        },
      }),
    },
    rowContainer: {
      marginBottom: 10,
    },
  });

  _renderHeader(isExpanded) {
    return(
      <ExpanderHeader
        title={'Description'}
        iconName={'align-left'}
        iconType={'feather'}
        {...{isExpanded}}
      />
    );
  };

  render(){
    const { styles } = SubjectDetails;
    const { containerStyle, subjectData } = this.props;

    const subject = SubjectItem.wrap(subjectData);
    const questions = (subject.questions || []).length;

    const description = subject.description || "No description available.";
    const lastupdated = subject.lastupdated || "N/A";

    return(
      <View style={[styles.container, containerStyle]}>
        <ContentExpander renderHeader={this._renderHeader}>
          <Text style={styles.description}>{description}</Text>
        </ContentExpander>
        <Divider style={styles.divider}/>        
        <DetailRow containerStyle={styles.rowContainer}>
          <DetailColumn
            title={'Updated:'}
            subtitle={lastupdated}
          />
          <DetailColumn
            title={'Questions:'}
            subtitle={`${questions} ${plural('item', questions)}`}
          />
        </DetailRow>
      </View>
    );
  };
};

class PreviousSession extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center', 
      justifyContent: 'center',
      paddingHorizontal: 15,
      paddingTop: 15,
      paddingBottom: 20,
    },
    textContainer: {
      flex: 1,
      marginLeft: 15,
    },
    title: {
      ...FONT_STYLES.heading6,
      color: PURPLE[900],
      textAlign: 'center',
      ...Platform.select({
        ios: {
          fontWeight: '600',
        },
        android: {
          fontWeight: '700',
        },
      }),
    },
    subtitle: {
      ...FONT_STYLES.subtitle1,
      ...Platform.select({
        ios: {
          fontWeight: '300',
        },
        android: {
          fontWeight: '100',
          color: GREY[900],
        },
      }),
    },
  });

  static imageSource = require('../../assets/icons/phone-book.png');

  render(){
    const { styles, imageSource: source } = PreviousSession;
    const { containerStyle } = this.props;

    return(
      <View style={[containerStyle, styles.container]}>
        <Animatable.Image
          style={sharedStyles.image}
          {...{source, ...sharedImageProps}}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title   }>No Previous Session</Text>
          <Text style={styles.subtitle}>If you couldn't answer everthing, we'll save your progress so you can come back to it later.</Text>
        </View>
      </View>
    );
  };
};

class Grades extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center', 
      justifyContent: 'center',
      paddingHorizontal: 15,
      paddingTop: 15,
      paddingBottom: 20,
    },
    textContainer: {
      flex: 1,
      marginLeft: 15,
    },
    title: {
      ...FONT_STYLES.heading6,
      color: PURPLE[900],
      textAlign: 'center',
      ...Platform.select({
        ios: {
          fontWeight: '600',
        },
        android: {
          fontWeight: '700',
        },
      }),
    },
    subtitle: {
      ...FONT_STYLES.subtitle1,
      ...Platform.select({
        ios: {
          fontWeight: '200',
        },
        android: {
          fontWeight: '100',
          color: GREY[900],
        },
      }),
    },
  });

  static imageSource = require('../../assets/icons/books-2.png');

  render(){
    const { styles, imageSource: source } = Grades;
    const { containerStyle } = this.props;

    return(
      <View style={[containerStyle, styles.container]}>
        <Animatable.Image
          style={sharedStyles.image}
          {...{source, ...sharedImageProps}}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title   }>No Grades Available</Text>
          <Text style={styles.subtitle}>Your grades will be available here once you've completed a practice exam.</Text>
        </View>
      </View>
    );
  };
};

export class SubjectModal extends React.PureComponent {
  static propTypes = {

  };

  static styles = StyleSheet.create({
    container: {
      paddingBottom: MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP,
    },
    //header styles
    headerWrapper: {
      ...Platform.select({
        ios: {
          position: 'absolute',
          width: '100%',
          borderBottomColor: 'rgba(0,0,0,0.15)',
          borderBottomWidth: 1,
        },
        android: {
          borderBottomColor: GREY[900],
        },
      }),
    },
    headerContainer: {
      paddingHorizontal: 10,
      paddingBottom: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255,255,255, 0.5)',      
        },
        android: {
          backgroundColor: 'rgba(255,255,255, 0.75)',      
        },
      }),
    },
    headerContentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTextContainer: {
      flex: 1,
      marginLeft: 7,
    },
    headerTitle: {
      color: PURPLE[700],
      ...FONT_STYLES.heading5,
      ...Platform.select({
        ios: {
          flex: 1,      
          fontWeight: '700',
          shadowColor: PURPLE[700],
          shadowRadius: 5,
          shadowOpacity: 0.15,
        },
        android: {
          fontWeight: '900',
        },
      }),
    },
    headerSubtitle: {
      ...FONT_STYLES.subtitle1,
      ...Platform.select({
        ios: {
          flex: 1,

          fontWeight: '200',
        },
        android: {
          fontWeight: '100',
        },
      }),
    },
    //content styles
    scrollview: {
      flex: 1,
      paddingBottom: 75,
    },
    sectionContainer: {
      paddingHorizontal: 10,
      paddingTop: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255,255,255, 0.6)',
          paddingBottom: 13,
          marginBottom: 15,
          borderBottomColor: 'rgba(0,0,0,0.15)',
          borderBottomWidth: 1,
        },
        android: {
          backgroundColor: 'white',
          paddingBottom: 40,
        },
      })
    },
    //footer styles
    footerWrapper: {
      position: 'absolute',
      width: '100%',
      bottom: 0,
    },
    footerContainer: {
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255,255,255,0.4)',
          paddingVertical: 12,
          paddingHorizontal: 10,
          //border
          borderTopColor: 'rgba(0,0,0,0.15)',
          borderTopWidth: 1,
          //extra padding
          ...(isIphoneX() && {
            paddingBottom: getBottomSpace() + 10,
          }),
        },
        android: {
          backgroundColor: 'white',          
          padding: 10,
          height: 80,
          elevation: 15,
        },
      }),
    },
    //list footer
    listFooterContainer: {
      marginBottom: 75
    },
  });

  constructor(props){
    super(props);

    this.state = {
      mountContent: false,
      headerHeight: -1,
      moduleData: null,
      subjectData: null,
    };
  };

  //------ functions ------
  openSubjectModal = (moduleData, subjectData) => {
    this.setState({
      moduleData, subjectData, 
      mountContent: true
    });

    this._modal.showModal();
  };

  closeSubjectModal = () => {
    this._modal.showModal();
  };

  isModalVisible = () => {
    const { mountContent } = this.state;
    return mountContent;
  };

  _handleHeaderOnLayout = ({nativeEvent}) => {
    const { headerHeight } = this.state;
    const { height } = nativeEvent.layout;

    if(headerHeight == -1){
      this.setState({headerHeight: height});
    };
  };

  _handleOnEndReached = () => {
    this.footer.show();
  };

  //------ render ------
  _renderHeader(){
    const { styles } = SubjectModal;
    const { moduleData, subjectData } = this.state;

    const module  = ModuleItemModel.wrap(moduleData );
    const subject = SubjectItem    .wrap(subjectData);

    const modulename  = module .modulename  || 'Unknown Module';
    const subjectname = subject.subjectname || 'Unknown Module';

    return(
      <BlurViewWrapper
        wrapperStyle={styles.headerWrapper}
        containerStyle={styles.headerContainer}
        onLayout={this._handleHeaderOnLayout}
      >
        <ModalTopIndicator/>
        <View style={styles.headerContentContainer}>
          <Icon
            containerStyle={sharedStyles.iconContainer}
            name={'notebook'}
            type={'simple-line-icon'}
            color={PURPLE.A700}
            size={26}
          />
          <View style={styles.headerTextContainer}>
            <Text numberOfLines={1} style={styles.headerTitle   }>{subjectname}</Text>
            <Text numberOfLines={1} style={styles.headerSubtitle}>{modulename }</Text>
          </View>
        </View>
      </BlurViewWrapper>
    );
  };

  _renderFooter(){
    const { styles } = SubjectModal;

    return(
      <BlurViewWrapper
        wrapperStyle={styles.footerWrapper}
        containerStyle={styles.footerContainer}
        intensity={100}
        tint={'default'}
      >
        <ModalBottomTwoButton
          leftText={'Start'}
          rightText={'Cancel'}
          onPressLeft={this._handleOnPressStart}
          onPressRight={this._handleOnPressCancel}
        />
      </BlurViewWrapper>
    );
  };

  _renderListFooter = () => {
    const { styles } = SubjectModal;
    return(
      <View style={styles.listFooterContainer}>
        <IconFooter 
          hide={false}
          delay={3000}
        />
      </View>
    );
  };

  _renderContent(){
    const { styles } = SubjectModal;
    const { headerHeight, moduleData, subjectData } = this.state;
    if(headerHeight == -1) return null;

    const PlatformProps = {
      ...Platform.select({
        ios: {
          contentInset :{top: headerHeight},
          contentOffset:{x: 0, y: -headerHeight},
        },
      }),
    };

    return(
      <ScrollView
        style={styles.scrollview}
        stickyHeaderIndices={[0,2,4]}
        onEndReached={this._handleOnEndReached}
        {...PlatformProps}
      >
        <StickyHeader
          title={'Subject Details'}
          subtitle={'Information about the current subject.'}
          iconContainer={sharedStyles.iconContainer}
          iconName={'file-text'}
          iconType={'feather'}
          iconContainer={sharedStyles.iconContainer}
        />
        <SubjectDetails
          containerStyle={styles.sectionContainer}
          {...{subjectData}}
        />
        <StickyHeader
          title={'Previous Session'}
          subtitle={'Praesent commodo cursus magna, vel sceler'}
          iconContainer={sharedStyles.iconContainer}
          iconName={'clock'}
          iconType={'feather'}
        />
        <PreviousSession
          containerStyle={styles.sectionContainer}          
        />
        <StickyHeader
          title={'Grades'}
          subtitle ={'Previous grades'}
          iconContainer={sharedStyles.iconContainer}
          iconName={'bar-chart'}
          iconType={'feather'}
        />
        <Grades
          containerStyle={styles.sectionContainer}          
        />
        {this._renderListFooter()}
      </ScrollView>
    );
  };

  _renderPlatform(){
    const { mountContent } = this.state;
    return Platform.select({
      ios: (
        <Fragment>
          {mountContent && this._renderContent()}
          {mountContent && this._renderHeader ()}
          {mountContent && this._renderFooter ()}
        </Fragment>
      ),
      android: (
        <Fragment>
          {mountContent && this._renderHeader ()}
          {mountContent && this._renderContent()}
          {mountContent && this._renderFooter ()}
        </Fragment>
      ),
    });
  };

  render(){
    const { styles } = SubjectModal;

    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <ModalBackground style={styles.container}>
          {this._renderPlatform()}
        </ModalBackground>
      </SwipableModal>
    );
  };
};