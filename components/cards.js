import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Dimensions, Image, FlatList, TouchableOpacity, ViewPropTypes } from 'react-native';

import { AnimatedGradient }  from './animatedGradient';
import { IconText } from './views';
import { IconButton } from './buttons';
import { GaugeChart, GradeDougnut } from './charts';

import Chroma from 'chroma-js'
import Carousel, { ParallaxImage }  from 'react-native-snap-carousel';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo'

const cardGroupHeight = 150;



export const subjectProps = {
  subjectID  : PropTypes.string,
  subjectName: PropTypes.string,
  subjectDesc: PropTypes.string,
}

export const moduleProps = {
  moduleID  : PropTypes.string,
  moduleName: PropTypes.string,
  moduleDesc: PropTypes.string,
  subjects  : PropTypes.arrayOf(
    PropTypes.shape(subjectProps)
  ),
}

export const progressProps = {
  mistakes  : PropTypes.number,
  correct   : PropTypes.number,
  questions : PropTypes.number,
}

//shows a the progress in a pie chart
export class SubjectProgress extends React.PureComponent {
  static propTypes = {
    progressData: PropTypes.shape(progressProps),
  }

  constructor(props){
    super(props);
    this.state = {
      mode: 0,
    }
  }

  toggle(callback){
    const { mode } = this.state;
    this.setState({
      mode: (mode == 2) ? 0 : mode+1 
    }, callback());
  }

  _animateChartZoomout = () => {
    this.chartView.fadeOut(100).then(() => {
      this.toggle(() => {
        this.chartView.bounceIn(500)
      });
    });
  }

  _animateChartFade = () => {
    this.chartView.fadeOut(100).then(() => {
      this.toggle(() => {
        this.chartView.fadeIn(500)
      });
    });
  }

  _onPressChart = () => {
    const { mode } = this.state;
    if (mode == 0) this._animateChartFade   ();
    else           this._animateChartZoomout();
  }

  render(){
    const { size, progressData, color, backgroundColor } = this.props;
    const { mode } = this.state;

    //const { correct, questions } = progressData;

    //ui computations
    const margin      = 15;
    const chartRadius = 50;
    const chartSize   = chartRadius * 2;
    const viewWidth   = chartSize + margin;

    //grade computations
    const answher = (progressData.correct + progressData.mistakes) 
    const percent = answher / progressData.questions * 100;

    const progress = <GaugeChart 
      percent={percent}
      radius={chartRadius}
      thickness={10}
      color={color}
      backgroundColor={backgroundColor}
    />

    const mistakes = <GradeDougnut
      mistakes={progressData.mistakes}
      correct ={progressData.correct }
      colors={['green', 'red']}
      radius={50}
      thickness={10}
    />

    const fraction = <View
      style={{backgroundColor: 'lightgrey', width: chartSize, height: chartSize, alignItems: 'center', justifyContent: 'center', borderRadius: chartSize}}  
    >
      <Text style={{fontSize: 20, }}>
        {answher}/{progressData.questions}
      </Text>
    </View>

    const comp = [progress, mistakes, fraction];
 
    return(
      <TouchableOpacity 
        style={{paddingHorizontal: 15, width: viewWidth, alignItems: 'center', justifyContent: 'center'}}
        onPress={this._onPressChart}
        activeOpacity={0.9}
      >
        <Animatable.View
          ref={(r) => this.chartView = r}
          useNativeDriver={true}
        >
          {comp[mode]}
        </Animatable.View>
      </TouchableOpacity>
    );
  }
}

//subject title and desc 
export class SubjectDetails extends React.Component {
  static propTypes = {
    subjectData: PropTypes.shape(subjectProps),
  }

  static defaultProps = {
    onPress: () => alert(),
  }

  constructor() {
    super();
  }

