import React from 'react';
import { View, Platform, Text, Clipboard } from 'react-native';

import Constants, { STYLES } from '../Constants';
import { CustomHeader          } from '../components/Header' ;

import { SubjectModal    } from '../components/SwipableModal';
import { ModuleListStack, ModuleListScreen } from './ModuleListScreen';
import { ResourcesStack , ResourcesScreen  } from './ResourcesScreen';
import { ExamsStack     , ExamsScreen      } from './ExamsScreen';
import { TipsStack, TipsScreen       } from './TipsScreen';
import { DrawerButton } from '../components/Buttons';

import { createBottomTabNavigator, createStackNavigator, Header } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import { LinearGradient } from 'expo';
import SubjectListScreen from './SubjectListScreen';
import { IconText } from '../components/Views';


const routeConfig = {
  TabModuleListRoute: {
    screen: Platform.select({
      ios    : ModuleListStack ,
      android: ModuleListScreen,
    }),
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
    screen: Platform.select({
      ios    : ExamsStack ,
      android: ExamsScreen,
    }),
    navigationOptions: {
      tabBarLabel: 'Exams',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconName = focused? 'ios-bookmarks' : 'ios-bookmarks-outline';
        return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
      }
    }
  },
  TabResourcesRoute: {
    screen: Platform.select({
      ios    : ResourcesStack ,
      android: ResourcesScreen,
    }),
    navigationOptions: {
      tabBarLabel: 'Resources',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconName = focused? 'ios-information-circle' : 'ios-information-circle-outline';
        return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
      }
    }
  },
  TabTipsRoute: {
    screen: Platform.select({
      ios    : TipsStack ,
      android: TipsScreen,
    }),
    navigationOptions: {
      tabBarLabel: 'Tips',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconName = focused? 'ios-star' : 'ios-star-outline';
        return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
      }
    }
  },
}

//tab navigation for  homescreen
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

//android: configure shared header
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
    ...Platform.select({
      ios: {
        //configured in each tab's stack
        headerMode: 'hidden',
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

