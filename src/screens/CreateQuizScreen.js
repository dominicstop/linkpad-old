import React, { Fragment } from 'react';
import { View, ScrollView, Text, StyleSheet, FlatList, Platform, Alert } from 'react-native';
import PropTypes from 'prop-types';

import { plural, isEmpty} from '../functions/Utils';
import { STYLES, HEADER_HEIGHT } from '../Constants';
import { PURPLE, RED } from '../Colors';
import { SubjectItem, } from '../models/ModuleModels';

import { AndroidHeader } from '../components/AndroidHeader';
import { ViewWithBlurredHeader, AnimatedListItem, Card , IconFooter} from '../components/Views' ;
import { PlatformTouchableIconButton, RippleBorderButton } from '../components/Buttons';

import * as Animatable from 'react-native-animatable';
import { NavigationEvents  } from 'react-navigation';
import { Divider } from 'react-native-elements';

//android header text style
const titleStyle = { 
  flex: 1, 
  textAlign: 'center', 
  marginRight: 10,
  position: 'absolute',
  color: 'white',
};

class NextButton extends React.PureComponent {
  static styles = StyleSheet.create({
    button: {
      marginRight: 5,
    },
    buttonLabel: {
      color: 'white', 
      ...Platform.select({
        ios: {
          fontSize: 18,
          margin: 10,
        },
        android: {
          fontSize: 19,          
          margin: 15,
          fontWeight: '500'
        }
      })
    },
  });
  
  

