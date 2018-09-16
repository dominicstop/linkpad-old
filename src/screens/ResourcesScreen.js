import React from 'react';
import { StyleSheet, RefreshControl, Alert, View, Text, TouchableOpacity, AsyncStorage, FlatList, ScrollView } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService'   ;
import { HEADER_PROPS          } from '../Constants'           ;
import { ViewWithBlurredHeader } from '../components/Views'    ;
import { CustomHeader          } from '../components/Header'   ;
import { DrawerButton          } from '../components/Buttons'  ;
import { ResourceList          } from '../components/Resources';

import { timeout, setStateAsync } from '../functions/Utils';
import   ResourcesStore           from '../functions/ResourcesStore';

import * as Animatable from 'react-native-animatable';
import { Header, createStackNavigator, NavigationEvents } from 'react-navigation';
import { Icon } from 'react-native-elements';
import _ from 'lodash';

const ResourcesHeader = (props) => <CustomHeader {...props}
  iconName='star-outlined'
  iconType='entypo'
  iconSize={22}
/>

//show the setting screen
export class ResourcesScreen extends React.Component {
  static navigationOptions=({navigation, screenProps}) => ({
    title: 'Resources',
    headerTitle: ResourcesHeader,
    headerLeft : <DrawerButton drawerNav={screenProps.drawerNav}/>,
  });
  

  constructor(props){
    super(props);
    this.DEBUG = false;
    this.state = {
      resources: [],
      refreshing: false,
      showContent: false,
    };
  }

  async componentWillMount(){
    //load data from storage
    let resources = await ResourcesStore.getResources();
    await setStateAsync(this, {resources: resources});
  }

  componentDidFocus = () => {
    //mount or show contents on first show
    if(!this.state.showContent){
      this.setState({showContent: true});
    }
  }

  _onRefresh = async () => {
    const { resources } = this.state;
    let new_resources = resources;
    //set ui to refrshing
    await setStateAsync(this, {refreshing: true });
    try {
      let result = await Promise.all([
        //get resources from server
        ResourcesStore.refreshResourcesData(),
        //avoid flicker
        timeout(1000),
      ]);
      //extract resources
      new_resources = result[0];
      //check if fetched resources is different
      const isresourcesNew = _.isEqual(resources, new_resources);
      //show alert when there are no changes
      if(isresourcesNew) Alert.alert('Sorry', 'No new resources to show');

    } catch(error){
      //avoid flicker
      await timeout(750);
      if(this.DEBUG) console.log('ResourcesScreen _onRefresh error: ' + error);
      Alert.alert('Error', 'Unable to fetch new resources (Please try again)');
      this.setState({refreshing: false});
    }
    await setStateAsync(this, {refreshing: false, resources: new_resources});
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

  _renderFooter = () => {
    return (
      <Animatable.View 
        style={{marginBottom: 80}}
        delay={1000}
        animation={'fadeInUp'}
      >
        <Icon
          name={'heart'}
          type={'entypo'}
          color={'rgb(170, 170, 170)'}
          size={24}
        />
      </Animatable.View>
    )
  }

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {this.state.showContent && <ResourceList
          contentInset={{top: Header.HEIGHT + 12}}
          resources={this.state.resources}
          refreshControl={this._renderRefreshCotrol()}
          ListFooterComponent={this._renderFooter()}
        />}
      </ViewWithBlurredHeader>
    );
  }
}

export const ResourcesStack = createStackNavigator({
  resourcesRoute: {
      screen: ResourcesScreen,
    },
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: HEADER_PROPS,
  }
);

