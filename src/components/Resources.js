import React, { Fragment } from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, FlatList, Platform } from 'react-native';
import PropTypes from 'prop-types';

import { ResourceModel } from '../models/ResourceModel';
import { BLUE, PURPLE } from '../Colors';
import { Card, AnimatedListItem } from './Views';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import { Divider } from 'react-native-elements';

const RESOURCES_SHAPE = {
  dateposted: PropTypes.string,
  description: PropTypes.string,
  indexid: PropTypes.number,
  title: PropTypes.string,
  link: PropTypes.string,
};

class ResourceItem extends React.PureComponent { 
  static propTypes = {
    resource: PropTypes.shape(RESOURCES_SHAPE),
    onPress : PropTypes.func,
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
    const { onPress, resource } = this.props;
    onPress && onPress(resource);
  };

  render(){
    const { styles } = ResourceItem;
    const { resource } = this.props;

    //wrap inside model
    const model = new ResourceModel(resource);

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
            {model.description}
          </Text>
          <Text style={styles.textLink}>
            {resource.link}
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };
};

export class ResourceList extends React.PureComponent {
  static propTypes = {
    onPress  : PropTypes.func,
    resources: PropTypes.arrayOf(
      PropTypes.shape(RESOURCES_SHAPE)
    ),
  };

  constructor(props){
    super(props);
    this.DEBUG = false;
  };

  _handleOnPress = (resource) => {
    const { onPress, resources } = this.props;
    onPress && onPress(resource, resources);
  };

  _renderItemResources = ({item, index}) => {
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <AnimatedListItem
        duration={500}
        multiplier={100}
        last={6}
        {...{index, animation}}
      >
        <ResourceItem 
          resource={item}
          onPress={this._handleOnPress}
        />
      </AnimatedListItem>
    );
  };

  render(){
    const { resources, ...flatListProps } = this.props;
    return(
      <FlatList
        ref={r => this.flatlist = r}
        data={_.compact(resources)}
        keyExtractor={item => item.indexid + ''}
        renderItem={this._renderItemResources}
        {...flatListProps}
      />
    );
  };
};