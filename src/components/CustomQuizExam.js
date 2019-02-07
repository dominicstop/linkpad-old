import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, FlatList, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

import { Header } from 'react-navigation';
import Carousel from 'react-native-snap-carousel';

class Question extends React.PureComponent {
  render(){
    return(
      null
    );
  };
};

class QuestionItem extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
      margin: 12,
      borderRadius: 20,
      shadowColor: 'black',
      shadowRadius: 5,
      shadowOpacity: 0.5,
      shadowOffset: {  
        width: 2,  
        height: 4,  
      },
    }
  });

  constructor(props){
    super(props);
  };


  
  render(){
    const { styles } = QuestionItem;

    return(
      <View style={styles.container}>

      </View>
    );
  };  
};

export class CustomQuizList extends React.Component {
  static propTypes = {
    quiz: PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  constructor(props){
    super(props);
    this.state = {
      quiz: [{}, {}, {}],
    };
  };

  _renderItem = ({item, index}) => {
    const isLast = false;
    
    return (
      <QuestionItem
        question={item}
        onPressNextQuestion={this._onPressNextQuestion}
        onEndReached={this.props.onEndReached}
        onAnswerSelected={this._onAnswerSelected}
        {...{isLast, index}}
      />
    );
  };

  render(){
    const { styles } = CustomQuizList;
    const { ...otherProps } = this.props;

    //get screen height/width
    const dimensions   = Dimensions.get('window');
    const screenHeight = dimensions.height;
    const screenWidth  = dimensions.width ;
    
    //ui values for carousel
    const headerHeight = Platform.select({
      ios    : Header.HEIGHT,
      android: Header.HEIGHT + StatusBar.currentHeight,
    });

    const carouseProps = {
      scrollEnabled: true,
      itemHeight: screenHeight - headerHeight,
      ...Platform.select({
        ios: {
          sliderHeight: screenHeight,
          activeSlideAlignment: 'end',
          vertical: true,
        },
        android: {
          sliderHeight: screenHeight - headerHeight,
          sliderWidth : screenWidth,
          itemWidth   : screenWidth,
          vertical: false,
          activeSlideAlignment: 'center'
        }
      }),
      ...otherProps,
    };

    return(
      <View style={styles.container}>
        <Carousel
          ref={r => this._carousel = r }
          data={this.state.quiz}
          renderItem={this._renderItem}
          //onSnapToItem={this._handleOnSnapToItem}
          //scrollview props
          showsHorizontalScrollIndicator={true}
          bounces={true}
          lockScrollWhileSnapping={true}
          //other props
          {...carouseProps}
        />
      </View>
    );
  };
};