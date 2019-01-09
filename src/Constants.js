import { StyleSheet, Platform } from 'react-native';

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
  HomeRoute        : 'HomeRoute'        ,
  PracticeExamRoute: 'PracticeExamRoute',
  //tabscreen routes
  TabModuleListRoute: 'TabModuleListRoute',
  TabExamsRoute     : 'TabExamsRoute'     ,
  TabResourcesRoute : 'TabResourcesRoute' ,
  TabTipsRoute      : 'TabTipsRoute'      ,
  
};

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
    shadowOpacity: 0.4,
  },
});

export default {
  NAV_BGCOLOR ,
  HEADER_PROPS,
  BG_COLOR,
  STACKNAV_PROPS,
}