import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Dimensions, Image, FlatList, TouchableOpacity, ViewPropTypes } from 'react-native';

import { AnimatedGradient }  from './animatedGradient';
import { IconText } from './views';
import { IconButton } from './buttons';
import { GaugeChart } from './charts';


import  Carousel, { ParallaxImage }  from 'react-native-snap-carousel';
import * as Animatable from 'react-native-animatable';

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

export class SubjectProgress extends React.PureComponent {
  static propTypes = {
  }

  constructor(props){
    super(props);
    this.state = {
      showPercent: true,
    }
  }

  _onPressChart = () => {
    const { showPercent } = this.state;
    this.chartView.zoomOut(100).then(() => {
      this.setState({ showPercent: !showPercent }, () => {
        this.chartView.bounceIn(500)
      });
    });
  }

  render(){
    const {size} = this.props;
    const { showPercent } = this.state;

    //ui computations
    const margin      = 15;
    const chartRadius = 50;
    const chartSize   = chartRadius * 2;
    const viewWidth   = chartSize + margin;
  
    const chart = <GaugeChart 
      percent={50}
      radius={chartRadius}
      thickness={10}
    />

    const text = <View
      style={{backgroundColor: 'lightgrey', width: chartSize, height: chartSize, alignItems: 'center', justifyContent: 'center', borderRadius: chartSize}}  
    >
      <Text
      style={{fontSize: 20, }}
      >
      50/100
    </Text>
    </View>
 
    return(
      <TouchableOpacity 
        style={{paddingHorizontal: 15, width: viewWidth, alignItems: 'center', justifyContent: 'center'}}
        onPress={this._onPressChart}
      >
        <Animatable.View
          ref={(r) => this.chartView = r}
          useNativeDriver={true}
        >
          {showPercent ? chart : text}
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
    const { subjectData, onPress, containerStyle } = this.props;
    return(
      <TouchableOpacity 
        style={[{ padding: 10, marginRight: 100 }, containerStyle]} 
        onPress={() => onPress(subjectData)}
        activeOpacity={0.7}
      >
        {/*Title*/}
        <IconText
          text={subjectData.subjectName}
          textStyle={{fontSize: 20, fontWeight: '500'}}
          iconColor='darkgrey'
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

//shows a single subject card and holds SubjectDetails and
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
    return(
      <View style={{ height: height, paddingTop: 20, paddingBottom: 50, shadowOffset:{  width: 5,  height: 5}, shadowColor: 'black', shadowOpacity: 0.4, shadowRadius: 13,}} overflow='visible'>
        <View style={{ height: '100%', flexDirection: 'row', backgroundColor: 'white', borderRadius: 12,}} overflow='hidden'>    
          <SubjectProgress
          />
          <SubjectDetails
            subjectData={subjectData}
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
          layoutCardOffset={12}
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
        style       ={containerStyle}
        data        ={moduleList}
        keyExtractor={(item) => item.moduleID }
        renderItem  ={this._renderItem }
      />
    );
  }
  
}
