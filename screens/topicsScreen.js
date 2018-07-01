import React from 'react';
import { StyleSheet, Text, View, Dimensions, Image } from 'react-native';

import { LinearGradient, NativeLinearGradient } from 'expo';

import  Carousel, { ParallaxImage }  from 'react-native-snap-carousel';

export class TopicsScreen extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      data: [
        {
          title: 'Hello',
          uri: 'https://images.pexels.com/photos/36764/marguerite-daisy-beautiful-beauty.jpg?auto=compress&cs=tinysrgb&h=350',
        },
        {
          title: 'World',
          uri: 'https://images.pexels.com/photos/813269/pexels-photo-813269.jpeg?auto=compress&cs=tinysrgb&h=350',
        },
        {
          title: 'Test',
          uri: 'https://i.ytimg.com/vi/bGtTTJNLAws/maxresdefault.jpg',
        }
      ],
    }

  }

  _renderItem ({item, index} ,parallaxProps) {
    const containerHeight = 150;

    return (
      <View style={{height: containerHeight, shadowOffset:{  width: 5,  height: 5}, shadowColor: 'black', shadowOpacity: 0.4, shadowRadius: 13,}}>
        <View style={{ flexDirection: 'row', backgroundColor: 'grey', borderRadius: 12,}} overflow='hidden'>    
          <ParallaxImage
            source={{uri: item.uri}}
            containerStyle={{height: containerHeight, width: containerHeight, backgroundColor: 'blue'}}
            
            parallaxFactor={0.05}
            {...parallaxProps}
          />
        </View>
      </View>
    );
  }

  render () {
    const sliderWidth = Dimensions.get('window').width;
    const itemWidth = sliderWidth - 25;

      return (
          <Carousel
            containerCustomStyle={{marginTop: 10}}
            ref={(c) => { this._carousel = c; }}
            data={this.state.data}
            renderItem={this._renderItem}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            activeSlideAlignment={'center'}
            layout={'tinder'}
            layoutCardOffset={8}
            enableSnap={true}
            hasParallaxImages={true}
            
            
          />
      );
  }
}
