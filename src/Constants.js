import { StyleSheet } from 'react-native';


export const NAV_BGCOLOR = 'rgba(48, 0, 247, 0.6)';
export const BG_COLOR    = 'rgb(233, 232, 239)'   ;

export const HEADER_PROPS = {
  headerTransparent: true,
  headerTintColor: 'white',
  headerTitleStyle: {
    fontWeight: 'bold',
    color: 'white'
  },
  headerStyle: {
    //backgroundColor: NAV_BGCOLOR,
  },
}

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
    shadowRadius: 3,
    shadowOpacity: 0.4,
  },
  glow: {
    shadowOffset:{ height: 0, width: 0 },
    shadowColor: 'white',
    shadowRadius: 9,
    shadowOpacity: 0.7,
  },
});

export default {
  NAV_BGCOLOR ,
  HEADER_PROPS,
  BG_COLOR,
  STACKNAV_PROPS,
}