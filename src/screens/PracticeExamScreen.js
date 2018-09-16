import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';

import   Constants, { STYLES }               from '../Constants'       ;
import { ViewWithBlurredHeader } from '../components/Views';
import { PracticeExamList      } from '../components/Exam' ;

import GradeStore from '../functions/GradeStore';

import * as Animatable             from 'react-native-animatable';
import    { createStackNavigator } from 'react-navigation';

import { Icon } from 'react-native-elements';

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

const CloseButton = (props) => {
  return (
    <TouchableOpacity
      style={{marginHorizontal: 10, flexDirection: 'row', alignItems: 'center'}}
      {...props}
    >
      <Icon
        name={'ios-close-circle-outline'}
        type={'ionicon'}
        color={'white'}
        size={26}
      />
      <Text style={{marginLeft: 7, fontSize: 18, color: 'white'}}>Close</Text>
    </TouchableOpacity>
  )
}


export class PracticeExamListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    let title = '';
    if(state.params) title = state.params.title;    
    return {
      title: title,
      headerTitleStyle: STYLES.glow,
      headerLeft: <CloseButton onPress={() => navigation.navigate('HomeRoute')}/>
    };
  };

  constructor(props){
    super(props);
    //get subjectsdata from prev. screen
    const { navigation } = this.props;
    this.DEBUG = true;
    this.state = {
      moduleData : navigation.getParam('moduleData' , null),
      subjectData: navigation.getParam('subjectData', null),
    };

    const items = this.state.subjectData.questions.length;

    this.updateTitle(0 + '/' + items);

    if(this.DEBUG){
      console.log('\n\nConstructor: PracticeExamListScreen - State:');
      console.log(this.state);
    }
  }

  async componentDidMount(){
    let index = await this.getCurrentIndexFromQuestion();
    this.updateTitleIndex(index);
  }

  updateTitle = (title) => {
    const {setParams} = this.props.navigation;
    setParams({ title: title })
  }

  updateTitleIndex = (index) => {
    const { subjectData } = this.state;
    const items = subjectData.questions.length;
    this.updateTitle(index == 0? 1 : index + '/' + items);
  }

  //TODO: move to GradeStore
  getCurrentIndexFromQuestion(){
    return new Promise(async (resolve, reject) => {
      const { subjectData, moduleData } = this.state;
      //extract id's from the current subject and modules
      const indexID_module  = moduleData.indexid ;
      const indexID_subject = subjectData.indexid;
      //get questions from state
      const questions = subjectData.questions;

      try {
        //read grades from storage
        let grades_from_store = await GradeStore.getGrades();
        if(grades_from_store != null){
          //find the answers that corresponds to the subject
          let match = grades_from_store.find((grade_item) => {
            if(this.DEBUG){
              console.log('\n\n\nGrades ID from store:');
              console.log('indexID_module : ' + grade_item.indexID_module );
              console.log('indexID_subject: ' + grade_item.indexID_subject);
              console.log('\nCurrent ID:' );
              console.log('indexID_module : ' + indexID_module );
              console.log('indexID_subject: ' + indexID_subject);
            }
            return grade_item.indexID_module == indexID_module && grade_item.indexID_subject == indexID_subject
          });
          
          if(this.DEBUG){
            console.log('\n\nMatching gradeItem from grade store: ');
            console.log(match);
          }

          if(match != null){
            let last_grade = match.answers.slice().pop();
            let last_index = last_grade.indexID_question + 1;
            resolve(last_index);
          }
          resolve(1);
        } 
      } catch(error){
        reject(error);
      }
    });
  }

  _handleOnEndReached = () => {
    console.log('onEndReached');
  }

  _onSnapToItem = (index) => {
    this.updateTitleIndex(index+1)
  }
  
  render() {
    const { subjectData, moduleData } = this.state;
    return (
      <ViewWithBlurredHeader>
        <Animatable.View
          animation={'fadeInUp'}
          duration={500}
          easing={'ease-in-out'}
          delay={750}
        >
          <PracticeExamList
            moduleData={moduleData}
            subjectData={subjectData}
            questions={subjectData.questions}
            onSnapToItem={this._onSnapToItem}
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