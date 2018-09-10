import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Dimensions, Image, FlatList, TouchableOpacity, ViewPropTypes, Platform } from 'react-native';

import { IconText  , AnimatedListItem } from './Views';
import { GaugeChart, GradeDougnut     } from './Charts';

import { colorShift , timeout} from '../functions/Utils';

import Chroma from 'chroma-js';
import Carousel from 'react-native-snap-carousel';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo';
import { material, human, systemWeights } from 'react-native-typography';
import _ from 'lodash';
import ProgressBar from 'react-native-progress/Bar';
import { Bar } from 'react-native-progress';

const cardGroupHeight = 150;

export const subjectProps = {
  subjectID  : PropTypes.string,
  subjectName: PropTypes.string,
  subjectDesc: PropTypes.string,
}

export const moduleProps = {
  indexid: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  modulename : PropTypes.string,
  description: PropTypes.string,
  subjects   : PropTypes.arrayOf(
    PropTypes.shape(subjectProps)
  ),
}

export const progressProps = {
  mistakes : PropTypes.number,
  correct  : PropTypes.number,
  questions: PropTypes.number,
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
    const margin      = 0;
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
      containerStyle={{opacity: 0.65}}
    />

    const mistakes = <GradeDougnut
      mistakes={progressData.mistakes}
      correct ={progressData.correct }
      colors={['green', 'red']}
      radius={50}
      thickness={10}
    />

    const fraction = <View
      style={{borderColor: color, borderWidth: 3, width: chartSize, height: chartSize, alignItems: 'center', justifyContent: 'center', borderRadius: chartSize,}}  
    >
      <Text>
        <Text style={{fontSize: 22, fontWeight: '900'}}>{answher}</Text>
        <Text style={{fontSize: 18, fontWeight: '100'}}>/{progressData.questions}</Text>
      </Text>
    </View>

    const comp = [progress, mistakes, fraction];
 
    return(
      <TouchableOpacity 
        style={{marginLeft: margin, width: viewWidth, alignItems: 'center', justifyContent: 'center'}}
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
export class SubjectDetails extends React.PureComponent {
  static propTypes = {
    subjectData: PropTypes.shape(subjectProps),
    onPress: PropTypes.func,
    numberOfLinesDesc: PropTypes.number,
    containerStyle: ViewPropTypes.style,
  }

  static defaultProps = {
    onPress: () => alert(),
  }

  constructor() {
    super();
  }

  render() {
    const { subjectData, onPress, containerStyle, color, numberOfLinesDesc } = this.props;
    return(
      <TouchableOpacity 
        style={[{flex: 1, alignItems: 'stretch'}, containerStyle]} 
        onPress={() => onPress(subjectData)}
        activeOpacity={0.7}
      >
        {/*Title*/}
        <Text 
          style={styles.subjectTitle}
          numberOfLines={1}
          ellipsizeMode={'tail'} 
          lineBreakMode={'tail'}
        >
          {subjectData.subjectname}
        </Text>
        <Text 
          style={[{flex: 1, marginTop: 1, textAlign: 'justify'}, styles.subjectSubtitle]} 
          numberOfLines={numberOfLinesDesc}
          ellipsizeMode={'tail'} 
          lineBreakMode={'tail'}
        >
          {subjectData.description}
        </Text>
      </TouchableOpacity>
    );
  }
}

//shows a single subject card and holds SubjectDetails and SubjectProgess
export class SubjectItem extends React.PureComponent {
  static propTypes = {
    moduleData: PropTypes.shape(moduleProps),
    subjectData: PropTypes.shape(subjectProps),
    height: PropTypes.number,
    numberOfLinesDesc: PropTypes.number,
    //callbacks
    onPressSubject: PropTypes.func,
    //styles
    containerStyle: ViewPropTypes.style,
  }

  static defaultProps = {
    height:  177,
  }

  constructor() {
    super();
  }

  _onPressSubject = () => {
    const { onPressSubject, subjectData, moduleData } = this.props;
    //pass subject data as param to callback
    onPressSubject(subjectData, moduleData);
  }

  render() {
    const { subjectData, height, containerStyle } = this.props;

    const GRADIENTS = [
      ['#36e3da', '#1b74fd'],
      ['#4fb2fb', '#6f12e0'],
      ['#ff2af2', '#5f1691'],
      ['#ff4e88', '#9a45d4'],
      ['#fb255e', '#ff5420'],
      ['#fd1226', '#ff8b0d'],
      ['#f0ff5b', '#ff6500'],
    ];

    const unused = [
      ['#85fc28', '#02692c'],
      ['#1ffc5d', '#005d40'],
      ['#00f994', '#02757c'],
    ];

    //const randColor = _.sample(GRADIENTS);
    //const selectedGradient = [colorShift(randColor[0], 20), colorShift(randColor[1], 15)];
    //console.log(selectedGradient);
    //const selectedGradient = GRADIENTS[8]
    //const selectedGradient = ['#D1C4E9', '#BBDEFB']
    const selectedGradient = ['#D1C4E9', '#BBDEFB']

    const DUMMY_PROGRESS = {
      correct  : 90,
      mistakes : 0,
      questions: 100,
    };

    const color = selectedGradient[0];

    return(
      <View style={[{ height: height, paddingTop: 10, paddingBottom: 35, shadowOffset:{  width: 4,  height: 5}, shadowColor: '#686868', shadowOpacity: 0.5, shadowRadius: 5}, containerStyle]} removeClippedSubviews={false}>
        <LinearGradient
          style={{flex: 1, height: '100%', borderRadius: 15, flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15}}
          colors={['white', 'white']}
          start={{x: 0, y: 0}} 
          end={{x: 1, y: 1}}
          overflow='hidden' 
        >
          {true && <SubjectProgress 
            progressData={DUMMY_PROGRESS} 
            color={Chroma(color).saturate(2).hex()}         
            backgroundColor={Chroma(color).brighten(2).hex()}         
          />}
          <SubjectDetails
            numberOfLinesDesc={this.props.numberOfLinesDesc}
            containerStyle={{marginLeft: 13}}
            subjectData={subjectData}
            onPress={this._onPressSubject}
            color={Chroma(color).darken().hex()}
          />
        </LinearGradient>
      </View>
    );
  }
}

//displays the module title
export class ModuleTitle extends React.PureComponent {
  static propTypes = {
    moduleData  : PropTypes.shape(moduleProps).isRequired,
  }

  render(){
    const { moduleData } = this.props;  
    return(
      <IconText
        textStyle={[styles.title, {}]}
        iconSize ={20}
        text={moduleData.modulename}
        iconColor='grey'
        iconName ='heart'
        iconType ='entypo'
      >
        {this.props.children}
      </IconText>
    );
  }
}

//displays the module description
export class ModuleDescription extends React.PureComponent {
  static propTypes = {
    moduleData  : PropTypes.shape(moduleProps).isRequired,
    detailedView: PropTypes.bool,
  }

  render(){
    const { moduleData, detailedView } = this.props;  
    return(
      <Text 
        style={[{textAlign: 'justify'}, styles.subtitle]}
        numberOfLines={ detailedView? undefined : 2}
      >
        {moduleData.description}
      </Text>
    );
  }
}

//displays the title and other details about the module
export class ModuleHeader extends React.PureComponent {
  static propTypes = {
    moduleData  : PropTypes.shape(moduleProps).isRequired,
    detailedView: PropTypes.bool,
  }

  render(){
    return(
      <ModuleTitle {...this.props}>
        <ModuleDescription {...this.props}/>
      </ModuleTitle>
    );
  }
}

//displays a single module item and a list of subjects
export class ModuleGroup extends React.Component {
  static propTypes = {
    //extra data
    moduleList: PropTypes.arrayOf(
      PropTypes.shape(moduleProps)
    ).isRequired,
    //actual data used
    moduleData       : PropTypes.shape(moduleProps).isRequired,
    numberOfLinesDesc: PropTypes.number,
    //callbacks
    onPressSubject: PropTypes.func,
    onPressModule : PropTypes.func,
  }

  _onPressModule = () => {
    const { moduleList, moduleData } = this.props;
    this.props.onPressModule(moduleList, moduleData);
  }

  //renders a single subject item
  _renderItem = ({item, index}) => {
    return(
      <SubjectItem 
        moduleData={this.props.moduleData}
        subjectData={item}
        onPressSubject={this.props.onPressSubject}
        numberOfLinesDesc={this.props.numberOfLinesDesc}
      />
    );
  }

  render() {
    const { moduleData } = this.props;

    //ui values
    const sliderWidth = Dimensions.get('window').width;
    const itemWidth   = sliderWidth - 20;

    return(
      <View style={{justifyContent: 'center', marginBottom: 5}}>
        {/*Header*/}
        <TouchableOpacity 
          style={{paddingHorizontal: 12}} 
          onPress={this._onPressModule}
        >
          <ModuleHeader 
            moduleData={moduleData}
            detailedView={false}
          />
        </TouchableOpacity>
        {/*Subject List*/}
        <Carousel
          //containerCustomStyle={{marginTop: -5}}
          ref={(c) => { this._carousel = c; }}
          data={_.compact(moduleData.subjects)}
          renderItem={this._renderItem}
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          activeSlideAlignment={'center'}
          layout={'tinder'}
          layoutCardOffset={14}
          enableSnap={true}
          removeClippedSubviews={false}
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
    //callbacks
    onPressSubject: PropTypes.func,
    onPressModule : PropTypes.func,
    //style
    containerStyle: ViewPropTypes.style,
  }
  
  componentDidMount(){
    //fix for contentInset bug
    setTimeout(() => {
      this.flatlist.scrollToOffset({animated: false, offset: 100});
      this.flatlist.scrollToOffset({animated: false, offset: -80});
    }, 500)
  }

  _renderItem = ({item, index}) => {
    return(
      <AnimatedListItem
        index={index}
        delay={0}
        duration={500}
        multiplier={300}
        animation='fadeInUp'
      >
        <ModuleGroup
          moduleList={this.props.moduleList}
          moduleData={item}
          onPressSubject={this.props.onPressSubject}
          onPressModule ={this.props.onPressModule }
          numberOfLinesDesc={3}
        />
      </AnimatedListItem>
    );
  }

  render(){
    const { moduleList, containerStyle, ...flatListProps} = this.props;
    return(
      <FlatList
        style={[containerStyle]}
        data={_.compact(moduleList)}
        ref={r => this.flatlist = r}
        keyExtractor={(item) => item.indexid + ''}
        renderItem ={this._renderItem }
        ListFooterComponent={<View style={{padding: 100}}/>}
        //scrollEventThrottle={200}
        //directionalLockEnabled={true}
        removeClippedSubviews={false}
        {...flatListProps}
      />
    );
  }
}

export class SubjectList extends React.Component {
  static propTypes = {
    //extra props
    moduleList: PropTypes.arrayOf(
      PropTypes.shape(moduleProps)
    ).isRequired,
    moduleData: PropTypes.shape(moduleProps).isRequired,
    //actual props used for data
    subjectListData: PropTypes.arrayOf(
      PropTypes.shape(subjectProps)
    ).isRequired,
    //callbacks
    onPressSubject: PropTypes.func,
    //style
    containerStyle: ViewPropTypes.style,
  }
  
  _renderItem = ({item, index}) => {
    return(
      <AnimatedListItem
        index={index}
        delay={300}
        duration={500}
      >
        <SubjectItem
          containerStyle={{height: null, marginHorizontal: 13, paddingTop: 0, paddingBottom: 20}}
          numberOfLinesDesc={6}
          subjectData={item}
          onPressSubject={this.props.onPressSubject}
          moduleData={this.props.moduleData}
        />
      </AnimatedListItem>
    );
  }

  render(){
    const { subjectListData, containerStyle, ...flatListProps} = this.props;
    return(
      <FlatList
        style={[containerStyle]}
        data={_.compact(subjectListData)}
        keyExtractor={(item) => item.indexid + ''}
        renderItem ={this._renderItem }
        ListFooterComponent={<View style={{padding: 70}}/>}
        scrollEventThrottle={200}
        directionalLockEnabled={true}
        removeClippedSubviews={true}
        {...flatListProps}
      />
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '600',
    fontSize: 24,
  },
  subtitle: {
    fontWeight: '200',
    fontSize: 18,
  },
  subjectTitle: {
    fontWeight: '500',
    fontSize: 24,
    color: 'black',

  },
  subjectSubtitle: {
    fontWeight: '300',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.9)',
  }
});