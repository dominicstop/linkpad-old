import React, { PureComponent } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native'

const NUM_LAYERS = 10
const NUM_STARS = 150

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomXY(w, h) {
  let largeAxis = w
  if (largeAxis < h) {
    largeAxis = h
  }
  while (true) {
    const x = getRandomInt(largeAxis)
    const y = getRandomInt(largeAxis)
    if (x < w && y < h) {
      return {
        x, y
      }
    }
  }
}

class StarLayer extends PureComponent {
  constructor (props) {
    super(props)
    const { height, width } = Dimensions.get('window');
    this.state = {
      starPos: Array(NUM_STARS).fill().map(() => {
        return randomXY(width, height)
      })
    }
  }

  render () {
    const stars = this.state.starPos.map(({ x, y }, idx) => {
      return (
        <View key={idx} style={{
          position: 'absolute',
          top: y,
          left: x,
          width: 1.2,
          height: 1.2,
          backgroundColor: '#fff'
        }}
        />
      )
    })
    return (
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: this.props.anim.opacity,
          transform: [
            { scale: this.props.anim.scale }
          ]
        }}>
        {stars}
      </Animated.View>
    )
  }
}

export default class Starfield extends PureComponent {
  constructor (props) {
    super(props)
    const anims = Array(NUM_LAYERS).fill().map((_, idx) => {
      const phase = idx / NUM_LAYERS
      const zPos = new Animated.Value(1.0)
      const zp = Animated.add(Animated.modulo(Animated.add(zPos, phase), 1), 0.1)
      const animScale = Animated.divide(1, zp)
      const opacity = Animated.add(Animated.multiply(-1, zp), 1)
      return {
        zPos,
        scale: animScale,
        opacity
      }
    })
    this.state = {
      anims
    }
  }

  componentDidMount () {
    this.state.anims.forEach((anim) => {
      Animated.loop(
        Animated.timing(anim.zPos,
        {
          toValue: 0.0,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true
        }),
        {
          iterations: -1,
          useNativeDriver: true,
        }
      ).start()
    })
  }

  render () {
    const layers = this.state.anims.map((anim, idx) => {
      return <StarLayer key={idx} anim={anim} />
    })
    return (
      <View style={{
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        flex:1
      }}
      >
        {layers}
      </View>
    )
  }
}