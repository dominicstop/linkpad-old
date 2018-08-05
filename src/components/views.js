import React from 'react';
import { Text, View, ViewPropTypes, TextProps } from 'react-native';
import PropTypes from 'prop-types';

import { Icon     } from 'react-native-elements';
import { Header   } from 'react-navigation';
import { BlurView } from 'expo';
import * as Animatable from 'react-native-animatable';

//icon and text
export class IconText extends React.PureComponent {
  static propTypes = {
    text: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    //icon props
    iconName : PropTypes.string,
    iconColor: PropTypes.string,
    iconType : PropTypes.string,
    iconSize : PropTypes.number,
    //style
    containerStyle: ViewPropTypes.style ,
    wrapperStyle  : ViewPropTypes.style ,
    textStyle     : Text.propTypes.style,
  }

  render(){
    const {text, iconName, iconColor, iconType, iconSize, containerStyle, textStyle, wrapperStyle, ...viewProps} = this.props;
    const childrenCount = React.Children.count(this.props.children);

    const IconText = (
      <View
        style={[{flexDirection: 'row', alignItems: 'center'}, containerStyle]}
        {...viewProps}
      >
        <Icon
          name ={iconName }
          color={iconColor}
          type ={iconType }
          size ={iconSize }
        />
        <Text 
          style={[{marginLeft: 7}, textStyle]}
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          {text}
        </Text>
      </View>
    );

    const Wrapper = (
      <View style={wrapperStyle}>
        {IconText}
        {this.props.children}
      </View>
    );

    return(
      childrenCount == 0 ? IconText : Wrapper
    );
  }
}

//ios only: used woth react-nav for a blurred floating header
export class ViewWithBlurredHeader extends React.Component {
  static propTypes = {
    hasTabBar: PropTypes.bool
  }

  static defaultProps = {
    hasTabBar: false
  }

  render(){
    const { hasTabBar } = this.props;

    const TabBarHeight = 49;

    const TabBlurView = (props) => <BlurView 
      style={{position: 'absolute', width: '100%', height: TabBarHeight, bottom: 0}}
      intensity={100}
      tint='default'
      {...props}
    />

    return(
      <View style={{flex: 1}}>
        {this.props.children}
        <BlurView 
          style={{position: 'absolute', width: '100%', height: Header.HEIGHT}}
          intensity={100}
          tint='default'
        />
        {hasTabBar? <TabBlurView/> : null}
      </View>
    );
  }
}

//used for animating items inside a flatlist
export class AnimatedListItem extends React.PureComponent {
  static propTypes = {
    index     : PropTypes.number,
    delay     : PropTypes.number,
    multiplier: PropTypes.number,
    last      : PropTypes.number,
  }

  static defaultProps = {
    index     : 0  ,
    delay     : 0  ,
    multiplier: 100,
    last      : 3  ,
  }

  render(){
    const { index, delay, multiplier, last, ...otherProps } = this.props;
    if(index > last) return this.props.children;
    return(
      <Animatable.View
        delay={(index + 1) * multiplier + delay}
        animation='fadeInUp'
        easing='ease-in-out'
        useNativeDriver={true}
        {...otherProps}
      >
        {this.props.children}
      </Animatable.View>
    );
  }
}