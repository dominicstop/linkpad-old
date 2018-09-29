import React from 'react';
import { Dimensions, Platform } from 'react-native';

import Constants, { STYLES } from '../Constants';

import { SubjectModal    } from '../components/Modals';
import { ModuleListStack } from './ModuleListScreen';
import { ResourcesStack  } from './ResourcesScreen';
import { ExamsStack      } from './ExamsScreen';
import { TipsStack       } from './TipsScreen';

import { createBottomTabNavigator, createMaterialTopTabNavigator } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';

//TODO: fork on github, export BottomTabBar and npm install
//import {  } from 'react-navigation-tabs/dist/views/BottomTabBar';

//tab navigation for  homescreen
const TabNavigation_ios = createBottomTabNavigator({
    TabModuleListRoute: {
      screen: ModuleListStack,
      navigationOptions: {
        tabBarLabel: 'Modules',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-albums' : 'ios-albums-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
        }
      }
    },
    TabExamsRoute: {
      screen: ExamsStack,
      navigationOptions: {
        tabBarLabel: 'Exams',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-bookmarks' : 'ios-bookmarks-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
        }
      }
    },
    TabResourcesRoute: {
      screen: ResourcesStack,
      navigationOptions: {
        tabBarLabel: 'Resources',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-information-circle' : 'ios-information-circle-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
        }
      }
    },
    TabTipsRoute: {
      screen: TipsStack,
      navigationOptions: {
        tabBarLabel: 'Tips',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-star' : 'ios-star-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
        }
      }
    },
  }, {
    initialRouteName: 'TabModuleListRoute',
    lazy: false,
    tabBarOptions: {
      activeTintColor: 'rgba(255, 255, 255, 0.8)',
      inactiveTintColor: 'rgba(255, 255, 255, 0.4)',
      style: {
        backgroundColor: Platform.OS == 'ios'? null : Constants.NAV_BGCOLOR,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
      }
    }
  }
);

const TabNavigation_android = createBottomTabNavigator({
    TabModuleListRoute: {
      screen: ModuleListStack,
      navigationOptions: {
        tabBarLabel: 'Modules',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-albums' : 'ios-albums-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
        }
      }
    },
    TabExamsRoute: {
      screen: ExamsStack,
      navigationOptions: {
        tabBarLabel: 'Exams',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-bookmarks' : 'ios-bookmarks-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
        }
      }
    },
    TabResourcesRoute: {
      screen: ResourcesStack,
      navigationOptions: {
        tabBarLabel: 'Resources',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-information-circle' : 'ios-information-circle-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
        }
      }
    },
    TabTipsRoute: {
      screen: TipsStack,
      navigationOptions: {
        tabBarLabel: 'Tips',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-star' : 'ios-star-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
        }
      }
    },
  }, {
    initialRouteName: 'TabModuleListRoute',
    lazy: false,
    tabBarOptions: {
      activeTintColor: 'rgba(255, 255, 255, 0.8)',
      inactiveTintColor: 'rgba(255, 255, 255, 0.4)',
      style: {
        backgroundColor: Platform.OS == 'ios'? null : Constants.NAV_BGCOLOR,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
      }
    }
  }
);

const TabNavigation = Platform.select({ios: TabNavigation_ios, android: TabNavigation_android});

//container for tab navigation
export class Homescreen extends React.PureComponent {
  static router = TabNavigation.router;

  static navigationOptions = {
    drawerLockMode: 'locked-closed',
  }

  static navigationOptions = ({navigation}) => {
    let drawerLockMode = 'unlocked';
    if(navigation.state.params) drawerLockMode = navigation.state.params.enableDrawerSwipe? 'unlocked' : 'locked-closed';
    return {
      drawerLockMode    
    }
  } 

  constructor(props){
    super(props);
  }

  setDrawerSwipe = (mode) => {
    this.props.navigation.setParams({enableDrawerSwipe: mode});
  }

  render(){
    return (
      <Animatable.View 
        style={{flex: 1, height: '100%', width: '100%', backgroundColor: 'rgb(233, 232, 239)'}}
        animation={'fadeIn'}
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        <SubjectModal ref={r => this.subjectModal = r}/>
        <TabNavigation
          navigation={this.props.navigation}
          screenProps={{
            ...this.props.screenProps,
            getRefSubjectModal   : () => this.subjectModal    ,
            getAppStackNavigation: () => this.props.navigation,
            setDrawerSwipe: this.setDrawerSwipe,
          }}
        />
      </Animatable.View>
    );
  }
}

