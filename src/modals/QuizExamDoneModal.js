import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated, TextInput, TouchableWithoutFeedback, Keyboard, Alert, Dimensions, Clipboard, SectionList } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../Constants';
import { PURPLE } from '../Colors';

import { setStateAsync, isEmpty } from '../functions/Utils';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconText, AnimateInView } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';

import _ from 'lodash';
import TimeAgo from 'react-native-timeago';
import { LinearGradient, BlurView, DangerZone } from 'expo';
import { Icon } from 'react-native-elements';

import * as _Reanimated from 'react-native-reanimated';
import * as Animatable from 'react-native-animatable';

const { Lottie } = DangerZone;
const { Easing } = _Reanimated;
const Reanimated = _Reanimated.default;

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

class ModalSectionItemDetails extends React.PureComponent {
  static propTypes = {
    quiz: PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
        }
      }),
    },
    divider: {
      margin: 10,
      height: 1,
      backgroundColor: 'rgba(0,0,0, 0.12)'
    },
    title: {
      fontSize: 24,
      color: PURPLE[600],
      fontWeight: '600',
    },
    date: {
      fontSize: 17,
      color: PURPLE[900],
      fontWeight: '300',
    },
    dateLabel: {
      color: PURPLE[1100],
      fontWeight: '600',
    },
    dateString: {
      fontWeight: '100',
    },
    description: {
      fontSize: 20,
      fontWeight: '200'
    },
    descriptionLabel: {
      fontWeight: '300'      
    }
  });

  _renderTitle(){
    const { styles } = ModalSectionItemDetails;
    const { quiz: {title} } = this.props;

    return(
      <Text 
        style={styles.title}
        numberOfLines={1}
      >
        {title}
      </Text>
    );
  };

  _renderDate(){
    const { styles } = ModalSectionItemDetails;
    const { quiz: {timestampCreated} } = this.props;

    const time = timestampCreated * 1000;
    const date = new Date(time);

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const dateString = date.toLocaleDateString('en-US', options);

    return(
      <Text style={styles.date}>
        <Text style={styles.dateLabel}>Created: </Text>
        <TimeAgo {...{time}}/>
        <Text style={styles.dateString}>{`, (${dateString})`}</Text>
      </Text>
    );
  };

  _renderDescription(){
    const { styles } = ModalSectionItemDetails;
    const { quiz: {description} } = this.props;

    return(
      <Text style={styles.description}>
        <Text style={styles.descriptionLabel}>Description - </Text>
        {description}
      </Text>
    );
  };

  render(){
    const { styles } = ModalSectionItemDetails;
    const { quiz: {title, description, timestampCreated} } = this.props;

    return(
      <View style={styles.container}>
        {this._renderTitle()}
        {this._renderDate()}
        <View style={styles.divider}/>
        {this._renderDescription()}
      </View>
    );
  };
};

class ModalSectionHeader extends React.PureComponent {
  static propTypes = {
    type: PropTypes.string,
  };

