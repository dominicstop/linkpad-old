import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { setStateAsync, timeout, shuffleArray } from '../functions/Utils';
import { STYLES } from '../Constants';

import { Button, ExpandCollapseTextWithHeader } from './Buttons';

import _ from 'lodash';

import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import    { Header   } from 'react-navigation';
import    { Divider  } from 'react-native-elements';

import { AnimatedListItem } from './Views';

import { DangerZone } from 'expo';
const { Lottie } = DangerZone;

const TIP_SHAPE = {
  dateposted: PropTypes.string,
  indexid: PropTypes.number,
  tip: PropTypes.string,
  tipnumber: PropTypes.number,
  title: PropTypes.string,
};

export class Card extends React.PureComponent {
  render(){
    const { styles, viewProps } = this.props; 
    return(
      <View 
        style={[STYLES.mediumShadow, {padding: 12, backgroundColor: 'white', margin: 10, borderRadius: 10}, styles]} 
        {...viewProps}
      >
        {this.props.children}
      </View>
    );
  }
}

export class TipItem extends React.PureComponent { 
  static propTypes = {
    tip: PropTypes.shape(TIP_SHAPE),
  }

  render(){
    const { tip } = this.props;
    return(
      <Card>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>{tip.title}</Text>
        <Text style={{fontSize: 16, fontWeight: '100', color: 'grey'}}>Last updated on {tip.dateposted}</Text>
        <Divider style={{margin: 10}}/>
        <Text style={{fontSize: 18, fontWeight: '300'}}>{tip.tip}</Text>
      </Card>
    );
  }
}

export class TipList extends React.PureComponent {
  static propTypes = {
    tips: PropTypes.arrayOf(
      PropTypes.shape(TIP_SHAPE)
    ),
  }

  componentDidMount(){
    //fix for contentInset bug
    setTimeout(() => {
      this.flatlist.scrollToOffset({animated: false, offset: 100});
      this.flatlist.scrollToOffset({animated: false, offset: -80});
    }, 500)
  }

  _renderItemTip = ({item, index}) => {
    return(
      <AnimatedListItem
        index={index}
        duration={500}
        multiplier={10}
      >
        <TipItem tip={item}/>
      </AnimatedListItem>
    );
  }

  render(){
    const { tips, ...flatListProps } = this.props;
    return(
      <FlatList
        ref={r => this.flatlist = r}
        data={this.props.tips}
        keyExtractor={item => item.indexid + ''}
        renderItem={this._renderItemTip}
        {...flatListProps}
      />
    );
  }
}