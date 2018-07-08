import React from 'react';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';

import { IconText } from './views'

export class CustomHeader extends React.PureComponent {
  static propTypes = {
    allowFontScaling: PropTypes.bool,
    style: Text.propTypes.style,
    color: PropTypes.string,
    //icon props
    iconName: PropTypes.string,
    iconType: PropTypes.string,
    iconSize: PropTypes.number,
  }

  static defaultProps = {
    color: 'white'
  }

  render(){
    return(
      <IconText
        text={this.props.children}
        textStyle={[{color: this.props.color, fontSize: 18, fontWeight: 'bold'}, this.props.style]}
        iconColor={this.props.color   }
        iconName ={this.props.iconName}
        iconType ={this.props.iconType}
        iconSize ={this.props.iconSize}
      />
    );
  }
}
