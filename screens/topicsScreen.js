import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

import Carousel from 'react-native-snap-carousel';

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
          uri: '',
        }
      ],
    }
  }

  _renderItem ({item, index}) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'stretch', backgroundColor: 'grey', borderRadius: 12, height: 150, shadowOffset:{  width: 5,  height: 5}, shadowColor: 'black', shadowOpacity: 0.25,}}>
          <View style={{width: 150, height: 150, backgroundColor: 'yellow'}}>
          
          </View>
          <View style={{flex: 1}}>
            <Text>{index}</Text>
          </View>
        </View>
    );
  }

  render () {
    const sliderWidth = Dimensions.get('window').width;
    const itemWidth = sliderWidth - 30;

      return (
          <Carousel
            containerCustomStyle={{marginTop: 10}}
            ref={(c) => { this._carousel = c; }}
            data={this.state.data}
            renderItem={this._renderItem}
            sliderWidth={sliderWidth}
            sliderHeight={500}
            itemWidth={itemWidth}
            activeSlideAlignment={'center'}
            layout={'tinder'}
            layoutCardOffset={8}
            enableSnap={true}
            
            
          />
      );
  }
}
