import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, ScrollView } from 'react-native';
import PropTypes from 'prop-types';

import Animated from 'react-native-reanimated';
import { BlurView } from 'expo';

import Interactable from './Interactable';
import { IconText } from '../components/Views';
import { timeout } from '../functions/Utils';

import * as Animatable      from 'react-native-animatable'   ;

const Screen = {
  width : Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
};

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
      { y: 40 },
      //hidden
      { y: Screen.height * 1.2 },
      //half screen
      { y: Screen.height - (Screen.height * 0.6) },
    ]
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
    if(!mountModal){
      await this._rootView.bounceOutDown(1000);
      this.setState({mountModal: true});
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
        outputRange: [0.75, 0],
        extrapolateRight: 'clamp',
      }),
    };

    return(
      <Animatable.View
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
    const { snapPoints } = this.props;
    if(!this.state.mountModal) return null;
    return (
      <View style={styles.float}>
        {this._renderShadow()}
        <Animatable.View
          ref={r => this._rootView = r}
          style={{position: 'absolute', width: '100%', height: '100%'}}
          animation={'bounceInUp'}
          duration={1000}
          pointerEvents={'box-none'}
        >
          <Interactable.View
            verticalOnly={true}
            boundaries={{ top: -300 }}
            initialPosition={snapPoints[2]}
            animatedValueY={this._deltaY}
            ref={r => this._interactable = r}
            onSnap={this._handleOnSnap}
            {...{snapPoints}}
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

//used in welcome screen: wrap with SwipableModal
export class WelcomeScreenModalContent extends React.PureComponent {
  _renderTop(){
    return(
      <View style={{width: '100%', alignItems: 'center', paddingVertical: 15}}>
        <View style={{width: 40, height: 8, borderRadius: 4, backgroundColor: '#00000040',}}/>
      </View>
    );
  }

  _renderBody(){
    return(
      <ScrollView style={{paddingTop: 5, paddingHorizontal: 15, marginBottom: 250}} contentContainerStyle={{paddingBottom: 100}}>
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
          {this._renderTop ()}
          {this._renderBody()}
        </View>
      </BlurView>
    );
  }
}

export class SubjectModal extends React.PureComponent {
  constructor(props){
    super(props);
    this.modalClosedCallback = null;
    this.modalOpenedCallback = null;
  }

  openSubjectModal = () => {
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

  render(){
    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <BlurView style={{flex: 1}} intensity={100}>
          <View style={{flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>

          </View>
        </BlurView>
      </SwipableModal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#efefef',
    overflow: 'hidden',
  },
  float: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  panelContainer: {
    height: Screen.height + 300,
    shadowOffset: { width: -5, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
  },
  panel: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    overflow: 'hidden'
  },
  textTitle: {
    fontSize: 30, fontWeight: '700', alignSelf: 'center', marginBottom: 2, color: 'rgba(0, 0, 0, 0.75)'
  },
  textBody: {
    textAlign: 'justify', fontSize: 20, fontWeight: '300'
  }
});