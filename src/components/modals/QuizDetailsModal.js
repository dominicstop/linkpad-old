import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, SectionList, Animated, TextInput } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../../Constants';
import { PURPLE } from '../../Colors';

import { plural , setStateAsync, timeout } from '../../functions/Utils';
import { SubjectItem, ModuleItemModel, ModuleStore } from '../../functions/ModuleStore';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../SwipableModal';
import { IconText, AnimateInView } from '../../components/Views';

import { BlurView, LinearGradient, DangerZone } from 'expo';
import { Icon, Divider } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import {  } from 'react-native-paper';

class FormTitle extends React.PureComponent {
  static styles = StyleSheet.create({
    iconInputWrapper: {
      marginTop: 5,
      marginHorizontal: 10,
    },
    iconInputContainer: {
      flexDirection: 'row', 
      margin: 12
    },
    borderInactive: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      borderColor: PURPLE[200],
      borderWidth: 1,
      borderRadius: 10,
    },
    borderActive: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      borderColor: PURPLE[600],
      borderWidth: 2,
      borderRadius: 10,
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
    }
  });

  constructor(props){
    super(props);
    this.state = {
      text: '',
    };
  };

  getText = () => {
    const { text } = this.state;
    return text;
  };

  _handleOnFocus = () => {
    this.activeBorder.transitionTo({opacity: 1}, 500);
    this.icon.transitionTo({opacity: 1}, 500);
  };

  _handleOnBlur = () => {
    this.activeBorder.transitionTo({opacity: 0}, 500);
    this.icon.transitionTo({opacity: 0.3}, 500);
  };

  _renderLabel(){
    const { styles } = FormTitle;

    return(
      <Text style={styles.title}>Quiz Title</Text>
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

    return(
      <TextInput
        style={styles.input}
        placeholder={'Custom Quiz Title'}
        multiline={false}
        underlineColorAndroid={'transparent'}
        onFocus={this._handleOnFocus}
        onBlur={this._handleOnBlur}
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
    }
  });

  _renderTitle(){
    const { styles } = ModalContents;

    return(
      <IconText
        containerStyle={styles.titleContainer}
        textStyle={styles.title}
        subtitleStyle={styles.subtitle}
        text={'Custom Quiz Details'}
        subtitle ={'Give your quiz a title and description.'}
        iconName={'notebook'}
        iconType={'simple-line-icon'}
        iconColor={'#512DA8'}
        iconSize={26}
      />
    );
  };

  _renderForms(){
    const { styles } = ModalContents;

    return(
      <View style={styles.body}>
        <FormTitle/>
      </View>
    );
  };

  _renderFinishButton(){
    return(
      null
    );
  };

  render(){
    return(
      <View style={{flex: 1}}>
        <ModalTopIndicator/>
        {this._renderTitle()}
        {this._renderForms()}
        {this._renderFinishButton()}
      </View>
    );
  };
};

export class QuizDetailsModal extends React.PureComponent {
  constructor(props){
    super(props);

    this.state = {
      mountContent: false,
    };

    //called when add subject is pressed
    this.onPressAddSubject = null;
  };

  openModal = async (selected) => {
    this.setState({mountContent: true});
    this._modal.showModal();
  };

  _handleOnModalShow = () => {
  };

  _handleOnModalHide = () => {
    this.setState({mountContent: false});
  };

  _renderContent(){
    return(
      <ModalContents/>
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
        <ModalBackground style={{paddingBottom}}>
          {mountContent && this._renderContent()}
        </ModalBackground>
      </SwipableModal>
    );
  };
};