import React from 'react';
import { StyleSheet, Text, View, Platform, NavigatorIOS, TouchableOpacity, LayoutAnimation, UIManager, RefreshControl, Clipboard } from 'react-native';

import   SubjectListScreen       from './SubjectListScreen'  ;
import   Constants               from '../Constants'         ;
import { ModuleList            } from '../components/Modules';
import { CustomHeader          } from '../components/Header' ;
import { DrawerButton          } from '../components/Buttons';
import { ViewWithBlurredHeader } from '../components/Views'  ;
import { timeout } from '../functions/Utils';
import ModuleStore from '../functions/ModuleStore';

import { Header, createStackNavigator, NavigationEvents } from 'react-navigation';

import Chroma from 'chroma-js';
import {setStateAsync} from '../functions/Utils';

//show a list of modules
export class ModuleListScreen extends React.Component {
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
    const { setDrawerSwipe, getRefSubjectModal } = this.props.screenProps;
    setDrawerSwipe(true);

    //close the modal if it's open
    let modal = getRefSubjectModal();
    const isModalVisible = modal.isModalVisible();

    if(isModalVisible){
      modal.loadPracticeExams();
    };
  };

  componentDidMount = async () => {
    //delay rendering
    setTimeout(() => { this.setState({mount: true}) }, 500);
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

  _navigateToModule = (modules, moduleData) => {
    this.props.navigation.navigate('SubjectListRoute', {
      modules, moduleData
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
    const offset = Header.HEIGHT;
    return(
      <ViewWithBlurredHeader hasTabBar={true} enableAndroid={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {mount && <ModuleList
          contentInset={{top: offset}}
          contentOffset={{x: 0, y: -offset}}
          contentContainerStyle={{paddingTop: 15}}
          modules={this.state.modules}
          onPressModule ={this._navigateToModule}
          onPressSubject={this._onPressSubject}
          refreshControl={this._renderRefreshCotrol()}
        />}
      </ViewWithBlurredHeader>
    );
  }
}
