import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { setStateAsync, timeout, shuffleArray } from '../functions/Utils';
import { STYLES } from '../Constants';

import { Button, ExpandCollapseTextWithHeader } from './Buttons';
import { Card } from './Views';

import _ from 'lodash';

import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import    { Header   } from 'react-navigation';
import    { Divider  } from 'react-native-elements';

import { AnimatedListItem } from './Views';

import { DangerZone } from 'expo';
import {ResourceModel} from '../functions/ResourcesStore';
const { Lottie } = DangerZone;

const RESOURCES_SHAPE = {
  dateposted: PropTypes.string,
  description: PropTypes.string,
  indexid: PropTypes.number,
  title: PropTypes.string,
  link: PropTypes.string,
};

export class ResourceItem extends React.PureComponent { 
  static propTypes = {
    resource: PropTypes.shape(RESOURCES_SHAPE),
    onPress : PropTypes.func,
  };

  static styles = StyleSheet.create({
    textTitle: {
      fontSize: 24, 
      fontWeight: 'bold'
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
      color: 'blue', 
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

  _renderHeader(){
    const { styles } = ResourceItem;
    const { resource } = this.props;

    //wrap inside model
    const model = new ResourceModel(resource);

    return(
      <View collapsable={true}>
        <Text style={styles.textTitle   }>{model.title}</Text>
        <Text style={styles.textSubtitle}>Last updated on {model.dateposted}</Text>
        <Divider style={{margin: 10}}/>
      </View>
    );
  };

  _renderFooter(){
    const { styles } = ResourceItem;
    const { resource } = this.props;

    return(
      <View collapsable={true}>
        <Text style={styles.textLink}>{resource.link}</Text>
      </View>
    );
  };

  _renderContent(){
    const { styles } = ResourceItem;
    const { resource } = this.props;

    //wrap inside model
    const model = new ResourceModel(resource);

    return (
      <Text style={styles.textBody} numberOfLines={4}>
        {model.description}
      </Text>
    );
  };

  render(){ 
    return(
      <Card>      
        <TouchableOpacity onPress={this._handleOnPress}>
          {this._renderHeader ()}
          {this._renderContent()}
        </TouchableOpacity>
        {this._renderFooter ()}
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
  }

  constructor(props){
    super(props);
    this.DEBUG = false;
  }

  _handleOnPress = (resource) => {
    const { onPress, resources } = this.props;
    onPress && onPress(resource, resources);
  };

  _renderItemResources = ({item, index}) => {
    return(
      <AnimatedListItem
        index={index}
        duration={500}
        multiplier={100}
        last={6}
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