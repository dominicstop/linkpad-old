import React, { Fragment, Children } from 'react';
import { Text, View, ScrollView, Dimensions, StyleSheet, Switch, TouchableOpacity, ActivityIndicator, Clipboard, Platform, TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';
import EventEmitter from 'events';

import * as scale from 'd3-scale';
import * as Animatable from 'react-native-animatable';
import { BarChart, AreaChart, StackedAreaChart, Grid, StackedBarChart, XAxis, YAxis } from 'react-native-svg-charts'
import { Circle, Path, Text as SVGText, G, Line, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Chroma from 'chroma-js';
import moment from "moment";
import TimeAgo from 'react-native-timeago';
import { createMaterialTopTabNavigator, NavigationEvents } from 'react-navigation';
import { Divider, Icon } from 'react-native-elements';
import * as shape from 'd3-shape';

import { Portal } from 'react-native-paper';

import { TransitionAB } from '../components/Transitioner';
import { GREEN, RED, PURPLE, GREY, BLUE, LIGHT_GREEN } from '../Colors';
import { CustomQuiz } from '../functions/CustomQuizStore';
import { CustomQuizResultItem } from '../functions/CustomQuizResultsStore';
import { Card, IconText } from '../components/Views';
import { NumberIndicator, DetailColumn, DetailRow, BlurViewWrapper, PlatformButton, ModalTitle } from '../components/StyledComponents';
import { setStateAsync, timeout } from '../functions/Utils';

/**
 * [x] TODO: refactor mode % 2 - move to longpresshandler
 * [x] TODO: add tooltip to CorrectTab bar graph
 * [x] TODO: add tooltip to sta0cked chart mode to Summary tab
 * [x] TODO: add button to header to switch/toggle betw. modes using Modal/Picker
 * [x] TODO: implement header details change based on active tab
 * [x] TODO: add animation to header when changing between selected chart items 
 * [-] TODO: implement long press summary tab to toggle mode
 * [-] FIX : fix indicator and header selected state getting out of sync
 * [-] FIX : fix yaxis/incorrect in summarytab being inconsintent between modes
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
  CORRECT: 'CORRECT' ,
  SKIPPED: 'SKIPPED' ,
  WRONG  : 'WRONG'   ,
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
      bottom: 12 + 10 
    },
  },
};

const stackItem = ({type, value, extraData, onPress, onLongPress, addOnPress, addFill}) => {
  //colors
  const colorsRed   = Chroma.scale([RED  .A700, RED  .A400]).colors(100);
  const colorsGreen = Chroma.scale([GREEN.A700, GREEN.A400]).colors(100);
  //params for callbacks
  const params = {type, value, ...(extraData || {})};

  return({
    [type]: {
      value: Math.abs(value || 0), 
      extraData,
      svg: {
        ...(addOnPress && {
          onPress    : () => onPress     && onPress    (params),
          onLongPress: () => onLongPress && onLongPress(params),  
        }),  
        ...(addFill && {
          fill: (
            (type == TYPES.CORRECT )? colorsGreen[value - 1] :
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
/** SummaryTab - bar chart: shown when a chart is selected/active */
const SummaryBarToolTip = ({ x, y, height, width, data, selectedIndex }) => {
  const radius = 6;
  const items = data.length;
  const bandwidth = (width / items);

  const { CORRECT, WRONG } = data[selectedIndex];
  //compute y pos based on score
  const yComputed = y(CORRECT.value + WRONG.value);

  //0 = top, height = bottom
  const upperBounds = (radius * 2) + 5;
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

/** SummaryTab - area chart: shown for each data point*/
class SummaryAreaDecorator extends React.Component {
  static propTypes = {
    //chart props
    x     : PropTypes.func, 
    y     : PropTypes.func, 
    height: PropTypes.number, 
    width : PropTypes.number, 
    data  : PropTypes.array , 
    values: PropTypes.array , 
    //custom props
    selectedIndex: PropTypes.number, 
    onPress      : PropTypes.func, 
    onLongPress  : PropTypes.func,
  };
  
  shouldComponentUpdate(nextProps){
    const { props: prevProps } = this;
    return(
      prevProps.selectedIndex != nextProps.selectedIndex ||
      prevProps.data  .length != nextProps.data  .length ||
      prevProps.values.length != nextProps.values.length 
    );
  };

  render(){
    const { x, y, values, selectedIndex, onPress, onLongPress } = this.props;
    return values.map((value, index) => {
      const CORRECT = value[TYPES.CORRECT];
      const WRONG   = value[TYPES.WRONG  ];
      const SKIPEED = value[TYPES.SKIPPED];
  
      //extract values
      const correct = CORRECT.value || 0;
      const wrong   = WRONG  .value || 0;
      const skipped = SKIPEED.value || 0;
  
      const items = (correct + wrong + skipped);
      const total = (correct + wrong);
      const score = (correct / items);
  
      const params = { 
        type     : TYPES.CORRECT    ,
        extraData: CORRECT.extraData,
        //pass down
        ...CORRECT.extraData,
      };
          
      const rectSize = 30;
      const props = (index == selectedIndex)? {
        r     : 8          ,
        stroke: 'white'    ,
        fill  : PURPLE.A700,
      }:{
        r     : 5          ,
        stroke: PURPLE[300],
        fill  :  'white'   ,
      };
  
      return(
        <G
          key={`${index}-parent`}
          x={x(index) - (rectSize/2)}
          y={y(total) - (rectSize/2)}
        >
          <Circle
            key={`${index}-childB`}
            cx={(rectSize/2)}
            cy={(rectSize/2)}
            key={index}
            strokeWidth={ 2 }      
            {...props}
          />
          <Rect
            key={`${index}-childA`}
            width={rectSize}
            height={rectSize}
            fill={'rgba(0,0,0,0)'}
            onPress    ={() => onPress     && onPress    (params)}
            onLongPress={() => onLongPress && onLongPress(params)}
          />
        </G>
      );
    });
  };
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

const XYGrid = ({ x, y, data, ticks }) => (
  <G>
    {ticks.map(tick => (
      <Line
        key={ tick }
        x1={ '0%' }
        x2={ '100%' }
        y1={ y(tick) }
        y2={ y(tick) }
        stroke={ 'rgba(0,0,0,0.1)' }
      />
    ))}
    {data.map((_, index) => (
      <Line
        key={ index }
        y1={ '0%' }
        y2={ '100%' }
        x1={ x(index) }
        x2={ x(index) }
        stroke={ 'rgba(0,0,0,0.1)' }
      />
    ))}
  </G>
);

/** CorrectTab - line chart: circular indicators */
const CorrectLineDecorator = ({ x, y, data, onPress, onLongPress, selectedIndex }) => {
  return data.map((value, index) => { 
    const { value: correctValue, extraData } = value[TYPES.CORRECT];
    const isActive = (selectedIndex == index);

    const rectSize = 30;
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
      type: TYPES.CORRECT, 
      ...(extraData || {}),
    };

    return(
      <G
        key={`${index}-parent`}
        x={x(index       ) - (rectSize/2)}
        y={y(correctValue) - (rectSize/2)}
      >
        <Circle
          r={radius}
          key={`${index}-childB`}
          cx={(rectSize/2)}
          cy={(rectSize/2)}
          key={index}
          strokeWidth={ 2 }      
          {...props}
        />
        <Rect
          key={`${index}-childA`}
          width={rectSize}
          height={rectSize}
          fill={'rgba(0,0,0,0)'}
          onPress    ={() => onPress     && onPress    (params)}
          onLongPress={() => onLongPress && onLongPress(params)}
        />
      </G>
    );
  });
};

/** CorrectTab - bar chart: circular tooltip indicator */
const CorrectBarToolTip = ({ x, y, height, width, data, selectedIndex }) => {
  const radius = 6;
  const items = data.length;
  const bandwidth = (width / items);

  const { value, extraData } = data[selectedIndex];
  //0 = top, height = bottom
  const upperBounds = (radius * 2) + 10;
  const lowerBounds = (height - upperBounds);

  const yPos = (
    y(value) > lowerBounds? lowerBounds :
    y(value) < upperBounds? upperBounds : y(value)
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
        stroke={GREEN[900]}
        strokeWidth={ 2 }
        fill={ 'white' }
      />
    </G>
  );
};

/** WrongTab - bar chart: shown when a chart is selected/active */
const WrongBarToolTip = ({ x, y, height, width, data, selectedIndex }) => {
  const radius = 6;
  const items = data.length;
  const bandwidth = (width / items);

  const WRONG   = data[selectedIndex][TYPES.WRONG  ];
  const SKIPPED = data[selectedIndex][TYPES.SKIPPED];

  //compute y pos based on score
  const yComputed = y(SKIPPED.value + WRONG.value);

  //0 = top, height = bottom
  const upperBounds = (radius * 2) + 5;
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

/** WrongTab - area chart: shown for each data point*/
class WrongAreaDecorator extends React.Component {
  static propTypes = {
    //chart props
    x     : PropTypes.func, 
    y     : PropTypes.func, 
    height: PropTypes.number, 
    width : PropTypes.number, 
    data  : PropTypes.array , 
    values: PropTypes.array , 
    //custom props
    selectedIndex: PropTypes.number, 
    onPress      : PropTypes.func, 
    onLongPress  : PropTypes.func,
  };
  
  shouldComponentUpdate(nextProps){
    const { props: prevProps } = this;
    return(
      prevProps.selectedIndex != nextProps.selectedIndex ||
      prevProps.data  .length != nextProps.data  .length ||
      prevProps.values.length != nextProps.values.length 
    );
  };

  render(){
    const { x, y, values, selectedIndex, onPress, onLongPress } = this.props;
    return values.map((value, index) => {
      const CORRECT = value[TYPES.CORRECT];
      const WRONG   = value[TYPES.WRONG  ];
      const SKIPEED = value[TYPES.SKIPPED];
  
      //extract values
      const correct = CORRECT.value || 0;
      const wrong   = WRONG  .value || 0;
      const skipped = SKIPEED.value || 0;
  
      const items = (correct + wrong + skipped);
      const total = (correct + wrong);
      const score = (correct / items);
  
      const params = { 
        type     : TYPES.CORRECT    ,
        extraData: CORRECT.extraData,
        //pass down
        ...CORRECT.extraData,
      };
          
      const rectSize = 30;
      const props = (index == selectedIndex)? {
        r     : 8          ,
        stroke: 'white'    ,
        fill  : PURPLE.A700,
      }:{
        r     : 5          ,
        stroke: PURPLE[300],
        fill  :  'white'   ,
      };
  
      return(
        <G
          key={`${index}-parent`}
          x={x(index) - (rectSize/2)}
          y={y(total) - (rectSize/2)}
        >
          <Circle
            key={`${index}-childB`}
            cx={(rectSize/2)}
            cy={(rectSize/2)}
            key={index}
            strokeWidth={ 2 }      
            {...props}
          />
          <Rect
            key={`${index}-childA`}
            width={rectSize}
            height={rectSize}
            fill={'rgba(0,0,0,0)'}
            onPress    ={() => onPress     && onPress    (params)}
            onLongPress={() => onLongPress && onLongPress(params)}
          />
        </G>
      );
    });
  };
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

class ModeSelectorModal extends React.PureComponent {
  static propTypes = {
    onPressOption: PropTypes.func,
    activeMode   : PropTypes.number,
  };

  static styles = StyleSheet.create({
    rootContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    overlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.25)',
    },
    topSpacer: {
      flex: 1,
    },
    topContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
    },
    bottomContainer: {
      backgroundColor: 'white',
      padding: 10,
    },
    controlContainer: {
      flex: 0,
      alignSelf: 'stretch',
      marginHorizontal: 0,
      marginVertical: 0,
      paddingVertical: 15,
      borderRadius: 13,
    },
    //header styles
    headerContainer: {
      marginTop: 3,
      marginBottom: 10,
    },
    headerTitle: {
      flex: 0,
    },
    headerSubtitle: {
      flex: 0,
      marginTop: -2,
    },
  });

  constructor(props){
    super(props);

    this.state = {
      mount: false,
      mode: -1,
    };
  };

  showModal = async ({visible, mode}) => {
    const { mount } = this.state;
    const didChange = (mount != visible);

    if(!visible && didChange){
      await Promise.all([
        this.overlay         && this.overlay        .fadeOut     (750),
        this.topContainer    && this.topContainer   .fadeOutDown (400),
        this.bottomContainer && this.bottomContainer.slideOutDown(300),
      ]);
      //hide and reset mode
      this.setState({mount: false, mode: -1}); 

    } else if(visible && didChange) {
      this.setState({mount: true, mode}); 
    };
  };

  _handleOnPress = (params) => {
    const { onPressOption } = this.props;
    this.showModal(false);
    onPressOption && onPressOption(params);
  };

  _handleOnPressCancel = () => {
    this.showModal(false);
  };

  _renderControls(){
    const { styles } = ModeSelectorModal;
    const { children, activeMode } = this.props;

    return(
      <Card style={styles.controlContainer}>
        <ModalTitle
          title={'Chart Mode'}
          subtitle={"Change the current chart style. "}
          iconStyle={{marginTop: 2}}
          iconName={'md-eye'}
          iconType={'ionicon'}
          containerStyle={styles.headerContainer}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
          outerGlow={false}
        />
        {Children.map(children, (child, index) => {
          const item = React.cloneElement(child, {
            index, activeMode,
            onPress: this._handleOnPress,
          });
          return(
            <Fragment>
              {(index == 0) && <Divider/>}
              {item}
              <Divider/>
            </Fragment>
          );
        })}
      </Card>
    );
  };

  render(){
    const { styles } = ModeSelectorModal;
    const { mount } = this.state;
    if(!mount) return null;

    const spacerProps = {
      style  : styles.topSpacer,
      onPress: this._handleOnPressCancel,
    };
    
    return(
      <View style={styles.rootContainer}>
        <Animatable.View 
          style={styles.overlay}
          ref={r => this.overlay = r}
          animation={'fadeIn'}
          duration={1000}
          useNativeDriver={true}
        />
        <TouchableOpacity {...spacerProps}/>        
        <Animatable.View 
          style={styles.topContainer}
          ref={r => this.topContainer = r}
          animation={'fadeInUp'}
          duration={300}
          useNativeDriver={true}
        >
          {this._renderControls()}
        </Animatable.View>
        <TouchableOpacity {...spacerProps}/>
        <Animatable.View 
          style={styles.bottomContainer}
          ref={r => this.bottomContainer = r}
          animation={'slideInUp'}
          duration={200}
          useNativeDriver={true}
        >
          <PlatformButton
            title={'Cancel'}
            iconName={'ios-close-circle'}
            iconType={'ionicon'}
            isBgGradient={true}
            onPress={this._handleOnPressCancel}
          />
        </Animatable.View>
      </View>
    );
  };
};

class ModeSelectorOption extends React.PureComponent {
  static propTypes = {
    mode      : PropTypes.number,
    index     : PropTypes.number,
    title     : PropTypes.string,
    subtitle  : PropTypes.string,
    activeMode: PropTypes.number,
    //callback events
    onPress: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    textContainer: {
      marginLeft: 12,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: PURPLE[900],
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '300',
    },
  });

  _handleOnPress = () => {
    const { onPress, ...otherProps } = this.props;
    //pass down props as params to callback
    onPress && onPress({...otherProps});
  };

  render(){
    const { styles } = ModeSelectorOption;
    const { title, subtitle, mode, activeMode } = this.props;

    const name = (mode == activeMode
      ? 'ios-radio-button-on'
      : 'ios-radio-button-off'
    );

    return(
      <TouchableOpacity 
        style={styles.container}
        onPress={this._handleOnPress}
        activeOpacity={0.75}
      >
        <Icon
          type={'ionicon'}
          color={PURPLE.A700}
          size={28}
          {...{name}}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
};

class SummaryTab extends React.PureComponent {
  static MODES = {
    'CHART_BAR'    : 0,
    'CHART_BAR_ALT': 1,
    'CHART_AREA'   : 2,
  };

  constructor(props){
    super(props);

    this.emitter = props.screenProps.emitter;
    this.data    = this.processData(0);

    this.state = {
      selected: null,
      selectedIndex: -1,
      showRecent: true,
      isFocused: true,
      showLoading: false,
      mode: 0,
    };
  };

  componentDidMount(){
    const { EVENTS } = ScoreProgressCard;

    if(this.emitter){
      this.emitter.addListener(
        EVENTS.onChangeShowRecent,
        this._handleOnChangeShowRecent
      );
      this.emitter.addListener(
        EVENTS.onPressHeaderClose,
        this._handleOnPressHeaderClose
      );
      this.emitter.addListener(
        EVENTS.onPressHeaderChartMode,
        this._handleOnPressChangeChartMode
      );
      this.emitter.addListener(
        EVENTS.onPressChartItem,
        this._handleOnPressChartItem
      );
    };
  };

  processData = (mode) => {
    const { MODES } = SummaryTab;
    const { results } = this.props.screenProps;
    const quiz_results = CustomQuizResultItem.wrapArray(results);
    
    return quiz_results.map(result => {
      const { correct, incorrect, unaswered } = result.results;

      switch (mode) {
        case MODES.CHART_BAR    :
        case MODES.CHART_BAR_ALT: return (() => {
          const sharedParams= {
            extraData  : {...result}, 
            onPress    : this._handleOnPressItem    , 
            onLongPress: this._handleOnLongPressBar, 
            addOnPress : true,
            addFill    : true,
          };
    
          return {
            ...stackItem({type: TYPES.CORRECT , value: correct  , ...sharedParams}),
            ...stackItem({type: TYPES.WRONG   , value: incorrect, ...sharedParams}),
            ...stackItem({type: TYPES.SKIPPED , value: unaswered, ...sharedParams}),
          };
        })();
        case MODES.CHART_AREA: return (() => {
          return {
            [TYPES.CORRECT]: Math.abs(correct   || 0),
            [TYPES.WRONG  ]: Math.abs(incorrect || 0),
            //not shown inside chart
            extraData: {...result},
          };
        })();
      };
    });
  };

  setMode = async (nextMode) => {
    const { mode } = this.state;
    const didModeChange = (mode != nextMode);
    if(!didModeChange) return null;

    //hide chart, mount/show loading
    await Promise.all([
      this.container && this.container.fadeOut(400),
      setStateAsync(this, {showLoading: true})
    ]);

    //change chart
    this.data = this.processData(nextMode);
    await setStateAsync(this, {mode: nextMode});
    await timeout(300);

    //hide loading, show chart
    await Promise.all([
      this.container && this.container.fadeIn(300)   ,
      this.loading   && this.loading  .fadeOutUp(400),
    ]);
    //unmount loading
    await setStateAsync(this, {showLoading: false});
  };

  toggleMode = async () => {
    const { MODES } = SummaryTab;
    const { mode } = this.state;

    const modes = Object.keys(MODES).length;
    const nextMode = ((mode + 1) % modes);
    await this.setMode(nextMode);
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
      this.setState({
        selected     : null,
        selectedIndex: null
      });
    };
  };

  /** emiiter: header change chart button */
  _handleOnPressChangeChartMode = () => {
    const { isFocused, mode } = this.state;
    if(isFocused){
      this.modeModal.showModal({visible: true, mode});
    };
  };

  /** emiiter: when a chart item is pressed in a tab */
  _handleOnPressChartItem = ({data, index, route}) => {
    if(route != TAB_ROUTES.SUMMARY){
      this.setState({
        selected     : data ,
        selectedIndex: index,
      });
    };
  };
  
  _handleOnPressOption = ({mode}) => {
    const { MODES } = SummaryTab;
    this.setMode(mode);
  };

  _handleOnLongPressChart = () => {
    this.toggleMode();
  };

  _handleOnLongPressBar = async () => {
    this.toggleMode();
  };

  _handleOnPressItem = (resultItem) => {
    const { EVENTS } = ScoreProgressCard;
    const { MODES } = SummaryTab;
    const { selected, showRecent, mode } = this.state;

    const prev = CustomQuizResultItem.wrap(selected  );
    const next = CustomQuizResultItem.wrap(resultItem);
    //if the prev and next selected are the same item
    const sameItem = (prev.timestampSaved == next.timestampSaved);
    
    const data = (showRecent
      ? this.data.slice(-10)
      : this.data  
    );

    const match = data.findIndex(item => {
      const extraData = (mode == MODES.CHART_AREA
        ? item.extraData
        : item[TYPES.CORRECT].extraData
      );

      const result = CustomQuizResultItem.wrap(extraData);
      return (result.endTime == next.endTime);
    });

    if(this.emitter){
      this.emitter.emit(EVENTS.onPressChartItem, {
        data : resultItem,
        route: TAB_ROUTES.SUMMARY,
        index: match,
      }); 
    };

    this.setState({
      selected     : sameItem? null : next,
      selectedIndex: match,
    });
  };

  _renderChart(){
    const { MODES } = SummaryTab;
    const { showRecent, mode, selected, selectedIndex } = this.state;

    const data = (showRecent
      ? this.data.slice(-10)
      : this.data
    );

    const items = data.length;
    const colors = [ RED.A700, GREEN.A700, ];

    const { CORRECT, WRONG, SKIPPED } = TYPES;
    const keys = (
      (mode == MODES.CHART_BAR    )? [ CORRECT, WRONG  , SKIPPED] :
      (mode == MODES.CHART_BAR_ALT)? [ WRONG  , CORRECT, SKIPPED] :
      (mode == MODES.CHART_AREA   )? [ CORRECT, WRONG  ,        ] : null
    );

    const { width } = Dimensions.get('screen');
    const card_width = (width - (12 * 2));
    const expanded_width = items * 30;

    const buttonProps = {
      activeOpacity: 1,
      onLongPress: this._handleOnLongPressChart,
      style: (showRecent? {
        flex: 1,
        height: '100%',
      }:{
        width: (expanded_width > card_width)? expanded_width : '100%',
        height: '100%',
        paddingRight: 15,
      }),
    };

    const contentInset = { top: 0, bottom: 7 };
    const sharedChartProps = {
      style: { flex: 1 },
      numberOfTicks: 10 ,
      min : 0, max : 100,
      yMin: 0, yMax: 100,
      //pass down as props
      data, keys, colors, contentInset
    };
    const sharedXAxisProps = {
      formatLabel: (value, index) => index + 1,
      svg: {
        fill: 'grey', 
        fontSize: 12
      },
      //pass down as props
      data
    };

    switch (mode) {
      case MODES.CHART_BAR    : 
      case MODES.CHART_BAR_ALT: return(
        <TouchableOpacity {...buttonProps}>
          <StackedBarChart
            valueAccessor={ ({ item, key }) => item[key].value }
            {...sharedChartProps}
          >
            {(mode == MODES.CHART_BAR)
              ? <Grid/>
              : <XYGrid belowChart={true}/>
            }
            {selected && <SummaryBarToolTip {...{selectedIndex}}/>}
          </StackedBarChart>
          <XAxis
            scale={scale.scaleBand}
            {...sharedXAxisProps}
          />
        </TouchableOpacity>
      );
      case MODES.CHART_AREA: return(() => {
        // note: stackedarea does not have full support for decorators
        // so i have to manually compute the pos of the points :/
        const altData = this.processData(MODES.CHART_BAR);
        const values  = (showRecent? altData.slice(-10) : altData);
        
        return(
          <TouchableOpacity {...buttonProps}>
            <StackedAreaChart
              curve={ shape.curveMonotoneX }
              {...sharedChartProps}
            >
              <Grid/>
              <SummaryAreaDecorator 
                onPress    ={this._handleOnPressItem   }
                onLongPress={this._handleOnLongPressBar}
                {...{values, data, selectedIndex}}
              />
            </StackedAreaChart>
            <XAxis {...sharedXAxisProps}/>
          </TouchableOpacity>
        );
      })();
    };
  };

  _renderOverlay(){
    const { MODES } = SummaryTab;
    const { mode: activeMode } = this.state;
    return(
      <Portal>
        <ModeSelectorModal 
          ref={r => this.modeModal = r}
          onPressOption={this._handleOnPressOption}
          {...{activeMode}}
        >
          <ModeSelectorOption
            title={'Bar Chart'}
            subtitle={'Correct and wrong answers'}
            mode={MODES.CHART_BAR}
          />
          <ModeSelectorOption
            title={'Bar Chart (Reversed)'}
            subtitle={'Wrong and correct answers'}
            mode={MODES.CHART_BAR_ALT}
          />
          <ModeSelectorOption
            title={'Line Chart'}
            subtitle={'Stacked area line chart'}
            mode={MODES.CHART_AREA}
          />
        </ModeSelectorModal>
      </Portal>
    );
  };

  render(){
    const { MODES } = SummaryTab;
    const { mode, showRecent, showLoading } = this.state;

    const keys = [TYPES.CORRECT, TYPES.WRONG];
    const data = (mode == MODES.CHART_AREA
      ? StackedAreaChart.extractDataPoints(this.data, keys)
      : this.data
    ); 

    return(
      <Fragment>
        {this._renderOverlay()}
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
            formatLabel={ value => `${value}%` }
            {...{data, ...CONSTANTS.yAxisProps}}
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
  static MODES = {
    'CHART_LINE': 0,
    'CHART_BAR' : 1,
  };

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
      isFocused: false,
      showRecent: true,
    };
  };

  componentDidMount(){
    const { EVENTS } = ScoreProgressCard;

    if(this.emitter){
      this.emitter.addListener(
        EVENTS.onChangeShowRecent,
        this._handleOnChangeShowRecent
      );
      this.emitter.addListener(
        EVENTS.onPressHeaderClose,
        this._handleOnPressHeaderClose
      );
      this.emitter.addListener(
        EVENTS.onPressHeaderChartMode,
        this._handleOnPressChangeChartMode
      );
      this.emitter.addListener(
        EVENTS.onPressChartItem,
        this._handleOnPressChartItem
      );
    };
  };

  processData = (mode) => {
    const { MODES } = CorrectTab;
    const { results } = this.props.screenProps;
    const quiz_results = CustomQuizResultItem.wrapArray(results);
    
    return quiz_results.map(result => {
      const { correct, incorrect, unaswered } = result.results;

      //todo: convert to switch
      if(mode == MODES.CHART_LINE){
        const sharedParams = {
          extraData : {...result},
          addOnPress: false,
          addFill   : false,
        };

        return {
          ...stackItem({type: TYPES.CORRECT , value: correct  , ...sharedParams}),
          ...stackItem({type: TYPES.WRONG   , value: incorrect, ...sharedParams}),
          ...stackItem({type: TYPES.SKIPPED , value: unaswered, ...sharedParams}),
        };

      } else if(mode == MODES.CHART_BAR){
        const params = {
          type : TYPES.CORRECT, 
          value: correct      ,
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

  setMode = async (nextMode) => {
    const { mode } = this.state;
    const didModeChange = (mode != nextMode);
    if(!didModeChange) return null;

    //hide chart, mount/show loading
    await Promise.all([
      this.container && this.container.fadeOut(400),
      setStateAsync(this, {showLoading: true})
    ]);

    //change chart
    this.data = this.processData(nextMode);
    await setStateAsync(this, {mode: nextMode});
    await timeout(300);

    //hide loading, show chart
    await Promise.all([
      this.container && this.container.fadeIn(300)   ,
      this.loading   && this.loading  .fadeOutUp(400),
    ]);
    //unmount loading
    await setStateAsync(this, {showLoading: false});
  };

  toggleMode = async () => {
    const { MODES } = CorrectTab;
    const { mode } = this.state;

    const modes = Object.keys(MODES).length;
    const nextMode = ((mode + 1) % modes);
    await this.setMode(nextMode);
  };

  //#region ------ event handlers ------
  /** navigation events: focus */
  _handleOnDidFocus = async () => {
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
          this.loading   && this.loading.fadeOutUp(400),
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

  /** emiiter: header change chart button */
  _handleOnPressChangeChartMode = () => {
    const { isFocused, mode } = this.state;
    if(isFocused){
      this.modeModal.showModal({visible: true, mode});
    };
  };

  /** emiiter: when a chart item is pressed in a tab */
  _handleOnPressChartItem = ({data, index, route}) => {
    if(route != TAB_ROUTES.CORRECT){
      this.setState({
        selected     : data ,
        selectedIndex: index,
      });
    };
  };

  /** overlay - ModeSelectorModal: onpress mode */
  _handleOnPressOption = ({mode}) => {
    const { MODES } = CorrectTab;
    this.setMode(mode);
  };

  /** chart - Decorators/Bar: onpress */
  _handleOnPressItem = (resultItem) => {
    const { EVENTS } = ScoreProgressCard;
    const { MODES } = CorrectTab;
    const { selected, showRecent, mode } = this.state;
  
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
        (mode == MODES.CHART_LINE)? item[TYPES.CORRECT].extraData :
        (mode == MODES.CHART_BAR )? item.extraData                : null
      );

      return (result.endTime == next.endTime);
    });

    if(this.emitter){
      this.emitter.emit(EVENTS.onPressChartItem, {
        data : resultItem,
        route: TAB_ROUTES.CORRECT,
        index: match,
      }); 
    };

    this.setState({
      selected     : sameItem? null : next ,
      selectedIndex: sameItem? null : match,
    });
  };

  _handleOnLongPressItem = async () => {
    const { MODES } = CorrectTab;
    const { mode } = this.state;

    const modes = Object.keys(MODES).length;
    const nextMode = ((mode + 1) % modes);

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
  //#endregion

  _renderOverlay(){
    const { MODES } = CorrectTab;
    const { mode: activeMode } = this.state;
    return(
      <Portal>
        <ModeSelectorModal 
          ref={r => this.modeModal = r}
          onPressOption={this._handleOnPressOption}
          {...{activeMode}}
        >
          <ModeSelectorOption
            title={'Bar Chart'}
            subtitle={'Correct answers bar chart'}
            mode={MODES.CHART_BAR}
          />
          <ModeSelectorOption
            title={'Line Chart'}
            subtitle={'Correct answers line chart'}
            mode={MODES.CHART_LINE}
          />
        </ModeSelectorModal>
      </Portal>
    );
  };

  _renderChart(){
    const { MODES } = CorrectTab;
    const { showRecent, selected, selectedIndex, mode } = this.state;

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
      min : 0, max : 100,
      yMin: 0, yMax: 100,
      data, contentInset,
    };
    const sharedXAxisProps = {
      style      : { marginTop: 2 },
      svg        : { fill: 'grey', fontSize: 12 },
      formatLabel: ( value, index ) => ( index + 1 ),
      data,
    };

    switch (mode) {
      case MODES.CHART_LINE: return(
        <TouchableOpacity {...buttonProps}>
          <AreaChart
            svg={{ fill: 'url(#gradient)' }}
            curve={shape.curveNatural}
            yAccessor={({item}) => item[TYPES.CORRECT].value}
            {...sharedChartProps}
          >
            <XYGrid/>         
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
      );
      case MODES.CHART_BAR: return(
        <TouchableOpacity {...buttonProps}>
          <BarChart
            svg={{strokeWidth: 2, fill: 'url(#gradient)'}}
            yAccessor={({item}) => item.value}
            {...sharedChartProps}
          >
            <Grid/>         
            {selected && <CorrectBarToolTip {...{selectedIndex}}/>}
            <CorrectGradient/>
          </BarChart>
          <XAxis
            scale={scale.scaleBand}
            {...sharedXAxisProps}  
          />
        </TouchableOpacity>
      );
    };
  };

  render(){
    const { showRecent, showLoading } = this.state;

    return(
      <Fragment>
        {this._renderOverlay()}
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
  static MODES = {
    'CHART_BAR'    : 0,
    'CHART_BAR_ALT': 1,
    'CHART_AREA'   : 2,
  };

  constructor(props){
    super(props);

    this.emitter = props.screenProps.emitter;
    this.data    = this.processData(0);

    this.state = {
      selected: null,
      selectedIndex: -1,
      showRecent: true,
      isFocused: false,
      showLoading: false,
      mode: 0,
    };
  };

  componentDidMount(){
    const { EVENTS } = ScoreProgressCard;

    if(this.emitter){
      this.emitter.addListener(
        EVENTS.onChangeShowRecent,
        this._handleOnChangeShowRecent
      );
      this.emitter.addListener(
        EVENTS.onPressHeaderClose,
        this._handleOnPressHeaderClose
      );
      this.emitter.addListener(
        EVENTS.onPressHeaderChartMode,
        this._handleOnPressChangeChartMode
      );
      this.emitter.addListener(
        EVENTS.onPressChartItem,
        this._handleOnPressChartItem
      );
    };
  };

  processData = (mode) => {
    const { MODES } = WrongTab;
    const { results } = this.props.screenProps;
    const quiz_results = CustomQuizResultItem.wrapArray(results);
    
    return quiz_results.map(result => {
      const { correct, incorrect, unaswered } = result.results;

      switch (mode) {
        case MODES.CHART_BAR    :
        case MODES.CHART_BAR_ALT:
          const sharedParams= {
            extraData  : {...result}, 
            onPress    : this._handleOnPressItem   , 
            onLongPress: this._handleOnLongPressBar, 
            addOnPress : true ,
            addFill    : false,
          };
    
          return {
            ...stackItem({type: TYPES.CORRECT , value: correct  , ...sharedParams}),
            ...stackItem({type: TYPES.WRONG   , value: incorrect, ...sharedParams}),
            ...stackItem({type: TYPES.SKIPPED , value: unaswered, ...sharedParams}),
          };

        case MODES.CHART_AREA: return {
          [TYPES.CORRECT]: Math.abs(correct   || 0),
          [TYPES.WRONG  ]: Math.abs(incorrect || 0),
          //not shown inside chart
          extraData: {...result},
        };
      };
    });
  };

  setMode = async (nextMode) => {
    const { mode } = this.state;
    const didModeChange = (mode != nextMode);
    if(!didModeChange) return null;

    //hide chart, mount/show loading
    await Promise.all([
      this.container && this.container.fadeOut(400),
      setStateAsync(this, {showLoading: true})
    ]);

    //change chart
    this.data = this.processData(nextMode);
    await setStateAsync(this, {mode: nextMode});
    await timeout(300);

    //hide loading, show chart
    await Promise.all([
      this.container && this.container.fadeIn(300)   ,
      this.loading   && this.loading  .fadeOutUp(400),
    ]);
    //unmount loading
    await setStateAsync(this, {showLoading: false});
  };

  toggleMode = async () => {
    const { MODES } = WrongTab;
    const { mode } = this.state;

    const modes = Object.keys(MODES).length;
    const nextMode = ((mode + 1) % modes);
    await this.setMode(nextMode);
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
      this.setState({
        selected     : null,
        selectedIndex: null
      });
    };
  };

  /** emiiter: header change chart button */
  _handleOnPressChangeChartMode = () => {
    const { isFocused, mode } = this.state;
    if(isFocused){
      this.modeModal.showModal({visible: true, mode});
    };
  };

  /** emiiter: when a chart item is pressed in a tab */
  _handleOnPressChartItem = ({data, index, route}) => {
    if(route != TAB_ROUTES.WRONG){
      this.setState({
        selected     : data ,
        selectedIndex: index,
      });
    };
  };

  _handleOnPressOption = ({mode}) => {
    const { MODES } = WrongTab;
    this.setMode(mode);
  };

  _handleOnLongPressChart = () => {
    this.toggleMode();
  };

  _handleOnLongPressBar = async () => {
    this.toggleMode();
  };

  _handleOnPressItem = (resultItem) => {
    const { EVENTS } = ScoreProgressCard;
    const { MODES } = WrongTab;
    const { selected, showRecent, mode } = this.state;

    const prev = CustomQuizResultItem.wrap(selected  );
    const next = CustomQuizResultItem.wrap(resultItem);
    //if the prev and next selected are the same item
    const sameItem = (prev.timestampSaved == next.timestampSaved);
    
    const data = (showRecent
      ? this.data.slice(-10)
      : this.data  
    );

    const match = data.findIndex(item => {
      const extraData = (mode == MODES.CHART_AREA
        ? item.extraData
        : item[TYPES.CORRECT].extraData
      );

      const result = CustomQuizResultItem.wrap(extraData);
      return (result.endTime == next.endTime);
    });

    if(this.emitter){
      this.emitter.emit(EVENTS.onPressChartItem, {
        data : resultItem,
        route: TAB_ROUTES.WRONG,
        index: match,
      }); 
    };

    this.setState({
      selected     : sameItem? null : next,
      selectedIndex: match,
    });
  };

  _renderChart(){
    const { MODES } = WrongTab;
    const { showRecent, mode, selected, selectedIndex } = this.state;

    const data = (showRecent
      ? this.data.slice(-10)
      : this.data
    );

    const items = data.length;
    const { CORRECT, WRONG, SKIPPED } = TYPES;

    const [keys, colors] = (
      (mode == MODES.CHART_BAR    )? [[SKIPPED, WRONG  , CORRECT], [GREY[300], RED .A700 , 'transparent']] :
      (mode == MODES.CHART_BAR_ALT)? [[WRONG  , SKIPPED, CORRECT], [RED .A700, GREY [300], 'transparent']] :
      (mode == MODES.CHART_AREA   )? [[CORRECT, WRONG  ,        ], [RED .A700, GREY [300],              ]] : null
    );

    const { width } = Dimensions.get('screen');
    const card_width = (width - (12 * 2));
    const expanded_width = items * 30;

    const buttonProps = {
      activeOpacity: 1,
      onLongPress: this._handleOnLongPressChart,
      style: (showRecent? {
        flex: 1,
        height: '100%',
      }:{
        width: (expanded_width > card_width)? expanded_width : '100%',
        height: '100%',
        paddingRight: 15,
      }),
    };

    const contentInset = { top: 0, bottom: 7 };
    const sharedChartProps = {
      style: { flex: 1 },
      numberOfTicks: 10 ,
      min : 0, max : 100,
      yMin: 0, yMax: 100,
      //pass down as props
      data, keys, colors, contentInset,
    };
    const sharedXAxisProps = {
      formatLabel: (value, index) => index + 1,
      svg: {
        fill: 'grey', 
        fontSize: 12
      },
      //pass down as props
      data,
    };

    switch (mode) {
      case MODES.CHART_BAR    : 
      case MODES.CHART_BAR_ALT: return(
        <TouchableOpacity {...buttonProps}>
          <StackedBarChart
            valueAccessor={ ({ item, key }) => item[key].value }
            {...sharedChartProps}
          >
            {(mode == MODES.CHART_BAR)
              ? <Grid/>
              : <XYGrid belowChart={true}/>
            }
            {selected && <WrongBarToolTip {...{selectedIndex}}/>}
          </StackedBarChart>
          <XAxis
            scale={scale.scaleBand}
            {...sharedXAxisProps}
          />
        </TouchableOpacity>
      );
      case MODES.CHART_AREA: return(() => {
        // note: stackedarea does not have full support for decorators
        // so i have to manually compute the pos of the points :/
        const altData = this.processData(MODES.CHART_BAR);
        const values  = (showRecent? altData.slice(-10) : altData);
        
        return(
          <TouchableOpacity {...buttonProps}>
            <StackedAreaChart
              curve={ shape.curveMonotoneX }
              {...sharedChartProps}
            >
              <Grid/>
              <WrongAreaDecorator 
                onPress    ={this._handleOnPressItem   }
                onLongPress={this._handleOnLongPressBar}
                {...{values, data, selectedIndex}}
              />
            </StackedAreaChart>
            <XAxis {...sharedXAxisProps}/>
          </TouchableOpacity>
        );
      })();
    };
  };

  _renderOverlay(){
    const { MODES } = WrongTab;
    const { mode: activeMode } = this.state;
    return(
      <Portal>
        <ModeSelectorModal 
          ref={r => this.modeModal = r}
          onPressOption={this._handleOnPressOption}
          {...{activeMode}}
        >
          <ModeSelectorOption
            title={'Bar Chart'}
            subtitle={'Skipped and wrong answers'}
            mode={MODES.CHART_BAR}
          />
          <ModeSelectorOption
            title={'Bar Chart (Reversed)'}
            subtitle={'Wrong and skipped answers'}
            mode={MODES.CHART_BAR_ALT}
          />
          <ModeSelectorOption
            title={'Line Chart'}
            subtitle={'Stacked area line chart'}
            mode={MODES.CHART_AREA}
          />
        </ModeSelectorModal>
      </Portal>
    );
  };

  render(){
    const { MODES } = WrongTab;
    const { mode, showRecent, showLoading } = this.state;

    const keys = [TYPES.CORRECT, TYPES.WRONG];
    const data = (mode == MODES.CHART_AREA
      ? StackedAreaChart.extractDataPoints(this.data, keys)
      : this.data
    ); 

    return(
      <Fragment>
        {this._renderOverlay()}
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
            formatLabel={ value => `${value}%` }
            {...{data, ...CONSTANTS.yAxisProps}}
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

export const ScoreProgressCardNavigator = createMaterialTopTabNavigator({
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

class ScoreProgressHeader extends React.PureComponent {
  static propTypes = {
    index: PropTypes.number,
    data : PropTypes.object,
    route: PropTypes.string,
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

  async componentDidUpdate(prevProps, prevState){
    const props = this.props;

    // note: the contents/ui has already been changed when the animation
    // is started. Fix by using the emitter or use another lifecycle method

    const didIndexChange = (props.index != prevProps.index);
    const didRouteChange = (props.route != prevProps.route);
    const didChange      = (didIndexChange  || didRouteChange);

    if(didChange && (prevProps.index > props.index)){
      await this.container.fadeOutRight(200);
      await this.container.fadeInLeft  (200);

    } else if(didChange && (prevProps.index < props.index)){
      await this.container.fadeOutLeft(200);
      await this.container.fadeInRight(200);
    };
  };

  _renderHeader(){
    const { styles } = ScoreProgressHeader;
    const { data } = this.props;

    const result = CustomQuizResultItem.wrap(data);
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
    const { index, data, route } = this.props;
    
    const result = CustomQuizResultItem.wrap(data);
    const { results, startTime, endTime } = result;

    //score
    const correct = results? results.correct   : 0;
    const wrong   = results? results.incorrect : 0;
    const skipped = results? results.unaswered : 0;
    const total   = results? results.total     : 0;

    //compute duration
    const diffTime  = endTime - startTime;
    const diffMills = moment.duration(diffTime).asMilliseconds();
    const duration  = moment.utc(diffMills).format("HH:mm:ss");

    const marginTop = 10;
    switch (route) {
      case TAB_ROUTES.WRONG: return(
        <Fragment>
          <DetailRow>
            <DetailColumn
              title={'Wrong: '}
              subtitle={`${wrong} items`}
              help={true}
              helpTitle={'Total Scrore'}
              helpSubtitle={'Your score over the total amount of items'}
              backgroundColor={PURPLE.A700}
              disableGlow={true}
            />
            <DetailColumn 
              title={'Skipped: '}
              subtitle={`${skipped} items`}
              help={true}
              helpTitle={'Total Skipped'}
              helpSubtitle={'Tells you how much time elapsed during the quiz.'}
              backgroundColor={PURPLE.A700}
              disableGlow={true}
            />
          </DetailRow>
        </Fragment>
      );
      default: return(
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
  };

  render(){
    const { styles } = ScoreProgressHeader;
    return(
      <Animatable.View
        ref={r => this.container = r}
        useNativeDriver={true}
      >
        {this._renderHeader()}
        <Divider style={styles.divider}/>
        {this._renderDetails()}
      </Animatable.View>
    );
  };
};

export class ScoreProgressCard extends React.PureComponent {
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
    //header button styles
    buttonTitle: {
      fontSize: 15,
      fontWeight: '500'
    },
    buttonSubtitle: {
      fontSize: 14,
      fontWeight: '200',
    },
  });

  static EVENTS = {
    onPressChartItem      : 'onPressChartItem'      ,
    onChangeShowRecent    : 'onChangeShowRecent'    ,
    onPressHeaderClose    : 'onPressHeaderClose'    ,
    onPressHeaderChartMode: 'onPressHeaderChartMode',
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
    const { EVENTS } = ScoreProgressCard;

    if(this.emitter){
      this.emitter.addListener(
        EVENTS.onPressChartItem,
        this._handleOnPressChartItem
      );
    };
  };

  _handleOnPressChartItem = async (params) => {
    const { selected } = this.state;
    const prev = CustomQuizResultItem.wrap((selected || {}).data);
    const next = CustomQuizResultItem.wrap((params   || {}).data);

    //if the prev and next selected are the same item
    const sameItem = (prev.timestampSaved == next.timestampSaved);

    if(sameItem){
      this.transitioner.transition(!sameItem);
      await timeout(300);
      this.setState({selected: null});

    } else{
      await setStateAsync(this, {selected: params});
      this.transitioner.transition(!sameItem);
    };
  };

  _handleOnTransition = (value) => {
    this.container.pulse(value? 750 : 500); 
  };

  _handleOnValueChangeSwitch = (value) => {
    const { EVENTS } = ScoreProgressCard;
    this.setState({ showRecent: value });
    
    if(this.emitter){
      this.emitter.emit(EVENTS.onChangeShowRecent, value); 
    };
  };

  _handleOnPressClose = () => {
    const { EVENTS } = ScoreProgressCard;

    //collapse header
    this.transitioner.transition(false);
    this.setState({
      selected     : null,
      selectedIndex: null,
    });
    
    if(this.emitter){
      this.emitter.emit(EVENTS.onPressHeaderClose); 
    };
  };

  _handleOnPressChangeChartMode = () => {
    const { EVENTS } = ScoreProgressCard; 
    const { selected } = this.state;   
    if(this.emitter && !selected){
      this.emitter.emit(EVENTS.onPressHeaderChartMode); 
    };
  };

  _renderInactive(){
    const { styles } = ScoreProgressCard;
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
            {'Tap on an item inside the chart to view more details. Tap on the same item to dismiss.'}
          </Text>
        </View>
        <Divider style={styles.divider}/>        
        <PlatformButton
          title={'Change Chart Mode'}
          subtitle={'Change the style of the chart'}
          iconDistance={12}
          iconName={'md-eye'}
          iconType={'ionicon'}
          isBgGradient={true}
          titleStyle={styles.buttonTitle}
          subtitleStyle={styles.buttonSubtitle}
          onPress={this._handleOnPressChangeChartMode}
        />
      </Fragment>
    );
  };

  _renderHeader(){
    const { styles } = ScoreProgressCard;
    const { data, index, route } = this.state.selected || {};

    return(
      <View style={styles.headerContainer}>
        <View style={styles.headerCard}>
          <TransitionAB 
            ref={r => this.transitioner = r}
            onTransition={this._handleOnTransition}
            handlePointerEvents={true}
          >
            {this._renderInactive()}
            <ScoreProgressHeader
              onPressClose={this._handleOnPressClose}
              {...{data, index, route}}
            />
          </TransitionAB>
        </View>
      </View>
    );
  };

  render(){
    const { styles } = ScoreProgressCard;
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
            <Portal.Host>
              {this._renderHeader()}
              <View style={styles.tabContainer}>
                <ScoreProgressCardNavigator
                  navigation={this.props.navigation}
                  {...{screenProps}}
                />
              </View>
            </Portal.Host>
          </View>
        </Card>
      </Animatable.View>
    );
  };
};