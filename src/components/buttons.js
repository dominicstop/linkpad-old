import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewPropTypes, TextProps, UIManager, LayoutAnimation } from 'react-native';
import PropTypes from 'prop-types';

import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo';
import { Icon } from 'react-native-elements';



UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

//icon and text
export class IconButton extends React.PureComponent {
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
    textStyle     : Text.propTypes.style,
  }

  render(){
    const {text, iconName, iconColor, iconType, iconSize, containerStyle, textStyle, children, iconProps, ...otherProps} = this.props;
    return(
      <TouchableOpacity
        style={[{flexDirection: 'row', alignItems: 'center'}, containerStyle]}
        {...otherProps}
      >
        <Icon
          name ={iconName }
          color={iconColor}
          type ={iconType }
          size ={iconSize }
          {...iconProps}
        />
        <Text style={[{marginLeft: 8, flex: 1}, textStyle]}>
          {text}
        </Text>
        {this.props.children}        
      </TouchableOpacity>
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