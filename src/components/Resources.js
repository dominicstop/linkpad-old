import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, FlatList } from 'react-native';
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
  }

  constructor(props){
    super(props);
  }

  _onPress = (isCollapsed) => {
    this.animatedRootViewRef.pulse(750);
  }

  _renderHeader(){
    const { resource } = this.props;
    return(
      <View collapsable={true}>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>{resource.title}</Text>
        <Text style={{fontSize: 16, fontWeight: '100', color: 'grey'}}>Last updated on {resource.dateposted}</Text>
        <Divider style={{margin: 10}}/>
      </View>
    );
  }

  _renderFooter(){
    const { resource } = this.props;
    return(
      <View collapsable={true}>
        <Text style={{fontSize: 18, color: 'blue', textDecorationLine: 'underline', marginTop: 5}}>{resource.link}</Text>
      </View>
    );
  }

  _renderCollapsable(){
    const { resource } = this.props;
    return(
      <Animatable.View 
        ref={r => this.animatedRootViewRef = r}
        useNativeDriver={true}
      >
        <View style={{marginHorizontal: 10, marginBottom: 10, padding: 13, backgroundColor: 'white', borderColor: 'rgb(197, 212, 216)', borderWidth: 3, borderRadius: 10, overflow: 'hidden'}}>
          <ExpandCollapseTextWithHeader
            collapsedNumberOfLines={5}
            style={{fontSize: 18, fontWeight: '300', textAlign: 'justify'}}
            text={resource.description}
            titleComponent={this._renderHeader()}
            onPress={this._onPress}
          />
          {this._renderFooter()}
        </View>
      </Animatable.View>
    );
  }

  _renderNormal(){ 
    return(
      <View style={{marginHorizontal: 10, marginBottom: 10, padding: 13, backgroundColor: 'white', borderColor: 'rgb(197, 212, 216)', borderWidth: 3, borderRadius: 10, overflow: 'hidden'}}>      
        {this._renderHeader()}
        <Text style={{fontSize: 18, fontWeight: '300', textAlign: 'justify'}}>
            {this.props.resource.description}
        </Text>
        {this._renderFooter()}
      </View>
    );
  }

  render(){
    const { resource } = this.props;
    const isTextLong = resource.description.length > 200;
    return(
      isTextLong? this._renderCollapsable() : this._renderNormal()
    );
  }
}

export class ResourceList extends React.PureComponent {
  static propTypes = {
    resources: PropTypes.arrayOf(
      PropTypes.shape(RESOURCES_SHAPE)
    ),
  }

  constructor(props){
    super(props);
    this.DEBUG = false;
  }

  componentDidMount(){
    //fix for contentInset bug
    if(this.DEBUG) console.log('\n\n\nReceived Resources Prop: \n' + this.props.resources);
    setTimeout(() => {
      this.flatlist.scrollToOffset({animated: false, offset: 100});
      this.flatlist.scrollToOffset({animated: false, offset: -80});
    }, 1);
  }

  _renderItemResources = ({item, index}) => {
    return(
      <AnimatedListItem
        index={index}
        duration={500}
        multiplier={100}
        last={6}
      >
        <ResourceItem resource={item}/>
      </AnimatedListItem>
    );
  }

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
  }
}