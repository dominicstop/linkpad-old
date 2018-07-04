import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TopicsScreen } from './screens/topicsScreen'
import { ModuleList } from './components/cards';

import { Pie } from 'react-native-pathjs-charts'


const cardsData = [
  {
    moduleID  : 'mod:001',
    moduleName: 'Lorum Module',
    moduleDesc: 'subject description here lorum ipsum',
    subjects: [
      {
        subjectID  : 'subj:001',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
      },
      {
        subjectID  : 'subj:002',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
      },
      {
        subjectID  : 'subj:003',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
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
