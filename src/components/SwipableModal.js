import React, { Component, Fragment } from 'react';
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, ScrollView, Platform, Alert, LayoutAnimation, UIManager, SectionList, SafeAreaView, StatusBar } from 'react-native';
import PropTypes from 'prop-types';

import Animated, { Easing } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import   Interactable                   from './Interactable';
import { AnimatedCollapsable          } from './Buttons';
import { IconText, AnimateInView      } from '../components/Views';
import { IconButton                   } from '../components/Buttons';
import { ModuleItemModel, SubjectItem } from '../models/ModuleModels';
import { timeout, setStateAsync       } from '../functions/Utils';

import * as Animatable from 'react-native-animatable';

import NavigationService from '../NavigationService';
import IncompletePracticeExamStore, { IncompletePracticeExamModel } from '../functions/IncompletePracticeExamStore';
import TimeAgo from 'react-native-timeago';
import { Icon, Divider } from 'react-native-elements';
import { ROUTES } from '../Constants';
import {PURPLE} from '../Colors';
import { isIphoneX, ifIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper';

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

const SPACING = 20;
export const MODAL_DISTANCE_FROM_TOP = Platform.select({
  ios: isIphoneX()? (getStatusBarHeight() + SPACING) : (20 + SPACING),
  android: StatusBar.currentHeight + SPACING,
});

export const MODAL_EXTRA_HEIGHT = 300;


export class ModalBackground extends React.PureComponent {
  static propTypes = {
    showBG: PropTypes.bool,
  };

  static defaultProps = {
    showBG: Platform.OS == 'android',
  };

  static styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: Platform.select({
        ios    : 'transparent',
        android: 'rgb(220, 220, 220)',
      }),
    },
    backgroundImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
      ...Platform.select({
        ios: {
          opacity: 0.05,
        },
      })
    }
  });

  static background = Platform.select({
    ios    : require('../../assets/patternBG.png'),
    android: require('../../assets/patternBG.jpg'),
  });

  _renderIOS(){
    const { styles } = ModalBackground;
    const { style, children, ...otherProps } = this.props;

    return(
      <BlurView 
        style={[styles.container, style]} 
        intensity={100} 
        tint={'light'}
        {...otherProps}
      >
        {this._renderBG()}
        <SafeAreaView style={{flex: 1}}>
          {children}
        </SafeAreaView>
      </BlurView>
    );
  };

  _renderBG(){
    const { styles } = ModalBackground;
    const { showBG } = this.props;
    if(!showBG) return null;

    return(
      <Image
        source={ModalBackground.background}
        style={styles.backgroundImage}
      />
    );
  };

  _renderAndroid(){
    const { styles } = ModalBackground;
    const { style, children, ...otherProps } = this.props;
    return(
      <View 
        style={[styles.container, style]} 
        {...otherProps}
      >
        {this._renderBG()}
        {children}
      </View>
    );
  };

  render(){
    return Platform.select({
      ios    : this._renderIOS    (),
      android: this._renderAndroid(),
    });
  };
};

export class SwipableModal extends React.PureComponent {
  static snapPoints = {
    fullscreen: { y: MODAL_DISTANCE_FROM_TOP },
    halfscreen: { y: Screen.height - (Screen.height * 0.6) },
    hidden    : { y: Screen.height }
  };
  
  static propTypes = {
    onModalShow: PropTypes.func,
    onModalHide: PropTypes.func,
    snapPoints: PropTypes.arrayOf(PropTypes.shape({
      //y: distance from top
      y: PropTypes.number,
    })),
  };

  static defaultProps = {
    snapPoints: [
      { y: MODAL_DISTANCE_FROM_TOP }, //full screen
      { y: Screen.height * 1       }, //hidden
    ],
    hitSlop: {
      bottom: -(Screen.height + MODAL_EXTRA_HEIGHT - 80)
    },
  };

  static styles = StyleSheet.create({
    float: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    wrapper: {
      position: 'absolute', 
      width: '100%', 
      height: '100%'
    },
    panelContainer: {
      height: Screen.height + MODAL_EXTRA_HEIGHT,
      shadowOffset: { width: -5, height: 0 },
      shadowRadius: 5,
      shadowOpacity: 0.4,
    },
    panel: {
      flex: 1,
      overflow: 'hidden',
    },
  });

  constructor(props) {
    super(props);

    this._deltaY = new Animated.Value(Screen.height - 100);
    this.stopCallback = null;

    this.state = {
      mountModal: false,
      visible: false,
    };
  };

  showModal = async () => {
    const { mountModal } = this.state;
    if(!mountModal){
      await setStateAsync(this, {mountModal: true});

      this._interactable.snapTo({index: 0});
      //wait for modal to finish animation
      await new Promise(resolve => this.stopCallback = resolve);
      //reset stop callback
      this.stopCallback = null; 

      this.setState({visible: true});
    };
  };

