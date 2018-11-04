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

//shared android header
export class CustomAndroidHeader extends React.PureComponent {
  render(){
    const statusbar_height = Expo.Constants.statusBarHeight;
    const header_height = Header.HEIGHT + Expo.Constants.statusBarHeight;
    return(
      <View style={{elevation: 20, width: '100%', height: header_height, backgroundColor: 'white'}}>
        <LinearGradient
          style={{flex: 1, alignItems: 'center', paddingTop: statusbar_height, paddingHorizontal: 10, flexDirection: 'row'}}
          colors={['#8400ea', '#651FFF']}
          start={[0, 1]} 
          end={[1, 0]}
        >
          {this.props.children}
        </LinearGradient>
      </View>
    );
  }
}

function getHeaderProps(routeName){
  switch(routeName){
    case 'TabModuleListRoute': return {
      title   : 'Modules',
      iconName: 'briefcase',
      iconType: 'simple-line-icon',
    };
    case 'TabExamsRoute': return {
      title   : 'Exams',
      iconName: 'bookmark',
      iconType: 'feather',
    };
    case 'TabResourcesRoute': return {
      title   : 'Modules',
      iconName: 'star-outlined',
      iconType: 'entypo',
    };
    case 'TabTipsRoute': return {
      title   : 'Modules',
      iconName: 'star-outlined',
      iconType: 'entypo',
    };
  }
}

//android: configure shared header
TabNavigation_android.navigationOptions = ({ navigation, screenProps }) => {
  const { routeName } = navigation.state.routes[navigation.state.index];

  const { title, iconName, iconType } = getHeaderProps(routeName);
  const headerProps = { iconName, iconType };

  const Header = (props) => <CustomAndroidHeader>
    <DrawerButton drawerNav={screenProps.drawerNav}/>
    <IconText
      {...headerProps}
      containerStyle={{marginLeft: 15}}
      text={title}
      textStyle={{color: 'white', fontSize: 18, fontWeight: 'bold'}}
      iconSize={22}
      iconColor={'white'}
    />
  </CustomAndroidHeader>

  return {
    title,
    header: Header,
  };
};

//ios: configure shared header
TabNavigation_ios.navigationOptions = ({ navigation, screenProps }) => {
  const { routeName } = navigation.state.routes[navigation.state.index];

  const { title, iconName, iconType } = getHeaderProps(routeName);
  const headerProps = { iconName, iconType };

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
        headerTransparent: true,
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