  static styles = StyleSheet.create({
    container: {
      marginTop: -1,
      padding: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255, 255, 255, 0.20)',
        },
        android: {
          backgroundColor: 'white',
          borderBottomColor: 'rgb(200,200,200)',
          borderBottomWidth: 1,
        }
      }),
    },
    contentContainer: {
      flexDirection: 'row',
    },
    titleContainer: {
      flex: 1,
      marginLeft: 8,
    },
    headerTitle: {
      fontWeight: '600',
      fontSize: 20,
      color: PURPLE[900],
    },
    headerSubtitle: {
      fontSize: 18,
      fontWeight: '300'
    },
  });

  getIconProps(type){
    const { SECTION_TYPES } = ModalContents;
    switch (type){
      case SECTION_TYPES.DETAILS: return {
        name: 'message-circle',
        type: 'feather'
      };
      case SECTION_TYPES.STATS: return {
        name: 'eye',
        type: 'feather'
      };
      case SECTION_TYPES.QUESTIONS: return {
        name: 'list',
        type: 'feather'
      };
    };
  };

  getHeaderDetails(type){
    const { SECTION_TYPES } = ModalContents;
    switch (type){
      case SECTION_TYPES.DETAILS: return {
        title: 'Quiz Details',
        description: 'Details about the current quiz',
      };
      case SECTION_TYPES.STATS: return {
        title: 'Quiz Statistics',
        description: 'How well are you doing so far?',
      };
      case SECTION_TYPES.QUESTIONS: return {
        title: 'Questions & Answers',
        description: 'Overview of your answers.',
      };
    };
  };

  _renderIcon(){
    const { type } = this.props;
    const iconProps = this.getIconProps(type);
    return (
      <Icon
        {...iconProps}
        color={PURPLE[500]}
        size={27}
      />
    );
  };

  _renderContent(){
    const { styles } = ModalSectionHeader;
    const { type } = this.props;

    const { title, description } = this.getHeaderDetails(type);

    return(
      <View style={styles.contentContainer}>
        {this._renderIcon()}
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
          <Text numberOfLines={2} style={styles.headerSubtitle}>{description}</Text>
        </View>
      </View>
    );
  };

  _renderIOS(){
    const { styles } = ModalSectionHeader;

    return(
      <BlurView
        style={{marginBottom: 2, borderBottomColor: 'black'}}
        tint={'default'}
        intensity={100}
      >
        <View style={styles.container}>
          {this._renderContent()}
        </View>
      </BlurView>
    );
  };

  _renderAndroid(){
    const { styles } = ModalSectionHeader;

    return(
      <View style={styles.container}>
        {this._renderContent()}
      </View>
    );
  };

  render(){
    return Platform.select({
      ios    : this._renderIOS(),
      android: this._renderAndroid(),
    });
  };
};

class ModalContents extends React.PureComponent {
  static propTypes = {
    quiz: PropTypes.object, 
    questions: PropTypes.array, 
    questionList: PropTypes.array, 
    answers: PropTypes.array, 
    currentIndex: PropTypes.number,
  };

  static SECTION_TYPES = {
    QUESTIONS: 'QUESTIONS',
    DETAILS: 'DETAILS',
    STATS: 'STATS'
  };
  