  render() {
    const { subjectData, onPress, containerStyle, color } = this.props;
    return(
      <TouchableOpacity 
        style={[{flex: 1, alignItems: 'stretch', padding: 10}, containerStyle]} 
        onPress={() => onPress(subjectData)}
        activeOpacity={0.7}
        onPressIn={() => {}}
      >
        {/*Title*/}
        <IconText
          text={subjectData.subjectName}
          textStyle={{fontSize: 20, fontWeight: '500'}}
          iconColor={color}
          iconName='heart'
          iconType='entypo'
          iconSize={22}
        />
        <Text style={{flex: 1, fontSize: 16, fontWeight: '100', marginTop: 3}}>
          {subjectData.subjectDesc}
        </Text>
      </TouchableOpacity>
    );
  }
}

//shows a single subject card and holds SubjectDetails and subject progess
export class SubjectItem extends React.Component {
  static propTypes = {
    subjectData: PropTypes.shape(subjectProps),
    height     : PropTypes.number,
  }

  static defaultProps = {
    height: 200,
  }

  constructor() {
    super();
  }

  render() {
    const { subjectData, height } = this.props;
    const color = subjectData.graidentBG[1];

    return(
      <View style={{ height: height, paddingTop: 20, paddingBottom: 50, shadowOffset:{  width: 3,  height: 3}, shadowColor: 'black', shadowOpacity: 0.35, shadowRadius: 10,}} overflow='visible'>
        <View style={{flex: 1,  height: '100%', flexDirection: 'row', backgroundColor: 'white', borderRadius: 12,}} overflow='hidden'>    
          <LinearGradient
            style={{position: 'absolute', width: '100%', height: '100%'}}
            colors={subjectData.graidentBG}
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 1}} 
          />
          <SubjectProgress 
            progressData={subjectData.progress} 
            color={Chroma(color).saturate(2).hex()}         
            backgroundColor={Chroma(color).brighten(2).hex()}         
          />
          <SubjectDetails 
            subjectData={subjectData}
            color={Chroma(color).darken().hex()}
          />
        </View>
      </View>
    );
  }
}


//displays a single module item and a list of subjects
export class ModuleGroup extends React.Component {
  static propTypes = {
    moduleData    : PropTypes.shape(moduleProps).isRequired,
    onPressAllSubj: PropTypes.func,
  }

  static defaultProps = {
    onPressAllSubj: () => alert(),
  }

  //renders a single subject item
  _renderItem = ({item, index}) => {
    return(
      <SubjectItem 
        subjectData={item}
      />
    );
  }

  render() {
    const { moduleData, onPressAllSubj } = this.props;

    //ui values
    const sliderWidth = Dimensions.get('window').width;
    const itemWidth = sliderWidth - 20;

    return(
      <View style={{justifyContent: 'center'}}>
        {/*Header*/}
        <TouchableOpacity 
          style={{paddingHorizontal: 12}} 
          onPress={() => onPressAllSubj(moduleData)}
        >
          <IconText
            text={moduleData.moduleName}
            textStyle={{fontSize: 20, fontWeight: '500', color: 'black', alignSelf: 'flex-start'}}
            iconColor='grey'
            iconName ='heart'
            iconType ='entypo'
            iconSize ={25}
          />
          <Text style={{fontSize: 16}}>
            {moduleData.moduleDesc}
          </Text>
        </TouchableOpacity>
        {/*Subject List*/}
        <Carousel
          containerCustomStyle={{marginTop: -5}}
          ref={(c) => { this._carousel = c; }}
          data={moduleData.subjects}
          renderItem={this._renderItem}
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          activeSlideAlignment={'center'}
          layout={'tinder'}
          layoutCardOffset={14}
          enableSnap={true}
        />
      </View>
    );
  }
}

//displays the list of modules
export class ModuleList extends React.Component {
  static propTypes = {
    moduleList: PropTypes.arrayOf(
      PropTypes.shape(moduleProps)
    ).isRequired,
    containerStyle: ViewPropTypes.style,
  }
  
  _renderItem = ({item}, index) => {
    return(
      <ModuleGroup moduleData={item}/>
    );
  }

  render(){
    const { moduleList, containerStyle, } = this.props;
    return(
      <FlatList
        style       ={[containerStyle]}
        data        ={moduleList}
        keyExtractor={(item) => item.moduleID }
        renderItem  ={this._renderItem }
        ListFooterComponent={<View style={{padding: 20}}/>}
      />
    );
  }
  
}
