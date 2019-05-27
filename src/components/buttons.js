import React, { Fragment } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewPropTypes, TextProps, LayoutAnimation, Platform, TouchableNativeFeedback } from 'react-native';
import PropTypes from 'prop-types';

import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo';
import { Icon } from 'react-native-elements';
import PlatformTouchable from './Touchable';
import { STYLES } from '../Constants';
import NavigationService from '../NavigationService';

//icon and text
export class IconButton extends React.PureComponent {
  static propTypes = {
    text: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    subtitle: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    onPress: PropTypes.func,
    //icon props
    iconName : PropTypes.string,
    iconColor: PropTypes.string,
    iconType : PropTypes.string,
    iconSize : PropTypes.number,
    iconProps: PropTypes.object,
    //style props
    containerStyle    : PropTypes.any,
    wrapperStyle      : PropTypes.any,
    textStyle         : PropTypes.any,
    subtitleStyle     : PropTypes.any,
    textContainerStyle: PropTypes.any,
  };

  static styles = StyleSheet.create({
    wrapper: {
      overflow: 'hidden',
    },
    container: {
      flexDirection: 'row', 
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    textTitle: {
      flex: 1,
    },
    textSubtitle: {
      flex: 1,
    },
    iconContainer: {
      marginRight: 15,
    },
  });

  getProps(){
    const { text, subtitle, iconName, iconColor, iconType, iconSize, containerStyle, wrapperStyle, textStyle, children, iconProps, subtitleStyle, textContainerStyle, ...otherProps} = this.props;
    return{
      iconProps: {
        name : iconName , 
        color: iconColor, 
        type : iconType ,
        size : iconSize ,
        ...iconProps
      },
      styleProps: {
        containerStyle    , 
        wrapperStyle      , 
        textStyle         ,
        subtitleStyle     ,
        textContainerStyle,
      },
      touchableProps: otherProps,
      text, subtitle
    };
  };

  _renderContent(){
    const { styles } = IconButton;
    const { iconProps, styleProps, text, subtitle } = this.getProps();

    const TitleSubtitle = (subtitle
      ?(
        <View style={[styles.textContainer, styleProps.textContainerStyle]}>
          <Text style={[styles.textTitle, styleProps.textStyle]}>
            {text}
          </Text>
          <Text style={[styles.textSubtitle, styleProps.subtitleStyle]}>
            {subtitle}
          </Text>
        </View>
      ):(
        <Text style={[styles.textTitle, styleProps.textStyle]}>
          {text}
        </Text>
      )
    );

    return(
      <Fragment>
        <Icon 
          containerStyle={styles.iconContainer} 
          {...iconProps}  
        />
        {TitleSubtitle}
        {this.props.children}  
      </Fragment>
    );
  };

  render(){
    const { styles } = IconButton;
    const { styleProps, touchableProps } = this.getProps();
    
    return Platform.select({
      ios: (
        <TouchableOpacity
          style={[styles.container, styleProps.containerStyle]}
          {...touchableProps}
        >
          {this._renderContent()}
        </TouchableOpacity>
      ),
      android: (
        <View style={[styles.wrapper, styleProps.wrapperStyle]}>
          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple('rgba(255, 255, 255, 0.5)')}
            useForeground={true}
            {...touchableProps}
          >
            <View style={[styles.container, styleProps.containerStyle]}>
              {this._renderContent()}
            </View>
          </TouchableNativeFeedback>
        </View>
      ),
    });
  };
};


export class PlatformTouchableIconButton extends React.PureComponent {
  static propTypes = {
    text: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    onPress: PropTypes.func,
    //icon props
    iconName : PropTypes.string,
    iconColor: PropTypes.string,
    iconType : PropTypes.string,
    iconSize : PropTypes.number,
    iconProps: PropTypes.object,
    //style
    containerStyle: ViewPropTypes.style ,
    wrapperStyle  : ViewPropTypes.style ,
    textStyle     : Text.propTypes.style,
  };

