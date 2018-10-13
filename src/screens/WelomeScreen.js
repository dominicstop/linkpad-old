import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Image, Platform, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

import * as Animatable from 'react-native-animatable';
import Swiper from 'react-native-swiper';
import {  NavigationEvents } from 'react-navigation';
import { Divider } from 'react-native-elements';

import { DangerZone } from 'expo';
let { Lottie } = DangerZone;

export class AnimatedView extends React.PureComponent {
  static propTypes = {
    animation: PropTypes.string,
    easing: PropTypes.string,
    duration: PropTypes.number,
    difference: PropTypes.number,
  }

  static defaultProps = {
    animation: 'fadeInUp',
    easing: 'ease-in-out',
    duration: 1000,
    difference: 250,
  }

  render(){
    const { animation, duration, difference, ...otherProps } = this.props;
    return this.props.children.map((child, index) => {
      return(
        <Animatable.View
          key={'animatedView-' + index}
          duration={duration + (index * difference)}
          useNativeDriver={true}
          {...{animation, ...otherProps}}
        >
          {child}
        </Animatable.View>
      );
    });
  }
}

export class Slide extends React.PureComponent {
  static propTypes = {
    slideNumber: PropTypes.number,
    currentSlideIndex: PropTypes.number,
  }

  constructor(props){
    super(props);
    this.state = {
      isFocused: false,
      shouldRender: false,
    }
  }

  componentDidMount(){

  }

  componentDidUpdate(prevProps, prevState){
    const { currentSlideIndex, slideNumber } = this.props;
    const { shouldRender } = this.state;

    const didChanged = prevProps.currentSlideIndex != currentSlideIndex;
    const isFocused  = currentSlideIndex == slideNumber;

    if(isFocused && !shouldRender){
      this.setState({shouldRender: true, ...{isFocused}});
    
    } else if(isFocused && !prevState.isFocused){
      this.setState({...{isFocused}});

    }
  }

  render(){
    const { shouldRender, isFocused, ...otherProps } = this.state;
    const { slideNumber } = this.props;
    const childProps = {
      ...{isFocused, shouldRender, slideNumber},
      ...otherProps
    };

    return( shouldRender? React.cloneElement(this.props.children, childProps) : null );
  }
}

export class TitleSlide extends React.PureComponent {
  constructor(props){
    super(props);
    this.circleSize = 100;
    this.circleStyle = { width: this.circleSize, height: this.circleSize, borderRadius: this.circleSize/2};
  }

  _renderIcon(){
    const containerStyle = Platform.select({
      //float on android, column in ios
      ios    : { position: 'relative' },
      android: { position:'absolute', height: this.circleSize * 2 }
    });

    return(
      <Animatable.View
        style={[containerStyle]}
        animation="pulse" 
        easing="ease-out" 
        iterationCount="infinite"
        delay={1000}
        duration={8000}
        useNativeDriver={true}
      >
        <Animatable.View
          style={[{backgroundColor: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 6, marginBottom: 10}, this.circleStyle]}
          animation={'fadeInUp'}
          duration={750}
          delay={750}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
        </Animatable.View>
      </Animatable.View>
    );
  }
  
  render(){
    //since the icon is floating on android, add margin
    const marginTop = Platform.select({ios: 5, android: this.circleSize});
    //nexted text in ios cannot use native animations
    const useNativeDriver = Platform.OS != 'ios';
    return(
      <Animatable.View 
        style={styles.slide}
        animation={'fadeIn'}
        delay={750}
        duration={4000}
        useNativeDriver={true}
      >
        {this._renderIcon()}
        <Animatable.Text
          style={[styles.textTitle, {...{marginTop}}]}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1000}
          delay={750}
          {...{useNativeDriver}}
        >
          {'Linkpad'}
        </Animatable.Text>
        <Animatable.Text 
          style={styles.textSubtitle}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1250}
          delay={750}
          {...{useNativeDriver}}
        >
          {'Pharmacy Review'}
        </Animatable.Text>
        <Animatable.View
          style={{width: '50%', height: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginTop: 20}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1750}
          delay={750}
          useNativeDriver={true}
        />
      </Animatable.View>
    );
  }
}

