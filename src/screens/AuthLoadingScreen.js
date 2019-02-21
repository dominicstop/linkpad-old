import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, AsyncStorage, Dimensions, Alert, Image } from 'react-native';
import PropTypes from 'prop-types';

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
import { FlatList } from 'react-native-gesture-handler';
import Expo from 'expo';


Animatable.initializeRegistryWithDefinitions({
  zoomInTransition: {
    from  : { opacity: 1, transform: [{ scale: 0  }] },
    to    : { opacity: 0, transform: [{ scale: 10 }] },
  }
});

class ImageFromStorage extends React.PureComponent {
  static propTypes = {
    fileURI: PropTypes.string,
  };

  constructor(props){
    super(props);
    this.state = {
      uri: null,
      loading: true,
    };
  };

  async componentDidMount(){
    const { fileURI } = this.props;
    const uri = await Expo.FileSystem.readAsStringAsync(fileURI);
    this.setState({uri});
  };

  _handleOnLoad = () => {
    this.container.transitionTo({opacity: 1}, 750);
  };

  _renderLoading(){
    const { style, ...otherProps } = this.props;
    const { uri } = this.state;

    return(
      <View style={[style]}>

      </View>
    );
  };
  
  _renderImage(){
    const { style, ...otherProps } = this.props;
    const { uri } = this.state;

    return(
      <Animatable.View
        style={{opacity: 0}}
        ref={r => this.container = r}
        useNativeDriver={true}
      >
        <Image 
          source={{uri}} 
          {...{style, ...otherProps}}
          onLoad={this._handleOnLoad}
        />
      </Animatable.View>
    );

  };

  render(){
    const { style, ...otherProps } = this.props;
    const { uri } = this.state;

    return(uri
      ? this._renderImage()
      : this._renderLoading()
    );
    
  };
};

export default class AuthLoadingScreen extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      resources: [],
    };
  }

  componentDidMount = async () => {
    const resources = await ResourcesStore.get((status) => console.log(status));
    console.log(resources);
    this.setState({resources});
    return;
    const { navigation } = this.props;
    try {
      //animate in and authenticate
      const userData = this._authenticate();

      const isLoggedIn = userData != null;
      const route = isLoggedIn? ROUTES.AppRoute : ROUTES.AuthRoute;

      //load modules and tips if logged in
      if(isLoggedIn){
        await this.loadData();
      };

      this.animateOut();
      navigation.navigate(route);

    } catch(error) {
      Alert.alert(
        "An Error as occured",
        `${error} (you have been logged out).`,
        [{text: 'OK', onPress: this._onPressAlertOK}],
      );
    };
  };

  async _authenticate(){
    try {
      const results = await Promise.all([
        UserStore.getUserData(),
        this.animatedRoot.fadeIn(250),
        this.animatedLoading.zoomIn(1250),
      ]);
      //return UserData from promise
      return results[0];

    } catch(error){
      console.log("Error: Could not Authenticate.");
      throw "Could not Authenticate.";
    };
  };

  async loadData(){
    try {
      await Promise.all([
        ModuleStore   .get(),
        ResourcesStore.get(),
        TipsStore     .get(),
      ]);
      await Promise.all([
        PreboardExamStore   .get(),
        ModulesLastUpdated  .get(),
        ResourcesLastUpdated.get(),
      ]);
    } catch(error) {
      console.log('Error: Unable to load data.');
      throw "Unable to load data from store";      
    };
  };

  async animateOut(){
    await Promise.all([
      this.animatedLoading.zoomInTransition(750),
      this.animatedRoot.fadeOut(500),
    ]);
  };

  _onPressAlertOK = async () => {
    const { navigation } = this.props;
    await AsyncStorage.clear();
    await this.animateOut();
    navigation.navigate(ROUTES.AuthRoute);
  };
  
  _render(){
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
  };

  render(){
    return(
      <View style={{flex: 1, padding: 20, backgroundColor: 'red'}}>
        <FlatList
          data={this.state.resources}
          renderItem={({item}) => {
            return(
              <View style={{backgroundColor: 'orange'}}>
                <Text>{item.photouri}</Text>
                <ImageFromStorage 
                  fileURI={item.photouri}
                  style={{flex: 1, height: 100}}
                />
              </View>
            );
          }}
        />
      </View>
    );
  };
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