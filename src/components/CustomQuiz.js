import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { Card, AnimatedListItem } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';

import { ROUTES, STYLES } from '../Constants';
import { PURPLE, RED} from '../functions/Colors';

import * as Animatable from 'react-native-animatable';
import { Divider } from 'react-native-elements';

Animatable.initializeRegistryWithDefinitions({
  listItemExit: {
    from: { scaleY: 1, scaleX: 1, opacity: 1 },
    to  : { scaleY: 0.5, scaleX: 0.5, opacity: 0 }
  }
});

export class QuizItem extends React.PureComponent {
  static PropTypes = {
    onPressDelete : PropTypes.func,
  };

  static styles = StyleSheet.create({
    card: {
      //animated styles
      opacity: 1,
      transform: [
        { scaleX: 1 }, 
        { scaleY: 1 },
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
        { scaleX: 0.75 },
        { scaleY: 0.50 },
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

    return(
      <View style={styles.descriptionContainer}>
        <Text 
          style={styles.textTitle}
          numberOfLines={1}
          ellipsizeMode={'tail'}
        >
          Module Title
        </Text>
        <Text 
          style={styles.textSubtitle}
          numberOfLines={3}
          ellipsizeMode={'tail'}
        >
          Questions used: 54/100
        </Text>
        <Text 
          style={styles.textBody}
          numberOfLines={3}
          ellipsizeMode={'tail'}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consectetur purus sit amet fermentum.
        </Text>
      </View>
    );
  };

  _renderDeleteButton(){
    const { styles } = QuizItem;

    return(
      <PlatformTouchableIconButton
        onPress={this._handleOnPressDeleteButton}
        wrapperStyle={styles.buttonWrapper}
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
  constructor(props){
    super(props);

    this.state = {
      quizItems: [
        {
          type: 'module',
          title: 'Lorum Title',
          description: 'lorum description',
          items: 300,
          moduleID : '',
          subjectID: '',
        },
        {
          type: 'module',
          title: 'Lorum Title',
          description: 'lorum description',
          items: 200,
          moduleID : '',
          subjectID: '',
        },
        {
          type: 'module',
          title: 'Lorum Title',
          description: 'lorum description',
          items: 200,
          moduleID : '',
          subjectID: '',
        },{
          type: 'module',
          title: 'Lorum Title',
          description: 'lorum description',
          items: 200,
          moduleID : '',
          subjectID: '',
        }
      ],
    };
  };

  _handleOnPressDelete = () => {
  };
  
  _keyExtractor(item){
    return `quizItem:${item.id}`;
  };

  _renderItem = ({item, index}) => {
    return(
      <AnimatedListItem
        duration={500}
        last={5}
        {...{index}}
      >
        <QuizItem onPressDelete={this._handleOnPressDelete}/>
      </AnimatedListItem>
    );
  };

  render(){
    const {props, state} = this;
    return(
      <FlatList
        data={state.quizItems}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
        {...props}
      />
    );
  };
};