  static styles = StyleSheet.create({
    buttonWrapper: {
      flex: 1, 
      borderRadius: 10
    },
    buttonContainer: {
      flex: 1, 
      flexDirection: 'row',
      padding: 15,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });

  _renderButtonContents(){
    const { text, iconName, iconColor, iconType, iconSize, textStyle } = this.props;
    const flex = this.props.children > 0? 1 : 0;

    const iconProps = {
      name : iconName ,
      type : iconType ,
      size : iconSize ,
      color: iconColor,
      ...this.props.iconProps,
    };

    return (
      <Fragment>
        <Icon {...iconProps}/>
        <Text style={[{marginLeft: 8, flex}, textStyle]}>
          {text}
        </Text>
        {this.props.children}
      </Fragment>
    );
  };

  render(){
    const {text, iconName, iconColor, iconType, iconSize, containerStyle, wrapperStyle, textStyle, children, iconProps, onPress, ...otherProps} = this.props;
    const { styles } = PlatformTouchableIconButton;

    return(
      <View style={[styles.buttonWrapper, wrapperStyle]}>
        <PlatformTouchable 
          background={PlatformTouchable.Ripple('#fff', true)}
          {...{onPress}}
        >
          <View style={[styles.buttonContainer, containerStyle]}>
            {this._renderButtonContents()}
          </View>
        </PlatformTouchable>
      </View>
    );
  }
}

//icon button but with default stylings
export class Button extends React.PureComponent {
  render(){
    const { style, ...IconButtonProps } = this.props;
    
    const containerStyle = {
      height: 50,
      paddingHorizontal: 15,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    };

    const textStyle = {
      flex: 0,
      color: 'white', 
      fontSize: 16, 
    }

    return(
      <IconButton
        containerStyle={[containerStyle, styles.shadow, style]}
        textStyle={textStyle}
        {...IconButtonProps}
      />
    );
  }
}

//icon and text w/ active inactive style
export class ToggleButton extends React.PureComponent {
  static propTypes = {
    isToggled: PropTypes.bool,
    text: PropTypes.string,
    //icon props
    iconNameActive   : PropTypes.string,
    iconNameInactive : PropTypes.string,
    iconColorActive  : PropTypes.string,
    iconColorInactive: PropTypes.string,
    iconType: PropTypes.string,
    iconSize: PropTypes.number,
    //textprops
    textStyle        : Text.propTypes.style,
    textStyleActive  : Text.propTypes.style,
    textStyleInactive: Text.propTypes.style,
  }

  static defaultProps = {
    //iconprops
    iconColorActive: '#009ffc',
    iconColorInactive: 'darkgrey',
    //textprops
    textStyle: {fontSize: 18},
    textStyleActive: { fontWeight: '600'},
    textStyleInactive: { fontWeight: '100', },
  }

  render(){
    const { 
      isToggled, text,
      //iconprops
      iconNameActive, iconNameInactive, iconColorActive, iconColorInactive, iconType, iconSize,
      //textprops
      textStyle,textStyleActive, textStyleInactive,
      ...otherProps
    } = this.props;

    return(
      <IconButton
        {...otherProps}
        text={text}
        textStyle={[textStyle, isToggled ? textStyleActive : textStyleInactive ]}
        iconName={isToggled ? iconNameActive : iconNameInactive }
        iconColor={isToggled ? iconColorActive: iconColorInactive }
        iconType={iconType}
        iconSize={iconSize}
        activeOpacity={0.5}
      />
    );
  }
}

//touch to expand or collapse
export class ExpandCollapse extends React.PureComponent {
  static propTypes = {
    collapseHeight: PropTypes.number ,
    colors        : PropTypes.arrayOf(PropTypes.string), 
  }

  static defaultProps = {
    collapseHeight: 200,
    colors        : ['rgba(255, 255, 255, 0)', 'white'], 
  }

  constructor(props){
    super(props);
    this.state = {
      height      : null,
      collapsable : true,
      checkHeight : true,
      layoutHeight: null,
    }
  }

  componentDidMount(){
    
  }

