import React, { Fragment } from 'react';
import { Text, View, ViewPropTypes, Platform, StyleSheet, StatusBar } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../Constants';

import { Icon     } from 'react-native-elements';
import { Header   } from 'react-navigation';
import Expo, { BlurView } from 'expo';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo';

const overlayOpacity = 0.4
//declare animations
Animatable.initializeRegistryWithDefinitions({
  //unflipped: start trans
  flipLeftStart: {
    easing: 'ease-in',
    from  : { transform: [{ rotateY: '0deg'  }, { rotateX: '0deg' }, { scale: 1    }] },
    to    : { transform: [{ rotateY: '90deg' }, { rotateX: '4deg' }, { scale: 0.90 }] },
  },
  //unflipped: end trans
  flipLeftEnd: {
    easing: 'ease-out',
    from  : { transform: [{ rotateY: '-90deg' }, { rotateX: '4deg' }, { scale: 0.90 }] },
    to    : { transform: [{ rotateY: '0deg'   }, { rotateX: '0deg' }, { scale: 1    }] },
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
      ellipsizeMode={'tail'}
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
          containerStyle={{marginRight: 10}}
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

export class Card extends React.PureComponent {
  static styles = StyleSheet.create({
    card: {
      overflow: 'visible', 
      marginTop: 5, 
      marginBottom: 12, 
      marginHorizontal: 12, 
      paddingHorizontal: 15, 
      paddingVertical: 10, 
      borderRadius: 10,
      backgroundColor: 'white', 
      elevation: 7,
    }
  });

  render(){
    const { styles } = Card;
    const { style, ...viewProps } = this.props;
    return(
      <View
        style={[styles.card, STYLES.mediumShadow, style]}
        {...viewProps}
      >
        {this.props.children}
      </View>
    );
  }
}

//ios only: used woth react-nav for a blurred floating header
export class ViewWithBlurredHeader extends React.PureComponent {
  static propTypes = {
    hasTabBar: PropTypes.bool,
    enableAndroid: PropTypes.bool
  }

  static defaultProps = {
    hasTabBar: false,
    enableAndroid: true,
  }

  //ios blurred header overlay
  _renderHeaderBlur(){
    return(
      <View style={{position: 'absolute', width: '100%', height: Header.HEIGHT,}}>
        <BlurView intensity={100} tint='default'>
          <LinearGradient
            style={{width: '100%', height: '100%', opacity: 0.7}}
            start={{x: 0.0, y: 0.25}} end={{x: 0.5, y: 1.0}}
            colors={['rgb(48, 0, 247)', 'rgb(90, 0, 247)']}
          />
        </BlurView>
      </View>
    );
  }

  //ios blurred tab bar overlay
  _renderTabBlur(){
    const TabBarHeight = 49;
    return(
      <View style={{ position: 'absolute', width: '100%', height: TabBarHeight, bottom: 0 }}>
        <BlurView intensity={100} tint='default'>
          <LinearGradient
            style={{width: '100%', height: '100%', opacity: 0.7}}
            start={[0, 1]} end={[1, 0]}
            colors={['rgb(48, 0, 247)', 'rgb(90, 0, 247)']}
          />
        </BlurView>
      </View>
    );
  }

  render_iOS(){
    const { hasTabBar } = this.props;
    return(
      <View style={{flex: 1}}>
        {this.props.children}
        {this._renderHeaderBlur()}
        {hasTabBar && this._renderTabBlur()}
      </View>
    );
  }

  render_Android(){
    return(this.props.children);
  }

  render(){
    return(
      Platform.select({
        ios    : this.render_iOS(),
        android: this.render_Android(),
      })
    );
  }
}

//Container: used for animating items inside a flatlist
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
        collapsable={true}
        {...otherProps}
      >
        {this.props.children}
      </Animatable.View>
    );
  }
}

//wraps childern and animates with delay stagger
export class AnimateInView extends React.PureComponent {
  static propTypes = {
    animation: PropTypes.string,
    easing: PropTypes.string,
    duration: PropTypes.number,
    difference: PropTypes.number,
  }

  static defaultProps = {
    animation: Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn',
    }),
    easing: 'ease-in-out',
    duration: 1000,
    difference: 250,
  }

  render(){
    const { animation, duration, difference, ...otherProps } = this.props;
    return this.props.children.map((child, index) => 
      <Animatable.View
        key={'animateInView-' + index}
        duration={duration + (index * difference)}
        useNativeDriver={true}
        {...{animation, ...otherProps}}
      >
        {child}
      </Animatable.View>
    );
  };
};

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
        this.animatedFrontBlackOverlay.partialFadeIn(300),
        this.animatedRootView         .flipLeftStart(300),
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
      <View style={[frontContainerStyle]}>
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
};

export class IconFooter extends React.PureComponent {
  static propTypes = {
    delay    : PropTypes.number,
    animation: PropTypes.string,
    animateIn: PropTypes.bool  ,
    hide     : PropTypes.bool  ,
  };

  static defaultProps = {
    animateIn: true,
    hide     : true,
    delay    : 500,
    animation: Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    }),
  };

  constructor(props){
    super(props);

    this.state = {
      mount: !props.hide,
    };
  };

  show(){
    const { mount } = this.state;
    !mount && this.setState({mount: true});
  };

  _renderHeart(){
    const { delay } = this.props;

    return(
      <Animatable.View
        animation={'pulse'}
        duration={1000}
        easing={'ease-in-out'}
        delay={3000}
        iterationCount={'infinite'}
        useNativeDriver={true}
        {...{delay}}
      >
        <Icon
          name={'heart'}
          type={'entypo'}
          color={'#B39DDB'}
          size={24}
        />
      </Animatable.View>
    );
  };

  render(){
    if(!this.state.mount) return null;
    const { delay, animation, animateIn } = this.props;
    
    if(animateIn){
      return (
        <Animatable.View 
          style={{paddingBottom: 50}}
          easing={'ease-in-out'}
          duration={750}
          useNativeDriver={true}
          {...{animation, delay}}
        >
          {this._renderHeart()}
        </Animatable.View>
      );

    } else {
      return (
        <View style={{paddingBottom: 50}}>
          {this._renderHeart()}
        </View>
      );
    };
  };
};

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