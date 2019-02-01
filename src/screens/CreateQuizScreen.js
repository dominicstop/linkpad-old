import React, { Fragment } from 'react';
import { View, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, FlatList, TextInput, Platform, Alert } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService from '../NavigationService';
import { setStateAsync , plural, isEmpty} from '../functions/Utils';
import { ROUTES, STYLES, HEADER_HEIGHT } from '../Constants';
import { PURPLE } from '../Colors';

import { CreateCustomQuizList } from '../components/CustomQuiz';
import { AndroidHeader } from '../components/AndroidHeader';
import { ViewWithBlurredHeader, IconText, Card } from '../components/Views' ;
import { PlatformTouchableIconButton } from '../components/Buttons';

import * as Animatable from 'react-native-animatable';
import { Header, NavigationEvents  } from 'react-navigation';
import { Icon, Divider } from 'react-native-elements';

//android header text style
const titleStyle = { 
  flex: 1, 
  textAlign: 'center', 
  marginRight: 10,
  position: 'absolute',
  color: 'white',
};

let _onPressNext;
const headerRight = (
  <TouchableOpacity onPress={() => _onPressNext && _onPressNext()}>
    <Text style={{fontSize: 18, color: 'white', margin: 10}}>Next</Text>
  </TouchableOpacity>
);

class TitleDescription extends React.PureComponent {
  static styles = StyleSheet.create({
    headerTextContainer: {
      flex: 1, 
    },
    headerTitle: {
      color: '#512DA8',
      fontSize: 20, 
      fontWeight: '800',
      textAlign: 'center',
    },
    headerSubtitle: {
      flex: 1,
      fontSize: 16,
      textAlign: 'justify',
      textAlignVertical: 'top',
      marginBottom: 10,
      ...Platform.select({
        ios: {
          fontWeight: '200'
        },
        android: {
          fontWeight: '100',
          color: '#424242'
        },
      })
    },
  });

  constructor(props){
    super(props);

    //set initial text
    this.state = {
      title: props.title,
      description: props.description,
    };
  };

  changeText = async ({title, description}) => {
    await this.textContainer.fadeOut(250);
    this.setState({title, description});

    if(Platform.OS == 'ios'){
      await this.textContainer.fadeInUp(250);

    } else {
      await this.textContainer.fadeIn(250);
    };
  };

  render(){
    const { styles } = TitleDescription;
    const { title, description } = this.state;

    const defaultTitle = (global.usePlaceholder
      ? 'Ridiculus Eges'
      : 'Custom Quiz'
    );

    const defaultDescription = (global.usePlaceholder
      ? 'Nulla vitae elit libero, a pharetra augue. Maecenas faucibus mollis interdum.'
      : 'Give your custom quiz a title and a description so you can easily find it later.'
    );

    const headerTitle       = (title       == '')? defaultTitle       : title; 
    const headerDescription = (description == '')? defaultDescription : `Quiz Descripton – ${description}`; 

    return(
      <Animatable.View 
        style={styles.headerTextContainer}
        ref={r => this.textContainer = r}
        useNativeDriver={true}
      >
        <Text 
          style={styles.headerTitle} 
          numberOfLines={1} 
        >
          {headerTitle}
        </Text>
        <Text style={styles.headerSubtitle}>{headerDescription}</Text>
      </Animatable.View>
    );
  };
};

