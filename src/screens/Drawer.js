import React from 'react';
import { Dimensions, Platform } from 'react-native';

import { STYLES          } from '../Constants';
import { CustomDrawer    } from '../components/CustomDrawer';
import { MoreStack       } from './MoreScreen';
import { BoardExamStack  } from './BoardExamScreen';
import { PaymentStack    } from './PaymentScreen';
import { AboutStack      } from './AboutScreen';
import { Homescreen      } from './Homescreen';


import { createDrawerNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';


const { width, height } = Dimensions.get('window');

const drawerBackgroundColor = Platform.select({
  ios    :'rgba(0, 0, 0, 0)',
  android: 'rgb(255, 255, 255)',
});

export class DrawerIcon extends React.PureComponent {
  render(){
    const { color } = this.props;
    const shouldGlow = color == 'white';
    return(
      <Icon 
        {...this.props}
        containerStyle={shouldGlow? [STYLES.glow, {shadowOpacity: 0.35}] : null}
      />
    );
  }
}

//side drawer navigation
export const DrawerStack = createDrawerNavigator({
    DrawerHomeRoute: {
      screen: Homescreen,
      navigationOptions: {
        drawerLabel: 'Home',
        drawerIcon: ({ tintColor }) => (
          <DrawerIcon
            name='ios-people'
            type='ionicon'
            size={28}
            color={tintColor}
          />
        ),
      }
    },
    DrawerBoardExamRoute: {
      screen: BoardExamStack,
      navigationOptions: {
        drawerLabel: 'Board Exam',
        drawerIcon: ({ tintColor }) => (
          <DrawerIcon
            name='ios-clipboard'
            type='ionicon'
            size={28}
            color={tintColor}
          />
        ),
      }
    },
    DrawerPaymentRoute: {
      screen: PaymentStack,
      navigationOptions: {
        drawerLabel: 'Payment',
        drawerIcon: ({ tintColor }) => (
          <DrawerIcon
            name='ios-cash'
            containerStyle={tintColor == 'white'? STYLES.glow : null}
            type='ionicon'
            size={28}
            color={tintColor}
          />
        ),
      }
    },
    DrawerAboutRoute: {
      screen: AboutStack,
      navigationOptions: {
        drawerLabel: 'About',
        drawerIcon: ({ tintColor }) => (
          <DrawerIcon
            name='ios-information-circle'
            type='ionicon'
            size={28}
            color={tintColor}
          />
        ),
      }
    },
    DrawerSettingsRoute: {
      screen: MoreStack,
      navigationOptions: {
        drawerLabel: 'Settings',
        drawerIcon: ({ tintColor }) => (
          <DrawerIcon
            name='ios-settings'
            type='ionicon'
            size={28}
            color={tintColor}
          />
        ),
      }
    },
  }, {
    drawerWidth: width - 40,
    contentComponent: CustomDrawer,
    ...{drawerBackgroundColor},
  }
);

//wraps drawerstack and passes drawernav as screenprop
export class DrawerStackContainer extends React.Component {
  static router = DrawerStack.router;

  render(){
    return (
      <DrawerStack
        navigation={this.props.navigation}
        screenProps={{
          ...this.props.screenProps,
          drawerNav: this.props.navigation,
        }}
      />
    );
  }
}