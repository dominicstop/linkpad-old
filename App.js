import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TopicsScreen } from './src/screens/topicsScreen'
import { ModuleList } from './src/components/cards';


const cardsData = [
  {
    moduleID  : 'mod:002',
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
        graidentBG : ['white', '#baffc9'],

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
  {
    moduleID  : 'mod:003',
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

export default class App extends React.Component {
  render() {
    return (
      <ModuleList
        containerStyle={{flex: 1, paddingTop: 30}}
        moduleList={cardsData}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
