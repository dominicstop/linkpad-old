import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, FlatList, Dimensions, Clipboard, Platform, StatusBar, ActivityIndicator, Image, TouchableWithoutFeedback, Alert } from 'react-native';
import PropTypes from 'prop-types';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import Carousel from 'react-native-snap-carousel';
import { validateNotEmpty } from '../functions/Validation';

import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { ifIphoneX, getStatusBarHeight, getBottomSpace } from 'react-native-iphone-x-helper';

import { getLetter , shuffleArray, setStateAsync, timeout, hexToRgbA, getTimestamp, isBase64Image, isEmpty} from '../functions/Utils';
import { PURPLE, RED, GREY, YELLOW, ORANGE, AMBER, BLUE } from '../Colors';
import { QuizAnswer , QuizQuestion, QUIZ_LABELS } from '../models/Quiz';
import { CustomQuiz } from '../functions/CustomQuizStore';
import { LOAD_STATE, FONT_STYLES } from '../Constants';
import { BlurViewWrapper } from './StyledComponents';
import { TestQuestion, TestAnswer, TestChoice } from '../models/TestModels';

/** Used in Choices: shows a single choice item */
class ChoiceItem extends React.PureComponent {
  static propTypes = {
    choice       : PropTypes.object, 
    index        : PropTypes.number,
    isLast       : PropTypes.bool  ,
    selected     : PropTypes.object,
    selectedIndex: PropTypes.number,
    onPressChoice: PropTypes.func  ,
  };

  static styles = StyleSheet.create({
    container: {
      minHeight: 38,
      paddingVertical : 7,
      paddingHorizontal: 10,
      alignItems: 'center',
      flexDirection: 'row',
    },
    choiceText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '100',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    choiceTextSelected: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: 'white',
    }, 
    keyText: {
      fontWeight: '500',
    }
  });

  static CB_PARAMS = {
    onPressChoice: {
      choice: 'choice', 
      index : 'index' ,
      isLast: 'isLast',
    },
  };

  static colors = [
    PURPLE[800],
    PURPLE[900],
    PURPLE[1000],
    PURPLE[1100],
    PURPLE[1200],
  ];

  _handleOnPress = () => {
    const { CB_PARAMS } = ChoiceItem;
    const { onPressChoice, index, choice, isLast } = this.props;
    const PARAM_KEYS = CB_PARAMS.onPressChoice;
    
    //call callback with params
    onPressChoice && onPressChoice({
      [PARAM_KEYS.index   ]: index ,
      [PARAM_KEYS.choice  ]: choice,
      [PARAM_KEYS.isLast  ]: isLast,
    });
  };

  _renderChoiceText(){
    const { styles } = ChoiceItem;
    const { index, selectedIndex, choice } = this.props;

    const answerKey  = getLetter(index);
    const isSelected = (index == selectedIndex);

    return(
      <Text style={isSelected? styles.choiceTextSelected : styles.choiceText}>
        <Text style={styles.keyText}>{answerKey}. </Text>
        {choice.value || 'N/A'}
      </Text>
    );
  };

  _renderIndicator(){
    const { index, selectedIndex } = this.props;
    const isSelected = index == selectedIndex;

    if(!isSelected) return null;

    return(
      <Animatable.View
        animation={'fadeInRight'}
        duration={300}
        useNativeDriver={true}
      >
        <Icon
          name={'check'}
          type={'feather'}
          size={22}
          color={'rgba(255, 255, 255, 0.75)'}
        />
      </Animatable.View>
    );
  };

  render(){
    const { styles, colors } = ChoiceItem;
    const { index, selectedIndex } = this.props;
    const isSelected = (index == selectedIndex);

    const containerStyle = {
      //diff bg color based on index
      backgroundColor: (isSelected
        // selected color
        ? PURPLE.A700
        // unselected color
        : hexToRgbA(colors[index], 0.75)
      ),
    };

    return(
      <TouchableOpacity
        style={[styles.container, containerStyle]}
        onPress={this._handleOnPress}
      >
        {this._renderChoiceText()}
        {this._renderIndicator ()}
      </TouchableOpacity>
    );
  };
}

/** Used in QuestionItem: shows a list of choices */
class Choices extends React.PureComponent {
  static propTypes = {
    index        : PropTypes.number,
    answers      : PropTypes.array ,
    quesion      : PropTypes.object,
    onPressChoice: PropTypes.func  ,
  };

