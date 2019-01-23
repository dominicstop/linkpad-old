import React, { Fragment } from 'react';
import { View, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService from '../NavigationService';
import { ROUTES, STYLES, HEADER_HEIGHT } from '../Constants';
import { PURPLE } from '../Colors';

import { CreateCustomQuizList } from '../components/CustomQuiz';
import { AndroidHeader } from '../components/AndroidHeader';

import { ViewWithBlurredHeader, IconText, Card } from '../components/Views' ;
import { PlatformTouchableIconButton } from '../components/Buttons';
import { CreateQuizModal } from '../components/modals/CreateQuizModal';

import { setStateAsync } from '../functions/Utils';

import * as Animatable from 'react-native-animatable';
import { Header, createStackNavigator } from 'react-navigation';
import { Icon, Divider } from 'react-native-elements';

//android header text style
const titleStyle = { 
  flex: 1, 
  textAlign: 'center', 
  marginRight: 10,
  position: 'absolute',
  color: 'white',
};

class AddSubjectsCard extends React.PureComponent {
  static PropTypes = {
    onPressAddModule : PropTypes.func,
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
    }
  });

  constructor(props){
    super(props);

    this.imageHeader = require('../../assets/icons/file-circle.png');
  };

  _handleOnPressAddModule = () => {
    const { onPressAddModule } = this.props;
    onPressAddModule && onPressAddModule();
  };

  _handleOnPressAddSubject = () => {
    const { onPressAddSubject } = this.props;
    onPressAddSubject && onPressAddSubject();
  };


  _renderDescription(){
    const { styles } = AddSubjectsCard;

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
          <Text style={styles.headerTitle   }>Add an Quiz Item</Text>
          <Text style={styles.headerSubtitle}>100 questions in total will be selected across all the subjects you've selected.</Text>
        </View>
      </View>
    );
  };

  _renderButtons(){
    const { styles } = AddSubjectsCard;

    return(
      <PlatformTouchableIconButton
        onPress={this._handleOnPressAddSubject}
        wrapperStyle={[styles.buttonWrapper, STYLES.lightShadow]}
        containerStyle={styles.buttonContainer}
        text={'Add Subjects'}
        textStyle={styles.buttonText}
        iconName={'bookmark'}
        iconType={'entypo'}
        iconColor={'white'}
        iconSize={24}
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
    let title = 'Custom Quiz';
    if(state.params) title = state.params.title;

    return ({
      title,
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
  });

  constructor(props){
    super(props);

    this.state = {
      selected: []
    };

    //get ref from screenprops
    const { getRefCreateQuizModal } = props.screenProps;
    //get ref of modal from homescreen wrapper
    this.quizModal = getRefCreateQuizModal();
  };

  //callback from modal
  _handleModalOnPressAddSubject = (selected) => {
    this.setState({selected});
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

  _renderHeader = () => {
    return(
      <AddSubjectsCard
        onPressAddModule ={this._handleOnPressAddModule }
        onPressAddSubject={this._handleOnPressAddSubject}
      />
    );
  };

  render(){
    const { styles } = CreateQuizScreen;

    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <CreateCustomQuizList
          style={styles.flatlist}
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
          ListHeaderComponent={this._renderHeader}
          quizItems={this.state.selected}
        />
      </ViewWithBlurredHeader>
    );
  };
};