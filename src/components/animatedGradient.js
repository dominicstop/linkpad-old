import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {StyleSheet, StatusBar, Dimensions, View, Animated, Easing, Text, processColor} from 'react-native';

// const {height, width} = Dimensions.get('window');

import Chroma from 'chroma-js'
import { LinearGradient } from 'expo';

export class AnimatedGradient extends React.Component {
  static propTypes = {
    speed       : PropTypes.number,
    numOfInterps: PropTypes.number,
    //gradient colors
    colorsTop   : PropTypes.arrayOf(PropTypes.string),
    colorsBottom: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    speed       : 1000,
    numOfInterps: 200 ,
    //gradient colors
    colorsTop   : ['red'  , 'pink', 'orange', 'yellow'],
    colorsBottom: ['pink' , 'red' , 'cyan'  , 'green' ],
  }

  constructor(props){
    super(props);
    //keep track of the current index
    this.colorIndex = 0;
    this.isReverse  = false;
    //unwrap props
    const {colorsTop, colorsBottom, numOfInterps} = props;
    //interpolate colors
    this.colorsTop    = Chroma.scale(colorsTop   ).colors(numOfInterps);
    this.colorsBottom = Chroma.scale(colorsBottom).colors(numOfInterps);
  }

  nextColors(){
    const { colorsTop, colorsBottom, colorIndex } = this;

    //decrement on reach end and vice versa
    if (colorIndex == colorsTop.length-1 ) this.isReverse = true ;
    if (colorIndex == 0                  ) this.isReverse = false;

    this.isReverse ? this.colorIndex-- :  this.colorIndex++;
    return [colorsTop[colorIndex], colorsBottom[colorIndex]];
  }

  start(){
    const { speed } = this.props;
    this.gradientInterval = setInterval( () => {
      //update gradient colors
      this.linearGradientRef.setNativeProps({
        //convert colors before assigning
        colors: this.nextColors().map(processColor)
      });
    }, speed);
  }

  stop(){
    if(this.gradientInterval){
      clearInterval(this.gradientInterval);
      this.gradientInterval = undefined;
    }
  }

  componentDidMount(){
    this.start();
  }

  render(){
    const { colorsTop, colorsBottom } = this;
    return(
      <LinearGradient
        {...this.props}
        colors={[colorsTop[0], colorsBottom[1]]}
        ref={r => this.linearGradientRef = r}
      />
    );
  }
}