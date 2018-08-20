import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

import { Button   } from './Buttons';
import { FlipView } from './Views';

import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import    { Header   } from 'react-navigation';

export class PracticeQuestion extends React.PureComponent {
  /*
  

  */

  _renderFrontQuestion = () => {
    return(
      <View style={{padding: 15}}>
        <Button
          text={'Flip'}
          style={{backgroundColor: '#6200EA'}}
          iconName={'pencil-square-o'}
          iconType={'font-awesome'}
          iconSize={22}
          iconColor={'white'}
          onPress={() => this.questionFlipView.flipCard()}
        />
      </View>
    );
  }

  _renderBackQuestion = () => {
    return(
      <Button
        text={'Flip'}
        style={{backgroundColor: '#6200EA'}}
        iconName={'pencil-square-o'}
        iconType={'font-awesome'}
        iconSize={22}
        iconColor={'white'}
        onPress={() => this.questionFlipView.unflipCard()}
      />
    );
  }

  render(){
    return(
      <FlipView 
        ref={r => this.questionFlipView = r}
        containerStyle={[{flex: 1}, styles.shadow]}
        frontComponent={this._renderFrontQuestion()}
        frontContainerStyle={styles.questionCard}
        backComponent={this._renderBackQuestion()}
        backContainerStyle={styles.questionCard}
      />
    );
  }
}

export class PracticeExamList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      entries: [
        {title: 'Hello'},
        {title: 'World'},
      ]
    }
  }
  
  _renderItem({item, index}) {
    return (
      <PracticeQuestion/>
    );
  }

  render(){
    //ui values for carousel
    const headerHeight = Header.HEIGHT + 15;
    const screenHeight = Dimensions.get('window').height;
    const carouselHeight = {
      sliderHeight: screenHeight, 
      itemHeight  : screenHeight - headerHeight,
    };

    return(
      <Carousel
        ref={(c) => { this._carousel = c; }}
        data={this.state.entries}
        renderItem={this._renderItem}
        firstItem={0}
        activeSlideAlignment={'end'}
        vertical={true}
        lockScrollWhileSnapping={false}
        //scrollview props
        showsHorizontalScrollIndicator={true}
        bounces={true}
        {...carouselHeight}
      />
    );
  }
}

const styles = StyleSheet.create({
  questionCard: {
    flex: 1,
    backgroundColor: 'white', 
    marginBottom: 15, 
    marginHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  shadow: {
    shadowOffset:{  width: 3,  height: 5,  },
    shadowColor: 'black',
    shadowRadius: 6,
    shadowOpacity: 0.5,
  },
});