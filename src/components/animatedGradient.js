import PropTypes from 'prop-types';
import React from 'react';
import { Dimensions, Platform, InteractionManager } from 'react-native';

import {timeout} from '../functions/Utils';

import _ from 'lodash';
import Chroma from 'chroma-js'
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing } from 'react-native-reanimated';
const { set, cond, startClock, stopClock, clockRunning, block, add, Value, Clock, timing, concat, interpolate } = Animated;
const {height, width} = Dimensions.get('window');

function runTiming(clock, value, dest) {
  const state = {
    finished : new Value(0), // will be set to 1 when the position reaches the final value or when frameTime exceeds duration
    position : new Value(0), // gets updated on every frame (value depends on duration and toValue)
    time     : new Value(0), // indicates the last clock time the animation node has been evaluated
    frameTime: new Value(0), // represents the progress of animation in ms (how long the animation has lasted so far)
  };

  const config = {
    duration: 1000 * 15,
    toValue : new Value(0),
    easing  : Easing.linear,
  };

  const repetitions = new Value(0);

  return block([
    cond(clockRunning(clock), [
      // if the clock is already running we update the toValue, in case a new dest has been passed in
      set(config.toValue, dest),
    ], [
      // if the clock isn't running we reset all the animation params and start the clock
      set(state.finished , 0),
      set(state.time     , 0),
      set(state.frameTime, 0),
      set(state.position , value),
      set(config.toValue , dest ),
      startClock(clock),
      set(repetitions, add(repetitions, 1)),
    ]),
    // we run the step here that is going to update position
    timing(clock, state, config),
    // if the animation is over, reset
    cond(state.finished, [
      stopClock(clock)
    ]),
    // we made the block return the updated position
    state.position,    
  ]);
};

function duplicateColors([mainA, mainB], [scaledA, scaledB]){
  const A = [], B = [];
  scaledA.forEach((colorA, indexA) => {
    const colorB = scaledB[indexA];
    const isMainColorA = mainA.includes(colorA);
    const isMainColorB = mainB.includes(colorB);

    if(isMainColorA && isMainColorB){
      _.range(60).forEach(() => {
        A.push(colorA);
        B.push(colorB);  
      });
    } else {
      A.push(colorA);
      B.push(colorB);
    };
  });

  console.log(A.length);
  console.log(B.length);
  return [A, B];
};

export class AnimatedGradient extends React.PureComponent {
  static propTypes = {
    speed       : PropTypes.number,
    numOfInterps: PropTypes.number,
    //gradient colors
    colorsTop   : PropTypes.arrayOf(PropTypes.string),
    colorsBottom: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    speed       : 1000,
    numOfInterps: 200 ,
    //gradient colors
    colorsTop   : ['red'  , 'pink', 'orange', 'yellow'],
    colorsBottom: ['pink' , 'red' , 'cyan'  , 'green' ],
  };

  constructor(props){
    super(props);
    //keep track of the current index
    this.colorIndex = 0;
    this.isReverse  = false;

    //unwrap props
    const {colorsTop, colorsBottom} = props;
    //interpolate colors
    this.colorsTop    = Chroma.scale(colorsTop   ).colors(colorsTop   .length * 90);
    this.colorsBottom = Chroma.scale(colorsBottom).colors(colorsBottom.length * 90);
    //duplicate main colors
    
    const min = 1.1;
    const max = 2.1;
    const mid = 2;
    const offset = height/2 - width/2;

    //rotation animation
    const clock = new Clock();
    this.rotation = runTiming(clock, 0, 360);
    this.scale = interpolate(this.rotation, {
      inputRange : [0  , 45 , 90 , 135, 180, 225, 270, 315, 360],
      outputRange: [min, max, mid, max, min, max, mid, max, min],
    });

    this.animating = false;

    /*

    this.stop = false

    a = (timestamp) => {
      console.log(timestamp);
      if(!this.stop){
        requestAnimationFrame(a)
      };
    };
    requestAnimationFrame(a)
    */

    this.state = {
      colors: [colorsTop[0], colorsBottom[0]],
    };
  };

  nextColors(){
    const { colorsTop, colorsBottom, colorIndex } = this;

    //decrement on reach end and vice versa
    if (colorIndex == colorsTop.length-1 ) this.isReverse = true ;
    if (colorIndex == 0                  ) this.isReverse = false;

    this.isReverse ? this.colorIndex-- : this.colorIndex++;
    return [colorsTop[colorIndex], colorsBottom[colorIndex]];
  };

  start = async () => {
    const { speed } = this.props;

    if(this.gradientInterval) return;

    this.gradientInterval = setInterval(() => {
      //get prev. gradient colors
      const { colors } = this.state;
      //get new gradient colors
      const newColors = this.nextColors();

      //check if the colors changed
      const didChangeTop    = colors[0] != newColors[0];
      const didChangeBottom = colors[1] != newColors[1];
      const didChangeColors = (didChangeTop && didChangeBottom);

      didChangeColors && this.setState({colors: newColors});
    }, speed);

    return;

    await Promise.all([
      timeout(speed),
      InteractionManager.runAfterInteractions(() => {
        //get prev. gradient colors
        const { colors } = this.state;
        //get new gradient colors
        const newColors = this.nextColors();

        //check if the colors changed
        const didChangeTop    = colors[0] != newColors[0];
        const didChangeBottom = colors[1] != newColors[1];
        const didChangeColors = (didChangeTop && didChangeBottom);

        didChangeColors && this.setState({colors: newColors});
      })
    ]);

    if(!this.animating){
      await InteractionManager.runAfterInteractions(this.start);
    };
  };

  stop(){
    if(this.gradientInterval){
      clearInterval(this.gradientInterval);
      this.gradientInterval = undefined;
    }
  };

  componentDidMount(){
    this.start();
  };

  componentWillUnmount(){
    this.stop();
  };

  render(){
    const { colors } = this.state;
    const style = {
      height: height,
      width : width ,
      transform: [
        { rotate: concat(this.rotation, 'deg') },
        { scale : this.scale },
      ]
    };

    return(
      <Animated.View 
        shouldRasterizeIOS={true}
        renderToHardwareTextureAndroid={true}
        {...{style}}
      >
        <LinearGradient
          ref={ref => this.linearGradientRef = ref}
          {...{colors, ...this.props}}
        >
          {this.props.children}
        </LinearGradient>
      </Animated.View>
    );
  };
};