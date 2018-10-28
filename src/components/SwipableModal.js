import React, { Component, Fragment } from 'react';
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, ScrollView } from 'react-native';
import PropTypes from 'prop-types';

import Animated from 'react-native-reanimated';
import { BlurView } from 'expo';

import   Interactable              from './Interactable';
import { AnimatedCollapsable     } from './Buttons';
import { IconText                } from '../components/Views';
import { IconButton              } from '../components/Buttons';
import { SubjectItem, ModuleItem } from '../functions/ModuleStore';
import { timeout                 } from '../functions/Utils';

import * as Animatable      from 'react-native-animatable'   ;

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
    const { snapPoints } = this.props;
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

//transparent line on top of modal
export class ModalTopIndicator extends React.PureComponent {
  render(){
    return(
      <View style={{width: '100%', alignItems: 'center', paddingVertical: 15}}>
        <View style={{width: 40, height: 8, borderRadius: 4, backgroundColor: '#00000040',}}/>
      </View>
    );
  }
}

//used in welcome screen: wrap with SwipableModal
export class WelcomeScreenModalContent extends React.PureComponent {
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
          <ModalTopIndicator/>
          {this._renderBody()}
        </View>
      </BlurView>
    );
  }
}

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
  }

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

  _handleOnPressClose = () => {
    this._modal.hideModal();
  }

  _renderTitle(){
    const { subjectData, moduleData } = this.state;
    //wrap data into helper object for easier access
    const subject = new SubjectItem(subjectData).get();
    const module  = new ModuleItem (moduleData ).get();

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
    const borderRadius = 10;
    //button text style
    const textStyle = {
      flex: 0,
      color: 'white',
      fontSize: 17,
      textDecorationLine: 'underline'
    }
    //shared props
    const buttonProps = {
      iconSize: 22,
      iconColor: 'white',
      textStyle,
    }
    //shared container style
    const buttonStyle = {
      flex: 1,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
    };
    
    return(
      <View style={{flexDirection: 'row', height: 80, padding: 10, paddingVertical: 15, borderTopColor: 'rgba(0, 0, 0, 0.2)', borderTopWidth: 1, shadowOffset:{  width: 2,  height: 3,  }, shadowColor: 'black', shadowRadius: 3, shadowOpacity: 0.5 }}>
        <IconButton
          text={'Start'}
          containerStyle={[buttonStyle, {borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius, backgroundColor: '#6200EA'}]}
          iconName={'pencil-square-o'}
          iconType={'font-awesome'}
          onPress={this._handleOnPressStart}
          textStyle={{}}
          {...buttonProps}
        />
        <IconButton
          text={'Cancel'}
          containerStyle={[buttonStyle, {borderTopRightRadius: borderRadius, borderBottomRightRadius: borderRadius, backgroundColor: '#C62828'}]}
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
        </ScrollView>
        {this._renderButtons()}
      </Fragment>
    );
  }

  render(){
    const paddingBottom = MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP;
    const { mountContent } = this.state;
    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <BlurView style={{flex: 1}} intensity={100}>
          <View style={{flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', paddingBottom}}>
            {mountContent && this._renderContent()}
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