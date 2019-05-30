import React, { Fragment } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { PURPLE } from '../Colors';

import _ from 'lodash';
import { Icon } from 'react-native-elements';
import Animated, { Easing } from 'react-native-reanimated';
const { set, cond, block, add, Value, timing, interpolate, and, or, onChange, eq, call, Clock, clockRunning, startClock, stopClock, concat, color, divide, multiply, sub, lessThan, abs, modulo, round, debug, clock } = Animated;

export class TextExpander extends React.PureComponent {
  static propTypes = {
    renderHeader: PropTypes.func,
    contentContainer: PropTypes.object,
    unmountWhenCollapsed: PropTypes.bool,
  };

  static styles = StyleSheet.create({
    contentWrapper: {
      overflow: 'hidden',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      marginRight: 10,
    },
    arrowContainer: {
      width: 25,
      height: 25,
      borderRadius: 25/2,
      backgroundColor: PURPLE[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  constructor(props){
    super(props);

    //animation values
    this.heightExpanded  = new Value(-1);
    this.heightCollapsed = new Value(0);
    this.progress        = new Value(100);

    this.height = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, this.heightExpanded],
      extrapolate: 'clamp',
    });
    this.opacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    this.indicatorOpacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });
    this.scale = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.95, 1],
      extrapolate: 'clamp',
    });
    this.rotation = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 180],
      extrapolate: 'clamp',
    });

    this.isHeightMeasured = false;
    this.state = {
      mount: true,
      isExpanded: true,
    };
  };

  expand = async (expand) => {
    const { isExpanded } = this.state;

    if(!this.isHeightMeasured){      
      //get current height of expanded
      const height = await new Promise(resolve => {
        this.contentContainer.measure((x, y, w, h) => resolve(h));
      });

      //set height measured flag to true
      this.isHeightMeasured = true;
      //set animated height values
      this.heightExpanded.setValue(height);
    };

    const config = {
      duration: 300,
      toValue : expand? 100 : 0,
      easing  : Easing.inOut(Easing.ease),
    };
    const animation = timing(this.progress, config);

    if(isExpanded != expand){
      //start animation
      animation.start();
      this.setState({isExpanded: !isExpanded});
    };
  };

  _handleOnPressHeader = () => {
    const { isExpanded } = this.state;
    this.expand(!isExpanded);
  };

  _renderHeader(){
    const { styles } = TextExpander;
    const { renderHeader } = this.props;
    const { isExpanded } = this.state;

    const arrowContainerStyle = {
      opacity: this.indicatorOpacity,
      transform: [
        { rotate: concat(this.rotation, 'deg') },
      ],
    };

    return(
      <TouchableOpacity 
        onPress={this._handleOnPressHeader}
        style={[styles.headerContainer, this.props.headerContainer]}
        activeOpacity={0.75}
      >
        <View style={styles.headerTitle}>
          {renderHeader && renderHeader(isExpanded)}
        </View>
        <Animated.View style={[styles.arrowContainer, arrowContainerStyle]}>
          <Icon
            name={'chevron-down'}
            type={'feather'}
            color={'white'}
            size={17}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  _renderContent(){
    const { styles } = TextExpander;
    const { mount } = this.state;

    const contentWrapperStyle = {
      opacity: this.opacity,
      height: this.height,
    };
    const contentContainer = {
      position: cond(eq(this.heightExpanded, -1), 'relative', 'absolute')
    };

    return(
      <Animated.View style={[styles.contentWrapper, contentWrapperStyle]}>  
        <Animated.View style={[this.props.contentContainer, contentContainer]}>
          <View ref={r => this.contentContainer = r}>
            {mount && this.props.children}
          </View>
        </Animated.View>
      </Animated.View>
    );
  };

  render(){
    return(
      <Fragment>
        {this._renderHeader()}
        {this._renderContent()}
      </Fragment>
    );
  };
};

export class ContentExpander extends React.PureComponent {
  static propTypes = {
    renderHeader: PropTypes.func,
    contentContainer: PropTypes.object,
    renderHeader: PropTypes.bool,
  };

  static defaultProps = {
    renderHeader: true,
  };

  static styles = StyleSheet.create({
    contentWrapper: {
      overflow: 'hidden',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      marginRight: 10,
    },
    arrowContainer: {
      width: 25,
      height: 25,
      borderRadius: 25/2,
      backgroundColor: PURPLE[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  constructor(props){
    super(props);

    //animation values
    this.heightExpanded  = new Value(-1);
    this.heightCollapsed = new Value(0);
    this.progress        = new Value(100);
    this.status          = new Value(0);

    this.height = interpolate(this.progress, {
      inputRange : [0, 99.99, 100],
      outputRange: [0, this.heightExpanded, -1],
      extrapolate: 'clamp',
    });
    this.opacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    
    //animated values for header
    if(props.renderHeader){
      this.indicatorOpacity = interpolate(this.progress, {
        inputRange : [0, 100],
        outputRange: [0.8, 1],
        extrapolate: 'clamp',
      });
      this.scale = interpolate(this.progress, {
        inputRange : [0, 100],
        outputRange: [0.95, 1],
        extrapolate: 'clamp',
      });
      this.rotation = interpolate(this.progress, {
        inputRange : [0, 100],
        outputRange: [0, 180],
        extrapolate: 'clamp',
      });
    };

    this.isHeightMeasured = false;
    this.state = {
      isExpanded: true,
    };
  };

  expand = async (expand) => {
    const { isExpanded } = this.state;

    if(!this.isHeightMeasured){      
      //get current height of expanded
      const height = await new Promise(resolve => {
        this.contentContainer.measure((x, y, w, h) => resolve(h));
      });

      //set height measured flag to true
      this.isHeightMeasured = true;
      //set animated height values
      this.heightExpanded.setValue(height);
    };

    const config = {
      duration: 300,
      toValue : expand? 100 : 0,
      easing  : Easing.inOut(Easing.ease),
    };
    
    if(isExpanded != expand){
      //start animation
      const animation = timing(this.progress, config);
      animation.start();
      this.setState({isExpanded: !isExpanded});
    };
  };

  toggle = () => {
    const { isExpanded } = this.state;
    this.expand(!isExpanded);
  };

  _handleOnPressHeader = () => {
    this.toggle();
  };

  _handleAnimationFinished = () => {

  };

  _renderHeader(){
    const { styles } = ContentExpander;
    const { renderHeader } = this.props;
    const { isExpanded } = this.state;
    if(!renderHeader) return null;

    const arrowContainerStyle = {
      opacity: this.indicatorOpacity,
      transform: [
        { rotate: concat(this.rotation, 'deg') },
        { scale: this.scale},
      ],
    };

    return(
      <TouchableOpacity 
        onPress={this._handleOnPressHeader}
        style={[styles.headerContainer, this.props.headerContainer]}
        activeOpacity={0.75}
      >
        <View style={styles.headerTitle}>
          {renderHeader && renderHeader(isExpanded)}
        </View>
        <Animated.View style={[styles.arrowContainer, arrowContainerStyle]}>
          <Icon
            name={'chevron-down'}
            type={'feather'}
            color={'white'}
            size={17}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  _renderContent(){
    const { styles } = ContentExpander;
    const contentWrapperStyle = {
      opacity: this.opacity,
      height: this.height,
    };

    return(
      <Animated.View style={[styles.contentWrapper, contentWrapperStyle]}>  
        <View 
          ref={r => this.contentContainer = r}
          collapsable={false}
        >
          {this.props.children}
        </View>
      </Animated.View>
    );
  };

  render(){
    const { progress, status, height } = this;
    return(
      <Fragment>
        {this._renderHeader()}
        {this._renderContent()}
        <Animated.Code exec={block([
          //animation started
          onChange(progress, cond(eq(status, 0), set(status, 1))),
          //animation finished
          cond(and(eq(status, 1), or(eq(progress, 0), eq(progress, 100))), [ 
            set(status, 0),
            call([progress], this._handleAnimationFinished),
          ]),
        ])}/>
      </Fragment>
    );
  };
};

export class TextExpandable extends React.PureComponent {
  static propTypes = {
    maxTextLength: PropTypes.number,
    text: PropTypes.string,
    //styles
  };

  static defaultProps = {
    maxTextLength: 200,
  };

  static styles = StyleSheet.create({

  });

  constructor(props){
    super(props);
    const { maxTextLength, text } = props;
    const exceedsMax = (text || '').length > maxTextLength;

    this.state = {
      exceedsMax,
    };
  };

  render(){
    return(
      <View>

      </View>
    );
  };
};