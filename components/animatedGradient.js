import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {StyleSheet, StatusBar, Dimensions, View, Animated, Easing} from 'react-native';

// const {height, width} = Dimensions.get('window');

import * as Animatable from 'react-native-animatable';
import Chroma from 'chroma-js'
import { LinearGradient } from 'expo';

export class GradientWrapper extends React.Component {
  render(){
    const { colors } = this.props;
    const hex = colors.map((c) => Chroma(JSON.stringify(c)).hex());
    return <View
      style={{width: '100%', height: '100%', backgroundColor: hex[1]}}
    />
  }
}

Animated.LinearGradient = Animated.createAnimatedComponent(GradientWrapper);

export class AnimatedGradient extends React.Component {
  static propTypes = {
    colorsTop   : PropTypes.arrayOf(PropTypes.string),
    colorsBottom: PropTypes.arrayOf(PropTypes.string),
    speed: PropTypes.number,
  }

  static defaultProps = {
    colorsTop   : ['red' , 'orange', 'yellow'],
    colorsBottom: ['blue', 'cyan'  , 'purple'],
    speed: 10000,
  }

  constructor(props){
    super(props);

    this.state = {
      //keep track of the current index of colors to use
      colorIndexTop   : new Animated.Value(0),
      colorIndexBottom: new Animated.Value(0),
    }
  }

  startAnimation = () => {
    const { colorIndexTop, colorIndexBottom } = this.state;
    const { colorsTop, colorsBottom, speed } = this.props;

    //init. so that it starts at index 0
    [colorIndexTop, colorIndexBottom].forEach(color => color.setValue(0));

    //run animations all at once
    Animated.parallel(
      [colorIndexTop, colorIndexBottom].map(colorIndex => {
        let length = colorsTop.length;
        //from 0 to the last element in the array
        return Animated.timing(colorIndex, {
          toValue : length,
          duration: speed ,
          easing  : Easing.linear 
        })
      })
    ).start(this.startAnimation);

  };

  componentDidMount(){
    this.startAnimation();
  }

  render(){
    const { colorsTop, colorsBottom } = this.props;
    const { colorIndexTop, colorIndexBottom } = this.state;

    const interpColorsTop = colorIndexTop.interpolate({
      inputRange : Array.from({length: colorsTop.length}, (item, index) => index),
      outputRange: colorsTop,
    });

    const interpColorsBottom = colorIndexBottom.interpolate({
      inputRange : Array.from({length: colorsBottom.length}, (item, index) => index),
      outputRange: colorsBottom,
    });

    

    return(
      <Animated.LinearGradient 
        colors={[interpColorsTop, interpColorsBottom]}
      >
      
      </Animated.LinearGradient>
    );
  }
}