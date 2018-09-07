import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

import   Constants               from '../Constants'       ;
import { ViewWithBlurredHeader } from '../components/Views';
import { PracticeExamList      } from '../components/Exam' ;

import * as Animatable             from 'react-native-animatable';
import    { createStackNavigator } from 'react-navigation';

export class PracticeExamHeader extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      currentIndex: 0,
    }
  }

  updateIndex = (index) => {
    this.setState({currentIndex: index});
  }

  render(){
    return(
      <Text>Hello {this.state.currentIndex}</Text>
    );
  }
}

export class PracticeExamListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    let title = '';
    if(state.params) title = state.params.title;    
    return {
      title: title,
    };
  };

  constructor(props){
    super(props);
    //get subjectsdata from prev. screen
    const { navigation } = this.props;
    this.state = {
      subjectData: navigation.getParam('subjectData', null),
    };
  }

  componentDidMount(){
    this.updateTitle(0 + '/100');
  }

  updateTitle = (title) => {
    const {setParams} = this.props.navigation;
    setParams({ title: title })
  }

  _handleOnEndReached = () => {
    console.log('onEndReached');
  }
  
  render() {
    const { subjectData } = this.state;
    return (
      <ViewWithBlurredHeader>
        <Animatable.View
          animation={'fadeInUp'}
          duration={500}
          easing={'ease-in-out'}
          delay={750}
        >
          <PracticeExamList
            questions={subjectData.questions}
            onSnapToItem={(index) => this.updateTitle(index + '/100')}
            onEndReached={() => alert('PracticeExamListScreen')}
          />
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