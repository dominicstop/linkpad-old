import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import PropTypes from 'prop-types';

import { PURPLE } from '../Colors';
import { FONT_NAMES } from '../Constants';

export class NumberIndicator extends React.PureComponent {
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    //styles and appearance props
    size          : PropTypes.number,
    color         : PropTypes.string,
    containerStyle: PropTypes.object,
    textStyle     : PropTypes.object,
    adjustFontSize: PropTypes.bool  ,
    initFontSize  : PropTypes.number,
    diffFontSize  : PropTypes.number,
  };

  static defaultProps = {
    size          : 22         ,
    color         : PURPLE[600],
    adjustFontSize: true       ,
    initFontSize  : 18         ,
    diffFontSize  : 1          ,
  };

  static styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: 'white',
      ...Platform.select({
        ios: {
          fontWeight: '500',
        },
        android: {
          fontWeight: '800',          
        },
      }),
    },
  });

  render(){
    const { styles } = NumberIndicator;
    const { size, value, color, initFontSize, diffFontSize, adjustFontSize } = this.props;
    
    const length = (value || '').length - 1;
    const textStyle = {
      ...(adjustFontSize && {
        fontSize: initFontSize - (diffFontSize * length)
      }),
    };

    const containerStyle = {
      width : size,
      height: size,
      borderRadius   : size/2,
      backgroundColor: color,
    };

    return (
      <View style={[styles.container, containerStyle, this.props.containerStyle]}>
        <Text 
          numberOfLines={1}
          style={[styles.text, textStyle, this.props.textStyle]}
        >
          {value}
        </Text>
      </View>
    );
  };
};