  static styles = StyleSheet.create({
    scrollview: {
      flex: 1, 
      borderTopColor: 'rgb(200, 200, 200)', 
      borderTopWidth: 1
    },
    title: {
      color: '#160656',
      ...Platform.select({
        ios: {
          fontSize: 24, 
          fontWeight: '800'
        },
        android: {
          fontSize: 26, 
          fontWeight: '900'
        }
      })
    },
    titleContainer: {
      marginLeft: 7, 
      marginRight: 25, 
      marginBottom: 10,
    },
    subtitle: {
      fontWeight: '200',
      fontSize: 16,
    },
    body: {
      borderTopColor: 'rgb(200, 200, 200)', 
      borderTopWidth: 1
    },
    buttonContainer: {
      padding: 12,
      borderTopColor: 'rgba(0, 0, 0, 0.25)',
      borderBottomColor: 'rgba(0, 0, 0, 0.25)',
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: PURPLE[700], 
      borderRadius: 12,
      padding: 15,
    },
    buttonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: 'white',
      textAlign: 'left',
      textAlignVertical: 'center',
      marginLeft: 13,
    },
  });

  constructor(props){
    super(props);

    const { SECTION_TYPES } = ModalContents;
    const { quiz, questions, questionList, answers, currentIndex } = props;

    this.state = {
      sections: [
        {type: SECTION_TYPES.DETAILS  , data: [{quiz}]},
        {type: SECTION_TYPES.STATS    , data: [{}]},
        {type: SECTION_TYPES.QUESTIONS, data: [{questions, questionList, answers, currentIndex}]},
      ],
    };
  };

  _handleOnPress = async () => {
  };

  _renderTitle(){
    const { styles } = ModalContents;

    const text = (global.usePlaceholder
      ? 'Tristique Dolor Aenean'
      : 'Custom Quiz Details'
    );

    const subtitle = (global.usePlaceholder
      ? 'Tortor Inceptos Cursus Etiam Vestibulum.'
      : 'Give your quiz a title and description.'
    );

    return(
      <IconText
        containerStyle={styles.titleContainer}
        textStyle={styles.title}
        subtitleStyle={styles.subtitle}
        iconName={'notebook'}
        iconType={'simple-line-icon'}
        iconColor={'#512DA8'}
        iconSize={26}
        {...{text, subtitle}}
      />
    );
  };

  _renderFinishButton(){
    const { styles } = ModalContents;

    const buttonText = (global.usePlaceholder
      ? 'Condimentum Amet'
      : 'Save Changes'
    );

    return(
      <Animatable.View
        style={styles.buttonContainer}
        animation={'fadeInUp'}
        duration={300}
        delay={300}
        useNativeDriver={true}
      >
        <TouchableOpacity onPress={this._handleOnPress}>
          <LinearGradient
            style={[styles.button, STYLES.mediumShadow]}
            colors={[PURPLE[800], PURPLE[500]]}
            start={[0, 1]} end={[1, 0]}
          >
            <Icon
              name={'ios-checkmark-circle-outline'}
              type={'ionicon'}
              color={'white'}
              size={24}
            />
            <Text style={styles.buttonText}>{buttonText}</Text>
            <Icon
              name={'chevron-right'}
              type={'feather'}
              color={'white'}
              size={30}
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  _renderSectionHeader = ({section: {type}}) => {
    return (
      <ModalSectionHeader {...{type}}/>
    );
  };

  _renderItem = ({item, index, section: {type}}) => {
    const { SECTION_TYPES } = ModalContents;
    
    switch (type) {
      case SECTION_TYPES.DETAILS: return(
        <ModalSectionItemDetails {...item}/>
      );
      case SECTION_TYPES.QUESTIONS: return(
        <Text>Questions</Text>
      );
      default: return null;
    }
  };

  _renderSectionFooter(){
    return (
      <View style={{marginBottom: 20, borderBottomColor: 'rgba(0, 0, 0, 0.1)', borderBottomWidth: 1}}/>
    );
  };

  render(){
    const { styles } = ModalContents;
    const { sections } = this.state;

    return(
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
          {this._renderTitle()}
          <SectionList
            style={styles.scrollview}
            renderItem={this._renderItem}
            renderSectionHeader={this._renderSectionHeader}
            renderSectionFooter={this._renderSectionFooter}
            keyExtractor={(item, index) => item + index}
            {...{sections}}
          />
        </View>
        {this._renderFinishButton()}
      </View>
    );
  };
};

export class QuizExamDoneModal extends React.PureComponent {
  static styles = StyleSheet.create({
    overlayContainer: {
      flex: 1,
      position: 'absolute',
      height: '100%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlay: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      opacity: 0,
      backgroundColor: 'white',
    },
    checkContainer: {
      width: '50%', 
      height: '50%', 
      marginBottom: 325
    }
  });

  constructor(props){
    super(props);

    this.state = {
      mountContent: false,
      currentIndex: -1, 
      questionList: [], 
      answers: [],
      questions: [], 
      quiz: null,
    };

    this._deltaY = null;
    //called when save changes is pressed
    this.onPressSaveChanges = null;
  };

  componentDidMount(){
    this._deltaY = this._modal._deltaY
  };

  openModal = async ({currentIndex, questionList, answers, questions, quiz}) => {
    //Clipboard.setString(JSON.stringify(quiz));

    this.setState({mountContent: true, currentIndex, questionList, answers, questions, quiz});
    this._modal.showModal();
  };

  _handleOnModalShow = () => {
  };

  _handleOnModalHide = () => {
    //reset state
    this.setState({mountContent: false});
  };

  _renderContent(){
    const { quiz, questions, questionList, answers, currentIndex } = this.state;

    const style = {
      flex: 1,
      opacity: this._deltaY.interpolate({
        inputRange: [0, Screen.height - MODAL_DISTANCE_FROM_TOP],
        outputRange: [1, 0.25],
        extrapolateRight: 'clamp',
      }),
    };

    return(
      <Reanimated.View {...{style}}>
        <ModalContents
          {...{quiz, questions, questionList, answers, currentIndex}}
        />
      </Reanimated.View>
    );
  };

  render(){
    const { mountContent } = this.state;
    const paddingBottom = (
      MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP
    );

    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <Fragment>
          <ModalBackground style={{paddingBottom}}>
            <ModalTopIndicator/>
            {mountContent && this._renderContent()}
          </ModalBackground>
        </Fragment>
      </SwipableModal>
    );
  };
};