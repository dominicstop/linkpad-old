import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback, Clipboard, FlatList, ActivityIndicator, Dimensions, Switch, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';

import Animated, { Easing } from 'react-native-reanimated';
const { set, cond, block, add, Value, timing, interpolate, and, or, onChange, eq, call, Clock, clockRunning, startClock, stopClock, concat, color, divide, multiply, sub, lessThan, abs, modulo, round, debug, clock } = Animated;


export class TransitionAB extends React.PureComponent {
  static propTypes = {
    
  };

  static styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    transContainer: {
      position: 'absolute',
      width: '100%',
    },
  });

  constructor(props){
    super(props);

    this.progress = new Value(0);
    //final height for each trans item
    this.heightA = new Value(-1);
    this.heightB = new Value(-1);

    this.opacityA = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [1, 0 ],
      extrapolate: 'clamp',
    });
    this.opacityB = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0 , 1 ],
      extrapolate: 'clamp',
    });
    this.height = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [this.heightA, this.heightB],
      extrapolate: 'clamp',
    });

    this.layoutHeightA = -1;
    this.layoutHeightB = -1;
    this.inital = false;
  };

  transition(inital){
    if(this.inital != inital){
      const config = {
        duration: 300,
        toValue : this.inital? 0 : 100,
        easing  : Easing.inOut(Easing.ease),
      };
  
      //start animation
      const animation = timing(this.progress, config);
      animation.start();
      this.inital = !this.inital;
    };
  };

  _handleOnLayoutA = ({nativeEvent}) => {
    const { height } = nativeEvent.layout;
    if(this.layoutHeightA == -1){
      this.heightA.setValue(height);
      this.layoutHeightA = height;
    };
  };

  _handleOnLayoutB = ({nativeEvent}) => {
    const { height } = nativeEvent.layout;
    if(this.layoutHeightB == -1){
      this.heightB.setValue(height);
      this.layoutHeightB = height;
    };
  };

  render(){
    const { styles } = TransitionAB;
    const { children } = this.props;
    const props = this.props

    const containerStyle = {
      height: this.height,
    };
    const transAStyle = {
      opacity: this.opacityA,
    };
    const transBStyle = {
      opacity: this.opacityB,
    };

    return(
      <Animated.View style={[styles.container, containerStyle, props.containerStyle]}>
        <Animated.View style={[styles.transContainer, transAStyle]}>
          <View onLayout={this._handleOnLayoutA}>
            {children[0]}
          </View>
        </Animated.View>
        <Animated.View style={[styles.transContainer, transBStyle]}>
          <View onLayout={this._handleOnLayoutB}>
            {children[1]}
          </View>
        </Animated.View>
      </Animated.View>
    );
  };
};