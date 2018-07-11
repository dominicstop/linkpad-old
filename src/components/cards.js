import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Dimensions, Image, FlatList, TouchableOpacity, ViewPropTypes, Platform } from 'react-native';

import { IconText } from './views';
import { GaugeChart, GradeDougnut } from './charts';

import Chroma from 'chroma-js'
import Carousel from 'react-native-snap-carousel';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo';
import { material, human, systemWeights } from 'react-native-typography';
import ProgressBar from 'react-native-progress/Bar';
import { Bar } from 'react-native-progress';


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
        <Text style={{fontSize: 24, fontWeight: '900'}}>{answher}</Text>
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
        <IconText
          text={subjectData.subjectName}
          textStyle={styles.subjectTitle}
          iconColor={color}
          iconName='heart'
          iconType='entypo'
          iconSize={22}
        />
        <Text 
          style={[{flex: 1, marginTop: 2, textAlign: 'justify'}, styles.subjectSubtitle]} 
          numberOfLines={numberOfLinesDesc}
          ellipsizeMode={'tail'} 
          lineBreakMode={'tail'}
        >
          {subjectData.subjectDesc}
        </Text>
      </TouchableOpacity>
    );
  }
}

//shows a single subject card and holds SubjectDetails and SubjectProgess
export class SubjectItem extends React.PureComponent {
  static propTypes = {
    subjectData: PropTypes.shape(subjectProps),
    height: PropTypes.number,
    numberOfLinesDesc: PropTypes.number,
    //callbacks
    onPressSubject: PropTypes.func,
    //styles
    containerStyle: ViewPropTypes.style,
  }

  static defaultProps = {
    height: 180,
  }

  constructor() {
    super();
  }

  render() {
    const { subjectData, height, onPressSubject, containerStyle } = this.props;
    const color = subjectData.graidentBG[1];

    return(
      <View style={[{ height: height, paddingTop: 10, paddingBottom: 35, shadowOffset:{  width: 3,  height: 10}, shadowColor: '#686868', shadowOpacity: 0.35, shadowRadius: 5}, containerStyle]} removeClippedSubviews={false}>
        <LinearGradient
          style={{flex: 1, height: '100%', borderRadius: 15, flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 15}}
          colors={subjectData.graidentBG}
          start={{x: 0, y: 0}} 
          end={{x: 1, y: 1}}
          overflow='hidden' 
        >
          <SubjectProgress 
            progressData={subjectData.progress} 
            color={Chroma(color).saturate(2).hex()}         
            backgroundColor={Chroma(color).brighten(2).hex()}         
          />
          <SubjectDetails
            numberOfLinesDesc={this.props.numberOfLinesDesc}
            containerStyle={{marginLeft: 13}}
            subjectData={subjectData}
            onPress={onPressSubject}
            color={Chroma(color).darken().hex()}
          />
        </LinearGradient>
      </View>
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
    const { moduleData, detailedView } = this.props;  
    return(
      <View>
        <IconText
          textStyle={detailedView? styles.titleLarge : styles.title}
          iconSize ={detailedView? 25 : 20 }
          text={moduleData.moduleName}
          iconColor='grey'
          iconName ='heart'
          iconType ='entypo'
        >
          <Text 
            style={[{textAlign: 'justify'}, styles.subtitle]}
            numberOfLines={ detailedView? undefined : 2}
          >
            {moduleData.moduleDesc}
          </Text>
        </IconText>
      </View>
    );
  }
}

//displays a single module item and a list of subjects
export class ModuleGroup extends React.Component {
  static propTypes = {
    moduleData       : PropTypes.shape(moduleProps).isRequired,
    numberOfLinesDesc: PropTypes.number,
    //callbacks
    onPressSubject: PropTypes.func,
    onPressModule : PropTypes.func,
  }

  //renders a single subject item
  _renderItem = ({item, index}) => {
    return(
      <SubjectItem 
        subjectData={item}
        onPressSubject={this.props.onPressSubject}
        numberOfLinesDesc={this.props.numberOfLinesDesc}
      />
    );
  }

  render() {
    const { moduleData, onPressModule } = this.props;

    //ui values
    const sliderWidth = Dimensions.get('window').width;
    const itemWidth = sliderWidth - 25;

    return(
      <View style={{justifyContent: 'center'}}>
        {/*Header*/}
        <TouchableOpacity 
          style={{paddingHorizontal: 12}} 
          onPress={() => onPressModule(moduleData)}
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
          data={moduleData.subjects}
          renderItem={this._renderItem}
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          activeSlideAlignment={'center'}
          layout={'tinder'}
          layoutCardOffset={12}
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
    flatListProps: PropTypes.object,
    //callbacks
    onPressSubject: PropTypes.func,
    onPressModule : PropTypes.func,
    //style
    containerStyle: ViewPropTypes.style,
  }
  
  _renderItem = ({item}, index) => {
    return(
      <ModuleGroup 
        moduleData={item}
        onPressSubject={this.props.onPressSubject}
        onPressModule ={this.props.onPressModule }
        numberOfLinesDesc={3}
      />
    );
  }

  render(){
    const { moduleList, containerStyle, flatListProps} = this.props;
    return(
      <FlatList
        style       ={[containerStyle]}
        data        ={moduleList}
        keyExtractor={(item) => item.moduleID }
        renderItem  ={this._renderItem }
        ListFooterComponent={<View style={{padding: 20}}/>}
        scrollEventThrottle={200}
        directionalLockEnabled={true}
        removeClippedSubviews={false}
        {...flatListProps}
      />
    );
  }
}

export class SubjectList extends React.Component {
  static propTypes = {
    subjectListData: PropTypes.arrayOf(
      PropTypes.shape(subjectProps)
    ).isRequired,
    //callbacks
    onPressSubject: PropTypes.func,
    //style
    containerStyle: ViewPropTypes.style,
  }
  
  _renderItem = ({item}, index) => {
    return(
      <SubjectItem
        containerStyle={{height: null, marginHorizontal: 13, paddingTop: 0, paddingBottom: 20}}
        numberOfLinesDesc={6}
        subjectData={item}
        onPressSubject={this.props.onPressSubject}
      />
    );
  }

  render(){
    const { subjectListData, containerStyle, ...flatListProps} = this.props;
    return(
      <FlatList
        style={[containerStyle]}
        data={subjectListData}
        keyExtractor={(item) => item.subjectID }
        renderItem ={this._renderItem }
        ListFooterComponent={<View style={{padding: 20}}/>}
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
    ...systemWeights.boldObject,
    ...Platform.select({
      ios    : human.title2Object,
      android: material.headlineObject,
    }),
  },
  titleLarge: {
    ...systemWeights.boldObject,
    ...Platform.select({
      ios    : human.title1Object,
      android: material.headlineObject,
    }),
  },
  subtitle: {
    ...systemWeights.thinObject,
    ...Platform.select({
      ios    : human.bodyObject,
      android: material.subheadingObject,
    }),
  },
  subjectTitle: {
    ...systemWeights.semiboldObject,
    ...Platform.select({
      ios    : human.title3Object,
      android: material.display1Object,
    }),
  },
  subjectSubtitle: {
    ...systemWeights.thinObject,
    ...Platform.select({
      ios    : human.subheadObject,
      android: material.subheadingObject,
    }),
  }
});