  static styles =  StyleSheet.create({
    blurview: {
      position: 'absolute',
      width: '100%',
      bottom: 0,
    },
    blurviewContainer: {
      paddingTop: 10,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    container: {
      overflow: 'hidden',
      backgroundColor: PURPLE[500],
      marginHorizontal: 10,
      marginBottom: 10,
      borderRadius: 10,
    },
  });

  static CB_PARAMS = {
    onPressChoice: {
      isLast           : 'isLast'           ,
      selected         : 'selected    '     ,
      selectedIndex    : 'selectedIndex'    ,
      prevSelected     : 'prevSelected'     ,
      prevSelectedIndex: 'prevSelectedIndex',
    },
  };

  constructor(props){
    super(props);
    const question = TestQuestion.wrap(props.question);
    const choices  = question.choiceItems || [];

    const filtered = choices.filter(choice => choice.value);
    const shuffled = shuffleArray(filtered);

    const matchAnswer = props.answers[props.index];
    const hasMatch    = (matchAnswer != undefined);
    const answer      = TestAnswer.wrap(matchAnswer);

    //in case of unmount, find the prev answers
    const selectedIndex = (!hasMatch? -1 : shuffled.findIndex(choice => 
      (choice.choiceID === answer.answerID) 
    ));

    const selected = ((selectedIndex != -1)
      ? choices[selectedIndex]
      : null
    );
    
    this.state = {
      choices : shuffled,
      //pass down
      selected, selectedIndex,
    };
  };

  _handleOnPressChoice = (params) => {
    const {CB_PARAMS:{ onPressChoice: CB_KEYS    }} = Choices;
    const {CB_PARAMS:{ onPressChoice: PARAM_KEYS }} = ChoiceItem;

    const { onPressChoice } = this.props;
    const { selected: prevSelected, selectedIndex: prevSelectedIndex } = this.state;

    const index  = params[PARAM_KEYS.index ] || ''   ;
    const isLast = params[PARAM_KEYS.isLast] || false;
    const choice = params[PARAM_KEYS.choice] || {}   ;

    this.setState({
      selected     : choice, 
      selectedIndex: index ,
    });

    //pass params to callback prop
    onPressChoice && onPressChoice({
      [CB_KEYS.prevSelected     ]: prevSelected     , 
      [CB_KEYS.prevSelectedIndex]: prevSelectedIndex,
      //pass down prev. callback params
      [CB_KEYS.selectedIndex]: index ,
      [CB_KEYS.isLast       ]: isLast,
      [CB_KEYS.selected     ]: choice,
    });
  };

  _renderChoices(){
    const { selected, selectedIndex, choices: _choices } = this.state;
    const choices = TestChoice.wrapArray(_choices);

    return choices.map((choice, index) => {
      const isLast = (index == (choices.length - 1));

      return(
        <ChoiceItem
          key={choice.choiceID}
          onPressChoice={this._handleOnPressChoice}
          {...{index, choice, isLast, selected, selectedIndex}}
        />
      );
    });
  };

  render(){
    const { styles } = Choices;

    const gradientProps = {
      style : styles.container,
      colors: [PURPLE[500], PURPLE[1000]],
      ...Platform.select({
        //diagonal gradient
        ios: {
          start: {x: 0.0, y: 0.25}, 
          end  : {x: 0.5, y: 1.00}
        },
        //horizonal gradient
        android: {
          start: {x: 0, y: 0}, 
          end  : {x: 1, y: 0}
        }
      }),
    };

    switch (Platform.OS) {
      case 'ios': return(
        <BlurViewWrapper
          wrapperStyle={styles.blurview}
          containerStyle={styles.blurviewContainer}
          onLayout={this.props.onLayout}
          tint={'default'}
          intensity={100}
        >
          <LinearGradient {...gradientProps}>
            {this._renderChoices()}
          </LinearGradient>
        </BlurViewWrapper>
      );
      case 'android': return(
        <LinearGradient {...gradientProps}>
          {this._renderChoices()}
        </LinearGradient>
      );
    };
  };
};

/** Used in Question: shows the quesion's image */
class QuestionImage extends React.PureComponent {
  static propTypes = {
    photofilename: PropTypes.string,
    photouri     : PropTypes.string,
    //events
    onPressImage    : PropTypes.func,
    onLongPressImage: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      height: 400,
      marginTop: 10,
      backgroundColor: PURPLE[200],
      overflow: 'hidden',
      borderRadius: 15,
    },
    errorContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: RED[400]
    },
    loadingContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      height: 400,
    },
  });

  constructor(props){
    super(props);

    const base64Images = props.base64Images || {};
    const base64Image  = base64Images[props.photouri];

    const hasImage    = props.photouri != null;
    const hasB64Image = base64Image != undefined;

    const STATES = {
      none    : { loading: LOAD_STATE.SUCCESS, showImage: false, loadImage: false },
      loaded  : { loading: LOAD_STATE.SUCCESS, showImage: true , loadImage: false },
      unloaded: { loading: LOAD_STATE.LOADING, showImage: false, loadImage: true  },
    };
    
    this.state = {
      base64Image, ...(
        hasB64Image? STATES.loaded   :
        hasImage   ? STATES.unloaded : STATES.none
      ),
    };
  };


  async componentDidMount(){
    const { photouri } = this.props;
    const { loadImage } = this.state;
    
    try {
      if(loadImage){
        //delay loading
        Platform.OS == 'android' && await timeout(750);
        console.log('loading image from store...');

        //load image from file system
        const base64Image = await FileSystem.readAsStringAsync(photouri);
        const isValidBase64Image = isBase64Image(base64Image || '');

        this.setState({
          showImage: isValidBase64Image,
          loading: LOAD_STATE.SUCCESS,
          base64Image, 
        });
      };
      
    }catch(error){
      console.log('Unable to load image');
      console.log(error);
      this.setState({base64Image, loading: LOAD_STATE.ERROR});
    };
  };
  
  /** TouchableOpacity: called when image is pressed */
  _handleImageOnPress = () => {
    const { onPressImage, photofilename, photouri } = this.props;
    const { base64Image } = this.state;
    
    onPressImage && onPressImage({
      base64Image, photofilename, photouri
    });
  };

  _handleImageOnLongPress = () => {
    const { onLongPressImage } = this.props;
    onLongPressImage && onLongPressImage();
  };

  _renderImage(){
    const { styles } = QuestionImage;
    const { containerStyle, imageStyle } = this.props;
    const { base64Image, showImage } = this.state;
    if(!showImage) return null;

    return(
      <TouchableOpacity
        style={[styles.container, containerStyle]}
        onPress={this._handleImageOnPress}
        onLongPress={this._handleImageOnLongPress}
        activeOpacity={0.85}
      >
        <Animatable.Image
          style={[styles.image, imageStyle]}
          source={{uri: base64Image}} 
          resizeMode={'cover'}
          animation={'fadeIn'}
          duration={750}
          delay={500}
          useNativeDriver={true}
        />
      </TouchableOpacity>
    );
  };

  _renderLoading(){
    const { styles } = QuestionImage;
    return(
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size={'large'}
          color={'white'}
        />
      </View>
    );
  };

  _renderError(){
    const { styles } = QuestionImage;
    return(
      <View style={[styles.container, styles.error]}>
        <Icon 
          name={'ios-warning'}
          type={'ionicon'}
          color={'white'}
          size={24}
        />
      </View>
    );
  };

  render(){
    const { loading, } = this.state;
    
    switch (loading) {
      case LOAD_STATE.LOADING: return this._renderLoading();
      case LOAD_STATE.SUCCESS: return this._renderImage  ();
      case LOAD_STATE.ERROR  : return this._loadError    ();
    };
  };
};

