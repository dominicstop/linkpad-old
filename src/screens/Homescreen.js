import React from 'react';
import { View, Platform, Text, Clipboard } from 'react-native';

import Constants, { STYLES } from '../Constants';
import { CustomHeader          } from '../components/Header' ;

import { SubjectModal    } from '../components/SwipableModal';
import { ModuleListScreen } from './ModuleListScreen';
import { ResourcesScreen  } from './ResourcesScreen';
import { ExamsScreen      } from './ExamsScreen';
import { TipsScreen       } from './TipsScreen';
import { DrawerButton } from '../components/Buttons';

import { createBottomTabNavigator, createStackNavigator, Header } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import { LinearGradient } from 'expo';
import SubjectListScreen from './SubjectListScreen';
import { IconText } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';

/**
 * each tab has a shared header because tabnav it is wrapped inside a stack
 * and is overriden manually when changing tabs
 */
const routeConfig = {
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
    screen: ExamsScreen,
    navigationOptions: {
      tabBarLabel: 'Exams',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconName = focused? 'ios-bookmarks' : 'ios-bookmarks-outline';
        return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
      }
    }
  },
  TabResourcesRoute: {
    screen: ResourcesScreen,
    navigationOptions: {
      tabBarLabel: 'Resources',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconName = focused? 'ios-information-circle' : 'ios-information-circle-outline';
        return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
      }
    }
  },
  TabTipsRoute: {
    screen: TipsScreen,
    navigationOptions: {
      tabBarLabel: 'Tips',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconName = focused? 'ios-star' : 'ios-star-outline';
        return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
      }
    }
  },
}

const TabNavigation_ios = createBottomTabNavigator(routeConfig, {
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

const TabNavigation_android = createMaterialBottomTabNavigator(routeConfig, {
    initialRouteName: 'TabModuleListRoute',
    lazy: true,
  }
);

function getHeaderProps(routeName){
  switch(routeName){
    case 'TabModuleListRoute': return {
      title: 'Modules',
      name : 'briefcase',
      type : 'simple-line-icon',
    };
    case 'TabExamsRoute': return {
      title: 'Exams',
      name : 'bookmark',
      type : 'feather',
    };
    case 'TabResourcesRoute': return {
      title: 'Modules',
      name : 'star-outlined',
      type : 'entypo',
    };
    case 'TabTipsRoute': return {
      title: 'Modules',
      name : 'star-outlined',
      type : 'entypo',
    };
  }
}

//android: configure shared header
TabNavigation_android.navigationOptions = ({ navigation, screenProps }) => {
  const { routeName } = navigation.state.routes[navigation.state.index];

  const { title, name, type } = getHeaderProps(routeName);
  const iconProps = { name, type };

  const titleIcon = <Icon {...iconProps} color={'white'} size={22}/>

  return {
    title,
    headerLeft: <DrawerButton/>,
    //custom header
    header: props => <AndroidHeader {...{titleIcon, ...props}}/>
  };
};

//ios: configure shared header
TabNavigation_ios.navigationOptions = ({ navigation, screenProps }) => {
  const { routeName } = navigation.state.routes[navigation.state.index];

  const { title, name, type } = getHeaderProps(routeName);
  const headerProps = { name, type };

  const headerTitle = (props) => <CustomHeader 
    {...props} {...headerProps}
    iconSize={22}
    color={'white'}
  />

  return {
    title,
    headerTitle,
    headerLeft: <DrawerButton/>
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
  }, Platform.select({
    ios: {
      navigationOptions: Constants.HEADER_PROPS, 
      headerMode: 'float',
      headerTransitionPreset: 'uikit',
      headerTransparent: true,
    },
    android: {
      //overriden in tabnav
      navigationOptions: {
        headerTransparent: false,
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: 'white'
        },
      },
    }
  })
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
    this.state = { 
      mount: false 
    }
  }

  componentDidMount(){
    setTimeout(() => this.setState({mount: true}), 0);
  }

  setDrawerSwipe = (mode) => {
    this.props.navigation.setParams({enableDrawerSwipe: mode});
  }

  _renderContents(){
    return(
      <Animatable.View
        style={{flex: 1}}
        animation={'fadeIn'}
        duration={250}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        <TabNavigationStack
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

  render(){
    const { mount } = this.state;
    return (
      <View style={{flex: 1, height: '100%', width: '100%', backgroundColor: 'rgb(233, 232, 239)'}}>
        {mount && this._renderContents()}
        <SubjectModal ref={r => this.subjectModal = r}/>
      </View>
    );
  }
}

