import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, SectionList, Animated, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
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
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: PURPLE[300],
      borderWidth: 1,
      borderRadius: 10,
    },
    borderActive: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
      opacity: 0.85,
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

    return(
      <Animatable.Text 
        style={styles.title}
        ref={r => this.label = r}
        useNativeDriver={true}
      >
        {'Quiz Title'}
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

    return(
      <TextInput
        style={styles.input}
        placeholder={'Custom Quiz Title'}
        underlineColorAndroid={'transparent'}
        onFocus={this._handleOnFocus}
        onBlur={this._handleOnBlur}
        onChangeText={this._handleOnChangeText}
        multiline={false}
        autoCorrect={false}
        maxLength={100}
        value={this.state.text}
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
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: PURPLE[300],
      borderWidth: 1,
      borderRadius: 10,
    },
    borderActive: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
      opacity: 0.85,
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

    return(
      <Animatable.Text 
        style={styles.title}
        ref={r => this.label = r}
        useNativeDriver={true}
      >
        {'Quiz Description'}
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

    return(
      <TextInput
        style={[styles.input, {maxHeight: 100}]}
        placeholder={'Custom Quiz Description'}
        underlineColorAndroid={'transparent'}
        onFocus={this._handleOnFocus}
        onBlur={this._handleOnBlur}
        onChangeText={this._handleOnChangeText}
        numberOfLines={3}
        multiline={true}
        autoCorrect={false}
        maxLength={100}
        value={this.state.text}
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

  _handleOnPress = () => {
    //get text from forms
    const title = this.inputTitle.getText();
    const description = this.inputDescription.getText();

    //check if the text is empty
    const isTitleEmpty       = isEmpty(title);
    const isDescriptionEmpty = isEmpty(description);

    if(isTitleEmpty || isDescriptionEmpty){
      isTitleEmpty       && this.formTitleContainer      .shake(500);
      isDescriptionEmpty && this.formDescriptionContainer.shake(500);

    } else {
      const { onPressSaveChanges } = this.props;
      onPressSaveChanges && onPressSaveChanges({title, description});
    };
  };

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
        <Animatable.View
          ref={r => this.formTitleContainer = r}
          useNativeDriver={true}
        >
          <FormTitle ref={r => this.inputTitle = r}/>
        </Animatable.View>
        <Animatable.View
          ref={r => this.formDescriptionContainer = r}
          useNativeDriver={true}
        >
          <FormDescription ref={r => this.inputDescription = r}/>
        </Animatable.View>
      </View>
    );
  };

  _renderFinishButton(){
    const { styles } = ModalContents;

    return(
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={this._handleOnPress}
      >
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
          <Text style={styles.buttonText}>{'Save Changes'}</Text>
          <Icon
            name={'chevron-right'}
            type={'feather'}
            color={'white'}
            size={30}
          />
        </LinearGradient>
      </TouchableOpacity>
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
          <ModalTopIndicator/>
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
  constructor(props){
    super(props);

    this.state = {
      mountContent: false,
    };

    //called when save changes is pressed
    this.onPressSaveChanges = null;
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

  _handleOnPressSaveChanges = ({title, description}) => {
    if(this.onPressSaveChanges != null){
      this._modal.hideModal();
      this.onPressSaveChanges && this.onPressSaveChanges({title, description});
    };
  };

  _renderContent(){
    return(
      <ModalContents onPressSaveChanges={this._handleOnPressSaveChanges}/>
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