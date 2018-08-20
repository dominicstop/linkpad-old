import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, AsyncStorage, Dimensions } from 'react-native';

import * as Animatable from 'react-native-animatable';
import { BarIndicator } from 'react-native-indicators';

Animatable.initializeRegistryWithDefinitions({
  zoomInTransition: {
    from  : { opacity: 1, transform: [{ scale: 0  }] },
    to    : { opacity: 0, transform: [{ scale: 10 }] },
  }
});

export default class AuthLoadingScreen extends React.Component { 
  constructor(props) {
    super(props);
  }

  _authenticate = () => {
    return new Promise(async resolve => {
      //do some authentication here
      const userToken = await AsyncStorage.getItem('userToken');
      resolve(userToken);
    });
  }

  componentDidMount = async () => {
    let delay = ms => new Promise(r => setTimeout(r, ms));

    //animate in and authenticate
    const results = await Promise.all([
      this._authenticate(),
      this.animatedRoot.fadeIn(250),
      this.animatedLoading.zoomIn(1250),
    ]);

    //animate out
    await Promise.all([
      this.animatedLoading.zoomInTransition(750),
      this.animatedRoot.fadeOut(500),
    ]);

    //navigate
    userToken = results[0];
    this.props.navigation.navigate(userToken? 'AppRoute' : 'AuthRoute');
  }
  
  render(){
    return(
      <Animatable.View 
        style={styles.rootContainer}
        ref={r => this.animatedRoot = r}
        useNativeDriver={true}
      >
        <Animatable.View
          ref={r => this.animatedLoading = r}
          useNativeDriver={true}
        >
          <BarIndicator 
            color='white' 
            count={8} 
            size={55}  
            animationDuration={1500}
          />
        </Animatable.View>
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#7C4DFF'
  },
  loadingText: {
    fontSize: 24,
    marginTop: 10,
    color: 'white',
  }
});