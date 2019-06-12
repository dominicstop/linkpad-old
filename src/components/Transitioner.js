import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback, Clipboard, FlatList, ActivityIndicator, Dimensions, Switch, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';

import Animated, { Easing } from 'react-native-reanimated';
import { timeout } from '../functions/Utils';
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

    const showLastFirst = props.showLastFirst;

    this.progress = new Value(showLastFirst? 100 : 0);
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
    this.inital = showLastFirst;

    this.state = {
      mountA: true,
      mountB: true,
    };
  };

  async transition(inital){
    const { handlePointerEvents, onTransition } = this.props;

    if(this.inital != inital){
      const config = {
        duration: 300,
        toValue : this.inital? 0 : 100,
        easing  : Easing.inOut(Easing.ease),
      };

      handlePointerEvents && this.setState({
        mountA: true,
        mountB: true,
      });
  
      //start animation
      const animation = timing(this.progress, config);
      animation.start();
      this.inital = !this.inital;

      //call callback
      onTransition && onTransition(this.inital);

      if(handlePointerEvents){
        await timeout(300);
        this.setState({
          mountA: !inital,
          mountB:  inital,
        });
      };
    };
  };

  async componentDidMount(){
    const { handlePointerEvents, showLastFirst } = this.props;
    if(handlePointerEvents){
      await timeout(250);
      this.setState({
        mountA: !showLastFirst,
        mountB:  showLastFirst,
      });
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
    const { mountA, mountB } = this.state;
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
            {mountA && props.children[0]}
          </View>
        </Animated.View>
        <Animated.View style={[styles.transContainer, transBStyle]}>
          <View onLayout={this._handleOnLayoutB}>
            {mountB && props.children[1]}
          </View>
        </Animated.View>
      </Animated.View>
    );
  };
};