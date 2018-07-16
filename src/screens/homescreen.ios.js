import React from 'react';
import { StyleSheet, Text, View, TabBarIOS, Platform, NavigatorIOS, TouchableOpacity, LayoutAnimation, UIManager } from 'react-native';

import { ModuleList            } from '../components/cards'  ;
import { CustomHeader          } from '../components/Header' ;
import { ViewWithBlurredHeader } from '../components/views'  ;
import { ExpandCollapse        } from '../components/buttons';

import { Header } from 'react-navigation';


const cardsData = [
  {
    moduleID  : 'mod:002',
    moduleName: 'Lorum Module',
    moduleDesc: 'subject description here lorum ipsum very long here lorum ipsum sit amit very long here subject description here lorum ipsum very long here lorum ipsum sit amit very long here subject description here lorum ipsum very long here lorum ipsum sit amit very long here',
    subjects: [
      {
        subjectID  : 'subj:001',
        subjectName: 'Lorum Subject',
        subjectDesc: 'Lorum Ipsum Description here this subject is about lorum isoum sit amit dolor aspicing long text here lorum ipsum sit amit dolor aspicing description sample text here very long',
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
  /*
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
  */
];

const ModulesHeader = (props) => <CustomHeader {...props}
  iconName='briefcase'
  iconType='simple-line-icon'
  iconSize={22}
/>

export default class Homescreen extends React.Component {
  static navigationOptions = {
    title: 'Modules',
    headerTitle: ModulesHeader,
  };

  constructor(props) {
    super(props);
    this.state = {selectedTab: 'tabFavorites'};
  }

  componentDidMount(){
    //this._navigateToModule(cardsData[0]);
  }

  setTab(tabId) {
    this.setState({selectedTab: tabId});
  }

  _navigateToModule = (moduleData) => {
    this.props.navigation.navigate('SubjectListRoute', {
      moduleData: moduleData,
    })
  }

  render(){
    return (
      <TabBarIOS
        barStyle='default'
      >
        <TabBarIOS.Item
          systemIcon="bookmarks"
          selected={this.state.selectedTab === 'tabFavorites'}
          onPress={() => this.setTab('tabFavorites')}
        >
          <ViewWithBlurredHeader>
            <ModuleList 
              containerStyle={{paddingTop: Header.HEIGHT - 5, backgroundColor: 'white'}}
              moduleList={cardsData}
              onPressModule ={this._navigateToModule}
              onPressSubject={(subjectData) => alert('navigate to: ' + subjectData.subjectName)}
            />
          </ViewWithBlurredHeader>
        </TabBarIOS.Item>
      </TabBarIOS>
    );
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
