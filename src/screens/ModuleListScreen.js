import React from 'react';
import { StyleSheet, Text, View, TabBarIOS, Platform, NavigatorIOS, TouchableOpacity, LayoutAnimation, UIManager } from 'react-native';

import { HEADER_PROPS          } from '../Constants';
import { ModuleList            } from '../components/cards'  ;
import { CustomHeader          } from '../components/Header' ;
import { ViewWithBlurredHeader } from '../components/views'  ;
import   SubjectListScreen       from './subjectListScreen'  ;

import { Header, createStackNavigator } from 'react-navigation';

import Chroma from 'chroma-js';

const cardsData = [
  {
    moduleID  : 'mod:002',
    moduleName: 'Mathematics',
    moduleDesc: 'subject description here lorum ipsum very long here lorum ipsum sit amit very long here subject description here lorum ipsum very long here lorum ipsum sit amit very long here subject description here lorum ipsum very long here lorum ipsum sit amit very long here',
    subjects: [
      {
        subjectID  : 'subj:002',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description this subject is about lorum ipsum long description here',
        progress   : {
          correct  : 20,
          mistakes : 20,
          questions: 100,
        },
        graidentBG : ['white', '#F48FB1'],
      },
      {
        subjectID  : 'subj:003',
        subjectName: 'Social Sciences',
        subjectDesc: 'lorumplaceholder description sample lorum ipsum sit amit dolor aspicing',
        progress   : {
          correct  : 90,
          mistakes : 0,
          questions: 100,
        },
        graidentBG : ['white', '#fcb69f'],
      },
      {
        subjectID  : 'subj:004',
        subjectName: 'Mental Health',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 20,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#CE93D8'],
      },
      {
        subjectID  : 'subj:003.5',
        subjectName: 'Integral Calculus',
        subjectDesc: 'Integrate integrals and the like and lorum ipsum sit amit dolor aspcing',
        progress   : {
          correct  : 80,
          mistakes : 20,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:005',
        subjectName: 'Linear Algebra',
        subjectDesc: 'Math and stuff lorum ipsum short description',
        progress   : {
          correct  : 46,
          mistakes : 25,
          questions: 100,
        },
        graidentBG : ['white', '#B39DDB'],
      },
      {
        subjectID  : 'subj:006',
        subjectName: 'Basic Statistics',
        subjectDesc: 'average lorum description stats stuff',
        progress   : {
          correct  : 30,
          mistakes : 50,
          questions: 100,
        },
        graidentBG : ['white', '#9FA8DA'],
      },
      {
        subjectID  : 'subj:007',
        subjectName: 'Advance Statistics',
        subjectDesc: 'Lorum ipsum advance stats description here abc def ghj',
        progress   : {
          correct  : 50,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#90CAF9'],
      },
      {
        subjectID  : 'subj:008',
        subjectName: 'Numerical Analysis',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 10,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80CBC4'],
      },
    ],
  },
  {
    moduleID  : 'mod:003',
    moduleName: 'History and Literature',
    moduleDesc: 'subject description here lorum ipsum',
    subjects: [
      {
        subjectID  : 'subj:001',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 50,
          mistakes : 20, 
          questions: 100,
        },
        graidentBG : ['white', '#50c9c3'],

      },
      {
        subjectID  : 'subj:002',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 20,
          mistakes : 20,
          questions: 100,
        },
        graidentBG : ['white', '#ffffba'],
      },
      {
        subjectID  : 'subj:003',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 90,
          mistakes : 0,
          questions: 100,
        },
        graidentBG : ['white', '#B39DDB'],
      },
      {
        subjectID  : 'subj:004',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#FFF59D'],
      },
    ],
  },
  {
    moduleID  : 'mod:004',
    moduleName: 'Lorum Module',
    moduleDesc: 'subject description here lorum ipsum',
    subjects: [
      {
        subjectID  : 'subj:001',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 50,
          mistakes : 20, 
          questions: 100,
        },
        graidentBG : ['white', '#039BE5'],

      },
      {
        subjectID  : 'subj:002',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 20,
          mistakes : 20,
          questions: 100,
        },
        graidentBG : ['white', '#a1c4fd'],
      },
      {
        subjectID  : 'subj:003',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 90,
          mistakes : 0,
          questions: 100,
        },
        graidentBG : ['white', '#fcb69f'],
      },
      {
        subjectID  : 'subj:004',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
    ],
  },
];

const ModulesHeader = (props) => <CustomHeader {...props}
  iconName='briefcase'
  iconType='simple-line-icon'
  iconSize={22}
/>

//show a list of modules
export class ModuleListScreen extends React.Component {
  static navigationOptions = {
    title: 'Modules',
    headerTitle: ModulesHeader,
  };

  _navigateToModule = (moduleData) => {
    this.props.navigation.navigate('SubjectListRoute', {
      moduleData: moduleData,
    })
  }

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <ModuleList 
          containerStyle={{paddingTop: Header.HEIGHT + 15, backgroundColor: 'white'}}
          moduleList={cardsData}
          onPressModule ={this._navigateToModule}
          onPressSubject={(subjectData) => alert('navigate to: ' + subjectData.subjectName)}
        />
      </ViewWithBlurredHeader>
    );
  }
}

export const ModuleListStack = createStackNavigator({
    ModuleListRoute: {
      screen: ModuleListScreen,
    },
    SubjectListRoute: {
      screen: SubjectListScreen,
    }, 
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: HEADER_PROPS,
  }
);