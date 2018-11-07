import React, { Component, Fragment } from 'react';
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import PropTypes from 'prop-types';

import Animated from 'react-native-reanimated';
import { BlurView } from 'expo';

import   Interactable                   from './Interactable';
import { AnimatedCollapsable          } from './Buttons';
import { IconText                     } from '../components/Views';
import { IconButton                   } from '../components/Buttons';
import { SubjectItem, ModuleItemModel } from '../functions/ModuleStore';
import { timeout, setStateAsync       } from '../functions/Utils';

import * as Animatable from 'react-native-animatable';
import NavigationService from '../NavigationService';

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

const MODAL_DISTANCE_FROM_TOP = 40;
const MODAL_EXTRA_HEIGHT = 100;

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
        hitSlop: { bottom: -(Screen.height + MODAL_EXTRA_HEIGHT - 50) }
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
    }
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
        />
      </Animatable.View>
    );
  }

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
  }
}

//transparent line on top of modal
export class ModalTopIndicator extends React.PureComponent {
  render(){
    return(
      <View style={{width: '100%', alignItems: 'center', paddingTop: 10, paddingBottom: 10}}>
        <View style={{width: 40, height: 8, borderRadius: 4, backgroundColor: '#00000040',}}/>
      </View>
    );
  }
}

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
}

//used in BoardExamScreen: shown when more info is pressed
export class BoardExamModalContent extends React.PureComponent {
  static styles = StyleSheet.create({
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

  constructor(props){
    super(props);
    this.imageIntro    = require('../../assets/icons/cloud-book.png');
    this.imageQuestion = require('../../assets/icons/qa.png');
    this.imageHands    = require('../../assets/icons/hands.png');
  }

  _renderIntroduction(){
    const { styles } = BoardExamModalContent;
    return(
      <View style={{alignItems: 'center'}}>
        <Animatable.Image
          source={this.imageIntro}
          style={{width: 90, height: 90, marginTop: 15}}
          animation={'pulse'}
          iterationCount={"infinite"}
          duration={5000}
          easing={'ease-in-out'}
          useNativeDriver={true}
        />
        <Text style={styles.bigTitle}>{'What is Preboard?'}</Text>
        <IconText
          containerStyle={{marginTop: 10}}
          textStyle={styles.smallTitle}
          iconSize ={28}
          text={'About'}
          iconColor='rgba(0, 0, 0, 0.5)'
          iconName ='ios-information-circle'
          iconType ='ionicon'
        />
        <Text style={styles.body}>
          {"Preboard Exam is an online mock exam that is updated yearly to asess the information you have learned whether its from the app's modules, practice quizes or the material discussed in class. The goal of this mock exam is to make sure you're prepared for the real thing and help you attain a passing score!"}
        </Text>
      </View>
    );
  }

  _renderQuestion(){
    const { styles } = BoardExamModalContent;
    return(
      <View style={{alignItems: 'center'}}>
        <Animatable.Image
          source={this.imageQuestion}
          style={{width: 90, height: 90, marginTop: 5}}
          animation={'pulse'}
          iterationCount={"infinite"}
          duration={5000}
          easing={'ease-in-out'}
          useNativeDriver={true}
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
  }

  _renderExplantion(){
    const { styles } = BoardExamModalContent;
    return(
      <View style={{alignItems: 'center', marginTop: 25}}>
        <Animatable.Image
          source={this.imageHands}
          style={{width: 90, height: 90}}
          animation={'pulse'}
          iterationCount={"infinite"}
          duration={5000}
          easing={'ease-in-out'}
          useNativeDriver={true}
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
  }

  _renderBody(){
    return(
      <ScrollView 
        style={{paddingTop: 5, borderTopColor: 'rgba(0, 0, 0, 0.2)', borderTopWidth: 1, padding: 15}} nestedScrollEnabled={true}
        ref={r => this._scrollView = r}
      >
        {this._renderIntroduction()}
        {this._renderQuestion()}
        {this._renderExplantion()}
        <View style={{marginBottom: 250}}/>
      </ScrollView>
    );
  }

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
  }
}

//used in homescreen: when a subject is pressed in module list
export class SubjectModal extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      moduleData  : null,
      subjectData : null,
      mountContent: false,
    };

    this.modalClosedCallback = null;
    this.modalOpenedCallback = null;
  };

