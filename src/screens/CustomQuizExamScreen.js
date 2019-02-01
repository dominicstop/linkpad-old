import React, { Fragment } from 'react';
import { View, LayoutAnimation, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { plural } from '../functions/Utils';
import { SubjectItem } from '../functions/ModuleStore';

import { ViewWithBlurredHeader, Card, AnimatedListItem } from '../components/Views';
import { PlatformTouchableIconButton } from '../components/Buttons';
import { AndroidHeader, AndroidBackButton} from '../components/AndroidHeader';


import Constants from '../Constants'
import { ROUTES, STYLES } from '../Constants';
import { PURPLE, RED } from '../Colors';

import { createStackNavigator } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Divider, Icon } from 'react-native-elements';
import TimeAgo from 'react-native-timeago';

class HeaderTitle extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: 'white',
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
    title: {
      fontSize: 16,
      fontWeight: '200',
    },
    titleCount: {
      fontWeight: '600'
    },
  });

  constructor(props){
    super(props);
    this.state = {
      
    };
  };

  _renderText(){
    const { styles } = HeaderTitle;

    return(
      <Text style={styles.title}>
        {'Question: '}
        <Text style={styles.titleCount}>
          {`2/10`}
        </Text>
      </Text>
    );
  };

  render(){
    const { styles } = HeaderTitle;

    return(
      <Animatable.View 
        style={styles.container}
        animation={'pulse'}
        duration={10000}
        delay={3000}
        iterationCount={'infinite'}
        useNativeDriver={true}
      >
        {this._renderText()}
      </Animatable.View>
    );
  };
};

//access callbacks and references
let References = {
  HeaderTitle: null,
};

const headerTitle = () => <HeaderTitle
  ref={r => References.HeaderTitle = r}
/>

class CustomQuizExamScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    return ({
      headerTitle,
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

  render(){
    return (
      <ViewWithBlurredHeader hasTabBar={false}>
      </ViewWithBlurredHeader>
    );
  };
};

export const CustomQuizExamStack = createStackNavigator({
  CustomQuizExamRoute: {
      screen: CustomQuizExamScreen,
    },
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: {
      gesturesEnabled: false,
      ...Constants.HEADER_PROPS
    },
  }
);