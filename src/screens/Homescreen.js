import React from 'react';
import { View, Platform } from 'react-native';

import Constants, { STYLES } from '../Constants';
import { CustomHeader          } from '../components/Header' ;

import { SubjectModal    } from '../components/SwipableModal';
import { ModuleListStack, ModuleListScreen } from './ModuleListScreen';
import { ResourcesStack , ResourcesScreen  } from './ResourcesScreen';
import { ExamsStack     , ExamScreen       } from './ExamsScreen';
import { TipsStack       } from './TipsScreen';
import { DrawerButton } from '../components/Buttons';

import { createBottomTabNavigator, createMaterialTopTabNavigator, createStackNavigator, Header } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import { LinearGradient } from 'expo';
import SubjectListScreen from './SubjectListScreen';



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
      screen: ModuleListScreen,
      navigationOptions: {
        title: 'Modules',
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

TabNavigation_android.navigationOptions = ({ navigation, screenProps }) => {
  const { routeName } = navigation.state.routes[navigation.state.index];

  // You can do whatever you like here to pick the title based on the route name
  let title = '';
  let headerProps = {};

  if(routeName == 'TabModuleListRoute'){
    title = 'Modules';
    headerProps = {
      iconName: 'briefcase',
      iconType: 'simple-line-icon',
    };

  } else if (routeName == 'TabExamsRoute') {
    title = 'Exams';
    headerProps = {
      iconName: 'briefcase',
      iconType: 'simple-line-icon',
    };

  } else if (routeName == 'TabResourcesRoute') {
    title = 'Resources';
    headerProps = {
      iconName: 'star-outlined',
      iconType: 'entypo',
    };

  } else if (routeName == 'TabTipsRoute') {
    title = 'Tips';
    headerProps = {
      iconName: 'briefcase',
      iconType: 'simple-line-icon',
    };

  }

  const CustomHeaderTitle = (props) => <CustomHeader 
    {...props} {...headerProps}
    iconSize={22}
    color={'white'}
  />
  

  return {
    title,
    headerTitle: CustomHeaderTitle, 
    headerLeft: <DrawerButton drawerNav={screenProps.drawerNav}/>,
  };
};

const TabNavigation = Platform.select({ios: TabNavigation_ios, android: TabNavigation_android});

//shared header for each stack
export const TabNavigationStack = createStackNavigator({
    HomeTabRoute: {
      screen: TabNavigation,
    },
    SubjectListRoute: {
      screen: SubjectListScreen,
    }, 
  }, {
    navigationOptions: {
      headerTransparent: true,
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
        color: 'white'
      },
      headerStyle: {
        backgroundColor: 'transparent',
      },
    },
    headerTransparent: true,
    cardStyle: {
      backgroundColor: 'transparent',
      opacity: 1,
    },
    transitionConfig : () => ({
      containerStyle: {
        backgroundColor: 'transparent',
      },
      transitionSpec: {
        duration: 0,
      },
    }),

  }
);




//container for tab navigation
export class Homescreen extends React.PureComponent {
  static router = TabNavigationStack.router;

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

  _renderSharedHeaderAndroid(){
    const header_height = Header.HEIGHT + Expo.Constants.statusBarHeight;
    return(
      <View style={{position: 'absolute', marginBottom: 20, width: '100%', height: header_height, backgroundColor: 'white'}}>
        <LinearGradient
          style={{flex: 1}}
          colors={['#8400ea', '#651FFF']}
          start={[0, 1]} 
          end={[1, 0]}
        />
      </View>
    );
  }

  render(){
    return (
      <View style={{flex: 1, height: '100%', width: '100%', backgroundColor: 'rgb(233, 232, 239)'}}>
        {this._renderSharedHeaderAndroid()}
        <TabNavigationStack
          navigation={this.props.navigation}
          screenProps={{
            ...this.props.screenProps,
            getRefSubjectModal   : () => this.subjectModal    ,
            getAppStackNavigation: () => this.props.navigation,
            setDrawerSwipe: this.setDrawerSwipe,
          }}
        />
        <SubjectModal ref={r => this.subjectModal = r}/>
      </View>
    );
  }
}

