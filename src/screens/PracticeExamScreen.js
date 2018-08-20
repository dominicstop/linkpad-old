import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

import   Constants               from '../Constants'       ;
import { ViewWithBlurredHeader } from '../components/Views';
import { PracticeExamList      } from '../components/Exam' ;

import * as Animatable             from 'react-native-animatable';
import    { createStackNavigator } from 'react-navigation';

export class PracticeExamListScreen extends React.Component {
  render() {
    return (
      <ViewWithBlurredHeader>
        <Animatable.View
          animation={'fadeInUp'}
          duration={500}
          easing={'ease-in-out'}
        >
          <PracticeExamList/>
        </Animatable.View>
      </ViewWithBlurredHeader>
    );
  }
}
export const PracticeExamStack = createStackNavigator({
  PracticeExamListRoute: {
      screen: PracticeExamListScreen,
    },
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: Constants.HEADER_PROPS,
  }
);