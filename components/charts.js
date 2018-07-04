import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, ViewPropTypes, TextProps } from 'react-native';
import Pie from 'react-native-pie'


export class GaugeChart extends React.PureComponent {
  static propTypes = {
    percent: PropTypes.number,
    color: PropTypes.string,
    backgroundColor: PropTypes.string,
    thickness: PropTypes.number,
    radius: PropTypes.number,
    //styles
    containerStyle: ViewPropTypes.style,
    textStyle     : ViewPropTypes.style,
  }

  static defaultProps = {
    percent: 0,
    color: 'blue',
    backgroundColor: '#ddd',
    thickness: 5,
    radius: 50,
  }

  render(){
    const { percent, color, backgroundColor, thickness, radius, containerStyle, textStyle } = this.props;
    return(
      <View style={containerStyle}>
        <Pie
          radius={radius}
          innerRadius={radius-thickness}
          series={[percent, 100-percent]}
          colors={[color, 'red']}
          backgroundColor={backgroundColor}
        />
        <View style={[styles.gauge]}>
          <Text style={[styles.gaugeText, textStyle]}>{percent}%</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  gauge: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeText: {
    backgroundColor: 'transparent',
    color: '#000',
    fontSize: 24,
  },
})