/** Used in QuestionItem: shows the question text + image */
class Question extends React.PureComponent {
  static propTypes = {
    question: PropTypes.object,
    //events
    onPressImage: PropTypes.func,
    onLongPress : PropTypes.func,
  };

  static styles = StyleSheet.create({
    scrollview: {
      flex: 1,
      ...Platform.select({
        ios: {
          marginTop: 10,
          paddingBottom: 10,
          borderRadius: 15,
          marginHorizontal: 10,
        },
        android: {
          padding: 10,
          marginBottom: 10,
        },
      }),
    },
    contentScrollview: {  
    },
    question: {
      flex: 1,
      fontSize: 18,
      fontWeight: '200',
    },
    numberCointainer: {
      width : 22,
      height: 22,
      borderRadius: 22/2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: PURPLE.A700,
      marginBottom: -2,
    },
    number: {
      marginRight: 10,
      fontWeight: '500',
      color: PURPLE[900],
    },
    spacer: {
      marginBottom: 10,
    },
  });

  /** QuestionImage: called when an image has been pressed */
  _handleOnPressImage = ({base64Image, photofilename, photouri}) => {
    const { onPressImage, question, index } = this.props;
    onPressImage && onPressImage({
      question, index, base64Image, photofilename, photouri
    });
  };

