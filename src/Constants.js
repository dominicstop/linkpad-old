import { StyleSheet, Platform } from 'react-native';
import { Header } from 'react-navigation';

import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';

export const ROUTES = {
  //rootnav routes
  AuthLoading: 'AuthLoading',
  AppRoute   : 'AppRoute'   ,
  AuthRoute  : 'AuthRoute'  ,
  //authstack routes
  WelcomeRoute: 'WelcomeRoute',
  LoginRoute  : 'LoginRoute'  ,
  SignUpRoute : 'SignUpRoute' ,
  //appstack routes
  HomeRoute           : 'HomeRoute'           ,
  ViewImageRoute      : 'ViewImageRoute'      ,
  PracticeExamRoute   : 'PracticeExamRoute'   ,
  CustomQuizExamScreen: 'CustomQuizExamScreen',
  //tabscreen routes
  TabModuleListRoute: 'TabModuleListRoute',
  TabExamsRoute     : 'TabExamsRoute'     ,
  TabResourcesRoute : 'TabResourcesRoute' ,
  TabTipsRoute      : 'TabTipsRoute'      ,
  //tabstack routes
  HomeTabRoute     : 'HomeTabRoute'     ,
  SubjectListRoute : 'SubjectListRoute' ,
  ViewResourceRoute: 'ViewResourceRoute',
  ViewTipRoute     : 'ViewTipRoute'     ,
  CreateQuizRoute  : 'CreateQuizRoute'  ,
};


export const HEADER_HEIGHT = Header.HEIGHT + (
  isIphoneX()? getStatusBarHeight(false) : 0
);

export const NAV_BGCOLOR = 'rgba(48, 0, 247, 0.6)';
export const BG_COLOR    = 'rgb(233, 232, 239)'   ;

export const HEADER_PROPS = Platform.select({
  ios: {
    headerTransparent: true,
    headerTintColor: 'white',
    headerTitleStyle: {
      fontWeight: 'bold',
      color: 'white'
    },
  },
  android: {
    headerTransparent: false,
    headerTintColor: 'white',
    headerTitleStyle: {
      fontWeight: 'bold',
      color: 'white'
    },
  },
});

export const STACKNAV_PROPS = {
  transitionConfig: () => ({
    containerStyle: {
      backgroundColor: BG_COLOR,
    }
  })
}

export const STYLES = StyleSheet.create({
  lightShadow: {
    shadowOffset:{  width: 2,  height: 3,  },
    shadowColor: 'black',
    shadowRadius: 2,
    shadowOpacity: 0.2,
  },
  mediumShadow: {
    shadowOffset:{  width: 2,  height: 3,  },
    shadowColor: 'black',
    shadowRadius: 4,
    shadowOpacity: 0.3,
  },
  glow: {
    shadowOffset:{ height: 0, width: 0 },
    shadowColor: 'white',
    shadowRadius: 5,
    shadowOpacity: 0.2,
  },
});

export default {
  NAV_BGCOLOR ,
  HEADER_PROPS,
  BG_COLOR,
  STACKNAV_PROPS,
  HEADER_HEIGHT
}