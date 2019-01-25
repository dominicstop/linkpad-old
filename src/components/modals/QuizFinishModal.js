import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, SectionList, Animated, TextInput, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../../Constants';
import { PURPLE } from '../../Colors';

import { plural , setStateAsync, timeout, isEmpty } from '../../functions/Utils';
import { SubjectItem, ModuleItemModel, ModuleStore } from '../../functions/ModuleStore';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../SwipableModal';
import { IconText, AnimateInView } from '../../components/Views';
import { PlatformTouchableIconButton } from '../../components/Buttons';

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

class ModalContents extends React.PureComponent {
  render(){
    return null;
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
    //wait to finish
    await Promise.all([
      //show overlay
      this.overlay.transitionTo({opacity: 0.4}, 500),
      //show check animation
      this.animatedCheck.start(),
    ]);
  };

  _renderOverlay(){
    const { styles } = QuizFinishModal;
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
    const {title, description, selected} = this.state;
    return(
      <ModalContents 
        onPressCreateQuiz={this._handleOnPressCreateQuiz}
        {...{title, description}}
      />
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
};