import React from 'react';
import { View, ScrollView, ViewPropTypes, Text, TouchableOpacity, AsyncStorage, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS          } from '../Constants';
import { ViewWithBlurredHeader, IconText, Card } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';
import { DrawerButton          } from '../components/Buttons';


import ModuleStore from '../functions/ModuleStore';
import TipsStore from '../functions/TipsStore';
import UserStore from '../functions/UserStore';

import { setStateAsync } from '../functions/Utils';

import { Header, createStackNavigator } from 'react-navigation';
import { Icon, Divider } from 'react-native-elements';

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
    }
  }

  _signOutAsync = async () => {
    //clear variables
    ModuleStore.clear();
    UserStore.clear();
    TipsStore.clear();
    //delete everything
    await AsyncStorage.clear();
    NavigationService.navigateRoot('AuthRoute');
  };

  async componentWillMount(){
    let user_data = await UserStore.getUserData();
    await setStateAsync(this, {user: user_data.user[0]});
  }

  _renderUserDetails(){
    const { user } = this.state;
    console.log(user);

    const name  = user.dispayName ? user.dispayName  : 'Name unknown' ;
    const email = user.email      ? user.email       : 'Email unknown';
    const phone = user.phoneNumber? user.phoneNumber : 'Phone unknown';

    const GRAY = 'rgb(175, 175, 175)';
    
    return(
      <Card>
        <Text style={{fontSize: 26, fontWeight: '800'}}>About User</Text>
        <Divider style={{marginVertical: 10}}/>
        <IconText
          //icon
          iconName={'user'}
          iconType={'feather'}
          iconColor={GRAY}
          iconSize={24}
          //text
          text={name}
          textStyle={styles.userDetail}
          //container
          containerStyle={styles.userDetailContainer}
        />
        <IconText
          //icon
          iconName={'mail'}
          iconType={'feather'}
          iconColor={GRAY}
          iconSize={24}
          //text
          text={email}
          textStyle={styles.userDetail}
          //container
          containerStyle={styles.userDetailContainer}
        />
        <IconText
          //icon
          iconName={'phone'}
          iconType={'feather'}
          iconColor={GRAY}
          iconSize={24}
          //text
          text={phone}
          textStyle={styles.userDetail}
          //container
          containerStyle={styles.userDetailContainer}
        />
      </Card>
    );
  }

  render(){
    const { user } = this.state;
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <ScrollView style={{paddingTop: Header.HEIGHT + 15, paddingHorizontal: 15}}>
          {user && this._renderUserDetails()}
          <TouchableOpacity 
            style={{padding: 10, margin: 10, backgroundColor: 'pink'}}
            onPress={() => this._signOutAsync()}
          >
            <Text>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  }
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