class TitleDescriptionCard extends React.PureComponent {
  static PropTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    onPressEditDetails: PropTypes.func,
  };
  
  static styles = StyleSheet.create({
    card: {
      marginBottom: 10,
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    buttonWrapper: {
      backgroundColor: PURPLE.A700,
      marginTop: 10,
    },
    buttonContainer: {
      padding: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 17,
      fontWeight: '600',
    },
  });

  constructor(props){
    super(props);
    this.imageHeader = require('../../assets/icons/clipboard-circle.png');
  };

  async componentDidUpdate(prevProps){
    const {title, description} = this.props;

    const didTitleChange       = title       != prevProps.title;
    const didDescriptionChange = description != prevProps.description;

    const didChange = didTitleChange || didDescriptionChange;
    didChange && this.titleDescription.changeText({title, description});
  };

  _handleOnPressEditDetails = () => {
    const { onPressEditDetails } = this.props;
    onPressEditDetails && onPressEditDetails();
  };

  _renderDescription(){
    const { styles } = TitleDescriptionCard;
    const { title, description } = this.props;

    return(
      <View style={{flexDirection: 'row'}}>
        <Animatable.Image
          source={this.imageHeader}
          style={styles.image}
          animation={'pulse'}
          easing={'ease-in-out'}
          iterationCount={"infinite"}
          duration={5000}
          useNativeDriver={true}
        />
        <TitleDescription
          ref={r => this.titleDescription = r}
          {...{title, description}}
        />
      </View>
    );
  };

  _renderButton(){
    const { styles } = AddSubjectsCard;

    const text = (global.usePlaceholder
      ? 'Pharetra Tellu'
      : 'Edit Details'
    );

    return(
      <PlatformTouchableIconButton
        onPress={this._handleOnPressEditDetails}
        wrapperStyle={[styles.buttonWrapper, STYLES.lightShadow]}
        containerStyle={styles.buttonContainer}
        textStyle={styles.buttonText}
        iconName={'edit'}
        iconType={'entypo'}
        iconColor={'white'}
        iconSize={24}
        {...{text}}
      />
    );
  };

  render() {
    const { styles } = TitleDescriptionCard;
    
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <Animatable.View
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <Card style={styles.card}>
          {this._renderDescription()}
          <Divider/>
          {this._renderButton()}
        </Card>
      </Animatable.View>
    );
  };
};

class AddSubjectsCard extends React.PureComponent {
  static PropTypes = {
    onPressAddSubject: PropTypes.func,
  };

  static styles = StyleSheet.create({
    card: {
      marginBottom: 10,
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    headerTextContainer: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
    },
    headerTitle: {
      color: '#512DA8',
      fontSize: 20, 
      fontWeight: '800'
    },
    headerSubtitle: {
      fontSize: 16, 
      ...Platform.select({
        ios: {
          fontWeight: '200'
        },
        android: {
          fontWeight: '100',
          color: '#424242'
        },
      })
    },
    buttonWrapper: {
      backgroundColor: PURPLE.A700,
      marginTop: 10,
    },
    buttonContainer: {
      padding: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 17,
      fontWeight: '600',
    },
  });

  constructor(props){
    super(props);

    this.imageHeader = require('../../assets/icons/file-circle.png');
  };

  _handleOnPressAddSubject = () => {
    const { onPressAddSubject } = this.props;
    onPressAddSubject && onPressAddSubject();
  };

  _renderDescription(){
    const { styles } = AddSubjectsCard;

    const title = (global.usePlaceholder
      ? 'Purus Ligula Sem'
      : 'Add an Quiz Item'
    );

    const description = (global.usePlaceholder
      ? 'Sed posuere consectetur est at lobortis. Maecenas faucibus mollis interdum.'
      : "100 questions in total will be selected across all the subjects you've selected."
    );

    return(
      <View style={{flexDirection: 'row'}}>
        <Animatable.Image
          source={this.imageHeader}
          style={styles.image}
          animation={'pulse'}
          easing={'ease-in-out'}
          iterationCount={"infinite"}
          duration={5000}
          useNativeDriver={true}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle   }>{title}</Text>
          <Text style={styles.headerSubtitle}>{description}</Text>
        </View>
      </View>
    );
  };

  _renderButtons(){
    const { styles } = AddSubjectsCard;

    const text = (global.usePlaceholder
      ? 'Vehicula Commodo'
      : 'Add Subjects'
    );

    return(
      <PlatformTouchableIconButton
        onPress={this._handleOnPressAddSubject}
        wrapperStyle={[styles.buttonWrapper, STYLES.lightShadow]}
        containerStyle={styles.buttonContainer}
        textStyle={styles.buttonText}
        iconName={'bookmark'}
        iconType={'entypo'}
        iconColor={'white'}
        iconSize={24}
        {...{text}}
      />
    );
  };

  render() {
    const { styles } = AddSubjectsCard;
    
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <Animatable.View
        duration={500}
        delay={100}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <Card style={styles.card}>
          {this._renderDescription()}
          <Divider/>
          {this._renderButtons()}
        </Card>
      </Animatable.View>
    );
  };
};

