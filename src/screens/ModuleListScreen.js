import React from 'react';
import { StyleSheet, Text, View, Platform, NavigatorIOS, TouchableOpacity, LayoutAnimation, UIManager, RefreshControl } from 'react-native';

import   SubjectListScreen       from './SubjectListScreen'  ;
import   Constants               from '../Constants'         ;
import { ModuleList            } from '../components/Cards'  ;
import { CustomHeader          } from '../components/Header' ;
import { DrawerButton          } from '../components/Buttons';
import { ViewWithBlurredHeader } from '../components/Views'  ;
import { timeout } from '../functions/Utils';
import ModuleStore from '../functions/ModuleStore';

import { Header, createStackNavigator, NavigationEvents } from 'react-navigation';

import Chroma from 'chroma-js';
import {setStateAsync} from '../functions/Utils';
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
  static navigationOptions=({navigation, screenProps}) => ({
    title: 'Modules',
    headerTitle: ModulesHeader,
    headerLeft : <DrawerButton drawerNav={screenProps.drawerNav}/>,
  });

  constructor(props){
    super(props);
    this.state = {
      modules: [], 
      refreshing: false,
      mount: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState){
    const { modules, mount } = this.state;
    return modules != nextState.modules || mount != nextState.mount;
  }

  componentDidFocus = () => {
    //enable drawer when this screen is active
    const { setDrawerSwipe } = this.props.screenProps;
    setDrawerSwipe(true);
    //close the modal if it's open
  }

  componentDidMount = async () => {
    //delay rendering
    setTimeout(() => { this.setState({mount: true}) }, 0);
  }

  _onRefresh = async () => {
    await setStateAsync(this, {refreshing: true });
    let result = await Promise.all([
      ModuleStore.refreshModuleData(),
      //avoid flicker
      timeout(1000),
    ]);
    await setStateAsync(this, {refreshing: false, modules: result[0]});
  }
  
  componentWillMount = async () => {
    //get modules from storage
    let modules = await ModuleStore.getModuleData();
    this.setState({modules: modules});
  }

  _navigateToModule = (moduleList, moduleData) => {
    this.props.navigation.navigate('SubjectListRoute', {
      moduleList: moduleList,
      moduleData: moduleData,
    });
  }

  _onPressSubject = (subjectData, moduleData) => {
    const { getRefSubjectModal, setDrawerSwipe } = this.props.screenProps;
    const { modalClosedCallback, modalOpenedCallback } = getRefSubjectModal();
    //set callbacks for modal when opened/closed
    if(!modalClosedCallback) getRefSubjectModal().modalClosedCallback = () => setDrawerSwipe(true );
    if(!modalOpenedCallback) getRefSubjectModal().modalOpenedCallback = () => setDrawerSwipe(false);

    getRefSubjectModal().openSubjectModal(moduleData, subjectData);
  }

  _renderRefreshCotrol(){
    const { refreshing } = this.state;
    const prefix = refreshing? 'Checking' : 'Pull down to check';
    return(
      <RefreshControl 
        refreshing={this.state.refreshing} 
        onRefresh={this._onRefresh}
        title={prefix + ' for changes...'}
      />
    );
  }

  render(){
    const { mount } = this.state;
    console.log('Module List rendering');
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {mount && <ModuleList
          contentInset={{top: Header.HEIGHT + 17}}
          moduleList={this.state.modules}
          onPressModule ={this._navigateToModule}
          onPressSubject={this._onPressSubject}
          refreshControl={this._renderRefreshCotrol()}
        />}
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
    navigationOptions: Constants.HEADER_PROPS,
    ...Platform.select({
      ios: {
        headerMode: 'float',
        headerTransitionPreset: 'uikit',
        headerTransparent: true,
      },
      android: {
        headerMode: 'screen',
        headerTransparent: false,
      },
    }),
  }
);
