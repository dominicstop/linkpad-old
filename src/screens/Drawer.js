import React, { Fragment } from 'react';
import { Dimensions, Platform } from 'react-native';

import { STYLES, ROUTES } from '../Constants';
import { CustomDrawer    } from '../components/CustomDrawer';
import { MoreStack       } from './MoreScreen';
import { BoardExamScreen } from './BoardExamScreen';
import { PaymentStack    } from './PaymentScreen';
import { AboutStack      } from './AboutScreen';
import { Homescreen      } from './Homescreen';

import { SwipableModal, BoardExamModalContent } from '../components/SwipableModal' ;

import { createDrawerNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';
import NavigationService from '../NavigationService';


const { width, height } = Dimensions.get('window');

const drawerBackgroundColor = Platform.select({
  ios    :'rgba(0, 0, 0, 0)',
  android: 'rgb(255, 255, 255)',
});

const DrawerIcon = (props) => {
  return (
    <Icon
      name ={props.iconName}
      type ={props.iconType}
      color={'white'}
      size={28}
      containerStyle={[STYLES.glow, {shadowOpacity: 0.25}]}
    />
  );
};

//side drawer navigation
const DrawerStack = createDrawerNavigator({
    [ROUTES.DrawerHomeRoute]: {
      screen: Homescreen,
      navigationOptions: {
        drawerLabel: 'Home',
        drawerIcon: (
          <DrawerIcon
            iconName={'ios-people'}
            iconType={'ionicon'}
          />
        ),
      }
    },
  [ROUTES.DrawerBoardExamRoute]: {
      screen: BoardExamScreen,
      navigationOptions: {
        drawerLabel: 'Board Exam',
        drawerIcon: (
          <DrawerIcon
            iconName={'ios-clipboard'}
            iconType={'ionicon'}
          />
        ),
      }
    },
    [ROUTES.DrawerPaymentRoute]: {
      screen: PaymentStack,
      navigationOptions: {
        drawerLabel: 'Payment',
        drawerIcon: (
          <DrawerIcon
            iconName={'ios-cash'}
            iconType={'ionicon'}
          />
        ),
      }
    },
    [ROUTES.DrawerAboutRoute]: {
      screen: AboutStack,
      navigationOptions: {
        drawerLabel: 'About',
        drawerIcon: ({ tintColor }) => (
          <DrawerIcon
            iconName={'ios-information-circle'}
            iconType={'ionicon'}
          />
        ),
      }
    },
    [ROUTES.DrawerSettingsRoute]: {
      screen: MoreStack,
      navigationOptions: {
        drawerLabel: 'Settings',
        drawerIcon: ({ tintColor }) => (
          <DrawerIcon
            iconName={'ios-settings'}
            iconType={'ionicon'}
          />
        ),
      }
    },
  }, {
    //drawerWidth: width - 40,
    contentComponent: CustomDrawer,
    initialRouteName: 'DrawerHomeRoute',
    ...{drawerBackgroundColor},
  }
);

//wraps drawerstack and passes drawernav as screenprop
export class DrawerStackContainer extends React.Component {
  static router = DrawerStack.router;

  static navigationOptions = {
    header: null,
  };

  //used in boardexamscreen
  _renderModal(){
    return(
      <SwipableModal
        ref={r => this._modal = r}
        onSnap={this._handleOnSnap}
      >
        <BoardExamModalContent/>
      </SwipableModal>
    );
  }

  render(){
    return (
      <Fragment>
        <DrawerStack
          navigation={this.props.navigation}
          ref={r => NavigationService.setDrawerNavigator(r)}  
          screenProps={{
            ...this.props.screenProps,
            drawerNav: this.props.navigation,
            getBoardExamModelRef: () => this._modal,
          }}
        />
        {this._renderModal()}
      </Fragment>
    );
  }
};