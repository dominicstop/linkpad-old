import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage } from 'react-native';
import PropTypes from 'prop-types';

import { ROUTES, HEADER_HEIGHT , STYLES} from '../Constants';
import { PURPLE } from '../Colors';
import { CustomQuizStore, CustomQuiz } from '../functions/CustomQuizStore';

import NavigationService from '../NavigationService';

import { ViewWithBlurredHeader, IconFooter, Card } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';
import { CustomQuizList } from '../components/CustomQuiz';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';

import { Header, NavigationEvents } from 'react-navigation';
import { Divider } from 'react-native-elements';

// shown when no exams have been created yet
class ExamHeader extends React.PureComponent {
  static PropTypes = {
    onPress: PropTypes.func,
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
      marginTop: 15,
    },
    buttonContainer: {
      padding: 12,
    },
    buttonText: {
      color: 'white',
      fontSize: 17,
      fontWeight: '600',
    }
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
          <Text style={styles.headerTitle   }>Custom Quiz</Text>
          <Text style={styles.headerSubtitle}>Combine different modules and subjects together to create a unique set of questions.</Text>
        </View>
      </View>
    );
  };

  _renderButton(){
    const { styles } = ExamHeader;

    return(
      <PlatformTouchableIconButton
        onPress={this._handleOnPressButton}
        wrapperStyle={[styles.buttonWrapper, STYLES.lightShadow]}
        containerStyle={styles.buttonContainer}
        text={'Create Custom Quiz'}
        textStyle={styles.buttonText}
        iconName={'plus-circle'}
        iconColor={'white'}
        iconType={'feather'}
        iconSize={24}
      />
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

export class ExamsScreen extends React.Component {
  static styles = StyleSheet.create({
    scrollview: {
      paddingTop: 12,
    },
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
          <CustomQuizList
            {...{quizes}}
          />
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};