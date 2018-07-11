import React from 'react';
import { Text, View, ViewPropTypes, TextProps } from 'react-native';
import { Icon } from 'react-native-elements';
import PropTypes from 'prop-types';

import { Header } from 'react-navigation';
import { BlurView } from 'expo';

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
    textStyle     : Text.propTypes.style,
  }

  render(){
    const {text, iconName, iconColor, iconType, iconSize, containerStyle, textStyle} = this.props;
    return(
      <View
        style={[{flexDirection: 'row', alignItems: 'center'}, containerStyle]}
        {...this.props}
      >
        <Icon
          name ={iconName }
          color={iconColor}
          type ={iconType }
          size ={iconSize }
        />
        <Text style={[{marginLeft: 7}, textStyle]}>
          {text}
        </Text>
      </View>
    );
  }
}

export class ViewWithBlurredHeader extends React.Component {
  render(){
    return(
      <View style={{flex: 1}}>
        {this.props.children}
        <BlurView 
          style={{position: 'absolute', width: '100%', height: Header.HEIGHT}}
          intensity={100}
          tint='default'
        />
      </View>
    );
  }
}