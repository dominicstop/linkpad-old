import PropTypes from 'prop-types';
import React from 'react';
import { Dimensions, Platform } from 'react-native';

import Chroma from 'chroma-js'
import { LinearGradient } from 'expo';
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
    this.colorsTop    = Chroma.scale(colorsTop   ).colors(colorsTop   .length * 60);
    this.colorsBottom = Chroma.scale(colorsBottom).colors(colorsBottom.length * 60);

    const min = Platform.select({ios: 1, android: 1.1});
    const max = Platform.select({ios: 2, android: 2.1});
    const offset = height/2 - width/2;

    //const divisor = Platform.select({ios: 4, android: 2});


    //rotation animation
    const clock = new Clock();
    this.rotation = runTiming(clock, 0, 360);
    this.scale = interpolate(this.rotation, {
      inputRange : [0  , 45 , 90 , 135, 180, 225, 270, 315, 360],
      outputRange: [min, max, min, max, min, max, min, max, min],
    });
    this.height = interpolate(this.rotation, {
      inputRange : [0     , 90   , 180   , 270  , 360   ],
      outputRange: [height, width, height, width, height],
    });
    this.width = interpolate(this.rotation, {
      inputRange : [0    , 90    , 180  , 270   , 360  ],
      outputRange: [width, height, width, height, width],
    });
    this.translateX = interpolate(this.rotation, {
      inputRange : [0, 90     , 180, 270    , 360],
      outputRange: [0, -offset, 0  , -offset, 0  ],
    });
    this.translateY = interpolate(this.rotation, {
      inputRange : [0, 90    , 180, 270    , 360],
      outputRange: [0, offset, 0  , offset , 0  ],
    });

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

  start(){
    const { speed } = this.props;

    //stop if there's already a timer
    if(this.gradientInterval) return;
    this.gradientInterval = setInterval( () => {
      //get prev. gradient colors
      const { colors } = this.state;
      //get new gradient colors
      const newColors = this.nextColors();

      //check if the colors changed
      const didChangeTop    = colors[0] != newColors[0];
      const didChangeBottom = colors[1] != newColors[1];
      const didChangeColors = didChangeTop && didChangeBottom;
      
      if(didChangeColors){
        this.setState({colors: newColors});
      };
    }, speed);
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
    return(
      <Animated.View style={{transform: [
        { scale     : this.scale      },
        { translateX: this.translateX },
        { translateY: this.translateY },
      ]}}>
        <Animated.View style={{
          height: this.height,
          width : this.width,
          transform: [{rotate: concat(this.rotation, 'deg')}]
        }}>
          <LinearGradient
            ref={ref => this.linearGradientRef = ref}
            {...{colors, ...this.props}}
          >
            {this.props.children}
          </LinearGradient>
      </Animated.View>
      </Animated.View>
    );
  };
};