import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, ScrollView } from 'react-native';
import PropTypes from 'prop-types';

import Animated from 'react-native-reanimated';
import { BlurView } from 'expo';

import Interactable from './Interactable';
import { IconText } from '../components/Views';
import { timeout } from '../functions/Utils';


const Screen = {
  width : Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
};

export class SwipableModal extends Component {
  static propTypes = {
    snapPoints: PropTypes.arrayOf(PropTypes.shape({
      //y: distance from top
      y: PropTypes.number,
    })),
  }

  static defaultProps = {
    snapPoints: [
      { y: 40 },
      { y: Screen.height - (Screen.height * 0.7) },
      { y: Screen.height * 1.2 },
    ]
  }


  constructor(props) {
    super(props);
    this._deltaY = new Animated.Value(Screen.height - 100);
  }

  _handleOnSnap = ({nativeEvent}) => {
    const { onSnap } = this.props;
    const { index, x , y } = nativeEvent;
    onSnap && onSnap(nativeEvent);
  }

  _renderShadow = () => {
    //shadow behind panel
    const shadowStyle = {
      backgroundColor: 'black',
      opacity: this._deltaY.interpolate({
        inputRange: [0, Screen.height - 100],
        outputRange: [0.5, 0],
        extrapolateRight: 'clamp',
      }),
    };

    return(
      <Animated.View
        pointerEvents={'box-none'}
        style={[styles.panelContainer, shadowStyle]}
      />
    );
  }

  render = () => {
    const { snapPoints } = this.props;

    return (
      <Interactable.View
        verticalOnly={true}
        boundaries={{ top: -300 }}
        initialPosition={snapPoints[1]}
        animatedValueY={this._deltaY}
        ref={r => this._interactable = r}
        onSnap={this._handleOnSnap}
        {...{snapPoints}}
      >
        <View style={styles.panel}>
          {this.props.children}
        </View>
      </Interactable.View>
    );
  }
}

//used in welcome screen
export class WelcomeScreenModalContent extends React.Component {
  _renderTop(){
    return(
      <View style={{width: '100%', alignItems: 'center', paddingVertical: 15}}>
        <View style={{width: 40, height: 8, borderRadius: 4, backgroundColor: '#00000040',}}/>
      </View>
    );
  }

  _renderBody(){
    return(
      <ScrollView style={{paddingTop: 5, paddingHorizontal: 15, marginBottom: 250}} contentContainerStyle={{paddingBottom: 100}}>
        <IconText
          textStyle={styles.textTitle}
          iconSize ={32}
          text={'About'}
          iconColor='rgba(0, 0, 0, 0.5)'
          iconName ='ios-information-circle'
          iconType ='ionicon'
        />
        <Text style={styles.textBody}>
          {"Sed posuere consectetur est at lobortis. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor."}
        </Text>

        <IconText
          containerStyle={{marginTop: 25}}
          textStyle={styles.textTitle}
          iconSize ={32}
          text={'Contact'}
          iconColor='rgba(0, 0, 0, 0.5)'
          iconName ='ios-contact'
          iconType ='ionicon'
        />
        <Text style={styles.textBody}>
          {"Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
        </Text>

        <IconText
          containerStyle={{marginTop: 25}}
          textStyle={styles.textTitle}
          iconSize ={32}
          text={'Our Policy'}
          iconColor='rgba(0, 0, 0, 0.5)'
          iconName ='ios-checkmark-circle'
          iconType ='ionicon'
        />
        <Text style={styles.textBody}>
          {"Donec id elit non mi porta gravida at eget metus. Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor."}
        </Text>
      </ScrollView>
    );
  }

  render(){
    return(
      <BlurView style={{flex: 1}} intensity={100}>
        <View style={{flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
          {this._renderTop ()}
          {this._renderBody()}
        </View>
      </BlurView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#efefef',
    overflow: 'hidden',
  },
  panelContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  panel: {
    height: Screen.height + 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
    overflow: 'hidden'
  },
  textTitle: {
    fontSize: 30, fontWeight: '700', alignSelf: 'center', marginBottom: 2, color: 'rgba(0, 0, 0, 0.75)'
  },
  textBody: {
    textAlign: 'justify', fontSize: 20, fontWeight: '300'
  }
});