
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { View, Platform } from 'react-native';
import { DangerZone } from 'expo';
import {timeout} from '../functions/Utils';
let { Lottie } = DangerZone;

export default class LottieCircle extends React.PureComponent {
  static propTypes = {
    circleSize: PropTypes.number,
    iconSize  : PropTypes.number,
    playDelay : PropTypes.number,
  };

  static defaultProps = {
    circleSize: 100,
    iconSize  : 450,
    ...Platform.select({
      ios: { 
        playDelay: 0,
        wrapperStyle: {
          shadowOffset:{  width: 1,  height: 4,  },
          shadowColor: 'black',
          shadowRadius: 5,
          shadowOpacity: 0.4,
        },
      },
      android: {
        //delay animation start due to lag
        playDelay: 1000,
      },
    })
  }

  constructor(props){
    super(props);
    this.iconContainerSize = props.circleSize;
  }

  async componentDidMount(){
    await timeout(this.props.playDelay);
    this.animation.play();
  }

  play  = () => { this.animation.play () }
  reset = () => { this.animation.reset() }

  _renderCircle(){
    const { circleSize, iconSize, containerStyle, containerProps, lottieStyle, ...lottieProps } = this.props;
    //margins are handled differently on ios and android
    const divisor = Platform.select({ios: 4, android: 2});
    const marginOffset = (iconSize - circleSize) / divisor * -1;

    //make view into a circle
    const circleStyle = {
      width : circleSize,
      height: circleSize,
      borderRadius: circleSize/2,
      overflow: 'hidden',
      backgroundColor: 'white',
    };

    //center lottie into view
    const lottieLayoutStyle = {
      width: iconSize, 
      height: iconSize, 
      marginTop: marginOffset, 
      marginLeft: marginOffset
    };

    return(
      <View style={[circleStyle, containerStyle]}>
        <Lottie
          ref={r => this.animation = r}
          style={[lottieLayoutStyle, lottieStyle]}
          hardwareAccelerationAndroid={true}
          useHardwareAcceleration={true}
          autoPlay={true}
          loop={true}
          speed={0.9}
          cacheStrategy={'weak'}
          {...lottieProps}
        />
      </View>
    );
  }

  _renderWrapper(){
    const { wrapperStyle, wrapperProps } = this.props;
    return(
      <View style={wrapperStyle} {...wrapperProps}>
        {this._renderCircle()}
      </View>
    );
  }

  render(){
    return Platform.select({
      ios: this._renderWrapper(),
      android: this._renderCircle(),
    });
  }
}