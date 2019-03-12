import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback} from 'react-native';
import PropTypes from 'prop-types';

import { plural , timeout, getTimestamp} from '../functions/Utils';
import { SubjectItem } from '../functions/ModuleStore';

import { ViewWithBlurredHeader, Card, AnimatedListItem } from '../components/Views';
import { PlatformTouchableIconButton, RippleBorderButton } from '../components/Buttons';
import { AndroidHeader, AndroidBackButton } from '../components/AndroidHeader';
import { CustomQuizList } from '../components/CustomQuizExam';
import { ViewImageScreen } from './ViewImageScreen';

import Constants from '../Constants'
import { ROUTES, STYLES } from '../Constants';
import { PURPLE, RED } from '../Colors';

import { createStackNavigator } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Divider, Icon } from 'react-native-elements';
import TimeAgo from 'react-native-timeago';
import {QuizExamDoneModal} from '../modals/QuizExamDoneModal';

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

  constructor(props){
    super(props);
    //assignable callback
    this.onPress = null;
  };

  _handleOnPress = () => {
    this.onPress && this.onPress();
  };

  _renderIOS(){
    const { styles } = CancelButton;
    
    return(
      <TouchableOpacity 
        style={styles.container}
        onPress={this._handleOnPress}
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

  _renderAndroid(){
    return(
      <AndroidBackButton onPress={this._handleOnPress}/>
    );
  };

  render(){
    return Platform.select({
      ios    : this._renderIOS(),
      android: this._renderAndroid(),
    });
  };
};

//custom header title
class HeaderTitle extends React.PureComponent {
  static styles = StyleSheet.create({
    container: Platform.select({
      ios: {
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
      }
    }),
    title: Platform.select({
      ios: {
        fontSize: 16,
        fontWeight: '200',
      },
      android: {
        fontSize: 19,
        fontWeight: '400',
        color: 'white',
      },
    }),
    titleCount: {
      fontWeight: '700'
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
    button: {
      marginRight: 5,
    },
    buttonContainer: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      alignItems: 'center',
    },
    label: {
      marginLeft: 7,
      color: 'white',
      ...Platform.select({
        ios: {
          marginBottom: 2,
          fontSize: 17,
          fontWeight: '100',
        },
        android: {
          fontSize: 18,
          fontWeight: '400',
        }
      })
    },
  });

  constructor(props){
    super(props);
    //assignable callback
    this.onPress = null;
  };

  _handleOnPress = () => {
    this.onPress && this.onPress();
  };

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
        <RippleBorderButton 
          containerStyle={styles.button}
          onPress={this._handleOnPress}
        >
          <View style={styles.buttonContainer}>
            <Icon
              name={'ios-checkmark-circle'}
              type={'ionicon'}
              color={'white'}
              size={24}
            />
            <Text style={styles.label}>Done</Text>
          </View>
        </RippleBorderButton>
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

//header components
const headerLeft  = <CancelButton ref={r => References.CancelButton = r}/>
const headerTitle = <HeaderTitle  ref={r => References.HeaderTitle  = r}/>
const headerRight = <DoneButton   ref={r => References.DoneButton   = r}/>

class CustomQuizExamScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    return ({
      title: 'Custom Quiz',
      headerTitle, headerRight, headerLeft,
      headerTitleStyle: STYLES.glow,
      //custom android header
      ...Platform.select({
        android: { header: props => 
          <AndroidHeader
            centerComponent={headerTitle}
            rightComponent={headerRight}
            {...props}
          />
      }}),
    });
  };

  static styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  constructor(props){
    super(props);
    this.didShowAlert = false;

    this.state = {
      startTime: getTimestamp(true),
    };

    //references
    this.quizExamDoneModal = null;
    this._carousel = null;
  };

  async componentDidMount(){
    const { navigation } = this.props;

    //get data from previous screen: ExamScreen
    const quiz = navigation.getParam('quiz' , null);
    const { questions = [] } = quiz;
    
    //assign carousel ref
    this._carousel = this.customQuizList.getCarouselRef();

    await timeout(100);
    //set header title total
    References && References.HeaderTitle.setTotal(questions.length);

    //assign callbacks to header buttons
    References.CancelButton.onPress = this._handleOnPressHeaderCancel;
    References.DoneButton  .onPress = this._handleOnPressHeaderDone;

    //get ref from screenprops
    const { getRefQuizExamDoneModal } = this.props.screenProps;
    this.quizExamDoneModal = getRefQuizExamDoneModal();
    this.quizExamDoneModal.onPressQuestionItem = this._handleOnPressQuestionItem;
  };

  openDoneModal = () => {
    const { navigation } = this.props;
    const { startTime } = this.state;

    //get data from previous screen: ExamScreen
    const quiz = navigation.getParam('quiz' , null);

    //get current state of customQuizList
    const customQuizListState = {
      currentIndex: this._carousel.currentIndex,
      questionList: this.customQuizList.getQuestionList(),
      answers     : this.customQuizList.getAnswers(),
      questions   : this.customQuizList.getQuestions(),
      //pass down state
      startTime,
    };

    //open modal and pass current state of quizlist
    this.quizExamDoneModal.openModal({quiz, ...customQuizListState});
  };

  _onPressCancelAlertOK = () => {
    const { navigation } = this.props;

    this.quizExamDoneModal && this.quizExamDoneModal.resetPrevTimestamps();
    navigation.navigate(ROUTES.HomeRoute);
  };

  _handleOnPressHeaderCancel = () => {
    Alert.alert(
      "Cancel Custom Quiz",
      "Are you sure you want to cancel? All of your progress will be lost.",
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'OK'    , onPress: this._onPressCancelAlertOK},
      ],
      {cancelable: false},
    );
  };

  _handleOnPressHeaderDone = () => {
    this.openDoneModal();
  };

  _handleOnSnapToItem = (index) => {
    References && References.HeaderTitle.setIndex(index + 1);
  };

  _onPressFinishAlertCancel = () => {
    References && References.DoneButton.animate();
  };

  _onPressFinishAlertOK = () => {
    this.openDoneModal();    
  };

  _handleOnAnsweredAllQuestions = () => {
    if(!this.didShowAlert){
      Alert.alert(
        "All Questions Answered",
        "If you're done answering, press 'OK', if not press 'Cancel' (You can press 'Done' on the upper right corner later when you're finished.)",
        [
          {text: 'Cancel', onPress: this._onPressFinishAlertCancel, style: 'cancel'},
          {text: 'OK'    , onPress: this._onPressFinishAlertOK},
        ],
        {cancelable: false},
      );
      this.didShowAlert = true;
    };
  };

  _handleOnNewAnswerSelected = () => {
    this._listContainer.pulse(750);
  };

  //callback assigned from done modal
  _handleOnPressQuestionItem = async ({index}) => {
    this._carousel.snapToItem(index, true);
    await timeout(500);
    await this._listContainer.pulse(750);
  };

  _handleOnPressImage = ({question, index, base64Image, photofilename, photouri}) => {
    const { navigation } = this.props;
    navigation && navigation.navigate(
      ROUTES.CustomQuizViewImage, {imageBase64: base64Image}
    );
  };

  render(){
    const { styles } = CustomQuizExamScreen;
    const { navigation } = this.props;
    
    //get data from previous screen: ExamScreen
    const quiz = navigation.getParam('quiz' , null);
    
    return (
      <ViewWithBlurredHeader hasTabBar={false}>
        <Animatable.View
          ref={r => this._listContainer = r}
          style={styles.container}
          animation={'fadeInUp'}
          duration={500}
          delay={300}
          useNativeDriver={true}
        >
          <CustomQuizList
            ref={r => this.customQuizList = r}
            onSnapToItem={this._handleOnSnapToItem}
            onAnsweredAllQuestions={this._handleOnAnsweredAllQuestions}
            onNewAnswerSelected={this._handleOnNewAnswerSelected}
            onPressQuestionItem={this._handleOnPressQuestionItem}
            onPressImage={this._handleOnPressImage}
            {...{quiz}}
          />
        </Animatable.View>
      </ViewWithBlurredHeader>
    );
  };
};

const CustomQuizExamStack = createStackNavigator({
    [ROUTES.CustomQuizExamRoute]: CustomQuizExamScreen,
    [ROUTES.CustomQuizViewImage]: ViewImageScreen, 
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

//container for the stacknav: CustomQuizExamStack
export class CustomQuizExamStackContainer extends React.PureComponent {
  static router = CustomQuizExamStack.router;

  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1, 
      height: '100%', 
      width: '100%', 
      backgroundColor: 'rgb(233, 232, 239)'
    },
  });

  _renderContents(){
    return(
      <CustomQuizExamStack
        navigation={this.props.navigation}
        screenProps={{
          ...this.props.screenProps,
          getRefQuizExamDoneModal: () => this.quizExamDoneModal,
        }}
      />
    );
  };

  _renderModals(){
    return(
      <Fragment>
        <QuizExamDoneModal ref={r => this.quizExamDoneModal = r}/>
      </Fragment>
    );
  };

  render(){
    const { styles } = CustomQuizExamStackContainer;

    return (
      <View style={styles.rootContainer}>
        {this._renderContents()}
        {this._renderModals  ()}
      </View>
    );
  }
};