  _handleOnLongPress = () => {
    const { onLongPress } = this.props;
    onLongPress && onLongPress();
  };

  _renderQuestion(){
    const { styles } = Question;
    const { index, question: _question } = this.props;
    const question = TestQuestion.wrap(_question);

    return(
      <Fragment>
        <Text 
          style={styles.question}
          onLongPress={this._handleOnLongPress}
          suppressHighlighting={true}
        >
          <Text style={styles.number}>{index + 1}. </Text>
          {question.question || '( No question to display )'}
        </Text>
      </Fragment>
    );
  };

  render(){
    const { styles } = Question;
    const { photofilename, photouri, base64Images, bottomSpace } = this.props;

    //dont render until choices height is measured in ios
    if(Platform.OS == 'ios' && bottomSpace == 0) return null;

    const PlatformProps = {
      ...Platform.select({
        ios: {
          contentInset: {
            bottom: bottomSpace + 10,
          },
        },
      }),
    };

    return(
      <ScrollView 
        style={styles.scrollview}
        contentContainerStyle={styles.contentScrollview}
        alwaysBounceVertical={false}
        {...PlatformProps}
      >
        {this._renderQuestion()}
        {false && <QuestionImage 
          onPressImage={this._handleOnPressImage}
          onLongPressImage={this._handleOnLongPress}
          {...{photofilename, photouri, base64Images}}
        />}
        <View style={styles.spacer}/>
      </ScrollView>
    );
  };
};