  render(){
    const { styles } = NextButton;
    return(
      <RippleBorderButton 
        containerStyle={styles.button}
        {...this.props}
      >
        <Text style={styles.buttonLabel}>Next</Text>
      </RippleBorderButton>
    );
  };
};

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
  static propTypes = {
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

  animatePulse(){
    this._container.pulse(750);
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
      android: 'fadeInRight',
    });

    return(
      <Animatable.View
        ref={r => this._container = r}
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
  static propTypes = {
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

  animatePulse(){
    this._container.pulse(750);
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
      android: 'fadeInRight',
    });

    return(
      <Animatable.View
        ref={r => this._container = r}
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

class QuizItem extends React.PureComponent {
  static propTypes = {
    subjectData  : PropTypes.object,  
    onPressDelete: PropTypes.func,
  };

  static styles = StyleSheet.create({
    card: {
      //animated styles
      opacity: 1,
      transform: [
        { scaleX : 1      }, 
        { scaleY : 1      },
        { rotateX: '0deg' }
      ],
      //layout styles
      marginBottom: 12, 
      marginTop: 5, 
      overflow: 'visible', 
      marginHorizontal: 12, 
      paddingHorizontal: 15, 
      paddingVertical: 10, 
      borderRadius: 10,
      backgroundColor: 'white', 
      elevation: 7,
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    descriptionContainer: {
      flex: 1, 
      alignItems: 'flex-start', 
      justifyContent: 'center', 
    },
    textTitle: {
      color: PURPLE[700],
      fontSize: 20, 
      fontWeight: '900'
    },
    textSubtitle: {
      color: PURPLE[1000],
      fontSize: 18,
      ...Platform.select({
        ios: {
          fontWeight: '500'
        },
        android: {
          fontWeight: '300'
        },
      }),
    },
    textBody: {
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
    divider: {
      marginVertical: 5
    },
    buttonWrapper: {
      marginTop: 5,
      backgroundColor: RED[800],
    },
    buttonContainer: {
      padding: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 17,
      fontWeight: '600',
    }
  });

  constructor(props){
    super(props);

    this.state = {
      width : null,
      height: null,
    };
  };

  _handleOnPressDeleteButton = async () => {
    const { onPressDelete } = this.props;

    const exitStyle = {
      opacity: 0, 
      height: 0,
      marginTop: 0, 
      marginBottom: 0, 
      paddingVertical: 0,
      transform: [
        { scaleX : 0.75    },
        { scaleY : 0.50    },
        { rotateX: '-45deg'},
      ]
    };

    await this._rootContainer.transitionTo(exitStyle, 300, 'ease-in-out');
    onPressDelete && onPressDelete();
  };

  _handleOnLayout = (event) => {
    const {x, y, width, height} = event.nativeEvent.layout;
    this.setState({width, height});
  };

  _renderDescription(){
    const { styles } = QuizItem;
    const { subjectData } = this.props;

    const subjectModel = new SubjectItem(subjectData);
    const { subjectname, description } = subjectModel.get();
    const questionCount = subjectModel.getQuestionLength();

    return(
      <View style={styles.descriptionContainer}>
        <Text 
          style={styles.textTitle}
          numberOfLines={1}
          ellipsizeMode={'tail'}
        >
          {subjectname}
        </Text>
        <Text 
          style={styles.textSubtitle}
          numberOfLines={3}
          ellipsizeMode={'tail'}
        >
          {`${questionCount} questions`}
        </Text>
        <Text 
          style={styles.textBody}
          numberOfLines={3}
          ellipsizeMode={'tail'}
        >
          {description}
        </Text>
      </View>
    );
  };

  _renderDeleteButton(){
    const { styles } = QuizItem;

    return(
      <PlatformTouchableIconButton
        onPress={this._handleOnPressDeleteButton}
        wrapperStyle={[styles.buttonWrapper, STYLES.lightShadow]}
        containerStyle={styles.buttonContainer}
        text={'Remove Item'}
        textStyle={styles.buttonText}
        iconName={'trash-2'}
        iconType={'feather'}
        iconColor={'white'}
        iconSize={24}
      />
    );
  };

  render(){
    const { styles } = QuizItem;
    const { width, height } = this.state;

    return(
      <Animatable.View
        style={[{width, height}, STYLES.mediumShadow,  styles.card]}
        easing={'ease-in-out'}
        ref={r => this._rootContainer = r}
        onLayout={this._handleOnLayout}
        useNativeDriver={false}
      >
        {this._renderDescription()}
        <Divider style={styles.divider}/>
        {this._renderDeleteButton()}
      </Animatable.View>
    );
  };
};

class CreateCustomQuizList extends React.PureComponent {
  static propTypes = {
    quizItems: PropTypes.array,
  };

  static styles = StyleSheet.create({
    indicatorText: {
      fontSize: 26,
      fontWeight: '400',
      marginTop: 15,
      marginBottom: 5,
      marginLeft: 12,
    },
  });

  constructor(props){
    super(props);
  };

  _handleOnPressDelete = () => {
  };
  
  _keyExtractor(item, index){
    return `${item.indexid}-${item.subjectname}`;
  };

  _renderItem = ({item, index}) => {
    return(
      <AnimatedListItem
        duration={500}
        last={5}
        {...{index}}
      >
        <QuizItem 
          onPressDelete={this._handleOnPressDelete}
          subjectData={item}  
        />
      </AnimatedListItem>
    );
  };

  _renderHeader = () => {
    const { styles } = CreateCustomQuizList;

    const { quizItems } = this.props;
    if(quizItems.length == 0) return null;

    const animation = Platform.select({
      ios: 'fadeInUp', 
      android: 'fadeInRight'
    });

    return(
      <Animatable.Text
        style={styles.indicatorText}
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        {`${quizItems.length} ${plural('Subject', quizItems.length)}`}
      </Animatable.Text>
    );
  };

  _renderFooter(){
    return(
      <IconFooter
        animateIn={false}
        hide={false}
      />
    );
  };

  render(){
    const {quizItems, ...otherProps} = this.props;
    return(
      <FlatList
        data={quizItems}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
        ListHeaderComponent={this._renderHeader}
        ListFooterComponent={this._renderFooter}
        {...otherProps}
      />
    );
  };
};

let _onPressNext;
const headerRight = <NextButton onPress={() => _onPressNext && _onPressNext()}/>

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
            rightComponent={headerRight}
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
      selectedModules: [],
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

  _onPressAlertOK = () => {
    const {selected, title, description} = this.state;
    const isValid = (isEmpty(title) || isEmpty(description));

    if(selected <= 0){
      this._headerAddCard.animatePulse();

    } else if(isValid){
      this._headerTitleCard.animatePulse();      
    };
  };

  _handleOnPressNext = () => {
    const {selected, selectedModules, title, description} = this.state;

    const isValid = (isEmpty(title) || isEmpty(description));

    if(selected <= 0){
      Alert.alert(
        'Not Enough Items',
        "Please add at least one subject to continue.",
        [{text: 'OK', onPress: this._onPressAlertOK}],
        //{cancelable: false},
      );
    } else if(isValid){
      Alert.alert(
        'No Title/Description',
        "Press 'Edit Deatils' to add a title and description.",
        [{text: 'OK', onPress: this._onPressAlertOK}],
      );
    } else {
      this.finishModal.openModal({
        selected, selectedModules, title, description
      });
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

      const {selected, selectedModules} = this.state;
      //show modal
      this.quizModal.openModal({selected, selectedModules});
    };
  };

  //callback from createquiz modal
  _handleModalOnPressAddSubject = async ({selected, selectedModules}) => {
    const prevCount = this.state.selected.length;
    const nextCount = selected.length;

    if(prevCount > nextCount){
      await this.listContainer.fadeOut(300);
      this.setState({selected, selectedModules});
      await this.listContainer.fadeInUp(300);

    } else {
      this.setState({selected, selectedModules});
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
          ref={r => this._headerTitleCard = r}
          onPressEditDetails={this._handleOnPressEditDetails}
          {...{title, description}} 
        />
        <AddSubjectsCard
          ref={r => this._headerAddCard = r}
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