  static styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: Platform.select({
        ios    : 'transparent',
        android: 'white',
      }),
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
    }
  });

  openSubjectModal = (moduleData, subjectData) => {
    this.setState({moduleData, subjectData, mountContent: true});
    this._modal.showModal();
  }

  closeSubjectModal = () => {
    this._modal.showModal();
  }

  _handleOnModalShow = () => {
    //call callbacks if defined
    this.modalOpenedCallback && this.modalOpenedCallback();
  }

  _handleOnModalHide = () => {
    //call callbacks if defined
    this.modalClosedCallback && this.modalClosedCallback();
  }

  _handleOnPressStart = () => {
    const { moduleData, subjectData } = this.state;
    NavigationService.navigateApp('PracticeExamRoute', {
      moduleData, subjectData,
    });
  }

  _handleOnPressClose = () => {
    this._modal.hideModal();
  }

  _renderTitle(){
    const { subjectData, moduleData } = this.state;
    
    //wrap data into helper object for easier access
    const subject = new SubjectItem    (subjectData).get();
    const module  = new ModuleItemModel(moduleData ).get();

    return(
      <IconText
        containerStyle={{marginRight: 20}}
        textStyle={{fontSize: 20, fontWeight: 'bold'}}
        subtitleStyle={{fontWeight: '200', fontSize: 16}}
        text     ={subject.subjectname}
        subtitle ={module .modulename }
        iconName ={'notebook'}
        iconType ={'simple-line-icon'}
        iconColor={'rgba(0, 0, 0, 0.6)'}
        iconSize ={26}
      />
    );
  }

  _renderDescription(){
    const { subjectData } = this.state;
    //wrap data into helper object for easier access
    const subject = new SubjectItem(subjectData).get();
    //title comp for collapsable
    const descriptionTitle = <IconText
      //icon
      iconName={'info'}
      iconType={'feather'}
      iconColor={'grey'}
      iconSize={26}
      //title
      text={'Description'}
      textStyle={{fontSize: 24, fontWeight: '800'}}
    />
    return(
      <View style={{overflow: 'hidden', marginTop: 15}}>
        <AnimatedCollapsable
          extraAnimation={false}
          text={subject.description}
          maxChar={400}
          collapsedNumberOfLines={6}
          titleComponent={descriptionTitle}
          style={{fontSize: 18, textAlign: 'justify'}}
        />
      </View>
    );
  }

  _renderDetails(){
    const { subjectData } = this.state;
    //wrap data into helper object for easier access
    const subject = new SubjectItem(subjectData).get();

    const titleStyle = {
      fontSize: 18,
      fontWeight: '500'
    };
    const subtitleStyle = {
      fontSize: 24,
      fontWeight: '200'
    };

    return(
      <Fragment>
        <IconText
          //icon
          iconName={'file-text'}
          iconType={'feather'}
          iconColor={'grey'}
          iconSize={26}
          //title
          text={'Subject Details'}
          textStyle={{fontSize: 24, fontWeight: '800'}}
        />
        <View style={{flexDirection: 'row', marginTop: 3}}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={titleStyle   }>{'Questions: '}</Text>
            <Text numberOfLines={1} style={subtitleStyle}>{subject.questions.length + ' items'}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={titleStyle   }>{'Updated: '}</Text>
            <Text numberOfLines={1} style={subtitleStyle}>{subject.lastupdated}</Text>
          </View>
        </View>
      </Fragment>
    );
  }

  _renderGrades(){
    return(
      <Fragment>
        <IconText
          //icon
          iconName={'bar-chart'}
          iconType={'feather'}
          iconColor={'grey'}
          iconSize={26}
          //title
          text={'Grades'}
          textStyle={{fontSize: 24, fontWeight: '800'}}
          //subtitle
          subtitleStyle={{fontWeight: '200', fontSize: 16}}
          subtitle ={'Previous grades'}
        />
      </Fragment>
    );
  }

  _renderButtons(){
    const { styles } = SubjectModal;
    const borderRadius = 10;
    //shared props
    const buttonProps = {
      iconSize: 22,
      iconColor: 'white',
      textStyle: styles.buttonText,
    }
    
    return(
      <View style={styles.buttonsContainer}>
        <IconButton
          text={'Start'}
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
  }

  _renderContent(){
    const Separator = (props) =>  <View style={{alignSelf: 'center', width: '80%', height: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', margin: 15}} {...props}/>
    return(
      <Fragment>
        <ModalTopIndicator/>
        <ScrollView style={{flex: 1, padding: 10, borderTopColor: 'rgba(0, 0, 0, 0.1)', borderTopWidth: 1}}>
          {this._renderTitle()}
          {this._renderDescription()}
          <Separator/>
          {this._renderDetails()}
          <Separator/>
          {this._renderGrades()}
          <View style={{marginBottom: 50}}/>
        </ScrollView>
        {this._renderButtons()}
      </Fragment>
    );
  }

  render(){
    const paddingBottom = MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP;
    const { styles } = SubjectModal;
    const { mountContent } = this.state;

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
  }
}

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