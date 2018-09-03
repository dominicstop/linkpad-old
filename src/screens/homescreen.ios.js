import React from 'react';

import { NAV_BGCOLOR     } from '../Constants'        ;
import { SubjectModal    } from '../components/Modals';
import { ModuleListStack } from './ModuleListScreen'  ;
import { ExamsStack      } from './ExamsScreen';
import { SettingsStack   } from './SettingsScreen'    ;


import * as Animatable from 'react-native-animatable';
import { createBottomTabNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';
import {TipsStack} from './TipsScreen';

//TODO: fork on github, export BottomTabBar and npm install
//import {  } from 'react-navigation-tabs/dist/views/BottomTabBar';

const TabNavigation = createBottomTabNavigator({
    ModuleListRoute: {
      screen: ModuleListStack,
      navigationOptions: {
        tabBarLabel: 'Modules',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-albums' : 'ios-albums-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon'/>;
        }
      }
    },
    ExamsRoute: {
      screen: ExamsStack,
      navigationOptions: {
        tabBarLabel: 'Exams',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-bookmarks' : 'ios-bookmarks-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon'/>;
        }
      }
    },
    TipsRoute: {
      screen: TipsStack,
      navigationOptions: {
        tabBarLabel: 'Tips',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-star' : 'ios-star-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon'/>;
        }
      }
    },
    SettingsRoute: {
      screen: SettingsStack,
      navigationOptions: {
        tabBarLabel: 'Settings',
        tabBarIcon: ({ focused, tintColor }) => {
          const iconName = focused? 'ios-settings' : 'ios-settings-outline';
          return <Icon name={iconName} size={25} color={tintColor} type='ionicon'/>;
        }
      }
    },
  }, {
    tabBarOptions: {
      activeTintColor: 'rgba(255, 255, 255, 0.8)',
      inactiveTintColor: 'rgba(255, 255, 255, 0.5)',
      style: {
        backgroundColor: NAV_BGCOLOR,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
      }
    }
  }
);

//container for tab navigation
export default class Homescreen extends React.PureComponent {
  static router = TabNavigation.router;

  constructor(props){
    super(props);
  }

  componentDidMount(){
    //const { navigation } = this.props;
    //navigation.navigate('PracticeExamRoute');
  }

  render(){
    return (
      <Animatable.View 
        style={{flex: 1}}
        animation={'fadeIn'}
        duration={750}
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
          }}
        />
      </Animatable.View>
    );
  }
}