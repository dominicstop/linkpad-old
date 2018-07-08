import React from 'react';
import { StyleSheet, Text, View, TabBarIOS, Platform } from 'react-native';

import { ModuleList } from '../components/cards';

import { BlurView } from 'expo';

const cardsData = [
  {
    moduleID  : 'mod:002',
    moduleName: 'Lorum Module',
    moduleDesc: 'subject description here lorum ipsum',
    subjects: [
      {
        subjectID  : 'subj:001',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description here this subject is about lorum isoum sit amit dolor aspicing',
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
  {
    moduleID  : 'mod:005',
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
      {
        subjectID  : 'subj:005',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:006',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:007',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:008',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:009',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:010',
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
    moduleID  : 'mod:006',
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
      {
        subjectID  : 'subj:005',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:006',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:007',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:008',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:009',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:010',
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
    moduleID  : 'mod:007',
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
      {
        subjectID  : 'subj:005',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:006',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:007',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:008',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:009',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:010',
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
    moduleID  : 'mod:008',
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
      {
        subjectID  : 'subj:005',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:006',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:007',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:008',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:009',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:010',
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
    moduleID  : 'mod:009',
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
      {
        subjectID  : 'subj:005',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:006',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:007',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:008',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:009',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:010',
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
    moduleID  : 'mod:010',
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
      {
        subjectID  : 'subj:005',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:006',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:007',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:008',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:009',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description',
        progress   : {
          correct  : 30,
          mistakes : 10,
          questions: 100,
        },
        graidentBG : ['white', '#80d0c7'],
      },
      {
        subjectID  : 'subj:010',
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

export default class Homescreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {selectedTab: 'tabFavorites'};
  }

  setTab(tabId) {
    this.setState({selectedTab: tabId});
  }

  _renderiOS(){
    return (
      <TabBarIOS
        barStyle='default'
      >
        <TabBarIOS.Item
          systemIcon="bookmarks"
          selected={this.state.selectedTab === 'tabFavorites'}
          onPress={() => this.setTab('tabFavorites')}
        >
          <View style={{flex: 1}}>
            <ModuleList 
              containerStyle={{paddingTop: 64, backgroundColor: 'white'}}
              moduleList={cardsData}/>
            <BlurView 
              style={{position: 'absolute', width: '100%', height: 64}}
              intensity={100}
              tint={'light'}
            />
          </View>
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  }

  _renderAndroid(){

  }

  render() {
    return Platform.select({
      ios    : this._renderiOS    (),
      android: this._renderAndroid(),
    })
  }

}

var styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center'
  },
  tabText: {
    margin: 50,
    fontSize: 40
  }
});


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
