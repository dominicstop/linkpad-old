import React, { Fragment } from 'react';
import { View, Platform, Text, StyleSheet, Clipboard } from 'react-native';

import Constants, { STYLES, ROUTES } from '../Constants';
import { CustomHeader } from '../components/Header' ;

import { SubjectModal     } from '../components/SwipableModal';
import { CreateQuizModal  } from '../components/modals/CreateQuizModal';
import { QuizDetailsModal } from '../components/modals/QuizDetailsModal';
import { QuizFinishModal  } from '../components/modals/QuizFinishModal';

import { ModuleListScreen } from './ModuleListScreen';
import { ResourcesScreen  } from './ResourcesScreen';
import { ExamsScreen      } from './ExamsScreen';
import { TipsScreen       } from './TipsScreen';
import { DrawerButton     } from '../components/Buttons';
import { CreateQuizScreen } from './CreateQuizScreen';

import SubjectListScreen from './SubjectListScreen';

import { createBottomTabNavigator, createStackNavigator, Header } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';
import { LinearGradient } from 'expo';
import { IconText } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import ViewResourceScreen from './ViewResource';

/**
 * each tab has a shared header because tabnav it is wrapped inside a stack
 * and is overriden manually when changing tabs
 */
const routeConfig = {
  [ROUTES.TabModuleListRoute]: {
    screen: ModuleListScreen,
    navigationOptions: {
      title: global.usePlaceholder? 'Lorum Ipsum' : 'Modules',
      tabBarLabel: 'Modules',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconName = focused? 'ios-albums' : 'ios-albums-outline';
        return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
      }
    }
  },
  [ROUTES.TabExamsRoute]: {
    screen: ExamsScreen,
    navigationOptions: {
      tabBarLabel: global.usePlaceholder? 'Sit Amit' : 'Quiz',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconName = focused? 'ios-bookmarks' : 'ios-bookmarks-outline';
        return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
      }
    }
  },
  [ROUTES.TabResourcesRoute]: {
    screen: ResourcesScreen,
    navigationOptions: {
      tabBarLabel: global.usePlaceholder? 'Dolor' : 'Resources',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconName = focused? 'ios-information-circle' : 'ios-information-circle-outline';
        return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
      }
    }
  },
  [ROUTES.TabTipsRoute]: {
    screen: TipsScreen,
    navigationOptions: {
      tabBarLabel: global.usePlaceholder? 'Justo' : 'Tips',
      tabBarIcon: ({ focused, tintColor }) => {
        const iconName = focused? 'ios-star' : 'ios-star-outline';
        return <Icon name={iconName} size={25} color={tintColor} type='ionicon' containerStyle={focused? STYLES.glow : null}/>;
      }
    }
  },
}

const TabNavigation_ios = createBottomTabNavigator(routeConfig, {
    initialRouteName: ROUTES.TabModuleListRoute,
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
    initialRouteName: ROUTES.TabModuleListRoute,
    lazy: true,
    barStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0)', 
    },
  }
);

//android: overlay custom gradient bg
class TabNavigationAndroidContainer extends React.Component {
  static router = TabNavigation_android.router;

  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1, 
      height: '100%', 
      width: '100%',
    },
    gradientBG: {
      position: 'absolute', 
      height: 56, 
      width: '100%', 
      bottom: 0, 
      left: 0, 
      right: 0,
    },
  });

  render(){
    const { styles } = TabNavigationAndroidContainer;
    const { navigation, screenProps } = this.props;

    return (
      <View style={styles.rootContainer}>
        <LinearGradient
          style={styles.gradientBG}
          colors={['#8400ea', '#651FFF']}
          start={[0, 1]} 
          end={[1, 0]}
        />
        <TabNavigation_android
          //pass down props
          {...{navigation, screenProps}}
        />
      </View>
    );
  }
}

function getHeaderProps(routeName){
  switch(routeName){
    case ROUTES.TabModuleListRoute: return {
      title: global.usePlaceholder? 'Lorum Ipsum' : 'Modules',
      name : 'briefcase',
      type : 'simple-line-icon',
    };
    case ROUTES.TabExamsRoute: return {
      title: global.usePlaceholder? 'Sit Amit' : 'Custom Quiz',
      name : 'bookmark',
      type : 'feather',
    };
    case ROUTES.TabResourcesRoute: return {
      title: global.usePlaceholder? 'Dolor Aspicing' : 'Resources',
      name : 'info',
      type : 'feather',
    };
    case ROUTES.TabTipsRoute: return {
      title: global.usePlaceholder? 'Justo Sit' : 'Tips',
      name : 'star-outlined',
      type : 'entypo',
    };
  };
};

//android: configure shared header
TabNavigationAndroidContainer.navigationOptions = ({ navigation, screenProps }) => {
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

const TabNavigation = Platform.select({
  ios    : TabNavigation_ios, 
  android: TabNavigationAndroidContainer
});

//shared header for each stack
export const TabNavigationStack = createStackNavigator({
    [ROUTES.HomeTabRoute      ]: TabNavigation,
    [ROUTES.SubjectListRoute  ]: SubjectListScreen,
    [ROUTES.ViewResourceRoute ]: ViewResourceScreen,
    [ROUTES.CreateQuizRoute   ]: CreateQuizScreen,
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
  };

  static navigationOptions = ({navigation}) => {
    let drawerLockMode = 'unlocked';
    if(navigation.state.params) drawerLockMode = navigation.state.params.enableDrawerSwipe? 'unlocked' : 'locked-closed';
    return {
      drawerLockMode    
    };
  };

  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1, 
      height: '100%', 
      width: '100%', 
      backgroundColor: 'rgb(233, 232, 239)'
    },
  });

  constructor(props){
    super(props);
    this.state = { 
      mount: false 
    };
  };

  componentDidMount(){
    //delay mount
    setTimeout(() => this.setState({mount: true}), 0);
  };

  setDrawerSwipe = (mode) => {
    const { navigation } = this.props;
    navigation && navigation.setParams({enableDrawerSwipe: mode});
  };

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
            getRefSubjectModal    : () => this.subjectModal    ,
            getRefCreateQuizModal : () => this.createQuizModal ,
            getRefQuizDetailsModal: () => this.quizDetailsModal,
            getRefQuizFinishModal : () => this.quizFinishModal ,
            getAppStackNavigation : () => this.props.navigation,
            setDrawerSwipe: this.setDrawerSwipe,
          }}
        />
      </Animatable.View>
    );
  };

  _renderModals(){
    return(
      <Fragment>
        <SubjectModal     ref={r => this.subjectModal     = r}/>
        <CreateQuizModal  ref={r => this.createQuizModal  = r}/>
        <QuizDetailsModal ref={r => this.quizDetailsModal = r}/>
        <QuizFinishModal  ref={r => this.quizFinishModal  = r}/>
      </Fragment>
    );
  };

  render(){
    const { styles } = Homescreen;
    const { mount  } = this.state;

    return (
      <View style={styles.rootContainer}>
        {mount && this._renderContents()}
        {mount && this._renderModals  ()}
      </View>
    );
  }
};

