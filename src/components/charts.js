import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, ViewPropTypes, TextProps } from 'react-native';

import { IconText } from './Views';

import Pie from 'react-native-pie'
import {STYLES} from '../Constants';
import Chroma from 'chroma-js';



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
        <View>
          <Pie 
            radius={radius}
            innerRadius={radius-thickness}
            series={[percent]}
            colors={[color]}
            backgroundColor={backgroundColor}
          />
        </View>
        <View style={[styles.gauge, STYLES.mediumShadow]}>
          <Text style={[styles.gaugeText, textStyle]}>{percent}%</Text>
        </View>
      </View>
    );
  }
}

export class GradeDougnut extends React.PureComponent {
  static propTypes = {
    mistakes: PropTypes.number,
    correct : PropTypes.number,
    colors: PropTypes.arrayOf(
      PropTypes.string
    ),
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
    const { mistakes, correct, colors, thickness, radius, textStyle, containerStyle } = this.props;
    return(
      <View style={containerStyle}>
        <Pie
          radius     ={radius}
          innerRadius={radius-thickness}
          series     ={[correct, mistakes]}
          colors     ={colors}
        />
        <View style={[styles.gauge, ]}>
          <View style={styles.gradeTextContainer}>
            <IconText
              textStyle={styles.gradeText}
              iconName='check'
              iconType='feather'
              iconSize={18}
            />
            <Text style={styles.gradeText}>
              {correct}%
            </Text>
          </View>
          <View style={styles.gradeTextContainer}>
            <IconText
              textStyle={styles.gradeText}
              iconName='x'
              iconType='feather'
              iconSize={18}
            />
            <Text style={styles.gradeText}>
              {mistakes}%
            </Text>
          </View>
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
  gradeTextContainer: {
    flexDirection : 'row',
    justifyContent: 'flex-start',
  },
  gradeText: {
    marginLeft: 3,
    fontWeight: '100',
  }
})