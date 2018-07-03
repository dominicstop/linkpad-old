import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Dimensions, Image, ScrollView, TouchableOpacity, ViewPropTypes } from 'react-native';

import { AnimatedGradient }  from './animatedGradient';
import { IconText } from './views';

import  Carousel, { ParallaxImage }  from 'react-native-snap-carousel';

export class CardItemPicture extends React.Component {
  static propTypes = {
    size: PropTypes.number
  }

  render(){
    const {size} = this.props;
    return(
      <View style={{height: size, width: size, backgroundColor: 'grey'}}
        onLayout={(event) => console.log(event.height)}
      >
      
      </View>
    );
  }
}

export class CardItemDetails extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      topic      : PropTypes.string,
      description: PropTypes.string,
    }),
    containerStyle: ViewPropTypes.style,
    onPress: PropTypes.func,
  }

  static defaultProps = {
    data: {
      topic      : 'Topic Name',
      description: 'Lorum ipsum sit amit topic description',
    },
    onPress: () => alert(),
  }

  constructor() {
    super();
  }

  render() {
    const { data, onPress, containerStyle } = this.props;
    const { topic, description } = data;
    return(
      <TouchableOpacity 
        style={[{ padding: 10 }, containerStyle]} 
        onPress={() => onPress(data)}
        activeOpacity={0.7}
      >
        {/*Title*/}
        <IconText
          text={topic}
          textStyle={{fontSize: 20, fontWeight: '500'}}
          iconColor='darkgrey'
          iconName='heart'
          iconType='entypo'
          iconSize={22}
        />
        <Text style={{flex: 1, fontSize: 16, fontWeight: '100', marginTop: 3,}}>
          {description}
        </Text>
      </TouchableOpacity>
    );
  }
}

export class CardItem extends React.Component {
  static propTypes = {
    cardHeight: PropTypes.number
  }

  static defaultProps = {
    cardHeight: 150
  }

  constructor() {
    super();
  }

  render() {
    const { cardHeight } = this.props;

    return(
      <View style={{ height: cardHeight, shadowOffset:{  width: 5,  height: 5}, shadowColor: 'black', shadowOpacity: 0.4, shadowRadius: 13,}}>
        <View style={{ height: '100%', flexDirection: 'row', backgroundColor: 'white', borderRadius: 12,}} overflow='hidden'>    
          {/*Left*/}
          <CardItemPicture size={cardHeight}/>
          {/*Right*/}
          <CardItemDetails/>
        </View>
      </View>
    );
  }
}

export class CardCarousel extends React.Component {
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

    return (
      <CardItem

      />
    );
  }

  render () {
    const sliderWidth = Dimensions.get('window').width;
    const itemWidth = sliderWidth - 20;

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
        layoutCardOffset={12}
        enableSnap={true}

      />
    );
  }
}

export class CardHeader extends React.Component {
  constructor() {
    super();
  }

  render() {
    return(null);
  }
}

export class CardGroup extends React.Component {
  constructor() {
    super();
  }

  render() {
    const cardGroupHeight = 250;

    return(
      <View style={{alignSelf: 'stretch', height: cardGroupHeight, backgroundColor: 'blue'}}>
        {/*Background*/}
        <AnimatedGradient
          style={{alignSelf: 'stretch', height: cardGroupHeight}}
          colorsTop   ={['red'  , 'orange', 'yellow']}
          colorsBottom={['blue' , 'purple' , 'violet' ]}
          speed={1000}
          numOfInterps={60}
        />
        {/*Foreground*/}
        <View style={{position: 'absolute', height: cardGroupHeight, paddingTop:20, justifyContent: 'center'}}>
          <CardCarousel/>
        </View>
      </View>
    );
  }
}

export const Data = {

}

export class CardList extends React.Component {
  render(){
    return(
      <ScrollView>
        <CardGroup/>
      </ScrollView>
    );
  }
  
}