class Option extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 65,
      height: 65,
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      ...Platform.select({
        ios: {
          shadowColor: 'white',
          shadowRadius: 7,
          shadowOpacity: 0.25,
        },
      }),
    },
    textContainer: {
      flex: 1,
      alignSelf: 'stretch',
      justifyContent: 'center',
      paddingLeft: 15,
    },
    title: {
      fontSize: 17,
      color: 'white',
      fontWeight: '800',
    },
    subtitle: {
      fontSize: 16,
      color: 'white',
      fontWeight: '200',
    },
  });

  render(){
    const { styles } = Option;
    const { props } = this;

    const containerStyle = {
      ...(props.hasBorder && {
        borderBottomColor: 'rgba(0,0,0,0.25)',
        borderBottomWidth: 1,
      })
    };

    return(
      <TouchableOpacity 
        style={[styles.container, containerStyle]}
        activeOpacity={0.75}
        {...props}
      >
        <Animatable.View 
          style={[styles.iconContainer, {backgroundColor: props.color}]}
          animation={'pulse'}
          duration={2 * 1000}
          iterationCount={'infinite'}
          iterationDelay={1000}
          useNativeDriver={true}
        >
          <Icon
            iconStyle={styles.icon}
            name={props.iconName}
            type={props.iconType}
            color={'white'}
            size={28}
          />
        </Animatable.View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {props.title || 'N/A'}
          </Text>
          <Text style={styles.subtitle}>
            {props.subtitle || 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
};

class QuestionOverlay extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255,255,255,0.3)',
        },
      }),
    },
    controlsContainer: {
      overflow: 'hidden',
      borderRadius: 18,
      alignSelf: 'stretch',
      backgroundColor: 'rgba(0,0,0,0.4)'
    },
    //title styles
    titleContainer: {
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingVertical: 15,
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderBottomColor: 'rgba(0,0,0,0.25)',
      borderBottomWidth: 1,
    },
    textContainer: {
      flex: 1,
      marginLeft: 15,
    },
    iconContainer: {
      width: 45,
      height: 45,
      borderRadius: 45/2,
      backgroundColor: PURPLE.A700,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: PURPLE.A700,
          shadowRadius: 7,
          shadowOpacity: 0.15,
          shadowOffset: { 
            height: 2,
            width: 1,
          },
        },
      }),
    },
    icon: {
      ...Platform.select({
        ios: {
          shadowColor: 'white',
          shadowRadius: 7,
          shadowOpacity: 0.6,
        },
      }),
    },
    title: {
      color: 'white',
      ...Platform.select({
        ios: {
          fontSize: 22, 
          fontWeight: '800',
          shadowColor: 'white',
          shadowRadius: 5,
          shadowOpacity: 0.15,
        },
        android: {
          fontWeight: '900',
          fontSize: 26, 
        },
      }),
    },
    subtitle: {
      color: 'white',
      ...FONT_STYLES.subtitle1,
      ...Platform.select({
        ios: {
          marginTop: -1,
          fontWeight: '400',
        },
        android: {
          fontWeight: '100',
        },
      }),
    },
  });

  _handleOnPressCancel = async () => {
    const { onPressCancel } = this.props;
    await this.container.fadeOutDown(250);
    onPressCancel && onPressCancel();
  };

  _renderTitle(){
    const { styles } = QuestionOverlay;

    return(
      <View style={styles.titleContainer}>
        <Animatable.View
          animation={'pulse'}
          iterationCount={'infinite'}
          iterationDelay={1000}
          duration={1000 * 7}
          useNativeDriver={true}
        >
          <Icon
            containerStyle={styles.iconContainer}
            iconStyle={styles.icon}
            name={'question'}
            type={'font-awesome'}
            size={24}
            color={'white'}
          />
        </Animatable.View>
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {'Options'}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {'What do you want to do?'}
          </Text>
        </View>
      </View>
    );
  };

  _renderOptions(){
    const { styles } = QuestionOverlay;
    const { props } = this;

    return(
      <Fragment>
        <Option
          title={'Skip'}
          subtitle={'Go to the next question'}
          iconName={'md-close-circle'}
          iconType={'ionicon'}
          color={RED.A700}
          hasBorder={true}
          onPress={props.onPressSkip}
        />
        <Option
          title={'Bookmark'}
          subtitle={'Mark the current question'}
          iconName={'md-add-circle'}
          iconType={'ionicon'}
          color={AMBER.A700}
          hasBorder={true}
          onPress={props.onPressBookmark}
        />
        <Option
          title={'Cancel'}
          subtitle={'Go back to the question'}
          iconName={'md-remove-circle'}
          iconType={'ionicon'}
          color={BLUE.A700}
          onPress={this._handleOnPressCancel}
        />
      </Fragment>
    );
  };

  render(){
    const { styles } = QuestionOverlay;
    return(
      <TouchableWithoutFeedback onPress={this._handleOnPressCancel}>
        <BlurViewWrapper
          wrapperStyle={{flex: 1}}
          containerStyle={styles.container}
        >
          <Animatable.View 
            style={styles.controlsContainer}
            ref={r => this.container = r}
            animation={'fadeInUp'}
            delay={250}
            duration={300}
            useNativeDriver={true}
          >
            {this._renderTitle()}
            {this._renderOptions()}
          </Animatable.View>
        </BlurViewWrapper>
      </TouchableWithoutFeedback>
    );
  };
};

/** Used in ExamTestList: shows a card w/ question text + image */
class QuestionItem extends React.PureComponent {
  static propTypes = {
    question      : PropTypes.object,
    isLast        : PropTypes.bool  ,
    index         : PropTypes.number,
    onPressChoice : PropTypes.func  ,
    answers       : PropTypes.array ,
    //events
    onPressSkip    : PropTypes.func,
    onPressBookmark: PropTypes.func,
    onOverlayShow  : PropTypes.func,
    onOverlayHide  : PropTypes.func,
    onPressImage   : PropTypes.func,
  };

