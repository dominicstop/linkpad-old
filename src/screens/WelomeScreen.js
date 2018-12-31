import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Image, Platform, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

import * as Animatable from 'react-native-animatable';
import Swiper from 'react-native-swiper';
import {  NavigationEvents } from 'react-navigation';
import { Divider } from 'react-native-elements';

import LottieCircle  from '../components/LottieCircle';
import { WelcomeScreenModalContent, SwipableModal } from '../components/SwipableModal';
import { AnimateInView } from '../components/Views';


//wrapper component for Swiper child
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

  componentDidUpdate(prevProps, prevState){
    const { currentSlideIndex, slideNumber } = this.props;
    const { shouldRender } = this.state;

    const didChanged = prevProps.currentSlideIndex != currentSlideIndex;
    const isFocused  = currentSlideIndex == slideNumber;

    if(isFocused && !shouldRender){
      this.setState({shouldRender: true, ...{isFocused}});
      console.log('first mount: ' + slideNumber);
    
    } else {
      this.setState({...{isFocused}});
      console.log('update: ' + slideNumber);
      console.log('focus: ' + isFocused);
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
};

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
        style={[containerStyle, styles.circleShadow]}
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
  }

  componentDidUpdate = (prevProps, prevState) => {
    if(!this.props.isFocused){
      this.lottie.reset();

    } else {
      this.lottie.play();
    }
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <View style={styles.slide}>
        <AnimateInView duration={750}>
          <LottieCircle 
            source={this.animationSource}
            ref={r => this.lottie = r}
          />
          <Text style={[styles.textTitle, {marginTop: 20}]}>{'Our Vision'}</Text>
          <Text style={[styles.textBody]}>{'Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam.'}</Text>
          <View style={styles.line}/>
        </AnimateInView>
      </View>
    );
  }
}

export class GoalSlide extends React.PureComponent {
  constructor(props){
    super(props);
    this.animationSource = require('../animations/bar_chart.json');
  }

  componentDidUpdate = (prevProps, prevState) => {
    if(!this.props.isFocused){
      this.lottie.reset();
      
    } else {
      this.lottie.play();
    }
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <View style={styles.slide}>
        <AnimateInView duration={750}>
          <LottieCircle 
            source={this.animationSource}
            ref={r => this.lottie = r}
          />
          <Text style={[styles.textTitle, {marginTop: 20}]}>{'Our Goal'}</Text>
          <Text style={[styles.textBody]}>{'Lorum Ipsum Morbi leo risus, porta ac consectetur ac, vestibulum at eros.'}</Text>
          <View style={styles.line}/>
        </AnimateInView>
      </View>
    );
  }
}

export class ImproveSlide extends React.PureComponent {
  constructor(props){
    super(props);
    this.animationSource = require('../animations/chart.json');
  }

  componentDidUpdate = (prevProps, prevState) => {
    if(!this.props.isFocused){
      this.lottie.reset();
      
    } else {
      this.lottie.play();
    }
  }

  render(){
    let deviceHeight = Dimensions.get('window').height;
    const fontSize = 28;
    const paddingTop = (deviceHeight * 0.5) - (this.iconContainerSize / 2) - (fontSize + 15);
    return(
      <View style={styles.slide}>
        <AnimateInView duration={750}>
          <LottieCircle 
            source={this.animationSource}
            ref={r => this.lottie = r}
          />          
          <Text style={[styles.textTitle, {marginTop: 20}]}>{'Improve and Learn'}</Text>
          <Text style={[styles.textBody]}>{'Lorum Ipsum Morbi leo risus, porta ac consectetur ac, vestibulum at eros.'}</Text>
          <View style={styles.line}/>
        </AnimateInView>
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
  }

  componentDidUpdate = (prevProps, prevState) => {
    if(!this.props.isFocused){
      this.lottie.reset();
      
    } else {
      this.lottie.play();
    }
  }

  _handleOnPressContinue = async () => {
    const { onPressContinue } = this.props;
    //await this.rootView.fadeOutLeft(500);
    onPressContinue && onPressContinue();
    this.lottie.reset();
  }

  _renderButton(){
    return(
      <Fragment>
        <TouchableOpacity
          style={{marginTop: 20, padding: 15, paddingHorizontal: 40, backgroundColor: 'rgba(1, 1, 1, 0.1)', borderColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 2, borderRadius: 15}}
          onPress={this._handleOnPressContinue}
        >
          <Text style={{fontSize: 18, fontWeight: '900', color: 'white'}}>Continue</Text>
        </TouchableOpacity>
      </Fragment>
    );
  }

  _renderMoreButton(){
    return(
      <TouchableOpacity
        style={{marginTop: 10}}
        onPress={this.props.onPressMore}
      >
        <Text style={{fontSize: 18, fontWeight: '300', color: 'white', textAlign: 'center', textDecorationLine: 'underline'}}>More Information</Text>
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
        <AnimateInView duration={750}>
          <LottieCircle 
            source={this.animationSource}
            ref={r => this.lottie = r}
          />          
          <Text style={[styles.textTitle, {marginTop: 20}]}>{'Your Account'}</Text>
          <Text style={[styles.textBody]}>{'Create an account or login to keep track of lorum ipsum sit amit dolor aspicing'}</Text>
          {this._renderButton()}
          {this._renderMoreButton()}
          <View style={styles.line}/>
        </AnimateInView>
      </View>
    );
  }
};

//screen that renders the slides 
export default class WelcomeScreen extends React.Component { 
  constructor(props){
    super(props);
    this.state = {
      currentSlideIndex: 0,
      showModal: false,
    }
  }

  async componentDidUpdate(prevProps, prevState){
    const { currentSlideIndex, showModal } = this.state;
    if (currentSlideIndex != 4 && showModal){
      this.setState({showModal: false});
    }
  }

  componentDidFocus = async () => {
    await this.rootView.fadeInLeft(500);
    if(this.state.currentSlideIndex == 4){
      this.continueSlide.lottie.play();
    }
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

  _handleOnPressMore = () => {
    this._modal.showModal();
  };

  _handleOnSnap = (isHidden) => {
  }

  _renderModal(){
    return(
      <SwipableModal
        ref={r => this._modal = r}
        onSnap={this._handleOnSnap}
      >
        <WelcomeScreenModalContent/>
      </SwipableModal>
    );
  }

  _renderSwiper = () => {
    const { currentSlideIndex } = this.state;
    return(
      <Swiper 
        style={styles.wrapper}
        onIndexChanged={this._handleOnIndexChanged}
        dotColor={'rgba(255, 255, 255, 0.25)'}
        activeDotColor={'rgba(255, 255, 255, 0.5)'}
        loadMinimal={true}
        loadMinimalSize={1}
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
          <ContinueSlide 
            ref={r => this.continueSlide = r}
            onPressContinue={this._handleOnPressContinue}
            onPressMore={this._handleOnPressMore}
          />
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
          {this._renderModal ()}
        </Animatable.View>
      </Fragment>
    );
  }
}

const deviceWidth = Dimensions.get('window').width;
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
      color: 'white', 
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
      color: 'rgba(255, 255, 255, 0.8)'
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
  },
  circleShadow: {
    shadowOffset:{  width: 1,  height: 2,  },
    shadowColor: 'black',
    shadowRadius: 5,
    shadowOpacity: 0.6,
  },
});