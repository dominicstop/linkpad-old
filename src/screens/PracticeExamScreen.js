import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';

import   Constants, { STYLES   } from '../Constants'       ;
import { ViewWithBlurredHeader } from '../components/Views';
import { PracticeExamList      } from '../components/Exam' ;

import IncompletePracticeExamStore from '../functions/IncompletePracticeExamStore';


import * as Animatable          from 'react-native-animatable';
import { createStackNavigator } from 'react-navigation';
import { Icon                 } from 'react-native-elements';
import {ModuleItemModel, SubjectItem} from '../functions/ModuleStore';

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
    const { navigation } = this.props;
    this.state = {
      //get data from prev. screen
      moduleData : navigation.getParam('moduleData' , null),
      subjectData: navigation.getParam('subjectData', null),
    };

    this.DEBUG = false;

    //this.updateTitleIndex(1);
  };

  async componentDidMount(){
    return;
    const last_index    = await this.getLastAnsweredIndex();
    const display_index = last_index > 0? last_index + 2 : 1;
    this.updateTitleIndex(display_index);


    //test
    const { moduleData, subjectData } = this.state;
    //wrap data inside models
    let moduleModel  = new ModuleItemModel(moduleData );
    let subjectModel = new SubjectItem    (subjectData);

    //extract indexid from subjectdata
    const { indexid } = subjectModel.get();
    //get matching subject and overwrite
    subjectModel = moduleModel.getSubjectByID(indexid);

    //get initialized iPE model
    let practiceExamModel = subjectModel.getIncompletePracticeExamModel();
    console.log(practiceExamModel.data);
  }

  //returns the last item's index in iPE's store
  async getLastAnsweredIndex(){
    return;
    const { subjectData, moduleData } = this.state;
    //extract id's from the current subject and modules
    const indexID_module  = moduleData .indexid;
    const indexID_subject = subjectData.indexid;

    //find match from store
    let matched_iPE = await IncompletePracticeExamStore.findMatch({indexID_module, indexID_subject}, true);
    let last_index = 0;

    if(matched_iPE.hasMatch){
      //get the last question from array
      let last_question = matched_iPE.match_iPE.answers.slice().pop();
      //update last index
      last_index = last_question.indexID_question;
    } 
    return (last_index);
  }

  updateTitle = (title) => {
    const {setParams} = this.props.navigation;
    setParams({ title: title })
  }

  updateTitleIndex = (index) => {
    return;
    const { subjectData } = this.state;
    const items = subjectData.questions.length;
    const prefix = 'Question ';
    const suffix = index == 0? 1 : index + '/' + items;
    this.updateTitle(prefix + suffix);
  }

  _handleOnEndReached = () => {
    console.log('onEndReached');
  }

  _onSnapToItem = (index) => {
    return;
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
            {...{moduleData, subjectData}}
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