import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage, ScrollView, TextInput, UIManager, LayoutAnimation, ActivityIndicator, KeyboardAvoidingView } from 'react-native';

import { Header, NavigationEvents } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';

export default class SignUpScreen extends React.Component {

  componentDidFocus = () => {
    const { getAuthBGGradientRef } = this.props.screenProps;
    //start the BG Gradient animation
    getAuthBGGradientRef && getAuthBGGradientRef().start();
  }

  render() {
    return (
      <View collapsable={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus} />
        <Animatable.View
          ref={r => this.ref_rootView = r}
          style={styles.rootContainer}
          animation={'fadeInRight'}
          duration={300}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          <KeyboardAvoidingView
            style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
            behavior='padding'
          >
            <Animatable.View
              style={[styles.formContainer, { overflow: 'hidden', elevation: 1 }]}
              ref={r => this.animatedformContainer = r}
              useNativeDriver={true}
            >
            </Animatable.View>
          </KeyboardAvoidingView>
        </Animatable.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    alignSelf: 'stretch',
    alignItems: 'stretch',
    margin: 15,
    padding: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20
  },
});