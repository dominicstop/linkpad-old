import { StyleSheet } from 'react-native';


export const NAV_BGCOLOR = 'rgba(48, 0, 247, 0.6)';

export const HEADER_PROPS = {
  headerTransparent: true,
  headerTintColor: 'white',
  headerTitleStyle: {
    fontWeight: 'bold',
    color: 'white'
  },
  headerStyle: {
    backgroundColor: NAV_BGCOLOR,
  },
}

export const STYLES = StyleSheet.create({
  mediumShadow: {
    shadowOffset:{  width: 2,  height: 3,  },
    shadowColor: 'black',
    shadowRadius: 4,
    shadowOpacity: 0.5,
  },
});

export default {
  NAV_BGCOLOR ,
  HEADER_PROPS,
}