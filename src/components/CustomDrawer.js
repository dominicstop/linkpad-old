import React from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TextInput, AsyncStorage } from 'react-native';

import   NavigationService   from '../NavigationService';
import { IconButton        } from '../components/Buttons';
import { IconText          } from '../components/Views';
import { setStateAsync     } from '../functions/Utils';

import ModuleStore from '../functions/ModuleStore';
import TipsStore from '../functions/TipsStore';
import UserStore from '../functions/UserStore';

import { DrawerItems, NavigationActions } from 'react-navigation';
import { BlurView, LinearGradient } from 'expo';
import * as Animatable from 'react-native-animatable';
import { Icon, Divider } from 'react-native-elements';
import {STYLES} from '../Constants';

export class CustomDrawer extends React.PureComponent {
  constructor(props){
    super(props);
    this.DEBUG = false;
    this.state = {
      user: null,
    }
  }

  async componentWillMount(){
    let user_data = await UserStore.getUserData();
    await setStateAsync(this, {user: user_data.user});
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

  _onItemPress = (navigation) => {
    if ( navigation.focused == false ){
      const navigateAction = NavigationActions.navigate({
        routeName: navigation.route.routeName,
      });
      this.props.navigation.dispatch(navigateAction);
    }
  }
  
  _renderHeader = () => {
    const { user } = this.state;
    if(this.DEBUG) console.log(user);

    const fname   = user.firstname? user.firstname : 'firstname';
    const lname   = user.lastname ? user.lastname  : 'lastname' ;
    const name    = fname + ' ' + lname;
    const letters = fname.charAt(0) + lname.charAt(0);
    const premium = user.ispremium? 'Premium User' : 'Not Premium User'

    const email = user.email      ? user.email       : 'Email unknown';
    const phone = user.phoneNumber? user.phoneNumber : 'Phone unknown';

    return(
      <View style={headerStyles.containerHeader}>
        {/*Left: Avatar w/ Initials*/}
        <View style={[headerStyles.containerAvatar, STYLES.glow, {shadowRadius: 32, shadowColor: '#6200EA', shadowOpacity: 0.8}]}>
          <Text style={[headerStyles.avatarInitials, STYLES.glow, {shadowRadius: 16}]}>{letters}</Text>
        </View>
        {/*Right: User Details*/}
        <View style={headerStyles.containerUserDetails}>
          {/*User: Name and Email*/}
          <Text numberOfLines={1} style={[headerStyles.titleName    , STYLES.glow]}>{name }</Text>
          <Text numberOfLines={1} style={[headerStyles.subtitleEmail, STYLES.glow]}>{email}</Text>
          {/*Premium status pill*/}
          <View style={headerStyles.pillPremium}>
            <Text style={headerStyles.textPremium}>{premium}</Text>
          </View>
        </View>
        <Divider style={{backgroundColor: 'rgba(255, 255, 255, 0.8)', marginHorizontal: 20, height: 5}}/>
      </View>
    );
  }

  _renderDrawerItems = () => {
    const { user } = this.state;
    return(
      <ScrollView style={{paddingTop: 20, flex: 1}} bounces={false}>
        {user && this._renderHeader()}
        <DrawerItems 
          {...this.props}
          activeTintColor='white'
          activeBackgroundColor='rgba(0, 0, 0, 0.10)'
          inactiveTintColor='rgba(255, 255, 255, 0.7)'
          labelStyle={{fontSize: 18}}
          activeLabelStyle={[{fontWeight: '900'}, STYLES.glow]}
          inactiveLabelStyle={{fontWeight: '300'}}
          onItemPress={this._onItemPress}
        />
      </ScrollView>
    );
  }

  _renderFooter = () => {
    return (
      <View collapsable={true}>
        <IconButton
          text={'Log Out'}
          onPress={this._signOutAsync}
          //icon props
          iconName={'log-out'}
          iconType={'feather'}
          iconColor={'white'}
          iconSize={25}
          //style
          containerStyle={{paddingVertical: 10, paddingHorizontal: 15, margin: 15, borderRadius: 15, backgroundColor: 'rgba(0, 0, 0, 0.1)'}}
          textStyle={{color: 'white', fontSize: 16, marginLeft: 10}}
        />
      </View>
    );
  }
  
  render(){
    return (
      <BlurView
        style={{height: '100%'}}
        intensity={100}
        tint='default'
        >
        <LinearGradient
          style={{flex: 1}}
          start={{x: 0.0, y: 0.25}} end={{x: 0.5, y: 1.0}}
          colors={['rgba(137, 30, 232, 0.7)' , 'rgba(18, 1, 209, 0.6)']}
        >
          {this._renderDrawerItems()}
          {this._renderFooter()}
        </LinearGradient>
      </BlurView>
    );
  }
};

const headerStyles = StyleSheet.create({
  containerHeader: {
    flex: 1, 
    padding: 15, 
    flexDirection: 'row', 
    alignItems: 'center'
  },
  containerUserDetails: {
    flex: 1, 
    justifyContent: 'center'
  },
  containerAvatar: {
    width: 80, 
    height: 80, 
    borderRadius: 80/2, 
    backgroundColor: '#6200EA', 
    marginRight: 15, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  avatarInitials: {
    fontSize: 24, 
    fontWeight: '900', 
  color: 'white'
  },
  titleName: {
    fontSize: 18, 
    fontWeight: '800', 
    color: 'white'
  },
  subtitleEmail: {
    fontSize: 16, 
    fontWeight: '200', 
    color: 'white'
  },
  pillPremium: {
    backgroundColor: '#673AB7', 
    marginTop: 5, 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 10
  },
  textPremium: {
    color: 'white'
  },
});