export class CreateQuizScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    //set header title
    let title = (global.usePlaceholder
      ? 'Nibh Mattis'
      : 'Custom Quiz'
    );
    
    if(state.params) title = state.params.title;

    return ({
      title, 
      headerRight,
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

  static styles = StyleSheet.create({
    flatlist: {
      paddingTop: 12,
    },
    indicatorText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
    },
  });

  constructor(props){
    super(props);

    this.state = {
      title: '',
      description: '',
      selected: [],
    };

    //get ref from screenprops
    const { getRefCreateQuizModal, getRefQuizDetailsModal, getRefQuizFinishModal } = props.screenProps;
    
    //get ref of modal from homescreen wrapper
    this.quizModal    = getRefCreateQuizModal ();
    this.detailsModal = getRefQuizDetailsModal();
    this.finishModal  = getRefQuizFinishModal ();
    
    _onPressNext = this._handleOnPressNext;
  };

  componentDidFocus = () => {
    const { setDrawerSwipe } = this.props.screenProps;
    setDrawerSwipe(false);
  };

  _handleOnPressNext = () => {
    const {selected, title, description} = this.state;

    const isValid = (isEmpty(title) || isEmpty(description));

    if(selected <= 0){
      Alert.alert(
        'Not Enough Items',
        "Please add at least one subject to continue.",
      );
    } else if(isValid){
      Alert.alert(
        'No Title/Description',
        "Press 'Edit Deatils' to add a title and description.",
      );
    } else {
      this.finishModal.openModal({selected, title, description});
    };
  };

  _handleOnPressEditDetails = () => {
    const {title, description} = this.state;

    if(this.detailsModal != null){
      //assign callback to modal
      this.detailsModal.onPressSaveChanges = this._handleModalOnPressSaveChanges;
      //show modal
      this.detailsModal.openModal({title, description});
    };
  };

  _handleOnPressAddSubject = () => {
    if(this.quizModal != null){
      //assign callback to modal
      this.quizModal.onPressAddSubject = this._handleModalOnPressAddSubject;

      const {selected } = this.state;
      //show modal
      this.quizModal.openModal(selected);
    };
  };

  //callback from createquiz modal
  _handleModalOnPressAddSubject = async (selected) => {
    const prevCount = this.state.selected.length;
    const nextCount = selected.length;

    if(prevCount > nextCount){
      await this.listContainer.fadeOut(300);
      this.setState({selected});
      await this.listContainer.fadeInUp(300);

    } else {
      this.setState({selected});
    };
  };

  //callback from quizdetails modal
  _handleModalOnPressSaveChanges = ({title, description}) => {
    this.setState({title, description});
  };

  _renderHeader = () => {
    const {title, description} = this.state;
    
    return(
      <Fragment>
        <TitleDescriptionCard 
          onPressEditDetails={this._handleOnPressEditDetails}
          {...{title, description}} 
        />
        <AddSubjectsCard 
          onPressAddSubject={this._handleOnPressAddSubject}
        />
      </Fragment>
    );
  };

  render(){
    const { styles } = CreateQuizScreen;

    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <ScrollView
          style={styles.flatlist}
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
        >
          {this._renderHeader()}
          <Animatable.View
            ref={r => this.listContainer = r}
            useNativeDriver={true}
          >
            <CreateCustomQuizList quizItems={this.state.selected}/>
          </Animatable.View>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};