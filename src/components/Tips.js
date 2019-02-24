import React from 'react';
import { StyleSheet, Text, TouchableOpacity, FlatList, Platform } from 'react-native';
import PropTypes from 'prop-types';

import { BLUE, PURPLE } from '../Colors';
import { Card }  from './Views';
import { AnimatedListItem } from './Views';
import { TipModel } from '../models/TipModel';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import { Divider  } from 'react-native-elements';

class TipItem extends React.PureComponent { 
  static propTypes = {
    tip: PropTypes.object,
    onPress: PropTypes.func,
    index: PropTypes.number,
  };

  static styles = StyleSheet.create({
    divider: {
      marginVertical: 10,
      marginHorizontal: 15,
    },
    textTitle: {
      fontSize: 24, 
      fontWeight: 'bold',
      color: PURPLE[1100]
    },
    textSubtitle: {
      fontSize: 16, 
      fontWeight: '100', 
      color: 'grey',
    },
    textBody: {
      fontSize: 18, 
      fontWeight: '300', 
      textAlign: 'justify'
    },
    textLink: {
      fontSize: 18, 
      color: BLUE[800], 
      textDecorationLine: 'underline', 
      marginTop: 5
    },
  });

  constructor(props){
    super(props);
  };

  _handleOnPress = () => {
    const { onPress, tip, index } = this.props;
    onPress && onPress({tip, index});
  };

  render(){
    const { styles } = TipItem;
    const { tip } = this.props;

    //wrap inside model
    const model = new TipModel(tip);

    return(
      <Card>      
        <TouchableOpacity onPress={this._handleOnPress}>
          <Text style={styles.textTitle}>
            {model.title}
          </Text>
          <Text style={styles.textSubtitle}>
            {`Last updated on ${model.dateposted}`}
          </Text>
          <Divider style={styles.divider}/>
          <Text style={styles.textBody} numberOfLines={4}>
            {model.tip}
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };
};

export class TipList extends React.PureComponent {
  static propTypes = {
    tips: PropTypes.array,
    onPressTip:PropTypes.func,
  };

  _handleKeyExtractor = (item) => {
    return `tipno:${item.tipnumber}-indexid:${item.indexid}`;
  };

  _handleOnPressTip = ({tip, index}) => {
    const { tips, onPressTip } = this.props;
    onPressTip && onPressTip({tip, tips, index});
  };

  _renderItemTip = ({item, index}) => {

    const animation = Platform.select({ios: 'fadeInUp', android: 'zoomIn'});

    return(
      <AnimatedListItem
        index={index}
        duration={500}
        multiplier={100}
        last={6}
        {...{animation}}
      >
        <TipItem 
          tip={item}
          onPress={this._handleOnPressTip}
          {...{index}}
        />
      </AnimatedListItem>
    );
  };

  render(){
    const { tips, ...flatListProps } = this.props;
    const data = _.compact(tips);
    return(
      <FlatList
        ref={r => this.flatlist = r}
        keyExtractor={this._handleKeyExtractor}
        renderItem={this._renderItemTip}
        {...{data, ...flatListProps}}
      />
    );
  };
};