import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { IconText } from './Views';
import { STYLES   } from '../Constants';

export class CustomHeader extends React.PureComponent {
  static propTypes = {
    allowFontScaling: PropTypes.bool,
    style: Text.propTypes.style,
    color: PropTypes.string,
    //icon props
    name: PropTypes.string,
    type: PropTypes.string,
    size: PropTypes.number,
  }

  static defaultProps = {
    color: 'white'
  }

  render(){
    return(
      <IconText
        text={this.props.children}
        textStyle={[{color: this.props.color, fontSize: 18, fontWeight: 'bold'}, this.props.style]}
        containerStyle={STYLES.glow}
        iconColor={this.props.color}
        iconName ={this.props.name }
        iconType ={this.props.type }
        iconSize ={this.props.size }
      />
    );
  }
}