  static styles = StyleSheet.create({
    overlayWrapper: {
      position: 'absolute', 
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    //card container
    wrapper: {
      //ios only style
      flex: 1,
      margin: 12,
      backgroundColor: 'white',
      borderRadius: 20,
      //ios card shadow
      shadowColor: 'black',
      shadowRadius: 5,
      shadowOpacity: 0.5,
      shadowOffset: {  
        width: 2,  
        height: 4,  
      },
      //extra bottom space
      ...ifIphoneX({
        marginBottom: getBottomSpace(),
      }),
    },
    container: {
      flex: 1,
      ...Platform.select({
        ios: {
          overflow: 'hidden',
          borderRadius: 15,
        },
        //android card shadow
        android: {
          borderRadius: 20,
          elevation: 15,
          margin: 12,
          backgroundColor: 'white',
        }
      }),
    }
  });

  static CB_PARAMS = {
    onPressChoice: {
      isLast           : 'isLast'           ,
      question         : 'question'         ,
      selected         : 'selected    '     ,
      selectedIndex    : 'selectedIndex'    ,
      prevSelected     : 'prevSelected'     ,
      prevSelectedIndex: 'prevSelectedIndex',
    },
  };

  constructor(props){
    super(props);
    // note: sometimes questionItem is unmounted when list becomes to big
    this.state = {
      choicesHeight: 0,
      showOverlay: false,
    };
  };

  /** returns the matching answer from answers array, otherwise returns undefined*/
  getMatchedAnswer(){
    //wrap answers object-array and question object props
    const answers  = QuizAnswer.wrapArray(this.props.answers );
    const question = QuizQuestion.wrap   (this.props.question);
    
    //check if there's a matching answer already, otherwise undefined
    return answers.find((answer) => {
      //combine indexID's of the question
      const questionID = `${question.indexID_module}-${question.indexID_subject}-${question.indexID_question}`;
      
      //return answer if ID's match
      return (answer.answerID == questionID);
    });
  };

  hideOverlay = async () => {
    const { onOverlayHide } = this.props;
    const { showOverlay } = this.state;
    const overlay = this.overlay;

    if(showOverlay){
      overlay && await overlay.fadeOut(300);
      this.setState({showOverlay: false});
      onOverlayHide && onOverlayHide();
    };
  };

  _handleChoicesOnLayout = ({nativeEvent}) => {
    const { choicesHeight } = this.state;
    const { height } = nativeEvent.layout;

    if(choicesHeight == 0){
      this.setState({choicesHeight: height});
    };
  };

  /** Choices: Called when a choice has been selected */
  _handleOnPressChoice = (params) => {
    const {CB_PARAMS:{ onPressChoice: PARAM_KEYS }} = Choices;
    const {CB_PARAMS:{ onPressChoice: CB_KEYS    }} = QuestionItem;
    const { onPressChoice, quesion } = this.props;

    //pass props to callback
    onPressChoice && onPressChoice({
      quesion,
      //pass down prev. callback params
      [CB_KEYS.isLast           ]: params[PARAM_KEYS.isLast           ],
      [CB_KEYS.selected         ]: params[PARAM_KEYS.selected         ],
      [CB_KEYS.selectedIndex    ]: params[PARAM_KEYS.selectedIndex    ],
      [CB_KEYS.prevSelected     ]: params[PARAM_KEYS.prevSelected     ], 
      [CB_KEYS.prevSelectedIndex]: params[PARAM_KEYS.prevSelectedIndex],
    });
  };

  _handleOnLongPress = () => {
    const { onOverlayShow } = this.props;
    const { showOverlay } = this.state;
    if(!showOverlay){
      this.setState({showOverlay: true});
      onOverlayShow && onOverlayShow();
    };
  };

  /** overlay: skip*/
  _handleOnPressSkip = async () => {
    const { onPressSkip, question, index, isLast } = this.props;
    await this.hideOverlay();
    onPressSkip && onPressSkip({question, isLast, index});
  };

  /** overlay: bookmark */
  _handleOnPressBookmark = async () => {
    const { onPressBookmark, question, index } = this.props;
    await this.hideOverlay();
    onPressBookmark && onPressBookmark({question, index});
  };

  /** overlay: cancel - hide overlay */
  _handleOnPressCancel = () => {
    this.hideOverlay();
  };

  _renderOverlay() {
    const { styles } = QuestionItem;
    const { showOverlay } = this.state;
    if(!showOverlay) return null;

    return(
      <Animatable.View
        ref={r => this.overlay = r}
        style={styles.overlayWrapper}
        animation={'fadeIn'}
        duration={300}
        useNativeDriver={true}
      >
        <QuestionOverlay
          onPressSkip={this._handleOnPressSkip}
          onPressBookmark={this._handleOnPressBookmark}
          onPressCancel={this._handleOnPressCancel}
        />
      </Animatable.View>
    );
  };

  _renderContents(){
    const { styles } = QuestionItem;
    const { index, question, onPressImage, base64Images, answers } = this.props;
    const { choicesHeight: bottomSpace } = this.state;

    return(
      <Fragment>
        <Question
          onLongPress={this._handleOnLongPress}
          {...{index, question, onPressImage, base64Images, bottomSpace}}
        />
        <Choices
          onPressChoice={this._handleOnPressChoice}
          onLayout={this._handleChoicesOnLayout}
          {...{index, question, answers}}
        />
      </Fragment>
    );
  };
  
  render(){
    const { styles } = QuestionItem;
  
    switch (Platform.OS) {
      case 'ios': return (
        <View style={styles.wrapper}>
          <View style={styles.container}>
            {this._renderContents()}
            {this._renderOverlay ()}
          </View>
        </View>
      );
      case 'android': return (
        <View style={styles.container}>
          {this._renderContents()}
        </View>
      );
    };
  };  
};

export class ExamTestList extends React.Component {
  static propTypes = {
    questions              : PropTypes.array ,
    base64Images           : PropTypes.object,
    onAnsweredLastQuestion : PropTypes.func  ,
    onNewAnswerSelected    : PropTypes.func  ,
    onPressImage           : PropTypes.func  ,
  };

