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
import {ModuleItemModel, SubjectItem} from '../functions/ModuleStore';

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
      containerStyle={{}}
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
        style={[{flex: 1,}, containerStyle]} 
        onPress={() => onPress(subjectData)}
        activeOpacity={0.7}
      >
        {/*Title*/}
        <Text 
          style={[styles.subjectTitle]}
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
export class SubjectListItem extends React.PureComponent {
  static propTypes = {
    subjectData: PropTypes.shape(subjectProps),
    height: PropTypes.number,
    numberOfLinesDesc: PropTypes.number,
    showDetails: PropTypes.bool,
    //callbacks
    onPressSubject: PropTypes.func,
    //styles
    containerStyle: ViewPropTypes.style,
  }

  static defaultProps = {
    showDetails: false,
    height: Platform.select({ios: 165, android: 150}),
  };

  static styles = StyleSheet.create({
    title: {
      fontWeight: '500',
      fontSize: 24,
      color: 'black',
    },
    description: {
      textAlign: 'justify',
      marginTop: 1, 
      fontWeight: '300',
      fontSize: 16,
      color: 'rgba(0, 0, 0, 0.9)',
    },
    detail: Platform.select({
      ios: {

      },
      android: {
        fontSize: 18,
        fontWeight: '100',
        color: 'grey'
      }
    }),
    wrapper: Platform.select({
      ios: {
        paddingTop: 10, 
        paddingBottom: 35, 
        shadowColor: '#686868', 
        shadowOpacity: 0.5, 
        shadowRadius: 5,
        shadowOffset: {  
          width: 4,
          height: 5
        }, 
      },
      android: {
        flex: 1, 
        paddingTop: 6, 
        paddingLeft: 5, 
        paddingRight: 9, 
        paddingBottom: 15,
      }
    }),
    container: Platform.select({
      ios: {
        flex: 1, 
        borderRadius: 15, 
        flexDirection: 'row', 
        paddingHorizontal: 20, 
        paddingVertical: 15, 
        backgroundColor: 'white',
        overflow: 'hidden',
      },
      android: {
        flex: 1, 
        elevation: 10, 
        borderRadius: 15, 
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        backgroundColor: 'white'
      }
    }),
  });

  constructor() {
    super();
  }

  _handleOnPress = () => {
    const { subjectData, onPressSubject } = this.props;
    onPressSubject && onPressSubject(subjectData);
  }

  _onPressSubject = () => {
    const { onPressSubject, subjectData, moduleData } = this.props;
    //pass subject data as param to callback
    onPressSubject(subjectData, moduleData);
  }

  _renderDetails(){
    const { styles } = SubjectListItem;
    const { subjectData, showDetails } = this.props;
    if(!showDetails) return null;

    const model = new SubjectItem(subjectData);
    const { lastupdated } = model.subject;
    const questionCount = model.getQuestionLength();

    return(
      <View style={{flexDirection: 'row', marginBottom: 2}}>
        <Text style={styles.detail}>{`${questionCount} items `}</Text>
        <Text style={styles.detail}>{` (Updated: ${lastupdated})`}</Text>
      </View>
    );
  }

  _renderDescription(){
    const { styles } = SubjectListItem;
    const { subjectData, numberOfLinesDesc } = this.props;

    return(
      <TouchableOpacity
        style={{flex: 1}}
        onPress={this._handleOnPress}
        activeOpacity={0.7}
      >
        <Text 
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode={'tail'} 
          lineBreakMode={'tail'}
        >
          {subjectData.subjectname}
        </Text>
        {this._renderDetails()}
        <Text 
          style={styles.description} 
          numberOfLines={numberOfLinesDesc}
          ellipsizeMode={'tail'} 
          lineBreakMode={'tail'}
        >
          {subjectData.description}
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { styles } = SubjectListItem;
    const { height, wrapperStyle, containerStyle } = this.props;

    return(
      <View style={[{height}, styles.wrapper, wrapperStyle]}>
        <View style={[styles.container, containerStyle]}>
          {this._renderDescription()}
        </View>
      </View>
    );
  }
}

//displays a single module item and a list of subjects
export class ModuleItem extends React.PureComponent {
  static propTypes = {
    modules: PropTypes.arrayOf(
      PropTypes.shape(moduleProps)
    ).isRequired,
    moduleData: PropTypes.shape(
      moduleProps
    ).isRequired,
    numberOfLinesDesc: PropTypes.number,
    //callbacks
    onPressSubject: PropTypes.func,
    onPressModule : PropTypes.func,
  };

  static defaultProps = {
    numberOfLinesDesc: 3
  };

  static styles = StyleSheet.create({
    title: Platform.select({
      ios: {
        fontSize: 24,
        fontWeight: '600',
        color: '#150a44'
      },
      android: {
        fontSize: 24,
        fontWeight: '900',
        color: '#150a44',
        textDecorationLine: 'underline', 
      }
    }),
    subtitle: Platform.select({
      ios: {
        fontSize: 22,
      },
      android: {
        marginTop: -3,
        fontSize: 18,
        fontWeight: '100',
        color: '#424242'
      }
    }),
    column: {
      flex: 1,
    },
    detail: {
      fontSize: 16,
      fontWeight: '100',
      color: 'grey'
    },
    description: {
      fontWeight: '200',
      fontSize: 18,
      textAlign: 'justify'
    },
  });

  _onPressModule = () => {
    const { modules, moduleData, onPressModule } = this.props;
    onPressModule && onPressModule(modules, moduleData);
  };

  _handleOnPressSubject = (subjectData) => {
    const { modules, moduleData, onPressSubject } = this.props;
    onPressSubject && onPressSubject(subjectData, moduleData);
  }