  hideModal = async () => {
    const { mountModal } = this.state;
    if(mountModal){
      await Promise.all([
        this.rootContainer.bounceOutDown(750),
        this.modalShadow.fadeOut(750)
      ]);

      /**
      this._interactable.snapTo({index: 1});  
      await new Promise(resolve => {
        this.stopCallback = resolve;
      });
      */
      
      this.stopCallback = null;  
      await setStateAsync(this, {
        mountModal: false,
        visible: false,
      });
    };
  };

  //called when modal is visible
  onModalShow = () => {
    const { onModalShow } = this.props;
    onModalShow && onModalShow();
  };
  
  //called when modal is hidden
  onModalHide = () => {
    const { onModalHide } = this.props;
    onModalHide && onModalHide();
  };

  _handleOnStop = () => {
    const callback = this.stopCallback;
    callback && callback();
  };

  _handleOnSnap = async ({nativeEvent}) => {
    const { index, x , y } = nativeEvent;
    const isHidden = y >= Screen.height;

    if(isHidden){
      await this.rootContainer.fadeOut(500);      
      //unmount modal when hidden
      await setStateAsync(this, {mountModal: false});
      this.onModalHide();
    };

    //call callback in props
    const { onSnap } = this.props;
    onSnap && onSnap(nativeEvent, {isHidden});
  };

  _handleOnPressShadow = () => {
    const { visible } = this.state;
    visible && this.hideModal();
  };

  _renderShadow = () => {
    const { styles } = SwipableModal;
    const deltaY = this._deltaY;

    const finalPosition = (Screen.height - MODAL_DISTANCE_FROM_TOP);
    const shadowOpacity = Platform.select({
      ios: 0.5, android: 0.75,
    });

    //shadow behind panel
    const shadowStyle = {
      backgroundColor: 'black',
      opacity: deltaY.interpolate({
        inputRange : [0, finalPosition],
        outputRange: [shadowOpacity, 0],
        extrapolate: 'clamp',
      }),
      ...Platform.select({
        ios: {
          transform: [
            {translateY: Animated.sub(deltaY, (Screen.height - 15))},
          ],
        }
      })
    };

    return(
      <Animatable.View
        ref={r => this.modalShadow = r}
        style={styles.float}
        animation={'fadeIn'}
        duration={1000}
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

  _renderInteractable(){
    const { styles } = SwipableModal;
    const { snapPoints, hitSlop } = this.props;

    const modalHeight = Screen.height - MODAL_DISTANCE_FROM_TOP;
    const finalRadius = ifIphoneX(30, 22);

    const panelStyle = {
      borderTopLeftRadius: this._deltaY.interpolate({
        inputRange: [0, modalHeight],
        outputRange: [finalRadius, 0],
        extrapolateRight: 'clamp',
      }),
      borderTopRightRadius: this._deltaY.interpolate({
        inputRange: [0, modalHeight],
        outputRange: [finalRadius, 0],
        extrapolateRight: 'clamp',
      }),
    };

    return(
      <Interactable.View
        ref={r => this._interactable = r}
        style={styles.panelContainer}
        verticalOnly={true}
        boundaries={{ top: MODAL_DISTANCE_FROM_TOP - 20 }}
        initialPosition={snapPoints[1]}
        animatedValueY={this._deltaY}
        onSnap={this._handleOnSnap}
        onStop={this._handleOnStop}
        {...{snapPoints, hitSlop}}
      >
        <Animated.View style={[styles.panel, panelStyle]}>
          {this.props.children}
        </Animated.View>
      </Interactable.View>
    );
  };

  render(){
    const { styles } = SwipableModal;
    const { mountModal } = this.state;
    if(!mountModal) return null;

    return (
      <View style={styles.float}>
        {this._renderShadow()}
        <Animatable.View
          ref={r => this.rootContainer = r}
          style={styles.wrapper}
          useNativeDriver={true}
          pointerEvents={'box-none'}
        >
          {this._renderInteractable()}
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
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
        },
        android: {
          backgroundColor: PURPLE[200],
        }
      })
    }
  });

  render(){
    const { styles } = ModalTopIndicator;
    
    return(
      <Animatable.View 
        style={styles.container}
        animation={'pulse'}
        duration={3000}
        iterationCount={'infinite'}
        iterationDelay={3000}
        useNativeDriver={true}
      >
        <View style={styles.indicator}/>
      </Animatable.View>
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



export class SearchTipsModal extends React.PureComponent {

};

export class SearchResourcesModal extends React.PureComponent {

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
  textTitle: {
    fontSize: 30, fontWeight: '700', alignSelf: 'center', marginBottom: 2, color: 'rgba(0, 0, 0, 0.75)'
  },
  textBody: {
    textAlign: 'justify', fontSize: 20, fontWeight: '300'
  }
});