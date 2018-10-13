import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Image, Platform, ScrollView, Dimensions, TouchableOpacity } from 'react-native';


import { AnimatedGradient } from '../components/AnimatedGradient';

import * as Animatable from 'react-native-animatable';
import Swiper from 'react-native-swiper';
import { Divider } from 'react-native-elements';

import { DangerZone } from 'expo';
let { Lottie } = DangerZone;

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
        style={styles.slide1}
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
      <Animatable.View
        style={{width: this.iconContainerSize, height: this.iconContainerSize, borderRadius: this.iconContainerSize/2, overflow: 'hidden'}}
        animation={'fadeInUp'}
        easing={'ease-in-out'}
        duration={750}
        useNativeDriver={true}
      >
        <Lottie
          ref={r => this.animation = r}
          style={{width: iconSize, height: iconSize, marginTop: marginOffset, marginLeft: marginOffset}}
          source={this.animationSource}
          autoPlay
          loop
        />
      </Animatable.View>
    );
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    console.log(this.iconContainerSize );
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <Animatable.View 
        style={styles.slide1}
        useNativeDriver={true}
      >
        {this._renderIcon()}
        <Animatable.Text 
          style={{fontSize: 28, fontWeight: '900', color: 'white', marginTop: 15}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1000}
        >
          {'Our Vision'}
        </Animatable.Text>
        <Animatable.Text 
          style={{fontSize: 24, fontWeight: '300', color: 'white', marginTop: 15, marginHorizontal: 10, textAlign: 'center'}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1250}
        >
          {'Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam.'}
        </Animatable.Text>
        <Animatable.View
          style={{width: '50%', height: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginTop: 20}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1500}
          useNativeDriver={true}
        />
        
      </Animatable.View>
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
      <Animatable.View
        style={{width: this.iconContainerSize, height: this.iconContainerSize, borderRadius: this.iconContainerSize/2, overflow: 'hidden'}}
        animation={'fadeInUp'}
        easing={'ease-in-out'}
        duration={750}
        useNativeDriver={true}
      >
        <Lottie
          ref={r => this.animation = r}
          style={{width: iconSize, height: iconSize, marginTop: marginOffset, marginLeft: marginOffset}}
          source={this.animationSource}
          autoPlay
          loop
        />
      </Animatable.View>
    );
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    console.log(this.iconContainerSize );
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <Animatable.View 
        style={styles.slide1}
        useNativeDriver={true}
      >
        {this._renderIcon()}
        <Animatable.Text 
          style={{fontSize: 28, fontWeight: '900', color: 'white', marginTop: 15}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1000}
        >
          {'Our Goal'}
        </Animatable.Text>
        <Animatable.Text 
          style={{fontSize: 24, fontWeight: '300', color: 'white', marginTop: 15, marginHorizontal: 10, textAlign: 'center'}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1250}
        >
          {'Lorum Ipsum Morbi leo risus, porta ac consectetur ac, vestibulum at eros.'}
        </Animatable.Text>
        <Animatable.View
          style={{width: '50%', height: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginTop: 20}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1500}
          useNativeDriver={true}
        />
        
      </Animatable.View>
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
      <Animatable.View
        style={{width: this.iconContainerSize, height: this.iconContainerSize, borderRadius: this.iconContainerSize/2, overflow: 'hidden'}}
        animation={'fadeInUp'}
        easing={'ease-in-out'}
        duration={750}
        useNativeDriver={true}
      >
        <Lottie
          ref={r => this.animation = r}
          style={{width: iconSize, height: iconSize, marginTop: marginOffset, marginLeft: marginOffset, backgroundColor: 'white'}}
          source={this.animationSource}
          autoPlay
          loop
        />
      </Animatable.View>
    );
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    console.log(this.iconContainerSize );
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <Animatable.View 
        style={styles.slide1}
        useNativeDriver={true}
      >
        {this._renderIcon()}
        <Animatable.Text 
          style={{fontSize: 28, fontWeight: '900', color: 'white', marginTop: 15}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1000}
        >
          {'Improve and Learn'}
        </Animatable.Text>
        <Animatable.Text 
          style={{fontSize: 24, fontWeight: '300', color: 'white', marginTop: 15, marginHorizontal: 10, textAlign: 'center'}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1250}
        >
          {'Lorum Ipsum Morbi leo risus, porta ac consectetur ac, vestibulum at eros.'}
        </Animatable.Text>
        <Animatable.View
          style={{width: '50%', height: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginTop: 20}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1500}
          useNativeDriver={true}
        />
        
      </Animatable.View>
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
    await this.rootView.fadeOutLeft(500);
    onPressContinue && onPressContinue();
  }

  _renderIcon(){
    const iconSize = 450;
    const marginOffset = (iconSize - this.iconContainerSize) / 4 * -1;

    return(
      <Animatable.View
        style={{width: this.iconContainerSize, height: this.iconContainerSize, borderRadius: this.iconContainerSize/2, overflow: 'hidden'}}
        animation={'fadeInUp'}
        easing={'ease-in-out'}
        duration={750}
        useNativeDriver={true}
      >
        <Lottie
          ref={r => this.animation = r}
          style={{width: iconSize, height: iconSize, marginTop: marginOffset, marginLeft: marginOffset, backgroundColor: 'white'}}
          source={this.animationSource}
          autoPlay
          loop
        />
      </Animatable.View>
    );
  }

  _renderButton(){
    return(
      <Animatable.View
        style={{marginTop: 30, marginBottom: 15}}
        animation={'fadeInUp'}
        easing={'ease-in-out'}
        duration={1500}
        useNativeDriver={true}
      >
        <TouchableOpacity
          style={{padding: 15, paddingHorizontal: 40, backgroundColor: 'rgba(1, 1, 1, 0.1)', borderColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 2, borderRadius: 15}}
          onPress={this._handleOnPressContinue}
        >
          <Text style={{fontSize: 24, fontWeight: '900', color: 'white'}}>Continue</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    console.log(this.iconContainerSize);
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <Animatable.View 
        style={styles.slide1}
        ref={r => this.rootView = r}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        {this._renderIcon()}
        <Animatable.Text 
          style={{fontSize: 28, fontWeight: '900', color: 'white', marginTop: 15}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1000}
        >
          {'Your Account'}
        </Animatable.Text>
        <Animatable.Text 
          style={{fontSize: 24, fontWeight: '300', color: 'white', marginTop: 15, marginHorizontal: 10, textAlign: 'center'}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1250}
        >
          {'Create an account or login to keep track of lorum ipsum sit amit dolor aspicing'}
        </Animatable.Text>
        {this._renderButton()}
        <Animatable.View
          style={{width: '50%', height: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginTop: 20}}
          animation={'fadeInUp'}
          easing={'ease-in-out'}
          duration={1750}
          useNativeDriver={true}
        />
      </Animatable.View>
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

  _handleOnIndexChanged = (index) => {
    this.setState({currentSlideIndex: index});
    console.log('index: ' + index);
  }

  _handleOnPressContinue = () => {
    const { navigation } = this.props;
    navigation.navigate('LoginRoute');
  }

  render(){
    const { currentSlideIndex } = this.state;
    return(
      <View style={{flex: 1}}>
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    
  },
  textTitle: Platform.select({
    ios: {
      color: 'white',
      fontSize: 30,
      fontWeight: '900',
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
    }
  }),
});