  toggle(){
    const { collapseHeight      } = this.props;
    const { height, collapsable } = this.state;
    if(!collapsable) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      height: height == collapseHeight ? undefined : collapseHeight 
    });
  }

  _onLayout = (event) => {
    const { collapseHeight } = this.props;
    const { checkHeight    } = this.state;
    const { height         } = event.nativeEvent.layout;

    if(!checkHeight) return;

    const shouldCollapse = height >= collapseHeight
    this.setState({
      collapsable: shouldCollapse,
      height     : shouldCollapse? collapseHeight : undefined,
      checkHeight: false,
    });
  }

  render(){
    const { collapseHeight, colors } = this.props;
    const { height } = this.state;

    const isCollapsed = height == collapseHeight;
    const transparent = 'rgba(255, 255, 255, 0)';
    const lastColor   = colors[colors.length-1]; 

    const Collapsed = (
      <LinearGradient
        overflow='hidden'
        colors={colors}
      >
        {this.props.children}
        <LinearGradient
          style={{position: 'absolute', width: '100%', height: '100%'}}
          colors={[transparent, isCollapsed? lastColor : transparent ]}
          locations={[0.4, 0.9]}
        />
      </LinearGradient>
    );
    
    return(
      <TouchableOpacity
        style={{maxHeight: this.state.height}}
        overflow='hidden'
        onPress={() => this.toggle()}
        activeOpacity={1}
        onLayout={this._onLayout}
      >
        {isCollapsed? Collapsed : this.props.children}
      </TouchableOpacity>
    );
  }
}

//a header with that can be expanded when header is touched
export class ExpandableWithHeader extends React.PureComponent {
  static propTypes = {
    collapseHeight: PropTypes.number ,
    locations     : PropTypes.arrayOf(PropTypes.number),
    colors        : PropTypes.arrayOf(PropTypes.string),
    header        : PropTypes.element,
    containerStyle: ViewPropTypes.style,
  }

  static defaultProps = {
    collapseHeight: 200,
    colors        : ['rgba(255, 255, 255, 0)', 'white'], 
  }

  constructor(props){
    super(props);
    this.state = {
      height      : null,
      collapsable : true,
      checkHeight : true,
      layoutHeight: null,
    }
  }

  toggle(){
    const { collapseHeight      } = this.props;
    const { height, collapsable } = this.state;

    if(!collapsable) return;
    const shouldCollapse = height == collapseHeight;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      height: shouldCollapse ? undefined : collapseHeight 
    });

    this.chevron.transitionTo([{
      transform: [{rotate:  shouldCollapse? '180deg' : '0deg'}]
    }]);
  }

  _onLayout = (event) => {
    const { collapseHeight } = this.props;
    const { checkHeight    } = this.state;
    const { height         } = event.nativeEvent.layout;

    if(!checkHeight) return;

    const shouldCollapse = height >= collapseHeight
    this.setState({
      collapsable: shouldCollapse,
      height     : shouldCollapse? collapseHeight : undefined,
      checkHeight: false,
    });
  }

  render(){
    const { collapseHeight, colors, locations } = this.props;
    const { height } = this.state;

    const isCollapsed = height == collapseHeight;
    const transparent = 'rgba(255, 255, 255, 0)';
    const lastColor   = colors[colors.length-1]; 

    const Collapsed = (
      <LinearGradient
        overflow='hidden'
        colors={colors}
        locations={locations}
      >
        {this.props.children}
        <LinearGradient
          style={{position: 'absolute', width: '100%', height: '100%'}}
          colors={[transparent, isCollapsed? lastColor : transparent ]}
          locations={locations}
        />
      </LinearGradient>
    );
    
    return(
      <View style={this.props.containerStyle}>
        <TouchableOpacity
          style={{flexDirection: 'row', overflow: 'hidden'}}
          onPress={() => this.toggle()}
          activeOpacity={1}
        >
          <View style={{flex: 1}}>
            {this.props.header}
          </View>
          <Animatable.View
            style={{alignItems: 'center', justifyContent: 'center', transform: [{ rotate : '0deg' }]}}
            ref={r => this.chevron = r}
            useNativeDriver={true}
          >
            <Icon
              name='chevron-down'
              type='feather'
              color='grey'
              size={30}
            />
          </Animatable.View>
        </TouchableOpacity>
        <View
          style={{maxHeight: this.state.height}}
          overflow='hidden'
          onLayout={this._onLayout}
        >
          {isCollapsed? Collapsed : this.props.children}
        </View>
      </View>
    );
  }
}

export class DrawerButton extends React.PureComponent {
  _handleOnPress = () => {
    NavigationService.navigateDrawerToggle();
  }

