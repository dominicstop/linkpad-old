import React, { Fragment } from 'react';
import { Text, View, ViewPropTypes, Platform, StyleSheet, StatusBar, TouchableNativeFeedback } from 'react-native';
import PropTypes from 'prop-types';
import { STYLES } from '../Constants';

import { withNavigation } from 'react-navigation';
import { Icon     } from 'react-native-elements';
import { Header   } from 'react-navigation';
import Expo, { BlurView } from 'expo';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo';

class BackButton extends React.PureComponent {
  _handleOnPress = () => {
    const { navigation } = this.props;
    this.props.navigation.goBack()
  }

  render(){
    return(
      <View style={{borderRadius: 100, overflow: 'hidden', padding: 20}}>
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple('white', true)}
          onPress={this._handleOnPress}
        >
          <Icon
            name={'arrow-left'}
            type={'feather'}
            color={'white'}
            size={27}
          />
        </TouchableNativeFeedback>
      </View>
    );
  }
}

export const AndroidBackButton = withNavigation(BackButton);


export class AndroidHeader extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string,
    titleIcon: PropTypes.element,
    //custom components
    leftComponent  : PropTypes.element,
    rightComponent : PropTypes.element,
    centerComponent: PropTypes.element,
  };

  static defaultProps = {
    leftComponent: <AndroidBackButton/>,
    centerComponent: null,
  };

  static styles = StyleSheet.create({

  });

  _renderTitle(){
    const { title, headerTitleStyle } = this.props.scene.descriptor.options;
    const { titleIcon } = this.props;
    //only add margin when icon is present
    const marginLeft = titleIcon? 12 : 0;
    return(
      <Fragment>
        {titleIcon}
        <Text style={[headerTitleStyle, { marginLeft, fontWeight: '900', fontSize: 18, textAlignVertical: 'center' }]}>{title}</Text>
      </Fragment>
    );
  }

  _renderContent(){
    const { leftComponent, centerComponent } = this.props;
    const { headerLeft, headerTitle } = this.props.scene.descriptor.options;

    return(
      <Fragment>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          {headerLeft? headerLeft : leftComponent}
        </View>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          {centerComponent? centerComponent: this._renderTitle()}
        </View>
        <View>

        </View>
      </Fragment>
    );
  }

  render(){
    const paddingTop = StatusBar.currentHeight;
    const height     = paddingTop + Header.HEIGHT;
    return(
      <View style={{height, elevation: 30, backgroundColor: 'blue'}}>
        <LinearGradient
          style={{flex: 1, flexDirection: 'row', paddingTop}}
          colors={['#8400ea', '#651FFF']}
          start={[0, 1]} 
          end={[1, 0]}
        >
          {this._renderContent()}
        </LinearGradient>
      </View>
    );
  }
}
