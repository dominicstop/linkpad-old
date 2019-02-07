import PropTypes from 'prop-types';
import React from 'react';
import { processColor } from 'react-native';

// const {height, width} = Dimensions.get('window');

import Chroma from 'chroma-js'
import { LinearGradient } from 'expo';

export class AnimatedGradient extends React.PureComponent {
  static propTypes = {
    speed       : PropTypes.number,
    numOfInterps: PropTypes.number,
    //gradient colors
    colorsTop   : PropTypes.arrayOf(PropTypes.string),
    colorsBottom: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    speed       : 1000,
    numOfInterps: 200 ,
    //gradient colors
    colorsTop   : ['red'  , 'pink', 'orange', 'yellow'],
    colorsBottom: ['pink' , 'red' , 'cyan'  , 'green' ],
  }

  constructor(props){
    super(props);
    //keep track of the current index
    this.colorIndex = 0;
    this.isReverse  = false;
    //unwrap props
    const {colorsTop, colorsBottom, numOfInterps} = props;
    
    //interpolate colors
    this.colorsTop    = Chroma.scale(colorsTop   ).colors(numOfInterps);
    this.colorsBottom = Chroma.scale(colorsBottom).colors(numOfInterps);

    this.state = {
      colors: [colorsTop[0], colorsBottom[0]],
    };
  }

  nextColors(){
    const { colorsTop, colorsBottom, colorIndex } = this;

    //decrement on reach end and vice versa
    if (colorIndex == colorsTop.length-1 ) this.isReverse = true ;
    if (colorIndex == 0                  ) this.isReverse = false;

    this.isReverse ? this.colorIndex-- : this.colorIndex++;
    return [colorsTop[colorIndex], colorsBottom[colorIndex]];
  }

  start(){
    const { speed } = this.props;
    //stop if there's already a timer
    if(this.gradientInterval) return;
    this.gradientInterval = setInterval( () => {
      //update gradient colors
      const colors = this.nextColors();
      this.setState({colors});
    }, speed);
  }

  stop(){
    if(this.gradientInterval){
      clearInterval(this.gradientInterval);
      this.gradientInterval = undefined;
    }
  }

  componentDidMount(){
    this.start();
  }

  componentWillUnmount(){
    this.stop();
  }

  render(){
    const { colors } = this.state;
    return(
      <LinearGradient
        ref={ref => this.linearGradientRef = ref}
        {...{colors, ...this.props}}
      >
        {this.props.children}
      </LinearGradient>
    );
  }
}