  _renderIcon(){
    return(
      <Icon
        name='ios-menu'
        type='ionicon'
        size={26}
        color='white'
        containerStyle={[STYLES.glow]}
      />
    );
  }


  render(){
    return Platform.select({
      ios: (
        <TouchableOpacity
          style={[STYLES.glow, { marginLeft: 10, shadowOpacity: 0.5, shadowRadius: 3 }]}
          onPress={this._handleOnPress}
        >
          {this._renderIcon()}
        </TouchableOpacity>
      ),
      android: (
        <View style={{borderRadius: 100, overflow: 'hidden', padding: 20}}>
          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple('white', true)}
            onPress={this._handleOnPress}
          >
            {this._renderIcon()}
          </TouchableNativeFeedback>
        </View>
      )
    });
  }
}

//touch to expand text
export class ExpandCollapseText extends React.PureComponent {
  static propTypes = {
    text: PropTypes.string,
    collapsedNumberOfLines: PropTypes.number,
    onPress: PropTypes.func
  }

  static defaultProps = {
    onPress: (isCollapsed) => {},
  }

  constructor(props){
    super(props);
    this.debug = false;
    this.state = {
      collapsed: true,
      //onlayout: text height when collapsedNumberOfLines is set
      collapsedHeight: null,
      //onlayout: text height when collapsedNumberOfLines not set
      expandedHeight : null,
      //value of null = max height
      viewHeight: null
    };
  }

  componentDidMount(){}

  isCollapsed = () => {
    const { viewHeight, collapsedHeight } = this.state;
    return viewHeight != null;
  }

  //switch betw. expanded and collapsed
  toggle = () => {
    const { collapsedHeight, expandedHeight } = this.state;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState((prevState, props) => {
      const collapsedViewHeight = expandedHeight - collapsedHeight;
      const isCollapsed = prevState.viewHeight > 0;

      //debug to console
      if(this.debug){
        console.log('\n\ntoggle...');
        console.log('Prev. viewHeight: ' + prevState.viewHeight);
        console.log('collapsedHeight: '  + collapsedHeight     );
        console.log('isCollapsed: '      + isCollapsed         );
      }

      return { viewHeight: isCollapsed? null : collapsedViewHeight };
    });
  }

  _onPress = () => {
    const { viewHeight, collapsedHeight } = this.state;
    const isCollapsed = viewHeight != null;
    //debug
    if(this.debug) console.log('\n\nOnPress...');
    this.props.onPress(isCollapsed);
    this.toggle();
  }

  _onLayout = (event) => {
    const { collapsedHeight, expandedHeight } = this.state;
    const { height } = event.nativeEvent.layout;

    //run once, on mount: collapsedHeight: null
    if(!collapsedHeight){
      //debugging
      if(this.debug){
        console.log('\n\nText - OnLayout...');
        console.log('Prev. collapsedHeight: ' + collapsedHeight);
        console.log('New   collapsedHeight: ' + height);
        console.log('viewHeight: ' + height);
      }
      this.setState({
        collapsedHeight: height,
      });
    }
    //run once, on mount: expandedHeight: null & collapsedHeight is set
    if(!expandedHeight && collapsedHeight){
      //debugging
      if(this.debug) console.log('\n\nexpanded viewHeight: ' + height);

      this.setState({
        expandedHeight: height,
        viewHeight    : height - collapsedHeight,        
      });
    }
  }

  render(){
    const { text, collapsedNumberOfLines, onPress, containerStyle, ...textProps} = this.props;
    const { collapsedHeight, expandedHeight, viewHeight } = this.state;
    const numOfLines = collapsedHeight? null : collapsedNumberOfLines;
    //debugging
    if(this.debug){
      console.log('\n\nRender....');
      console.log('collapsedHeight: ' + collapsedHeight);
      console.log('numOfLines: ' + numOfLines);
      console.log('viewHeight: ' + viewHeight);
    };

    const Wrapper = (props) => Platform.select({
      ios: (
        <TouchableOpacity
          activeOpacity={0.5}
          {...props}
        >
          {props.children}
        </TouchableOpacity>
      ),
      android: (
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple('#6200EA', true)}
          useForeground={true}
          {...props}
        >
          {props.children}
        </TouchableNativeFeedback>
      ),
    });
    