  static styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  constructor(props){
    super(props);

    //store user answers
    this.answers = TestAnswer.wrapArray([]);

    //wrap custom quiz to prevent missing properties
    const questions = TestQuestion.wrapArray(props.questions || []);
    //assign questions as property
    this.questions = [...questions.reverse()];    

    this.state = {
      //the current questions to display
      questionList : [this.questions.pop()],
      scrollEnabled: true,
    };
  };

  //#region ---- getters -----
  /** get a copy of the remaining questions */
  getQuestions = () =>  {
    return (_.cloneDeep(this.questions));
  };

  /** get a copy of all the current answers */
  getAnswers = () => {
    return _.cloneDeep(this.answers);
  };

  /** get the current questions being displayed */
  getQuestionList = () => {
    const { questionList } = this.state;
    return questionList;
  };

  /** returns a reference to the carousel component */
  getCarouselRef = () => {
    return this._carousel;
  };
  //#endregion

  //#region ---- functions -----
  /** gets a question and appends it to questionlist state*/
  async addQuestionToList(){
    const { questionList } = this.state;

    //get the next question to dispaly - returns undefined when array is empty
    const nextQuestion = this.questions.pop();
    //dont add next question if undefined
    if(nextQuestion != undefined){
      //append the next question to the end of question list
      const newQuestionList = [...questionList, nextQuestion];
      await setStateAsync(this, {questionList: newQuestionList});

    } else {
      //debug
      console.log('addQuestionToList: no more questions to add');
    };
  };

  /** inserts a new answer to the list, otherwise overwrites prev answer */
  addAnswer({question, label, choice: _choice}){
    const choice = TestChoice.wrap(_choice);
    const answer = TestAnswer.create(choice)

    const matchIndex = this.answers.findIndex(item => 
      item.answerID == answer.answerID
    );

    if(matchIndex != -1){
      const prevLabel = this.answers[matchIndex].label;
      const isMarked  = (label     == QUIZ_LABELS.MARKED);
      const wasMarked = (prevLabel == QUIZ_LABELS.MARKED);
      const noMark    = (isMarked && wasMarked);

      //replace existing answer
      this.answers[matchIndex] = ((!isMarked)? answer : {
        //append the prev. answer if only marking
        ...this.answers[matchIndex], ...(
          (noMark   )? {label: null } :
          (wasMarked)? {label: QUIZ_LABELS.MARKED} : {}
        ),
      });

    } else {
      //append new answer to answers
      this.answers.push(answer);
    };
  };

  //----- event handlers -----
  /** QuestionItem - choices: called when a choice has been selected */
  _handleOnPressChoice = async (params) => {
    const { CB_PARAMS:{ onPressChoice: PARAM_KEYS }} = QuestionItem;
    const { onAnsweredLastQuestion, onNewAnswerSelected } = this.props;

    //callback chain: ChoiceItem -> Choices -> QuestionItem
    const isLast       = params[PARAM_KEYS.isLast      ];
    const question     = params[PARAM_KEYS.question    ];
    const selected     = params[PARAM_KEYS.selected    ];
    const prevSelected = params[PARAM_KEYS.prevSelected];
    
    if(isLast){
      //event: last question has been answered
      onAnsweredLastQuestion && onAnsweredLastQuestion();

    } else if(!prevSelected){
      //event: new answer, no prev choice selected
      onNewAnswerSelected && onNewAnswerSelected();
      
      //add answer with delay for animations to finish
      await Promise.all([
        this.addQuestionToList(),
        timeout(400)
      ]);

      //show next question if it's not the last item
      !isLast && this._carousel.snapToNext();
    };

    this.addAnswer({question, choice: selected});
  };

