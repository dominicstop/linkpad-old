import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Platform , Alert, TouchableNativeFeedback} from 'react-native';
import PropTypes from 'prop-types';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView, IconFooter } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader } from '../components/Header' ;

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import Expo from 'expo';
import { Header, NavigationEvents } from 'react-navigation';

import { STYLES, ROUTES } from '../Constants';
import { ResourceModel } from '../models/ResourceModel';
import { plural, isEmpty, timeout } from '../functions/Utils';
import { BLUE , GREY, PURPLE} from '../Colors';

import { Divider } from 'react-native-elements';

export class CustomQuizExamResultScreen extends React.Component {
  static navigationOptions = {
    title: 'Results',
    //headerTitle: ViewResourceHeader,
    //custom android header
    ...Platform.select({
      android: { header: props => <AndroidHeader {...props}/> }
    }),
  };

  render(){
    const offset = Header.HEIGHT;

    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <ScrollView
          //adjust top distance
          contentInset ={{top: offset}}
          contentOffset={{x: 0, y: -offset}}
        >
          <AnimateInView duration={500}>
            <Text>Hello World</Text>
            <Text>Hello World</Text>
          </AnimateInView>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};
