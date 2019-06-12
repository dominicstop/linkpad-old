import React, {Fragment} from 'react';
import { Text, View, ScrollView, Dimensions, StyleSheet, Switch, TouchableOpacity, ActivityIndicator, Clipboard, Platform } from 'react-native';
import PropTypes from 'prop-types';
import EventEmitter from 'events';

import * as scale from 'd3-scale';
import * as Animatable from 'react-native-animatable';
import { BarChart, AreaChart, Grid, StackedBarChart, XAxis, YAxis } from 'react-native-svg-charts'
import { Circle, Path, Text as SVGText, G, Line, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Chroma from 'chroma-js';
import moment from "moment";
import TimeAgo from 'react-native-timeago';
import { createMaterialTopTabNavigator, NavigationEvents } from 'react-navigation';
import { Divider, Icon } from 'react-native-elements';
import * as shape from 'd3-shape';

import { TransitionAB } from '../components/Transitioner';
import { GREEN, RED, PURPLE, GREY, BLUE, LIGHT_GREEN } from '../Colors';
import { CustomQuiz } from '../functions/CustomQuizStore';
import { CustomQuizResultItem } from '../functions/CustomQuizResultsStore';
import { Card } from '../components/Views';
import { NumberIndicator, DetailColumn, DetailRow } from '../components/StyledComponents';
import { setStateAsync, timeout } from '../functions/Utils';

/**
 * todo: refactor mode % 2 - move to longpresshandler
 */

//#region ------ SHARED CHART FUNC/CONST ------
const sharedStyles = StyleSheet.create({
  wrapper: {
    flex: 1, 
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 5,  
  },
  scrollview: {
    paddingVertical: 10,    
  },
  //loading indicator styles
  loadingContainer: {
    position: 'absolute',
    marginTop: 15,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: PURPLE.A700,
    borderRadius: 15, 
  },
  loadingText: {
    marginLeft: 7,
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

const TAB_ROUTES = {
  'SUMMARY': 'SUMMARY',
  'CORRECT': 'CORRECT',
  'WRONG'  : 'WRONG'  ,
};

const TYPES = { 
  CORRRECT: 'CORRRECT',
  SKIPPED : 'SKIPPED' ,
  WRONG   : 'WRONG'   ,
};

const CONSTANTS = {
  yAxisProps: {
    min: 0, 
    max: 100,
    numberOfTicks: 10,
    style: {
      marginHorizontal: 5,
      paddingVertical: 10,    
    },
    svg: { 
      fill: 'grey', 
      fontSize: 10 
    },
    contentInset: { 
      top: 10, 
      bottom: 15 + 10 
    },
  },
};

function stackItem({type, value, extraData, onPress, onLongPress, addOnPress, addFill}){
  //colors
  const colorsRed   = Chroma.scale([RED  .A700, RED  .A400]).colors(100);
  const colorsGreen = Chroma.scale([GREEN.A700, GREEN.A400]).colors(100);
  //params for callbacks
  const params = {type, value, ...(extraData || {})};

  return({
    [type]: {
      value, extraData,
      svg: {
        ...(addOnPress && {
          onPress    : () => onPress     && onPress    (params),
          onLongPress: () => onLongPress && onLongPress(params),  
        }),  
        ...(addFill && {
          fill: (
            (type == TYPES.CORRRECT)? colorsGreen[value - 1] :
            (type == TYPES.WRONG   )? colorsRed  [value - 1] :
            (type == TYPES.SKIPPED )? 'rgba(0, 0, 0, 0)'     : null
          ),
        }),  
      }, 
    },
  });
};
//#endregion -----

//#region ------ CHART COMPONENTS ------ 
/** SummaryTab: shown when a chart is selected/active */
const StackedToolTip = ({ x, y, height, width, data, selectedIndex }) => {
  const radius = 6;
  const items = data.length;
  const bandwidth = (width / items);

  const { CORRRECT, WRONG, SKIPPED } = data[selectedIndex];
  const totalItems = CORRRECT.value + WRONG.value + SKIPPED.value;
  const total = CORRRECT.value + WRONG.value;
  const score = (total / totalItems);

  //compute height based on score
  const yComputed = (height - (height * score)) + (radius/2);

  //0 = top, height = bottom
  const upperBounds = (radius * 2) + 10;
  const lowerBounds = (height - upperBounds);

  const yPos = (
    yComputed > lowerBounds? lowerBounds :
    yComputed < upperBounds? upperBounds : yComputed
  );

  return (
    <G
      x={ x(selectedIndex) + (bandwidth/2) }
      key={ 'tooltip' }
      //onPress={() => {}}
    > 
      <Circle
        y={yPos}
        r={radius}
        stroke={ 'rgb(134, 65, 244)' }
        strokeWidth={ 2 }
        fill={ 'white' }
      />
    </G>
  );
};

/** CorrectTab - line chart: green gradient bg*/
const CorrectGradient = ({ index }) => (
  <Defs key={index}>
    <LinearGradient id={'gradient'} x1={'0%'} y={'0%'} x2={'0%'} y2={'100%'}>
      <Stop offset={'0%'  } stopColor={LIGHT_GREEN.A700} stopOpacity={0.8}/>
      <Stop offset={'100%'} stopColor={GREEN      .A700} stopOpacity={0.5}/>
    </LinearGradient>
  </Defs>
);

/** CorrectTab - line chart: chart border */
const CorrectLine = ({ line }) => (
  <Path
    key={'line'}
    d={line}
    stroke={GREEN[900]}
    fill={'none'}
  />
);

/** CorrectTab - line chart: circular indicators */
const CorrectLineDecorator = ({ x, y, data, onPress, onLongPress, selectedIndex }) => {
  return data.map((value, index) => {
    const { value: correctValue, extraData } = value[TYPES.CORRRECT];
    const isActive = (selectedIndex == index);

    const radius = isActive? 7 : 4.5;
    const props = (isActive? {
      stroke: 'white',
      fill  : GREEN.A700,
    }: {
      stroke: GREEN[900],
      fill  : 'white'   ,
    });

    //onpress callback params
    const params = {
      value, 
      type: TYPES.CORRRECT, 
      ...(extraData || {}),
    };
  
    return (
      <Circle
        r={radius}
        key={index}
        cx={x(index)}
        cy={y(correctValue)}
        onPress    ={() => {onPress     && onPress    (params)}}
        onLongPress={() => {onLongPress && onLongPress(params)}}
        {...props}
      />
    );
  });
};
//#endregion ------ 

//#region ------ STYLED COMPONENTS ------ 
/** animates in/out */
const LoadingIndicator = React.forwardRef((props, ref) => {
  if(!props.showLoading) return null;
  return(
    <Animatable.View
      style={sharedStyles.loadingContainer}
      animation={'fadeInDown'}
      duration={300}
      useNativeDriver={true}
      {...{ref}}
    >
      <ActivityIndicator
        size={'small'}
        color={'white'}
      />
      <Text style={sharedStyles.loadingText}>
        {'Loading'}
      </Text>
    </Animatable.View>
  );
});
//#endregion ------ 

class SummaryTab extends React.PureComponent {
  constructor(props){
    super(props);
    const { emitter, results } = props.screenProps;
    this.emitter = emitter;

    const quiz_results = CustomQuizResultItem.wrapArray(results);
    this.data = quiz_results.map(result => {
      const { correct, incorrect, unaswered } = result.results;

      const sharedParams= {
        extraData   : {...result}, 
        onPress    : this._handleOnPressBar, 
        onLongPress: this._handleOnLongPressBar, 
        addOnPress : true,
        addFill    : true,
      };

      return {
        ...stackItem({type: TYPES.CORRRECT, value: correct  , ...sharedParams}),
        ...stackItem({type: TYPES.WRONG   , value: incorrect, ...sharedParams}),
        ...stackItem({type: TYPES.SKIPPED , value: unaswered, ...sharedParams}),
      };
    });

    this.state = {
      selected: null,
      selectedIndex: 0,
      showRecent: true,
      isFocused: true,
      showLoading: false,
      mode: 0,
    };
  };

  componentDidMount(){
    const { EVENTS } = StatsCard;

    if(this.emitter){
      this.emitter.addListener(
        EVENTS.onChangeShowRecent,
        this._handleOnChangeShowRecent
      );
      this.emitter.addListener(
        EVENTS.onPressHeaderClose,
        this._handleOnPressHeaderClose
      );
    };
  };

  /** navigation events: focus */
  _handleOnDidFocus = () => {
    const { isFocused } = this.state;
    if(!isFocused){
      this.setState({isFocused: true});
    };
  };

  /** navigation events: blurred */
  _handleOnDidBlur = () => {
    const { isFocused } = this.state;
    if(isFocused){
      this.setState({isFocused: false});
    };
  };

  /** emiiter: header recent switch toggle */
  _handleOnChangeShowRecent = async (value) => {
    const { showRecent, isFocused } = this.state;
    const didChange = (value != showRecent);

    if(didChange){
      //hide chart, mount/show loading
      isFocused && await Promise.all([
        this.container && this.container.fadeOut(400),
        setStateAsync(this, {showLoading: true})
      ]);

      //change chart
      await timeout(100);
      await setStateAsync(this, {showRecent: value});
      await timeout(300);
      
      if(isFocused){
        //hide loading, show chart
        await Promise.all([
          this.container && this.container.fadeIn(300),
          this.loading.fadeOutUp(400),
        ]);
        //unmount loading
        await setStateAsync(this, {showLoading: false})
      };
    };
  };

  /** emiiter: header close button */
  _handleOnPressHeaderClose = () => {
    const { selected } = this.state;
    if(selected){
      this.setState({selected: null});
    };
  };

  _handleOnLongPressBar = async () => {
    const { mode } = this.state;

    //hide chart, mount/show loading
    await Promise.all([
      this.container && this.container.fadeOut(400),
      setStateAsync(this, {showLoading: true})
    ]);

    //change chart
    await setStateAsync(this, {mode: mode + 1});
    await timeout(300);

    //hide loading, show chart
    await Promise.all([
      this.container && this.container.fadeIn(300),
      this.loading.fadeOutUp(400),
    ]);
    //unmount loading
    await setStateAsync(this, {showLoading: false});
  };

  _handleOnPressBar = (resultItem) => {
    const { EVENTS } = StatsCard;
    const { selected, showRecent } = this.state;
    
    if(this.emitter){
      this.emitter.emit(EVENTS.onPressChartItem, resultItem); 
    };

    const prev = CustomQuizResultItem.wrap(selected  );
    const next = CustomQuizResultItem.wrap(resultItem);
    //if the prev and next selected are the same item
    const sameItem = (prev.timestampSaved == next.timestampSaved);

    const data = (showRecent
      ? this.data.slice(-10)
      : this.data
    );

    const match = data.findIndex(item => {
      const correct = item[TYPES.CORRRECT];
      const result = CustomQuizResultItem.wrap(correct.extraData);
      return (result.endTime == next.endTime);
    });

    this.setState({
      selected: sameItem? null : next,
      selectedIndex: match,
    });
  };

  _renderChart(){
    const { showRecent, mode, selected, selectedIndex } = this.state;

    const data = (showRecent
      ? this.data.slice(-10)
      : this.data
    );

    const items = data.length;
    const colors = [ RED.A700, GREEN.A700, ];

    const { CORRRECT, WRONG, SKIPPED } = TYPES;
    const MODE = (mode % 2);
    const keys = (
      (MODE == 0)? [ CORRRECT, WRONG   , SKIPPED] :
      (MODE == 1)? [ WRONG   , CORRRECT, SKIPPED] : null
    );

    const { width } = Dimensions.get('screen');
    const card_width = (width - (12 * 2));
    const expanded_width = items * 30;

    const style = (showRecent? {
      flex: 1,
      height: '100%',
    }:{
      width: (expanded_width > card_width)? expanded_width : '100%',
      height: '100%',
      paddingRight: 15,
    });  

    const contentInset = { top: 10, bottom: 7 };

    return(
      <Fragment>
        <View {...{style}}>
          <StackedBarChart
            style={{flex: 1}}
            numberOfTicks={10}
            valueAccessor={ ({ item, key }) => item[key].value }
            min ={0} max ={100}
            yMin={0} yMax={100}
            {...{data, keys, colors, contentInset}}
          >
            <Grid />
            {selected && <StackedToolTip {...{selectedIndex}}/>}
          </StackedBarChart>
          <XAxis
            style={{ marginTop: 0 }}
            scale={scale.scaleBand}
            formatLabel={(value, index) => index + 1}
            svg={{fill: 'grey', fontSize: 12}}
            {...{data}}
          />
        </View>
      </Fragment>
    );
  };

  render(){
    const { showRecent, showLoading } = this.state;

    return(
      <Fragment>
        <NavigationEvents
          onDidFocus={this._handleOnDidFocus}
          onDidBlur ={this._handleOnDidBlur }
        />
        <Animatable.View
          style={sharedStyles.wrapper}
          ref={r => this.container = r}
          useNativeDriver={true}
        >
          <YAxis
            data={this.data}
            formatLabel={ value => `${value}%` }
            {...CONSTANTS.yAxisProps}
          />
          {showRecent? (
            <View style={sharedStyles.container}>
              {this._renderChart()}
            </View>
          ):(
            <ScrollView
              horizontal={true}
              style={sharedStyles.scrollview}
            >
              {this._renderChart()}
            </ScrollView>
          )}
        </Animatable.View>
        <LoadingIndicator
          ref={r => this.loading = r}
          {...{showLoading}}
        />
      </Fragment>
    );
  };
};

class CorrectTab extends React.PureComponent {
  static MODES = 2;

  constructor(props){
    super(props);

    const { emitter } = props.screenProps;
    this.emitter = emitter;
    this.data = this.processData(0);

    this.state = {
      mode: 0,
      selected: null,
      selectedIndex: null,
      showLoading: false,
      isFocused: true,
      showRecent: true,
    };
  };

  componentDidMount(){
    const { EVENTS } = StatsCard;

    if(this.emitter){
      this.emitter.addListener(
        EVENTS.onChangeShowRecent,
        this._handleOnChangeShowRecent
      );
      this.emitter.addListener(
        EVENTS.onPressHeaderClose,
        this._handleOnPressHeaderClose
      );
    };
  };

  processData = (mode) => {
    const { MODES } = CorrectTab;
    const { results } = this.props.screenProps;
    const quiz_results = CustomQuizResultItem.wrapArray(results);
    const MODE = (mode % MODES);
    
    return quiz_results.map(result => {
      const { correct, incorrect, unaswered } = result.results;

      if(MODE == 0){
        const sharedParams = {
          extraData : {...result},
          addOnPress: false,
          addFill   : false,
        };

        return {
          ...stackItem({type: TYPES.CORRRECT, value: correct  , ...sharedParams}),
          ...stackItem({type: TYPES.WRONG   , value: incorrect, ...sharedParams}),
          ...stackItem({type: TYPES.SKIPPED , value: unaswered, ...sharedParams}),
        };

      } else if(MODE == 1){
        const params = {
          type : TYPES.CORRRECT, 
          value: correct       ,
          //pass down extra data
          ...(result || {}),
        };

        return {
          value    : correct,
          extraData: result ,
          svg: {
            onPress    : () => {this._handleOnPressItem    (params)},
            onLongPress: () => {this._handleOnLongPressItem(params)},
          },
        };
      };
    });
  };

  /** navigation events: focus */
  _handleOnDidFocus = () => {
    const { isFocused } = this.state;
    if(!isFocused){
      this.setState({isFocused: true});
    };
  };

  /** navigation events: blurred */
  _handleOnDidBlur = () => {
    const { isFocused } = this.state;
    if(isFocused){
      this.setState({isFocused: false});
    };
  };

  /** emiiter: header recent switch toggle */
  _handleOnChangeShowRecent = async (value) => {
    const { showRecent, isFocused } = this.state;
    const didChange = (value != showRecent);

    if(didChange){
      //hide chart, mount/show loading
      isFocused && await Promise.all([
        this.container && this.container.fadeOut(400),
        setStateAsync(this, {showLoading: true})
      ]);

      //change chart
      await timeout(100);
      await setStateAsync(this, {showRecent: value});
      await timeout(300);
      
      if(isFocused){
        //hide loading, show chart
        await Promise.all([
          this.container && this.container.fadeIn(300),
          this.loading.fadeOutUp(400),
        ]);
        //unmount loading
        await setStateAsync(this, {showLoading: false})
      };
    };
  };

  /** emiiter: header close button */
  _handleOnPressHeaderClose = () => {
    const { selected, selectedIndex } = this.state;
    if(selected || selectedIndex){
      this.setState({
        selected     : null,
        selectedIndex: null,
      });
    };
  };

  _handleOnPressItem = (resultItem) => {
    const { MODES } = CorrectTab;
    const { EVENTS } = StatsCard;
    const { selected, showRecent, mode } = this.state;
    const MODE = (mode % MODES);
    
    if(this.emitter){
      this.emitter.emit(EVENTS.onPressChartItem, resultItem); 
    };

    const prev = CustomQuizResultItem.wrap(selected  );
    const next = CustomQuizResultItem.wrap(resultItem);
    //if the prev and next selected are the same item
    const sameItem = (prev.timestampSaved == next.timestampSaved);

    const data = (showRecent
      ? this.data.slice(-10)
      : this.data
    );

    const match = data.findIndex(item => {
      const result = CustomQuizResultItem.wrap(
        (MODE == 0)? item[TYPES.CORRRECT].extraData :
        (MODE == 1)? item.extraData                 : null
      );

      return (result.endTime == next.endTime);
    });

    this.setState({
      selected     : sameItem? null : next ,
      selectedIndex: sameItem? null : match,
    });
  };

  _handleOnLongPressItem = async () => {
    const { mode } = this.state;
    const nextMode = (mode + 1);

    //hide chart, mount/show loading
    await Promise.all([
      this.container && this.container.fadeOut(400),
      setStateAsync(this, {showLoading: true})
    ]);

    //update data i.e add onpress handlers
    this.data = this.processData(nextMode);
    //change chart
    await setStateAsync(this, {mode: nextMode});
    await timeout(300);

    //hide loading, show chart
    await Promise.all([
      this.container && this.container.fadeIn(300),
      this.loading.fadeOutUp(400),
    ]);
    //unmount loading
    await setStateAsync(this, {showLoading: false});
  };

  _renderChart(){
    const { showRecent, selectedIndex, mode } = this.state;

    const data = (showRecent
      ? this.data.slice(-10)
      : this.data
    );
    
    const items = data.length;

    const { width } = Dimensions.get('screen');
    const card_width = (width - (12 * 2));
    const expanded_width = items * 30;
    
    const buttonProps = {
      activeOpacity: 1,
      onLongPress: this._handleOnLongPressItem,
      style: (showRecent? {
        flex: 1,
        height: '100%',
      }:{
        width: (expanded_width > card_width)? expanded_width : '100%',
        height: '100%',
        paddingRight: 15,
      }),
    };
    
    const contentInset = { top: 10, bottom: 7 };
    const sharedChartProps = {
      style: { flex: 1 },
      numberOfTicks: 10 ,
      min : 0  , 
      max : 100,
      yMin: 0  , 
      yMax: 100,
      ...{data, contentInset}
    };
    const sharedXAxisProps = {
      style      : { marginTop: 2 },
      svg        : { fill: 'grey', fontSize: 12 },
      formatLabel: ( value, index ) => ( index + 1 ),
      ...{data},
    };

    const MODE = (mode % 2);
    return (
      (MODE == 0)? (
        <TouchableOpacity {...buttonProps}>
          <AreaChart
            svg={{ fill: 'url(#gradient)' }}
            curve={shape.curveNatural}
            yAccessor={({item}) => item[TYPES.CORRRECT].value}
            {...sharedChartProps}
          >
            <Grid/>
            <CorrectLine/>
            <CorrectGradient/>
            <CorrectLineDecorator 
              onPress={this._handleOnPressItem}
              onLongPress={this._handleOnLongPressItem}
              {...{selectedIndex}}
            />
          </AreaChart>
          <XAxis {...sharedXAxisProps}/>
        </TouchableOpacity>
      ):(MODE == 1)? (
        <TouchableOpacity {...buttonProps}>
          <BarChart
            svg={{strokeWidth: 2, fill: 'url(#gradient)'}}
            yAccessor={({item}) => item.value}
            {...sharedChartProps}
          >
            <Grid/>
            <CorrectGradient/>
          </BarChart>
        </TouchableOpacity>
      ):(null)
    );
  };

  render(){
    const { showRecent, showLoading } = this.state;

    return(
      <Fragment>
        <NavigationEvents
          onDidFocus={this._handleOnDidFocus}
          onDidBlur ={this._handleOnDidBlur }
        />
        <Animatable.View
          style={sharedStyles.wrapper}
          ref={r => this.container = r}
          useNativeDriver={true}
        >
          <YAxis
            data={this.data}
            formatLabel={ value => `${value}%` }
            {...CONSTANTS.yAxisProps}
          />
          {showRecent? (
            <View style={sharedStyles.container}>
              {this._renderChart()}
            </View>
          ):(
            <ScrollView
              horizontal={true}
              style={sharedStyles.scrollview}
            >
              {this._renderChart()}
            </ScrollView>
          )}
        </Animatable.View>
        <LoadingIndicator
          ref={r => this.loading = r}
          {...{showLoading}}
        />
      </Fragment>
    );
  };
};

class WrongTab extends React.PureComponent {
  render(){
    return(
      <View style={{flex: 1, backgroundColor: 'red', width: 100, height: 100}}>

      </View>
    );
  };
};

const TabNavigator = createMaterialTopTabNavigator({
    [TAB_ROUTES.SUMMARY]: SummaryTab,
    [TAB_ROUTES.CORRECT]: CorrectTab,
    [TAB_ROUTES.WRONG  ]: WrongTab  ,
  }, {
    swipeEnabled: false,
    animationEnabled: true,
    activeTintColor: PURPLE.A700,
    tabBarOptions: {
      labelStyle: {
        color: 'white',
        fontSize: 14,
      },
      style: {
        backgroundColor: PURPLE.A400,
      },
      indicatorStyle:{
        backgroundColor: 'white',
      },
    },
  }
);

class StatsHeader extends React.PureComponent {
  static propTypes = {
    selected: PropTypes.object,
  };

  static styles = StyleSheet.create({
    divider: {
      margin: 12,
    },
    //header styles
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleTextContainer: {
      flex: 1,
      marginLeft : 12,
      marginRight: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: PURPLE[900],
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '200',
      color: GREY[900],
    },
    subtitleTime: {
      fontWeight: '200',
      opacity: 0.5,
      color: GREY[900],
    },
    closeContainer: {
      alignSelf: 'flex-start',
    },
  });

  _renderHeader(){
    const { styles } = StatsHeader;
    const { selected } = this.props;

    const result = CustomQuizResultItem.wrap(selected);
    const { results } = result;

    const correct = results? results.correct : 0;
    const total   = results? results.total   : 0;

    const value = Math.round((correct / total * 100));
    const color = (value >= 50)? GREEN.A700 : RED.A400;

    const time = result.timestampSaved || 0;
    const date    = moment(time).format('ddd, MMM D YYYY');
    const timeStr = moment(time).format('LT');

    return(
      <View style={styles.titleContainer}>
        <NumberIndicator
          textStyle={{fontWeight: '700'}}
          size={45}
          initFontSize={16}
          diffFontSize={1.25}
          suffix={'%'}
          {...{value, color}}
        />
        <View style={styles.titleTextContainer}>
          <Text style={[styles.title, {color}]}>{date}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            <TimeAgo {...{time}}/>
            <Text style={styles.subtitleTime}>{` at ${timeStr}`}</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeContainer}
          onPress={this.props.onPressClose}
          activeOpacity={0.75}
        >
          <Icon
            name={'ios-close-circle'}
            type={'ionicon'}
            color={GREY[200]}
            size={32}
          />
        </TouchableOpacity>
      </View>
    );
  };

  _renderDetails(){
    const { selected } = this.props;

    const result = CustomQuizResultItem.wrap(selected);
    const { results, startTime, endTime } = result;

    //score
    const correct = results? results.correct : 0;
    const total   = results? results.total   : 0;

    //compute duration
    const diffTime  = endTime - startTime;
    const diffMills = moment.duration(diffTime).asMilliseconds();
    const duration  = moment.utc(diffMills).format("HH:mm:ss");

    const marginTop = 10;
    return(
      <Fragment>
        <DetailRow>
          <DetailColumn
            title={'Total Score: '}
            subtitle={`${correct}/${total} items`}
            help={true}
            helpTitle={'Total Scrore'}
            helpSubtitle={'Your score over the total amount of items'}
            backgroundColor={PURPLE.A700}
            disableGlow={true}
          />
          <DetailColumn 
            title={'Duration: '}
            subtitle={duration}
            help={true}
            helpTitle={'Total Duration'}
            helpSubtitle={'Tells you how much time elapsed during the quiz.'}
            backgroundColor={PURPLE.A700}
            disableGlow={true}
          />
        </DetailRow>
      </Fragment>
    );
  };

  render(){
    const { styles } = StatsHeader;
    return(
      <Fragment>
        {this._renderHeader()}
        <Divider style={styles.divider}/>
        {this._renderDetails()}
      </Fragment>
    );
  };
};

class StatsCard extends React.PureComponent {
  static propTypes = {
    results: PropTypes.array,
  };

  static styles = StyleSheet.create({
    wrapper: {
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    container: {
      flex: 1,
      overflow: 'hidden',
      borderRadius: 10,
    },
    tabContainer: {
      overflow: 'hidden',
      height: 325,
    },
    TabNavigator: {
      flex: 1, 
      height: '100%', 
      width: '100%', 
    },
    //header styles
    headerContainer: {
      padding: 10,
      backgroundColor: PURPLE.A400,
    },
    headerCard: {
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 12,
      backgroundColor: 'white',
      ...Platform.select({
        ios: {
          shadowOffset:{  width: 1,  height: 1.5,  },
          shadowColor: 'black',
          shadowRadius: 4,
          shadowOpacity: 0.15,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    headerInactiveContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerImage: {
      width: 90,
      height: 90,
    },
    headerDesc: {
      flex: 1,
      fontSize: 15,
      fontWeight: '200',
      marginLeft: 12,
      color: GREY[900],
      textAlignVertical: 'center',
    },
    divider: {
      margin: 10,
    },
    //header switch
    switchTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: PURPLE[800],
    },
    switchSubtitle: {
      fontSize: 15,
      fontWeight: '200',
      color: GREY[900],
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    switchTextContainer: {
      flex: 1,
      marginRight: 10,
    },
  });

  static EVENTS = {
    onPressChartItem  : 'onPressChartItem'  ,
    onChangeShowRecent: 'onChangeShowRecent',
    onPressHeaderClose: 'onPressHeaderClose',
  };

  constructor(props){
    super(props);

    this.emitter = new EventEmitter();
    this.image = require('../../assets/icons/charts.png');

    this.state = {
      selected: null,
      showRecent: true,
      showSwitch: false,
    };
  };

  componentDidMount(){
    const { EVENTS } = StatsCard;

    if(this.emitter){
      this.emitter.addListener(
        EVENTS.onPressChartItem,
        this._handleOnPressChartItem
      );
    };
  };

  _handleOnPressChartItem = async (params) => {
    const { selected } = this.state;
    const prev = CustomQuizResultItem.wrap(selected);
    const next = CustomQuizResultItem.wrap(params  );

    //if the prev and next selected are the same item
    const sameItem = (prev.timestampSaved == next.timestampSaved);

    if(sameItem){
      this.transitioner.transition(!sameItem);
      await timeout(300);
      this.setState({selected: null});

    } else{
      await setStateAsync(this, {selected: next});
      this.transitioner.transition(!sameItem);
    };
  };

  _handleOnTransition = (value) => {
    this.container.pulse(value? 750 : 500); 
  };

  _handleOnValueChangeSwitch = (value) => {
    const { EVENTS } = StatsCard;
    this.setState({ showRecent: value });
    
    if(this.emitter){
      this.emitter.emit(EVENTS.onChangeShowRecent, value); 
    };
  };

  _handleOnPressClose = () => {
    const { EVENTS } = StatsCard;

    //collapse header
    this.transitioner.transition(false);
    
    if(this.emitter){
      this.emitter.emit(EVENTS.onPressHeaderClose); 
    };
  };

  _renderInactive(){
    const { styles } = StatsCard;
    const { showRecent: value } = this.state;
    const { results } = this.props;

    const count = (results || []).length;
    const subtitle = (value
      ? 'Showing last 10 results'
      : `Showing all ${count} results`
    );

    return(
      <Fragment>
        <View style={styles.switchContainer}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchTitle}>
              {'Show Recent'}
            </Text>
            <Text style={styles.switchSubtitle}>
              {subtitle}
            </Text>
          </View>
          <Switch
            onValueChange={this._handleOnValueChangeSwitch}
            {...{value}}
          />
        </View>
        <Divider style={styles.divider}/>        
        <View style={styles.headerInactiveContainer}>
          <Animatable.Image
            source={this.image}
            style={styles.headerImage}
            animation={'pulse'}
            duration={20 * 1000}
            iterationCount={'infinite'}
            iterationDelay={1000}
            delay={2000}
          />
          <Text style={styles.headerDesc}>
            {'Tap on an item inside the chart to view more details. Long press on thr chart to toggle between modes.'}
          </Text>
        </View>
      </Fragment>
    );
  };

  _renderHeader(){
    const { styles } = StatsCard;
    const { selected } = this.state;

    return(
      <View style={styles.headerContainer}>
        <View style={styles.headerCard}>
          <TransitionAB 
            ref={r => this.transitioner = r}
            onTransition={this._handleOnTransition}
            handlePointerEvents={true}
          >
            {this._renderInactive()}
            <StatsHeader
              onPressClose={this._handleOnPressClose}
              {...{selected}}  
            />
          </TransitionAB>
        </View>
      </View>
    );
  };

  render(){
    const { styles } = StatsCard;
    const props = this.props;

    const screenProps = {
      results: props.results,
      emitter: this.emitter ,
    };
     
    return(
      <Animatable.View
        ref={r => this.container = r}
        useNativeDriver={true}
      >
        <Card style={styles.wrapper}>
          <View style={styles.container}>
            {this._renderHeader()}
            <View style={styles.tabContainer}>
              <TabNavigator
                navigation={this.props.navigation}
                {...{screenProps}}
              />
            </View>
          </View>
        </Card>
      </Animatable.View>
    );
  };
};

export class TestScreen extends React.Component {
  static router = TabNavigator.router;

  render(){
    const json = require('../../test_data/quiz_results.json');

    return(
      <ScrollView style={{paddingTop: 100}}>
        <StatsCard 
          results={json}
          navigation={this.props.navigation}
        />
      </ScrollView>
    );
  };
};