  /** QuestionItem - overlay: */
  _handleOnPressSkip = async ({question, isLast, index}) => {
    const { questionList } = this.state;
    const currentIndex = questionList.length - 1;

    if(isLast){
      Alert.alert(
        "Last Question",
        "There are no more questions to skip."
      );

    } else if(index == currentIndex){
      //add answer with delay for animations to finish
      await Promise.all([
        this.addQuestionToList(),
        timeout(400)
      ]);

      this._carousel.snapToNext();
      this.addAnswer({
        question, 
        userAnswer: null, 
        isCorrect: false,
        label: QUIZ_LABELS.SKIPPPED,
      });

    } else {
      this._carousel.snapToNext(true, true);
      Alert.alert(
        "Already Skipped",
        "Cannot skip question"
      );
    };
  };

  /** QuestionItem - overlay: */
  _handleOnPressBookmark = ({question, index}) => {
    this.addAnswer({
      userAnswer: null, 
      isCorrect: false,
      label: QUIZ_LABELS.MARKED,
      //pass down question
      question,
    });
  };

  /** QuestionItem - overlay: called when overlay is visible */
  _handleOnOverlayShow = () => {
    const { scrollEnabled } = this.state;
    if(scrollEnabled){
      this.setState({scrollEnabled: false});
    };
  };

  /** QuestionItem - overlay: called when overlay is hidden */
  _handleOnOverlayHide = () => {
    const { scrollEnabled } = this.state;
    if(scrollEnabled){
      this.setState({scrollEnabled: true});
    };
  };
  //#endregion

  //#region ----- render -----
  _renderItem = ({item: question, index}) => {
    const { questions, onPressImage, base64Images } = this.props;
    //check if last item to be shown
    const isLast = (index == (questions || []).length - 1);
    
    return (
      <QuestionItem
        onPressChoice={this._handleOnPressChoice}
        onPressSkip={this._handleOnPressSkip}
        onPressBookmark={this._handleOnPressBookmark}
        onOverlayShow={this._handleOnOverlayShow}
        onOverlayHide={this._handleOnOverlayHide}
        answers={this.answers}
        {...{question, isLast, index, onPressImage, base64Images}}
      />
    );
  };

  render(){
    const { styles } = ExamTestList;
    const { scrollEnabled, questionList: data } = this.state;
    const { ...otherProps } = this.props;

    //get screen height/width
    const dimensions   = Dimensions.get('window');
    const screenHeight = dimensions.height;
    const screenWidth  = dimensions.width ;
    
    //ui values for carousel
    const headerHeight = Platform.select({
      ios    : Header.HEIGHT,
      android: Header.HEIGHT + StatusBar.currentHeight,
    });

    const carouseProps = {
      scrollEnabled: true,
      itemHeight: ifIphoneX(
        screenHeight - headerHeight - getStatusBarHeight(),
        screenHeight - headerHeight,
      ),
      //platform specific props
      ...Platform.select({
        //swipe vertical on ios
        ios: {
          sliderHeight: screenHeight,
          activeSlideAlignment: 'end',
          vertical: true,
        },
        //swipe horizontally on android
        android: {
          sliderHeight: screenHeight - headerHeight,
          sliderWidth : screenWidth,
          itemWidth   : screenWidth,
          vertical: false,
          activeSlideAlignment: 'center'
        }
      }),
      //spread props
      ...otherProps,
    };

    return(
      <View style={styles.container}>
        <Carousel
          ref={r => this._carousel = r }
          renderItem={this._renderItem}
          //scrollview props
          showsHorizontalScrollIndicator={true}
          bounces={this.state.scrollEnabled}
          lockScrollWhileSnapping={true}
          //pass down props
          {...{data, scrollEnabled, ...carouseProps}}
        />
      </View>
    );
  };
  //#endregion
};