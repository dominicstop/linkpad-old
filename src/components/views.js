import React from 'react';
import { Text, View, ViewPropTypes, TextProps, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { Icon     } from 'react-native-elements';
import { Header   } from 'react-navigation';
import { BlurView } from 'expo';
import * as Animatable from 'react-native-animatable';

const overlayOpacity = 0.2
//declare animations
Animatable.initializeRegistryWithDefinitions({
  //unflipped: start trans
  flipLeftStart: {
    easing: 'ease-in',
    from  : { transform: [{ rotateY: '0deg'  }, { scale: 1    }] },
    to    : { transform: [{ rotateY: '90deg' }, { scale: 0.95 }] },
  },
  //unflipped: end trans
  flipLeftEnd: {
    easing: 'ease-out',
    from  : { transform: [{ rotateY: '-90deg' }, { scale: 0.95 }] },
    to    : { transform: [{ rotateY: '0deg'   }, { scale: 1    }] },
  },
  //flipped: start trans
  flipRightStart: {
    easing: 'ease-in',
    from  : { transform: [{ rotateY: '0deg'   }, { scale: 1    }] },
    to    : { transform: [{ rotateY: '-90deg' }, { scale: 0.95 }] },
  },
  //flipped: end trans
  flipRightEnd: {
    easing: 'ease-out',
    from  : { transform: [{ rotateY: '-90deg' }, { scale: 0.95 }] },
    to    : { transform: [{ rotateY: '0deg'   }, { scale: 1    }] },
  },
  //partially fade in
  partialFadeIn: {
    from  : { opacity: 0 },
    to    : { opacity: overlayOpacity },
  },
  //partially fade out
  partialFadeOut: {
    from  : { opacity: overlayOpacity },
    to    : { opacity: 0 },
  }
});

//icon and text
export class IconText extends React.PureComponent {
  static propTypes = {
    text: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    subtitle: PropTypes.oneOfType([
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
    subtitleStyle : Text.propTypes.style,
  }

  render(){
    const {text, subtitle, iconName, iconColor, iconType, iconSize, containerStyle, textStyle, subtitleStyle, wrapperStyle, ...viewProps} = this.props;
    const childrenCount = React.Children.count(this.props.children);

    const Title = (props) => <Text 
      style={[textStyle]}
      numberOfLines={1}
      ellipsizeMode='tail'
      {...props}
    >
      {text}
    </Text>

    const TitleSubtitle = (props) => <View>
      <Title/>
      <Text style={subtitleStyle}>
        {subtitle}
      </Text>
    </View>

    const IconText = (
      <View
        style={[{flexDirection: 'row', alignItems: 'center'}, containerStyle]}
        {...viewProps}
      >
        <Icon
          containerStyle={{marginRight: 7}}
          name ={iconName }
          color={iconColor}
          type ={iconType }
          size ={iconSize }
        />
        {subtitle? <TitleSubtitle/> : <Title/>}
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

export class FlipView extends React.PureComponent {
  static propTypes = {
    frontComponent     : PropTypes.element  ,
    frontContainerStyle: ViewPropTypes.style,
    backComponent      : PropTypes.element  ,
    backContainerStyle : ViewPropTypes.style, 
  };

  constructor(props){
    super(props);
    this.state = {
      flipped: false,
    }
  }

  flipCard = () => {
    return new Promise(async resolve => {
      //flip start
      await Promise.all([
        this.animatedFrontBlackOverlay.partialFadeIn(200),
        this.animatedRootView         .flipLeftStart(200),
      ]);
      //hide front, show back
      await this.setState({flipped: true});
      //flip end
      await Promise.all([
        this.animatedBackBlackOverlay.partialFadeOut(300),
        this.animatedRootView        .flipLeftEnd   (300),
      ]);
      //resolve: animation ended
      resolve();
    });
  }

  unflipCard = () => {
    return new Promise(async resolve => {
      //unflip start
      await Promise.all([
        this.animatedBackBlackOverlay.partialFadeIn (200),
        this.animatedRootView        .flipRightStart(200),
      ]);
      //hide back, show front
      await this.setState({flipped: false});
      //unflip end
      await Promise.all([
        this.animatedFrontBlackOverlay.partialFadeOut(300),
        this.animatedRootView         .flipRightEnd  (300),
      ]);
      //resolve: animation ended
      resolve();
    });
  }

  //shown when flipped: false
  _renderFrontView(){
    const { frontComponent, frontContainerStyle } = this.props;
    return(
      <View style={frontContainerStyle}>
        {frontComponent}
        <Animatable.View 
          style={[styles.cardBlackOverlay]} 
          ref={r => this.animatedFrontBlackOverlay = r}
          pointerEvents={'none'}
          useNativeDriver={true}
        />
      </View>
    );
  }

  _renderBackView(){
    const { backComponent, backContainerStyle } = this.props;
    return(
      <View style={backContainerStyle}>
        {backComponent}
        <Animatable.View 
          style={[styles.cardBlackOverlay, {opacity: 0.5}]} 
          ref={r => this.animatedBackBlackOverlay = r}
          pointerEvents={'none'}
          useNativeDriver={true}
        />
      </View>
    );
  }

  render(){
    const { flipped } = this.state;
    return(
      <Animatable.View
        style={this.props.containerStyle}
        ref={r => this.animatedRootView = r}
        useNativeDriver={true}
      >
        {flipped? this._renderBackView() : this._renderFrontView()}
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  shadow: {
    shadowOffset:{  width: 3,  height: 5,  },
    shadowColor: 'black',
    shadowRadius: 6,
    shadowOpacity: 0.5,
  },
  cardBlackOverlay: {
    position: 'absolute', 
    width: '100%', 
    height: '100%', 
    backgroundColor: 'black',
    opacity: 0,
  }
});