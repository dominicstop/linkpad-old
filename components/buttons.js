import React from 'react';
import { Text, TouchableOpacity, ViewPropTypes, TextProps } from 'react-native';
import { Icon } from 'react-native-elements';
import PropTypes from 'prop-types';

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
    //style
    containerStyle: ViewPropTypes.style ,
    textStyle     : Text.propTypes.style,
  }

  render(){
    const {text, iconName, iconColor, iconType, iconSize, containerStyle, textStyle} = this.props;
    return(
      <TouchableOpacity
        style={[{flexDirection: 'row', alignItems: 'center'}, containerStyle]}
        {...this.props}
      >
        <Icon
          name ={iconName }
          color={iconColor}
          type ={iconType }
          size ={iconSize }
        />
        <Text style={[{marginLeft: 8}, textStyle]}>
          {text}
        </Text>
      </TouchableOpacity>
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
      textStyle,textStyleActive, textStyleInactive
    } = this.props;

    return(
      <IconButton
        {...this.props}
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