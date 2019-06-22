import React from 'react';
import { View, ScrollView, StyleSheet, Text, Platform, TouchableOpacity, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import NavigationService from '../NavigationService';
import { plural } from '../functions/Utils';
import { ROUTES, HEADER_HEIGHT , STYLES} from '../Constants';
import { PURPLE, RED } from '../Colors';
import { CustomQuizStore, CustomQuiz } from '../functions/CustomQuizStore';

import { ViewWithBlurredHeader, IconFooter, Card, AnimatedListItem } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import TimeAgo from 'react-native-timeago';
import { Divider, Icon } from 'react-native-elements';
import { Header, NavigationEvents } from 'react-navigation';
import { PlatformButton, NumberIndicator } from '../components/StyledComponents';


// shown when no exams have been created yet
class EmptyCard extends React.PureComponent {
  static styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      paddingVertical: 10,
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
  });

  constructor(props){
    super(props);
    this.imageHeader = require('../../assets/icons/folder-castle.png');
  };

  render() {
    const { styles } = EmptyCard;
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <Card>
        <Animatable.View
          style={styles.card}
          duration={500}
          easing={'ease-in-out'}
          useNativeDriver={true}
          {...{animation}}
        >
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
            <Text style={styles.headerTitle   }>No Items Yet</Text>
            <Text style={styles.headerSubtitle}>You haven't created any custom quiz yet. Press the "Create Custom Quiz" button to create your first quiz.</Text>
          </View>
        </Animatable.View>
      </Card>
    );
  };
};

class ExamHeader extends React.PureComponent {
  static propTypes = {
    onPress: PropTypes.func,
  };

  static styles = StyleSheet.create({
    card: {
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 16,
      backgroundColor: 'white',
      elevation: 10,
      shadowColor: 'black',
      shadowRadius: 4,
      shadowOpacity: 0.3,
      shadowOffset:{
        width: 2,  
        height: 3,  
      },
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
    divider: {
      margin: 13,
    },
  });

  constructor(props){
    super(props);

    this.imageHeader = require('../../assets/icons/book-mouse.png');
  };
  
  _handleOnPressButton = () => {
    const { onPress } = this.props;
    onPress && onPress();
  };

  _renderDescription(){
    const { styles } = ExamHeader;

    const title = (global.usePlaceholder
      ? 'Lorum Ipsum'
      : 'Custom Quiz'
    );

    const description = (global.usePlaceholder
      ? 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem.'
      : 'Combine different modules and subjects together to create a unique set of questions.'
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

  render() {
    const { styles } = ExamHeader;
    
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <Animatable.View
        style={styles.card}
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        {this._renderDescription()}
        <Divider style={styles.divider}/>
        <PlatformButton
          title={'Create Quiz'}
          subtitle={'Create a new cutom quiz'}
          onPress={this._handleOnPressButton}
          iconName={'ios-add-circle'}
          iconType={'ionicon'}
          iconDistance={10}
          isBgGradient={true}
          showChevron={true}
        />
      </Animatable.View>
    );
  };
};

class CustomQuizItem extends React.PureComponent {
  static propTypes = {
    index: PropTypes.number,
    quiz: PropTypes.object,
    onPressQuiz: PropTypes.func,
  }; 

  static styles = StyleSheet.create({
    container: {
      padding: 10,
      marginTop: 5,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 3,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      marginLeft: 5,
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

    const {index, quiz: {
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
          <View style={styles.titleContainer}>
            <NumberIndicator 
              value={index + 1}
              size={20}
              initFontSize={14}
            />
            <Text style={styles.title}>
              {title}
            </Text>
          </View>
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

class CustomQuizList extends React.PureComponent {
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

  _handleOnPressQuiz = (quizItem) => {
    const quiz = CustomQuiz.wrap(quizItem);
    //randomize question order
    const randomized = CustomQuiz.randomizeQuestionOrder(quiz);

    //navigate to custom quiz exam screen
    NavigationService.navigateApp(
      ROUTES.CustomQuizExamScreen, {
        quiz: randomized,
    });
  };

  _keyExtractor(item, index){
    return `${item.indexID_quiz}-${item.title}`;
  };

  _renderItem = ({item, index}) => {
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <AnimatedListItem
        duration={300}
        last={5}
        {...{index, animation}}
      >
        <CustomQuizItem 
          onPressQuiz={this._handleOnPressQuiz}
          quiz={item}
          {...{index}}
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
      android: 'zoomIn'
    });

    return(
      <Animatable.View
        style={styles.headerContainer}
        duration={300}
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
    return(
      <IconFooter hide={false}/>
    );
  };

  _renderEmpty(){
    return(
      <EmptyCard/>
    );
  };

  render(){
    const {quizes, ...otherProps} = this.props;
    return(
      <FlatList
        data={quizes || []}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
        ListHeaderComponent={this._renderHeader}
        ListFooterComponent={this._renderFooter}
        ListEmptyComponent={this._renderEmpty}
        {...otherProps}
      />
    );
  };
};

export class ExamsScreen extends React.Component {
  static styles = StyleSheet.create({

  });

  constructor(props){
    super(props);
    this.state = {
      quizes: [],
    };  
  };

  componentDidMount(){
    this.getQuizes();    
  };

  componentDidFocus = () => {
    //enable drawer when this screen is active
    const { setDrawerSwipe, getRefSubjectModal } = this.props.screenProps;
    setDrawerSwipe(true);
    this.getQuizes();
  };

  async getQuizes(){
    const quizes = await CustomQuizStore.read();
    this.setState({quizes});
  };

  handleOnPressCreateQuiz = () => {
    const { navigation } = this.props;
    navigation && navigation.navigate(ROUTES.CreateQuizRoute);
  };

  render(){
    const { styles } = ExamsScreen;
    const { quizes } = this.state;

    return(
      <ViewWithBlurredHeader hasTabBar={true} enableAndroid={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <ScrollView 
          style={styles.scrollview}
          //adjust top distance
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
        >
          <ExamHeader onPress={this.handleOnPressCreateQuiz}/>
          <CustomQuizList {...{quizes}}/>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};