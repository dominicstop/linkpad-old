import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, AsyncStorage, Dimensions } from 'react-native';

import * as Animatable from 'react-native-animatable';
import { BarIndicator } from 'react-native-indicators';
import store from 'react-native-simple-store';

import { ModuleStore    }  from '../functions/ModuleStore'   ;
import { TipsStore      }  from '../functions/TipsStore'     ;
import { ResourcesStore }  from '../functions/ResourcesStore';

import { ROUTES } from '../Constants';

import UserStore         from '../functions/UserStore'        ;
import PreboardExamStore from '../functions/PreboardExamStore';
import { ModulesLastUpdated, ResourcesLastUpdated } from '../functions/MiscStore';


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

  componentDidMount = async () => {
    let delay = ms => new Promise(r => setTimeout(r, ms));

    //animate in and authenticate
    const results = await Promise.all([
      UserStore.getUserData(),
      this.animatedRoot.fadeIn(250),
      this.animatedLoading.zoomIn(1250),
    ]);

    //get UserData from promise
    const userData   = results[0];
    const isLoggedIn = userData != null;

    //load modules and tips if logged in
    if(isLoggedIn){
      await Promise.all([
        ModuleStore   .get(),
        ResourcesStore.get(),
        TipsStore     .get(),
        PreboardExamStore   .get(),
        ModulesLastUpdated  .get(),
        ResourcesLastUpdated.get(),
      ])
    }

    //animate out
    await Promise.all([
      this.animatedLoading.zoomInTransition(750),
      this.animatedRoot.fadeOut(500),
    ]);

    //navigate
    const { navigation } = this.props;
    const route = isLoggedIn? ROUTES.AppRoute : ROUTES.AuthRoute;
    navigation.navigate(route);
  };
  
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