  _renderHeader(){
    const { styles } = ModuleItem;
    const { moduleData } = this.props;

    return(
      <TouchableOpacity 
        style={{paddingHorizontal: 12}} 
        onPress={this._onPressModule}
      >
        <IconText
          //text
          text={moduleData.modulename}
          textStyle={styles.title}
          //icon
          iconName='file-text-o'
          iconType='font-awesome'
          iconColor='#7E57C2'
          iconSize ={20}
        />
        <Text style={styles.description} numberOfLines={2}>
          {moduleData.description}
        </Text>
      </TouchableOpacity>
    );
  };

  _renderDetails(){
    const { styles } = ModuleItem;
    const { moduleData } = this.props;
    const model = new ModuleItemModel(moduleData);

    return(
      <View style={{flexDirection: 'row', paddingHorizontal: 12}}>
        <Text style={styles.detail}>
          {`Updated on: ${moduleData.lastupdated}`}
        </Text>
      </View>
    );
  }

  //renders a single subject item
  _renderItem = ({item, index}) => {
    const { modules, moduleData } = this.props;
    return(
      <SubjectListItem 
        subjectData={item}
        numberOfLinesDesc={this.props.numberOfLinesDesc}
        onPressSubject={this._handleOnPressSubject}
        //pass down props
        {...{modules, moduleData}}
      />
    );
  }

  render() {
    const { moduleData } = this.props;

    //ui values
    const sliderWidth = Dimensions.get('window').width;
    const platformSpecificProps = Platform.select({
      ios: {
        layout: 'tinder',
        activeSlideAlignment: 'center',
        itemWidth: sliderWidth - 20,
        enableSnap: true,
        layoutCardOffset: 10,
      },
      android: {
        layout: 'default',
        activeSlideAlignment: 'start',
        itemWidth: sliderWidth - 50,
        enableSnap: false,
        inactiveSlideShift: 0,
        inactiveSlideOpacity: 0.9,
        inactiveSlideScale: 1,
        containerCustomStyle: { paddingLeft: 5 },
      }
    });

    return(
      <View style={{justifyContent: 'center', marginBottom: 5}}>
        {this._renderHeader()}
        {this._renderDetails()}
        <Carousel
          ref={r => this._carousel = r }
          data={_.compact(moduleData.subjects)}
          renderItem={this._renderItem}
          sliderWidth={sliderWidth}
          activeSlideAlignment={'center'}
          removeClippedSubviews={false}
          {...platformSpecificProps}
        />
      </View>
    );
  }
}

//displays the list of modules
export class ModuleList extends React.PureComponent {
  static propTypes = {
    modules: PropTypes.arrayOf(
      PropTypes.shape(moduleProps)
    ).isRequired,
    //callbacks
    onPressSubject: PropTypes.func,
    onPressModule : PropTypes.func,
  }

  _renderFooter = () => {
    return(
      <View style={{padding: 100}}/>
    );
  }

  _renderItem = ({item, index}) => {
    const { modules, onPressModule, onPressSubject } = this.props;
    const animation = Platform.select({
      ios    : 'fadeInUp', 
      android: 'zoomIn'
    });

    return(
      <AnimatedListItem
        delay={250}
        duration={500}
        multiplier={200}
        {...{animation, index}}
      >
        <ModuleItem
          moduleData={item}
          numberOfLinesDesc={3}
          //pass down props
          {...{modules, onPressModule, onPressSubject}}
        />
      </AnimatedListItem>
    );
  }

  render(){
    const { modules, containerStyle, ...flatListProps} = this.props;
    return(
      <FlatList
        data={_.compact(modules)}
        ref={r => this.flatlist = r}
        keyExtractor={(item) => item.indexid + ''}
        renderItem ={this._renderItem }
        ListFooterComponent={this._renderFooter}
        removeClippedSubviews={false}
        {...flatListProps}
      />
    );
  }
}

export class SubjectList extends React.Component {
  static propTypes = {
    //extra props
    modules: PropTypes.arrayOf(
      PropTypes.shape(moduleProps)
    ).isRequired,
    moduleData: PropTypes.shape(moduleProps).isRequired,
    //callbacks
    onPressSubject: PropTypes.func,
    //style
    containerStyle: ViewPropTypes.style,
  };

  static styles = StyleSheet.create({
    wrapper: {
      height: null,
      ...Platform.select({
        ios: {
          paddingTop: 5, 
          paddingBottom: 10, 
        },
        android: {
          paddingTop: 7, 
          paddingBottom: 8,
        }
      })
    },
    container: Platform.select({
      android: { elevation: 5 }
    })
  });
  
  _renderItem = ({item, index}) => {
    const { styles } = SubjectList;
    const { onPressSubject, moduleData } = this.props;
    const animation = Platform.select({
      ios    : 'fadeInUp', 
      android: 'zoomIn'
    });

    return(
      <AnimatedListItem
        delay={0}
        duration={500}
        multiplier={200}
        {...{animation, index}}
      >
        <SubjectListItem
          showDetails={true}
          wrapperStyle={styles.wrapper}
          containerStyle={styles.container}
          numberOfLinesDesc={6}
          subjectData={item}
          //pass dowm props
          {...{moduleData, onPressSubject}}
        />
      </AnimatedListItem>
    );
  }

  render(){
    const { moduleData, containerStyle, ...flatListProps} = this.props;
    const data = _.compact(moduleData.subjects);
    return(
      <FlatList
        {...{data}}
        keyExtractor={(item) => item.indexid + ''}
        renderItem ={this._renderItem }
        ListFooterComponent={<View style={{padding: 70}}/>}
        removeClippedSubviews={true}
        {...flatListProps}
      />
    );
  }
}