    const backgroundColor = Platform.select({ios: 'transparent', android: 'white'});

    return (
      <Wrapper
        style={{overflow: 'hidden'}}
        onPress={this._onPress}
        activeOpacity={0.5}
      >
        <View style={[containerStyle, {marginBottom: 0 - viewHeight}]}>
          <Text
            numberOfLines={numOfLines}
            onLayout={this._onLayout}
            selectable={false}
            ellipsizeMode={'tail'}
            {...textProps}
          >
            {text}
          </Text>
          <View style={{marginTop: 0 - viewHeight, height: viewHeight, width: '100%', backgroundColor}}/>
        </View>
      </Wrapper>
    );
  }
}

//touch to expand text wrapped with animated header
export class ExpandCollapseTextWithHeader extends React.PureComponent {
  static propTypes = {
    text: PropTypes.string,
    collapsedNumberOfLines: PropTypes.number,
    onPress: PropTypes.func,
    titleComponent: PropTypes.element,
    titleContainerStyle: ViewPropTypes.style,
  }

  static defaultProps = {
    onPress: (isCollapsed) => {},
  }

  _onPressHeader = () => {
    this.expandCollapseRef._onPress();
  }

  _onPress = (isCollapsed) => {
    this.props.onPress(isCollapsed);
    this.chevron.transitionTo([{
      transform: [{rotate:  isCollapsed? '180deg' : '0deg'}]
    }]);
  }

  _renderHeader(){
    const { titleComponent, titleContainerStyle } = this.props;

    const Wrapper = (props) => Platform.select({
      ios: (
        <TouchableOpacity
          activeOpacity={0.5}
          {...props}
        >
          {props.children}
        </TouchableOpacity>
      ),
      android: (
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple('#6200EA', true)}
          useForeground={true}
          {...props}
        >
          {props.children}
        </TouchableNativeFeedback>
      ),
    });

    return(
      <Wrapper onPress={this._onPressHeader}>
        <View style={[{flexDirection: 'row'}, titleContainerStyle]}>
          <View style={[{flex: 1}]}>
            {titleComponent}
          </View>
          <Animatable.View
            style={{alignItems: 'center', justifyContent: 'center', transform: [{ rotate : '0deg' }]}}
            ref={r => this.chevron = r}
            useNativeDriver={true}
          >
            <Icon
              name='chevron-down'
              type='feather'
              color='grey'
              size={30}
            />
          </Animatable.View>
        </View>
      </Wrapper>
    );
  }

  render(){
    const { titleComponent, onPress, ...expandCollapseProps} = this.props;
    return(
      <View collapsable={true}>
        {this._renderHeader()}
        <ExpandCollapseText
          {...expandCollapseProps}
          ref={r => this.expandCollapseRef = r}
          onPress={this._onPress}
        />
      </View>
    );
  }
}

/**
 * if number of characters reached, it will render it inside a
 * ExpandCollapseTextWithHeader and if not, it will render as
 * normal text + header w/o the arrow on the side
 */
export class AnimatedCollapsable extends React.PureComponent {
  static propTypes = {
    //the title or header
    titleComponent: PropTypes.element.isRequired,
    //text to show
    text: PropTypes.string.isRequired,
    //number of char before rendering inside a collapsable
    maxChar: PropTypes.number.isRequired,
    //number of lines when collapsed
    collapsedNumberOfLines: PropTypes.number,
    //should animate pulse
    extraAnimation: PropTypes.bool,
    onPress: PropTypes.func,
  }

  static defaultProps = {
    extraAnimation: true,
    collapsedNumberOfLines: 3,
  }

  _onPress = (isCollapsed) => {
    const { extraAnimation } = this.props;
    if(extraAnimation) this.animatedRootViewRef.pulse(750);
  }

  _renderCollapsable(){
    const { extraAnimation, onPress, ...ExpandCollapseProps } = this.props;
    return(
      <Animatable.View 
        ref={r => this.animatedRootViewRef = r}
        useNativeDriver={true}
      >
        <ExpandCollapseTextWithHeader
          onPress={this._onPress}
          {...ExpandCollapseProps}
        />
      </Animatable.View>
    );
  }

