import { StyleSheet, Platform } from 'react-native';
import { Header } from 'react-navigation';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import { PURPLE, GREY } from './Colors';


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
  TesterRoute         : 'TestRoute'           , 
  ViewImageRoute      : 'ViewImageRoute'      ,
  PracticeExamRoute   : 'PracticeExamRoute'   ,
  CustomQuizExamScreen: 'CustomQuizExamScreen',
  //drawer routes
  DrawerHomeRoute     : 'DrawerHomeRoute'     ,
  DrawerBoardExamRoute: 'DrawerBoardExamRoute',
  DrawerPaymentRoute  : 'DrawerPaymentRoute'  ,
  DrawerAboutRoute    : 'DrawerAboutRoute'    ,
  DrawerSettingsRoute : 'DrawerSettingsRoute' ,
  //custom quiz exam routes
  CustomQuizExamRoute        : 'CustomQuizExamRoute'        ,
  CustomQuizViewImageRoute   : 'CustomQuizViewImageRoute'   ,
  CustomQuizExamResultRoute  : 'CustomQuizExamResultRoute'  ,
  CustomQuizExamResultQARoute: 'CustomQuizExamResultQARoute',

  ExamTestRoute: 'ExamTestRoute',


  //preboard exam routes
  PreboardExamRoute    : 'PreboardExamRoute'    ,
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

export const SCREENPROPS_KEYS = {
  getRefSubjectModal       : 'getRefSubjectModal'       ,
  getRefCreateQuizModal    : 'getRefCreateQuizModal'    ,
  getRefQuizDetailsModal   : 'getRefQuizDetailsModal'   ,
  getRefQuizFinishModal    : 'getRefQuizFinishModal'    ,
  getRefViewCustomQuizModal: 'getRefViewCustomQuizModal',
  getAppStackNavigation    : 'getAppStackNavigation'    ,
  setDrawerSwipe           : 'setDrawerSwipe'           ,
  getRefTestExamDoneModal  : 'getRefTestExamDoneModal'  ,
};

