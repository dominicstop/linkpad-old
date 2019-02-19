import React, { Fragment } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { plural } from '../functions/Utils';
import { SubjectItem } from '../functions/ModuleStore';
import NavigationService from '../NavigationService';

import { Card, AnimatedListItem } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';

import { ROUTES, STYLES } from '../Constants';
import { PURPLE, RED } from '../Colors';

import * as Animatable from 'react-native-animatable';
import { Divider, Icon } from 'react-native-elements';
import TimeAgo from 'react-native-timeago';

Animatable.initializeRegistryWithDefinitions({
  listItemExit: {
    from: { scaleY: 1, scaleX: 1, opacity: 1 },
    to  : { scaleY: 0.5, scaleX: 0.5, opacity: 0 }
  }
});

class QuizItem extends React.PureComponent {
  static PropTypes = {
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
      backgroundColor: RED[200],
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

export class CreateCustomQuizList extends React.PureComponent {
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
    return(<View style={{marginBottom: 75}}/>);
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

class CustomQuizItem extends React.PureComponent {
  static propTypes = {
    quiz: PropTypes.object,
    onPressQuiz: PropTypes.func,
  }; 

  static styles = StyleSheet.create({
    container: {
      padding: 10,
      marginTop: 5,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
    },
    description: {
      fontSize: 18,
    },
    time: {
      fontSize: 16,
      fontWeight: '100',
    },
  });

  _handleOnPressQuiz = () => {
    const { onPressQuiz, quiz } = this.props;
    onPressQuiz && onPressQuiz(quiz);
  };

  render(){
    const { styles } = CustomQuizItem;

    const {quiz: {
      title            = "Uknown Title", 
      description      = "Uknown Description", 
      timestampCreated = 0, 
      questions        = [],
    }} = this.props;

    const time = timestampCreated * 1000;
    const questionCount = questions.length;

    const prefix = (global.usePlaceholder
      ? 'Ultricies'
      : 'Subject'
    );

    return(
      <Card style={styles.container}>
        <TouchableOpacity onPress={this._handleOnPressQuiz}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time} >
            {`${questionCount} ${plural(prefix, questionCount)} — `}
            <TimeAgo {...{time}}/>
          </Text>
          <Divider style={{margin: 5}}/>
          <Text style={styles.description}>{description}</Text>
        </TouchableOpacity>
      </Card>
    );
  };
};

export class CustomQuizList extends React.PureComponent {
  static propTypes = {
    quizes: PropTypes.array,
  };

  static defaultProps = {
    quizes: [],
  };

  static styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      marginLeft: 12,
      marginTop: 20,
    },
    indicatorText: {
      fontSize: 26,
      fontWeight: '500',
      marginLeft: 8,
    },
  });

  _handleOnPressQuiz = (quiz) => {
    //navigate to custom quiz exam screen
    NavigationService.navigateApp(ROUTES.CustomQuizExamScreen, {quiz});
  };

  _keyExtractor(item, index){
    return `${item.indexID_quiz}-${item.title}`;
  };

  _renderItem = ({item, index}) => {
    return(
      <AnimatedListItem
        duration={500}
        last={5}
        {...{index}}
      >
        <CustomQuizItem 
          onPressQuiz={this._handleOnPressQuiz}
          quiz={item}  
        />
      </AnimatedListItem>
    );
  };

  _renderHeader = () => {
    const { styles } = CustomQuizList;
    
    const { quizes } = this.props;
    
    if(!quizes) return null;
    if(quizes.length == 0) return null;

    const prefix = (global.usePlaceholder
      ? 'Ullamcorper' : 'Quiz'
    );

    const animation = Platform.select({
      ios: 'fadeInUp', 
      android: 'fadeInRight'
    });

    return(
      <Animatable.View
        style={styles.headerContainer}
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <Icon
          name={'clipboard-pencil'}
          type={'foundation'}
          size={28}
          color={'rgb(125, 125, 125)'}
        />
        <Text style={styles.indicatorText}>
          {`${quizes.length} ${plural(prefix, quizes.length, 'es')}`}
        </Text>
      </Animatable.View>
    );
  };

  _renderFooter(){
    return(<View style={{marginBottom: 75}}/>);
  };

  render(){
    const {quizes, ...otherProps} = this.props;
    return(
      <FlatList
        data={quizes}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
        ListHeaderComponent={this._renderHeader}
        ListFooterComponent={this._renderFooter}
        {...otherProps}
      />
    );
  };
};