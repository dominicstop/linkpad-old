import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

import { Button } from './Buttons';

import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import    { Header   } from 'react-navigation';

const overlayOpacity = 0.2

Animatable.initializeRegistryWithDefinitions({
  //unflipped: start trans
  flipLeftStart: {
    easing: 'ease-in',
    from  : { transform: [{ rotateY: '0deg'  }, { scale: 1    }] },
    to    : { transform: [{ rotateY: '90deg' }, { scale: 0.95 }] },
  },
  //unflipped: end trans
  flipLeftEnd: {
    easing: 'ease-out',
    from  : { transform: [{ rotateY: '-90deg' }, { scale: 0.95 }] },
    to    : { transform: [{ rotateY: '0deg'   }, { scale: 1    }] },
  },
  //flipped: start trans
  flipRightStart: {
    easing: 'ease-in',
    from  : { transform: [{ rotateY: '0deg'   }, { scale: 1    }] },
    to    : { transform: [{ rotateY: '-90deg' }, { scale: 0.95 }] },
  },
  //flipped: end trans
  flipRightEnd: {
    easing: 'ease-out',
    from  : { transform: [{ rotateY: '-90deg' }, { scale: 0.95 }] },
    to    : { transform: [{ rotateY: '0deg'   }, { scale: 1    }] },
  },
  //partially fade in
  partialFadeIn: {
    from  : { opacity: 0 },
    to    : { opacity: overlayOpacity },
  },
  //partially fade out
  partialFadeOut: {
    from  : { opacity: overlayOpacity },
    to    : { opacity: 0 },
  }
});

//base card container
export class QuestionCard extends React.PureComponent {
  render(){
    const { style, ...viewProps } = this.props;
    return(
      <View
        style={[styles.questionCard, style]}
        {...viewProps}
      >
        {this.props.children}
      </View>
    );
  }
}

export class PracticeQuestion extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      flipped: false,
    }
  }

  toggleFlip = () => {

  }

  _flipCard = async () => {
    //flip start
    await Promise.all([
      this.animatedFrontBlackOverlay.partialFadeIn(200),
      this.animatedCard             .flipLeftStart(200),
    ]);

    //hide front, show back
    await this.setState({flipped: true});

    //flip end
    await Promise.all([
      this.animatedBackBlackOverlay.partialFadeOut(250),
      this.animatedCard            .flipLeftEnd   (250),
    ]);
  }

  _unflipCard = async () => {
    //unflip start
    await Promise.all([
      this.animatedBackBlackOverlay.partialFadeIn (200),
      this.animatedCard            .flipRightStart(200),
    ]);

    //hide back, show front
    await this.setState({flipped: false});

    //unflip end
    await Promise.all([
      this.animatedFrontBlackOverlay.partialFadeOut(250),
      this.animatedCard             .flipRightEnd  (250),
    ]);
  }

  //shown when flipped: false
  _renderFrontQuestion(){
    return(
      <QuestionCard>
        <Button
          text={'Flip'}
          style={{backgroundColor: '#6200EA'}}
          iconName={'pencil-square-o'}
          iconType={'font-awesome'}
          iconSize={22}
          iconColor={'white'}
          onPress={this._flipCard}
        />
        <Animatable.View 
          style={[styles.cardBlackOverlay]} 
          ref={r => this.animatedFrontBlackOverlay = r}
          pointerEvents={'none'}
          useNativeDriver={true}
        />
      </QuestionCard>
    );
  }

  _renderBackQuestion(){
    return(
      <QuestionCard>
        <Button
          text={'UnFlip'}
          style={{backgroundColor: '#6200EA'}}
          iconName={'pencil-square-o'}
          iconType={'font-awesome'}
          iconSize={22}
          iconColor={'white'}
          onPress={this._unflipCard}
        />
        <Animatable.View 
          style={[styles.cardBlackOverlay, {opacity: 0.5}]} 
          ref={r => this.animatedBackBlackOverlay = r}
          pointerEvents={'none'}
          useNativeDriver={true}
        />
      </QuestionCard>
    );
  }

  render(){
    const { flipped } = this.state;
    return(
      <Animatable.View
        style={[{flex: 1, 
        transform: [
          { rotateY: '0deg'}
        ]}, styles.shadow]}
        ref={r => this.animatedCard = r}
        useNativeDriver={true}
      >
        {flipped? this._renderBackQuestion() : this._renderFrontQuestion()}
      </Animatable.View>
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
    marginHorizontal: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  shadow: {
    shadowOffset:{  width: 3,  height: 5,  },
    shadowColor: 'black',
    shadowRadius: 6,
    shadowOpacity: 0.5,
  },
  cardBlackOverlay: {
    position: 'absolute', 
    width: '100%', 
    height: '100%', 
    backgroundColor: 'black',
    opacity: 0,
  }
});