export class VisionSlide extends React.PureComponent {
  constructor(props){
    super(props);
    this.animationSource = require('../animations/eye.json');
    this.iconContainerSize = 100;
  }

  componentDidMount(){
    this.animation.play();
  }

  _renderIcon(){
    const iconSize = 450;
    const marginOffset = (iconSize - this.iconContainerSize) / 4 * -1;

    return(
      <View style={{width: this.iconContainerSize, height: this.iconContainerSize, borderRadius: this.iconContainerSize/2, overflow: 'hidden'}}>
        <Lottie
          ref={r => this.animation = r}
          style={{width: iconSize, height: iconSize, marginTop: marginOffset, marginLeft: marginOffset}}
          source={this.animationSource}
          autoPlay
          loop
        />
      </View>
    );
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    console.log(this.iconContainerSize );
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <View style={styles.slide}>
        <AnimatedView duration={750}>
          {this._renderIcon()}
          <Text style={[styles.textTitle, {marginTop: 20}]}>{'Our Vision'}</Text>
          <Text style={[styles.textBody]}>{'Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam.'}</Text>
          <View style={styles.line}/>
        </AnimatedView>
      </View>
    );
  }
}

export class GoalSlide extends React.PureComponent {
  constructor(props){
    super(props);
    this.animationSource = require('../animations/bar_chart.json');
    this.iconContainerSize = 100;
  }

  componentDidMount(){
    this.animation.play();
  }

  _renderIcon(){
    const iconSize = 450;
    const marginOffset = (iconSize - this.iconContainerSize) / 4 * -1;

    return(
      <View style={{width: this.iconContainerSize, height: this.iconContainerSize, borderRadius: this.iconContainerSize/2, overflow: 'hidden'}}>
        <Lottie
          ref={r => this.animation = r}
          style={{width: iconSize, height: iconSize, marginTop: marginOffset, marginLeft: marginOffset}}
          source={this.animationSource}
          autoPlay
          loop
        />
      </View>
    );
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <View style={styles.slide}>
        <AnimatedView duration={750}>
          {this._renderIcon()}
          <Text style={[styles.textTitle, {marginTop: 20}]}>{'Our Goal'}</Text>
          <Text style={[styles.textBody]}>{'Lorum Ipsum Morbi leo risus, porta ac consectetur ac, vestibulum at eros.'}</Text>
          <View style={styles.line}/>
        </AnimatedView>
      </View>
    );
  }
}

export class ImproveSlide extends React.PureComponent {
  constructor(props){
    super(props);
    this.animationSource = require('../animations/chart.json');
    this.iconContainerSize = 100;
  }

  componentDidMount(){
    this.animation.play();
  }

  _renderIcon(){
    const iconSize = 450;
    const marginOffset = (iconSize - this.iconContainerSize) / 4 * -1;

    return(
      <View style={{width: this.iconContainerSize, height: this.iconContainerSize, borderRadius: this.iconContainerSize/2, overflow: 'hidden'}}>
        <Lottie
          ref={r => this.animation = r}
          style={{width: iconSize, height: iconSize, marginTop: marginOffset, marginLeft: marginOffset, backgroundColor: 'white'}}
          source={this.animationSource}
          autoPlay
          loop
        />
      </View>
    );
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    console.log(this.iconContainerSize );
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <View style={styles.slide}>
        <AnimatedView duration={750}>
          {this._renderIcon()}
          <Text style={[styles.textTitle, {marginTop: 20}]}>{'Improve and Learn'}</Text>
          <Text style={[styles.textBody]}>{'Lorum Ipsum Morbi leo risus, porta ac consectetur ac, vestibulum at eros.'}</Text>
          <View style={styles.line}/>
        </AnimatedView>
      </View>
    );
  }
}

export class ContinueSlide extends React.PureComponent {
  static propTypes = {
    onPressContinue: PropTypes.func
  }

  constructor(props){
    super(props);
    this.animationSource = require('../animations/pencil.json');
    this.iconContainerSize = 100;
  }

  componentDidMount(){
    this.animation.play();
  }

  _handleOnPressContinue = async () => {
    const { onPressContinue } = this.props;
    //await this.rootView.fadeOutLeft(500);
    onPressContinue && onPressContinue();
  }

