import React from 'react';
import { View, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS          } from '../Constants';
import { ViewWithBlurredHeader } from '../components/views' ;
import { CustomHeader          } from '../components/Header';


import { Header, createStackNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';


const HeaderProps = {
  headerTransparent: true,
  headerTintColor: 'white',
  headerTitleStyle: {
    fontWeight: 'bold',
    color: 'white'
  },
  headerStyle: {
    backgroundColor: 'rgba(48, 0, 247, 0.7)',
  },
}

const SettingsHeader = (props) => <CustomHeader {...props}
  iconName='settings'
  iconType='simple-line-icon'
  iconSize={22}
/>

export class SettingItem extends React.PureComponent {
  static propTypes = {
    text: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    onPress: PropTypes.func,
    //icon props
    iconName : PropTypes.string,
    iconColor: PropTypes.string,
    iconType : PropTypes.string,
    iconSize : PropTypes.number,
    iconProps: PropTypes.object,
    //style
    containerStyle: ViewPropTypes.style ,
    textStyle     : Text.propTypes.style,
  }

  render(){
    const {text, iconName, iconColor, iconType, iconSize, containerStyle, textStyle, children, iconProps, ...otherProps} = this.props;
    return(
      <TouchableOpacity
        style={[{flexDirection: 'row', alignItems: 'center'}, containerStyle]}
        {...otherProps}
      >
        <Icon
          name ={iconName }
          color={iconColor}
          type ={iconType }
          size ={iconSize }
          {...iconProps}
        />
        <Text style={[{marginLeft: 8, flex: 1}, textStyle]}>
          {text}
        </Text>
        <Icon
          name ={'chevron-right'}
          color={'grey'         }
          type ={'feather'      }
          size ={25}
        />     
      </TouchableOpacity>
    );
  }
}

//show the setting screen
export class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
    headerTitle: SettingsHeader,
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    NavigationService.navigate('AuthRoute');
  };

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <ScrollView style={{paddingTop: Header.HEIGHT + 15, paddingHorizontal: 20}}>
          <SettingItem
            text   ={'Log Out'}
            onPress={this._signOutAsync}
            //icon props
            iconName={'log-out'}
            iconType={'feather'}
            iconSize={25}
            //style
            containerStyle={{}}
            textStyle     ={{}}
          />
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  }
}

export const SettingsStack = createStackNavigator({
    SettingsRoute: {
      screen: SettingsScreen,
    },
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: HEADER_PROPS,
  }
);