export const IMAGE_TYPE = {
  'BASE64': 'BASE64',
  'FS_URI': 'FS_URI',
  'NONE'  : 'NONE'  ,
  'FAILED': 'FAILED',
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

export const LOAD_STATE = {
  'INITIAL': 'INITIAL',
  'LOADING': 'LOADING',
  'SUCCESS': 'SUCCESS',
  'ERROR'  : 'ERROR'  ,
};

//note: not all fonts are loaded
export const FONT_NAMES = {
  //------ Play Fair Display -------------------------
  playfair_regular        : 'playfair_regu'          ,
  playfair_bold           : 'playfair_bold'          ,
  playfair_black          : 'playfair_black'         ,
  playfair_regular_italic : 'playfair_regular_italic',
  playfair_italic_bold    : 'playfair_italic_bold'   ,
  playfair_italic_black   : 'playfair_italic_black'  ,
  //------ Taviraj -----------------------------------------
  taviraj_thin               : 'taviraj_thin'              ,
  taviraj_extra_light        : 'taviraj_extra_light'       ,
  taviraj_light              : 'taviraj_light'             ,
  taviraj_regular            : 'taviraj_regular'           ,
  taviraj_medium             : 'taviraj_medium'            ,
  taviraj_semi_bold          : 'taviraj_semi_bold'         ,
  taviraj_bold               : 'taviraj_bold'              ,
  taviraj_extra_bold         : 'taviraj_extra_bold'        ,
  taviraj_black              : 'taviraj_black'             ,
  taviraj_italic_thin        : 'taviraj_italic_thin'       ,
  taviraj_italic_extra_light : 'taviraj_italic_extra_light',
  taviraj_italic_light       : 'taviraj_italic_light'      ,
  taviraj_italic_regular     : 'taviraj_italic_regular'    ,
  taviraj_italic_medium      : 'taviraj_italic_medium'     ,
  taviraj_italic_semi_bold   : 'taviraj_italic_semi_bold'  ,
  taviraj_italic_bold        : 'taviraj_italic_bold'       ,
  taviraj_italic_extra_bold  : 'taviraj_italic_extra_bold' ,
  taviraj_italic_black       : 'taviraj_italic_black'      ,
  //------- Barlow ---------------------------------------
  barlow_thin               : 'barlow_thin'              ,
  barlow_extra_light        : 'barlow_extra_light'       ,
  barlow_light              : 'barlow_light'             ,
  barlow_regular            : 'barlow_regular'           ,
  barlow_medium             : 'barlow_medium'            ,
  barlow_semi_bold          : 'barlow_semi_bold'         ,
  barlow_bold               : 'barlow_bold'              ,
  barlow_extra_bold         : 'barlow_extra_bold'        ,
  barlow_black              : 'barlow_black'             ,
  barlow_italic_thin        : 'barlow_italic_thin'       ,
  barlow_italic_extra_light : 'barlow_italic_extra_light',
  barlow_italic_light       : 'barlow_italic_light'      ,
  barlow_italic_regular     : 'barlow_italic_regular'    ,
  barlow_italic_medium      : 'barlow_italic_medium'     ,
  barlow_italic_extra_bold  : 'barlow_italic_extra_bold' ,
  barlow_italic_semi_bold   : 'barlow_italic_semi_bold'  ,
  barlow_italic_bold        : 'barlow_italic_bold'       ,
  barlow_italic_black       : 'barlow_italic_black'      ,
  //------- Barlow Semi Condensed ---------------------------------------------------
  barlow_semicondensed_thin               : 'barlow_semicondensed_thin'              ,
  barlow_semicondensed_extra_light        : 'barlow_semicondensed_extra_light'       ,
  barlow_semicondensed_light              : 'barlow_semicondensed_light'             ,
  barlow_semicondensed_regular            : 'barlow_semicondensed_regular'           ,
  barlow_semicondensed_medium             : 'barlow_semicondensed_medium'            ,
  barlow_semicondensed_semi_bold          : 'barlow_semicondensed_semi_bold'         ,
  barlow_semicondensed_bold               : 'barlow_semicondensed_bold'              ,
  barlow_semicondensed_extra_bold         : 'barlow_semicondensed_extra_bold'        ,
  barlow_semicondensed_black              : 'barlow_semicondensed_black'             ,
  barlow_semicondensed_italic_thin        : 'barlow_semicondensed_italic_thin'       ,
  barlow_semicondensed_italic_extra_light : 'barlow_semicondensed_italic_extra_light',
  barlow_semicondensed_italic_light       : 'barlow_semicondensed_italic_light'      ,
  barlow_semicondensed_italic_regular     : 'barlow_semicondensed_italic_regular'    ,
  barlow_semicondensed_italic_medium      : 'barlow_semicondensed_italic_medium'     ,
  barlow_semicondensed_italic_extra_bold  : 'barlow_semicondensed_italic_extra_bold' ,
  barlow_semicondensed_italic_semi_bold   : 'barlow_semicondensed_italic_semi_bold'  ,
  barlow_semicondensed_italic_bold        : 'barlow_semicondensed_italic_bold'       ,
  barlow_semicondensed_italic_black       : 'barlow_semicondensed_italic_black'      ,
  //------- Barlow Condensed ------------------------------------------------
  barlow_condensed_thin               : 'barlow_condensed_thin'              ,
  barlow_condensed_extra_light        : 'barlow_condensed_extra_light'       ,
  barlow_condensed_light              : 'barlow_condensed_light'             ,
  barlow_condensed_regular            : 'barlow_condensed_regular'           ,
  barlow_condensed_medium             : 'barlow_condensed_medium'            ,
  barlow_condensed_semi_bold          : 'barlow_condensed_semi_bold'         ,
  barlow_condensed_bold               : 'barlow_condensed_bold'              ,
  barlow_condensed_extra_bold         : 'barlow_condensed_extra_bold'        ,
  barlow_condensed_black              : 'barlow_condensed_black'             ,
  barlow_condensed_italic_thin        : 'barlow_condensed_italic_thin'       ,
  barlow_condensed_italic_extra_light : 'barlow_condensed_italic_extra_light',
  barlow_condensed_italic_light       : 'barlow_condensed_italic_light'      ,
  barlow_condensed_italic_regular     : 'barlow_condensed_italic_regular'    ,
  barlow_condensed_italic_medium      : 'barlow_condensed_italic_medium'     ,
  barlow_condensed_italic_extra_bold  : 'barlow_condensed_italic_extra_bold' ,
  barlow_condensed_italic_semi_bold   : 'barlow_condensed_italic_semi_bold'  ,
  barlow_condensed_italic_bold        : 'barlow_condensed_italic_bold'       ,
  barlow_condensed_italic_black       : 'barlow_condensed_italic_black'      ,
};

export const FONT_STYLES = StyleSheet.create({
  heading1: {
    fontSize: 96,
  },
  heading2: {
    fontSize: 60,
  },
  heading3: {
    fontSize: 48,
  },
  heading4: {
    fontSize: 34,
  },
  heading5: {
    fontSize: 24,
  },
  heading6: {
    fontSize: 20,
  },
  heading7: {
    fontSize: 18,
    fontWeight: '500',
  },
  subtitle1: {
    fontSize: 16,
  },
  subtitle2: {
    fontSize: 14,
  },
  body1: {
    fontSize: 16,
  },
  body2: {
    fontSize: 14,
  },

  /** Used in the homescreen for header card */
  cardTitle: {
    textAlign: 'center',
    color: PURPLE[700],
    ...Platform.select({
      ios: {
        fontSize: 20,
        fontWeight: '800'
      },
      android: {
        fontFamily: FONT_NAMES.barlow_bold,
        fontSize: 21,
      },
    }),
  },
  cardSubtitle: {
    fontSize: 16,
    textAlign: 'left',
    ...Platform.select({
      ios: {
        marginTop: 2,
        fontWeight: '200',
        color: '#202020',
      },
      android: {
        fontWeight: '100',
        color: '#424242'
      },
    })
  },
  detailTitle: Platform.select({
    ios: {
      fontSize: 17,
      fontWeight: '500',
      color: '#161616'
    },
    android: {
      fontFamily: FONT_NAMES.barlow_semi_bold,
      fontSize: 17,
      color: '#161616',
    }
  }),
  detailSubtitle: Platform.select({
    ios: {
      fontSize: 16,
      fontWeight: '200',
      color: '#161616',
    },
    android: {
      fontFamily: FONT_NAMES.barlow_semicondensed_light,
      fontSize: 19,
      lineHeight: 19,
      color: GREY[900],
    },
  }),
});



export default {
  NAV_BGCOLOR ,
  HEADER_PROPS,
  BG_COLOR,
  STACKNAV_PROPS,
  HEADER_HEIGHT
}