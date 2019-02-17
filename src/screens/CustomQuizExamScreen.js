import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert} from 'react-native';
import PropTypes from 'prop-types';

import { plural , timeout} from '../functions/Utils';
import { SubjectItem } from '../functions/ModuleStore';

import { ViewWithBlurredHeader, Card, AnimatedListItem } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';
import { AndroidHeader, AndroidBackButton} from '../components/AndroidHeader';
import { CustomQuizList } from '../components/CustomQuizExam';


import Constants from '../Constants'
import { ROUTES, STYLES } from '../Constants';
import { PURPLE, RED } from '../Colors';

import { createStackNavigator } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Divider, Icon } from 'react-native-elements';
import TimeAgo from 'react-native-timeago';

//custom header left component
class CancelButton extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      alignItems: 'center',
    },
    label: {
      fontSize: 17,
      fontWeight: '100',
      marginLeft: 7,
      marginBottom: 2,
      color: 'white',
    },
  });

  render(){
    const { styles } = DoneButton;
    
    return(
      <TouchableOpacity 
        style={styles.container}
        onPress={this.onPress}
      >
        <Icon
          name={'ios-close-circle'}
          type={'ionicon'}
          color={'white'}
          size={22}
        />
        <Text style={styles.label}>Cancel</Text>
      </TouchableOpacity>
    );
  };
};

//custom header title
class HeaderTitle extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: 'white',
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
    title: {
      fontSize: 16,
      fontWeight: '200',
    },
    titleCount: {
      fontWeight: '600'
    },
  });

  constructor(props){
    super(props);
    this.state = {
      index: 1,
      total: 1,
    };
  };

  setIndex = (index) => {
    this.setState({index});
  };
  
  setTotal = (total) => {
    this.setState({total});
  };

  _renderText(){
    const { styles } = HeaderTitle;
    const { index, total } = this.state;

    return(
      <Text style={styles.title}>
        {'Question: '}
        <Text style={styles.titleCount}>
          {`${index}/${total}`}
        </Text>
      </Text>
    );
  };

  render(){
    const { styles } = HeaderTitle;

    return(
      <Animatable.View 
        style={styles.container}
        animation={'pulse'}
        duration={10000}
        delay={3000}
        iterationCount={'infinite'}
        useNativeDriver={true}
      >
        {this._renderText()}
      </Animatable.View>
    );
  };
};

//custom header right component
class DoneButton extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      alignItems: 'center',
    },
    label: {
      fontSize: 17,
      fontWeight: '100',
      marginLeft: 7,
      marginBottom: 2,
      color: 'white',
    },
  });

  animate = () => {
    this._animatable.rubberBand(1250);
  };

  render(){
    const { styles } = DoneButton;
    
    return(
      <Animatable.View
        ref={r => this._animatable = r}
        useNativeDriver={true}
      >
        <TouchableOpacity 
          style={styles.container}
          onPress={this._handleOnPress}
        >
          <Icon
            name={'ios-checkmark-circle'}
            type={'ionicon'}
            color={'white'}
            size={22}
          />
          <Text style={styles.label}>Done</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };
};

//access callbacks and references
let References = {
  CancelButton: null,
  HeaderTitle : null,
  DoneButton  : null,
};

const headerLeft  = <CancelButton ref={r => References.CancelButton = r}/>
const headerTitle = <HeaderTitle  ref={r => References.HeaderTitle  = r}/>
const headerRight = <DoneButton   ref={r => References.DoneButton   = r}/>

class CustomQuizExamScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    return ({
      headerTitle, headerRight, headerLeft,
      headerTitleStyle: STYLES.glow,
      //custom android header
      ...Platform.select({
        android: { header: props => 
          <AndroidHeader 
            {...{titleStyle, ...props}}
          />
      }}),
    });
  };

  constructor(props){
    super(props);
    this.didShowAlert = false;
  };

  async componentDidMount(){
    const { navigation } = this.props;

    //get data from previous screen: ExamScreen
    const quiz = navigation.getParam('quiz' , null);
    const { questions = [] } = quiz;

    await timeout(100);
    References.HeaderTitle.setTotal(questions.length);
    
  };

  _handleOnSnapToItem = (index) => {
    References.HeaderTitle.setIndex(index + 1);
  };

  _onPressAlertCancel = () => {
    References.DoneButton.animate();
  };

  _onPressAlertOK = () => {

  };

  _handleOnAnsweredAllQuestions = () => {
    if(!this.didShowAlert){
      Alert.alert(
        "All Questions Answered",
        "If you're done answering, press 'OK', if not press 'Cancel' (You can press 'Done' on the upper right corner later when you're finished.)",
        [
          {text: 'Cancel', onPress: this._onPressAlertCancel, style: 'cancel'},
          {text: 'OK'    , onPress: this._onPressAlertOK},
        ],
        {cancelable: false},
      );
      this.didShowAlert = true;
    };
  };

  render(){
    const { navigation } = this.props;
    //get data from previous screen: ExamScreen
    const quiz = navigation.getParam('quiz' , null);
    
    return (
      <ViewWithBlurredHeader hasTabBar={false}>
        <CustomQuizList
          onSnapToItem={this._handleOnSnapToItem}
          onAnsweredAllQuestions={this._handleOnAnsweredAllQuestions}
          {...{quiz}}
        />
      </ViewWithBlurredHeader>
    );
  };
};

export const CustomQuizExamStack = createStackNavigator({
  CustomQuizExamRoute: {
      screen: CustomQuizExamScreen,
    },
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: {
      gesturesEnabled: false,
      ...Constants.HEADER_PROPS
    },
  }
);