import React from 'react';
import { View, ScrollView } from 'react-native';

import { ViewWithBlurredHeader } from '../components/views' ;
import { CustomHeader          } from '../components/Header';
import { IconButton            } from '../components/buttons';

import { Header, createStackNavigator } from 'react-navigation';

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

//show the setting screen
export class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
    headerTitle: SettingsHeader,
  };

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <ScrollView style={{paddingTop: Header.HEIGHT + 15, paddingHorizontal: 20}}>
          <IconButton
            text   ={'Log Out'}
            onPress={() => {
              alert();
            }}
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
    navigationOptions: HeaderProps,
  }
);