  _renderNormal(){ 
    //note: style prop is textstyle in ExpandCollapseText
    const { text, style, titleComponent } = this.props;
    return(
      <View collapsable={true}>
        {titleComponent}
        <Text style={[style]}>
          {text}
        </Text>
      </View>
    );
  }

  render(){
    const { text, maxChar } = this.props;
    //render inside collapsable if max char reached
    const isTextLong = text.length > maxChar;
    return(
      isTextLong? this._renderCollapsable() : this._renderNormal()
    );
  }

}

export class RippleBorderButton extends React.PureComponent {
  static propTypes = {
    onPress: PropTypes.func,
    rippleColor: PropTypes.string,
    containerStyle: PropTypes.any,
  };

  static defaultProps = {
    rippleColor: 'white'
  };

  static styles = StyleSheet.create({
    container: Platform.select({android: {
      overflow: 'hidden',
      paddingVertical: 5,
      borderRadius: 12,
    }}),
  });

  _handleOnPress = () => {
    const { onPress } = this.props;
    onPress && onPress();
  };
  

  render(){
    const { styles } = RippleBorderButton;
    const { rippleColor, containerStyle, onPress, ...otherProps } = this.props;
    return (
      <View style={[styles.container, containerStyle]}>
        {Platform.select({
          ios:(
            <TouchableOpacity 
              onPress={this._handleOnPress}
              {...otherProps}
            >
              {this.props.children}
            </TouchableOpacity>
          ),
          android:(
            <TouchableNativeFeedback
              background={TouchableNativeFeedback.Ripple(rippleColor, true)}
              onPress={this._handleOnPress}
              {...otherProps}
            >
              {this.props.children}
            </TouchableNativeFeedback>
          ),
        })}
      </View>
    );
  };
};

export class Checkbox extends React.Component {
  //props definition
  static propTypes = {
    label: PropTypes.string,
    isChecked: PropTypes.bool,
    onPress: PropTypes.func,
    //style props
    containerStyle: ViewPropTypes.style,
    textStyle: Text.propTypes.style,
  };

  static defaultProps = {
    label: 'checkbox',
    isChecked: false,
    onPress: () => {},
  }

  constructor(props){
    super(props);
    this.state = {
      isChecked: this.props.isChecked,
    };
  }

  shouldComponentUpdate(nextProps, nextState){
    const {isChecked} = this.state;
    const {label    } = this.props;
    
    if(nextProps.label     == label    ) return true;
    if(nextState.isChecked == isChecked) return true;

    return false;
  }

  isChecked(){
    return (this.state.isChecked);
  }

  _onPress = () => {
    const {isChecked} = this.state;
    const {label    } = this.props;
    this.setState({isChecked: !isChecked}, () => {
      //call callback func
      this.props.onPress(label, !isChecked);
    })
  }

  render(){
    const { containerStyle, textStyle } = this.props;
    //checkbox icon
    const iconProps = { type: 'ionicon', size: 20 };
    const on  = <Icon name='ios-radio-button-on'  color='black' {...iconProps}/>;
    const off = <Icon name='ios-radio-button-off' color='grey'  {...iconProps}/>;

    return(
      <TouchableOpacity 
        style={{flexDirection: 'row', ...containerStyle}}
        onPress={this._onPress}
      >
        {/*Checkbox*/}
        {(this.state.isChecked)? on : off}
        <Text style={{marginLeft: 7, ...textStyle}}>
          {this.props.label}
        </Text>
      </TouchableOpacity>
    );
  }
}

//pass array of string and ouput array of checkboxes
export function createCheckboxes(values = [], onPress = (label, isChecked) => {}, containerStyle, textStyle)  {
  const checkboxes = values.map((item, index) => {
    return (
      <Checkbox 
        key={'checkbox' + item + index} 
        label={item + ''} 
        onPress={onPress}
        containerStyle={containerStyle}
        textStyle={textStyle}
      />
    );
  });
  return checkboxes;
}

const styles = StyleSheet.create({
  shadow: {
    shadowOffset:{  width: 3,  height: 5,  },
    shadowColor: 'black',
    shadowRadius: 6,
    shadowOpacity: 0.5,
  }
});