import React from 'react';
import { StyleSheet, Text, View, Platform, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { setStateAsync, timeout, shuffleArray } from '../functions/Utils';
import { STYLES } from '../Constants';

import { Button, ExpandCollapseTextWithHeader } from './Buttons';
import {Card} from './Views';

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

export class TipItem extends React.PureComponent { 
  static propTypes = {
    tip: PropTypes.shape(TIP_SHAPE),
  }

  constructor(props){
    super(props);
  }

  _onPress = (isCollapsed) => {
    this.animatedRootViewRef.pulse(750);
  }

  _renderHeader(){
    const { tip } = this.props;
    return(
      <View collapsable={true}>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>{tip.title}</Text>
        <Text style={{fontSize: 16, fontWeight: '100', color: 'grey'}}>Last updated on {tip.dateposted}</Text>
        <Divider style={{margin: 10}}/>
      </View>
    );
  }

  _renderCollapsable(){
    const { tip } = this.props;
    return(
      <Animatable.View 
        ref={r => this.animatedRootViewRef = r}
        useNativeDriver={true}
      >
        <View style={{marginHorizontal: 10, marginBottom: 10, padding: 13, backgroundColor: 'white', borderColor: 'rgb(197, 212, 216)', borderWidth: 3, borderRadius: 10, overflow: 'hidden'}}>
          <ExpandCollapseTextWithHeader
            collapsedNumberOfLines={5}
            style={{fontSize: 18, fontWeight: '300', textAlign: 'justify'}}
            text={tip.tip}
            titleComponent={this._renderHeader()}
            onPress={this._onPress}
          />
        </View>
      </Animatable.View>
    );
  }

  _renderNormal(){ 
    return(
      <View style={{marginHorizontal: 10, marginBottom: 10, padding: 13, backgroundColor: 'white', borderColor: 'rgb(197, 212, 216)', borderWidth: 3, borderRadius: 10, overflow: 'hidden'}}>      
        {this._renderHeader()}
        <Text style={{fontSize: 18, fontWeight: '300', textAlign: 'justify'}}>
            {this.props.tip.tip}
        </Text>
      </View>
    );
  }

  render(){
    const { tip } = this.props;
    const isTextLong = tip.tip.length > 200;
    return(
      isTextLong? this._renderCollapsable() : this._renderNormal()
    );
  }
}

export class TipList extends React.PureComponent {
  static propTypes = {
    tips: PropTypes.arrayOf(
      PropTypes.shape(TIP_SHAPE)
    ),
  }

  _renderItemTip = ({item, index}) => {
    return(
      <AnimatedListItem
        index={index}
        duration={500}
        multiplier={100}
        last={6}
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
        data={_.compact(this.props.tips)}
        keyExtractor={item => item.indexid + ''}
        renderItem={this._renderItemTip}
        {...flatListProps}
      />
    );
  }
}