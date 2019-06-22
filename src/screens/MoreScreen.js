import React from 'react';
import { View, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet, Alert } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS, HEADER_HEIGHT          } from '../Constants';
import { ViewWithBlurredHeader, IconText, Card } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';
import { DrawerButton          } from '../components/Buttons';


import { ModuleStore } from '../functions/ModuleStore';

import { setStateAsync } from '../functions/Utils';

import { Header, createStackNavigator } from 'react-navigation';
import { Icon, Divider } from 'react-native-elements';

import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

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

const MoreHeader = (props) => <CustomHeader {...props}
  iconName='menu'
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
export class MoreScreen extends React.Component {
  static navigationOptions=({navigation, screenProps}) => ({
    title: 'More',
    headerTitle: MoreHeader,
    headerLeft : <DrawerButton drawerNav={screenProps.drawerNav}/>,
  });

  constructor(props){
    super(props);
    this.state = {
      user: null,
    };
  };

  _handleOnPressModule = async () => {
    const { type, uri, name, size } = await DocumentPicker.getDocumentAsync();

    if(type === 'success'){
      console.log('URI : ' + ('' + uri  || '').slice(0, 50));
      console.log('NAME: ' + ('' + name || '').slice(0, 50));
      console.log('SIZE: ' + ('' + size || '').slice(0, 50));
      console.log('-----------------------------\n\n');

      const info = await FileSystem.getInfoAsync(uri);
      console.log('exists: ' + ('' + info.exists           || '').slice(0, 50));
      console.log('isDir : ' + ('' + info.isDirectory      || '').slice(0, 50));
      console.log('md5   : ' + ('' + info.md5              || '').slice(0, 50));
      console.log('modifi: ' + ('' + info.modificationTime || '').slice(0, 50));
      console.log('size  : ' + ('' + info.size             || '').slice(0, 50));
      console.log('uri   : ' + ('' + info.uri              || '').slice(0, 50));
      console.log('-----------------------------\n\n');

      const fileString = await FileSystem.readAsStringAsync(uri);
      console.log('fileString: ' + (fileString || '').slice(0, 100));

      const fileJSON = await JSON.parse(fileString);
      console.log('fileJSON: ' + JSON.stringify(Object.keys(fileJSON || {})));

      //modules array
      const modules = fileJSON.modules;
      //save to store
      await ModuleStore.importJSON(modules);

      Alert.alert('Import Success');
    };
  };

  render(){
    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <ScrollView
          contentInset={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
        >
          <TouchableOpacity 
            style={{padding: 10, margin: 10, backgroundColor: 'blue'}}
            onPress={this._handleOnPressModule}
          >
            <Text>Load Module JSON Data</Text>
          </TouchableOpacity>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
}

export const styles = StyleSheet.create({
  userDetail: {
    fontSize: 22,
    fontWeight : '300'
  },
  userDetailContainer: {
    marginBottom: 5,
  }
});

export const MoreStack = createStackNavigator({
    MoreRoute: {
      screen: MoreScreen,
    },
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: HEADER_PROPS,
  }
);