  _renderIcon(){
    const iconSize = 450;
    const marginOffset = (iconSize - this.iconContainerSize) / 4 * -1;

    return(
      <View style={{width: this.iconContainerSize, height: this.iconContainerSize, borderRadius: this.iconContainerSize/2, overflow: 'hidden'}}>
        <Lottie
          ref={r => this.animation = r}
          style={{width: iconSize, height: iconSize, marginTop: marginOffset, marginLeft: marginOffset, backgroundColor: 'white'}}
          source={this.animationSource}
          autoPlay
          loop
        />
      </View>
    );
  }

  _renderButton(){
    return(
      <TouchableOpacity
        style={{marginTop: 30, padding: 15, paddingHorizontal: 40, backgroundColor: 'rgba(1, 1, 1, 0.1)', borderColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 2, borderRadius: 15}}
        onPress={this._handleOnPressContinue}
      >
        <Text style={{fontSize: 20, fontWeight: '900', color: 'white'}}>Continue</Text>
      </TouchableOpacity>
    );
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    console.log(this.iconContainerSize);
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <View style={styles.slide}>
        <AnimatedView duration={750}>
          {this._renderIcon()}
          <Text style={[styles.textTitle, {marginTop: 20}]}>{'Your Account'}</Text>
          <Text style={[styles.textBody]}>{'Create an account or login to keep track of lorum ipsum sit amit dolor aspicing'}</Text>
          {this._renderButton()}
          <View style={styles.line}/>
        </AnimatedView>
      </View>
    );
  }
}

export default class WelcomeScreen extends React.Component { 
  constructor(props){
    super(props);
    this.state = {
      currentSlideIndex: 0,
    }
  }

  componentDidFocus = () => {
    this.rootView.fadeInLeft(500);
  }

  _handleOnIndexChanged = (index) => {
    this.setState({currentSlideIndex: index});
    console.log('index: ' + index);
  }

  _handleOnPressContinue = async () => {
    const { navigation } = this.props;
    await this.rootView.fadeOutLeft(500);
    navigation.navigate('LoginRoute');
  }

  _renderSwiper(){
    const { currentSlideIndex } = this.state;
    return(
      <Swiper 
        style={styles.wrapper}
        onIndexChanged={this._handleOnIndexChanged}
        dotColor={'rgba(255, 255, 255, 0.25)'}
        activeDotColor={'rgba(255, 255, 255, 0.5)'}
        loadMinimal={true}
        loadMinimalSize={2}
        bounces={true}
        loop={false}
      >
        <TitleSlide/>
        <Slide slideNumber={1} {...{currentSlideIndex}}>
          <VisionSlide/>
        </Slide>
        <Slide slideNumber={2} {...{currentSlideIndex}}>
          <GoalSlide/>
        </Slide>
        <Slide slideNumber={3} {...{currentSlideIndex}}>
          <ImproveSlide/>
        </Slide>
        <Slide slideNumber={4} {...{currentSlideIndex}}>
          <ContinueSlide onPressContinue={this._handleOnPressContinue}/>
        </Slide>
      </Swiper>
    );
  }

  render(){
    return(
      <Fragment>
        <NavigationEvents 
          onDidFocus={this.componentDidFocus}  
        />
        <Animatable.View 
          style={{flex: 1}}
          ref={r => this.rootView = r}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          {this._renderSwiper()}
        </Animatable.View>
      </Fragment>
    );
  }
}

const deviceWidth  = Dimensions.get('window').width;
const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  textTitle: Platform.select({
    ios: {
      fontSize: 28, 
      fontWeight: '900', 
      color: 'white', 
      marginTop: 15
    },
    android: {
      color: 'white',
      fontSize: 28,
      fontWeight: '900',
    }
  }),
  textSubtitle: Platform.select({
    ios: {
      fontSize: 26,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    android: {
      fontSize: 24,
      fontWeight: '100',
    },
  }),
  textBody: {
    fontSize: 24, 
    fontWeight: '300', 
    color: 'white', 
    marginTop: 15, 
    marginHorizontal: 10, 
    textAlign: 'center'
  },
  line: {
    width: deviceWidth * 0.5, 
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: 20
  }
});