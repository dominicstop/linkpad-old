import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage } from 'react-native';
import PropTypes from 'prop-types';

import Constants         from '../Constants';
import NavigationService from '../NavigationService';

import { ViewWithBlurredHeader, IconFooter, Card } from '../components/Views';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';

import { Header, createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';

export class ExamsScreen extends React.Component {
  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={true} enableAndroid={false}>
        <ScrollView style={{paddingTop: Header.HEIGHT + 15, paddingHorizontal: 0}}>
          <NoExamsCard/>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};

// shown when no exams have been created yet
export class NoExamsCard extends React.PureComponent {
  static styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
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
    detailTitle: Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '500'
      },
      android: {
        fontSize: 17,
        fontWeight: '900'
      }
    }),
    detailSubtitle: Platform.select({
      ios: {
        fontSize: 16,
        fontWeight: '200'
      },
      android: {
        fontSize: 16,
        fontWeight: '100',
        color: '#424242'
      },
    }),
  });

  constructor(props){
    super(props);

    this.imageHeader = require('../../assets/icons/book-mouse.png');
  };

  render() {
    const { styles } = NoExamsCard;
    
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
        </Card>
      </Animatable.View>
    );
  };
};