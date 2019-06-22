import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, Text, View, ActivityIndicator, AsyncStorage, Dimensions, Alert, Image } from 'react-native';
import PropTypes from 'prop-types';

import * as Animatable from 'react-native-animatable';
import { BarIndicator } from 'react-native-indicators';

import { ImageFromStorage } from '../components/Views';

import { ModuleStore } from '../functions/ModuleStore'   ;
import { TipsStore } from '../functions/TipsStore'     ;
import { ResourcesStore } from '../functions/ResourcesStore';
import { UserStore, UserModel } from '../functions/UserStore'        ;

import { ROUTES, FONT_NAMES } from '../Constants';

import PreboardExamStore from '../functions/PreboardExamStore';
import { FlatList } from 'react-native-gesture-handler';
import { ModulesLastUpdated, ResourcesLastUpdated , TipsLastUpdated} from '../functions/MiscStore';

Animatable.initializeRegistryWithDefinitions({
  zoomInTransition: {
    from  : { opacity: 1, transform: [{ scale: 0  }] },
    to    : { opacity: 0, transform: [{ scale: 10 }] },
  }
});

export default class AuthLoadingScreen extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      resources: [],
    };
  }

  componentDidMount = async () => {
    const { navigation } = this.props;
    try {
      //animate in and authenticate
      const [user] = await Promise.all([
        this._authenticate (),
        //this._loadIconFonts(),
        this._loadTextFonts(),
      ]);

      //lol this is temp
      const isLoggedIn = user.email != '';

      //load modules and tips if logged in
      if(isLoggedIn) await this._loadData();

      this.animateOut();
      navigation.navigate(isLoggedIn
        ? ROUTES.AppRoute 
        : ROUTES.AuthRoute
      );

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
      const [user] = await Promise.all([
        UserStore.read(),
        //start animations
        this.animatedRoot   .fadeIn(250 ),
        this.animatedLoading.zoomIn(1250),
      ]);

      const user_wrapped = UserModel.wrap(user);
      return (user_wrapped);

    } catch(error){
      console.log("Error: Could not Authenticate.");
      throw "Could not Authenticate.";
    };
  };

  async _loadData(){
    try {
      await Promise.all([
        ModuleStore      .get(),
        TipsStore        .get(),
        ResourcesStore   .get(),
        PreboardExamStore.get(),
      ]);
      await Promise.all([
        //load lastupdated from store
        ModulesLastUpdated  .read(),
        ResourcesLastUpdated.read(),
        TipsLastUpdated     .read(),
      ]);
    } catch(error) {
      console.log('Error: Unable to load data.');
      throw "Unable to load data from store";      
    };
  };

  async _loadIconFonts(){
    /*
    await Font.loadAsync({
      'Material Design Icons': require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf" ),
      'Material Icons'       : require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf"  ),
      'FontAwesome'          : require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf'    ),
      'SimpleLineIcons'      : require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/SimpleLineIcons.ttf'),
      'simple-line-icons'    : require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/SimpleLineIcons.ttf'),
      'Feather'              : require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf'        ),
      'Ionicons'             : require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'       ),
      'Entypo'               : require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf'         ),
    });
    */
  };

  async _loadTextFonts(){
    await Font.loadAsync({
      //------ Play Fair Display ------
      //[FONT_NAMES.playfair_regular]: require('../../assets/fonts/Playfair_Display/PlayfairDisplay-Regular.ttf'),
      //[FONT_NAMES.playfair_bold   ]: require('../../assets/fonts/Playfair_Display/PlayfairDisplay-Bold.ttf'   ),
      //[FONT_NAMES.playfair_black  ]: require('../../assets/fonts/Playfair_Display/PlayfairDisplay-Black.ttf'  ),
      //------ Taviraj ------
      //[FONT_NAMES.taviraj_regular    ]: require('../../assets/fonts/Taviraj/Taviraj-Regular.ttf'     ),
      //[FONT_NAMES.taviraj_light      ]: require('../../assets/fonts/Taviraj/Taviraj-Light.ttf'       ),
      //[FONT_NAMES.taviraj_extra_light]: require('../../assets/fonts/Taviraj/Taviraj-ExtraLight.ttf'  ),
      //[FONT_NAMES.taviraj_medium     ]: require('../../assets/fonts/Taviraj/Taviraj-Medium.ttf'      ),
      //[FONT_NAMES.taviraj_semi_bold  ]: require('../../assets/fonts/Taviraj/Taviraj-SemiBold.ttf'    ),
      //[FONT_NAMES.taviraj_bold       ]: require('../../assets/fonts/Taviraj/Taviraj-Taviraj-Bold.ttf'),
      //------ Barlow ------
      [FONT_NAMES.barlow_extra_light]: require('../../assets/fonts/Barlow/Barlow-ExtraLight.ttf'),
      [FONT_NAMES.barlow_light      ]: require('../../assets/fonts/Barlow/Barlow-Light.ttf'     ),
      [FONT_NAMES.barlow_regular    ]: require('../../assets/fonts/Barlow/Barlow-Regular.ttf'   ),
      [FONT_NAMES.barlow_medium     ]: require('../../assets/fonts/Barlow/Barlow-Medium.ttf'    ),
      [FONT_NAMES.barlow_semi_bold  ]: require('../../assets/fonts/Barlow/Barlow-SemiBold.ttf'  ),
      [FONT_NAMES.barlow_bold       ]: require('../../assets/fonts/Barlow/Barlow-Bold.ttf'      ),
      [FONT_NAMES.barlow_extra_bold ]: require('../../assets/fonts/Barlow/Barlow-ExtraBold.ttf' ),
      [FONT_NAMES.barlow_black      ]: require('../../assets/fonts/Barlow/Barlow-Black.ttf'     ),
      //------ Barlow Semi Condensed ------
      //[FONT_NAMES.barlow_semicondensed_extra_light]: require('../../assets/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-ExtraLight.ttf'),
      [FONT_NAMES.barlow_semicondensed_light      ]: require('../../assets/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Light.ttf'     ),
      //[FONT_NAMES.barlow_semicondensed_regular    ]: require('../../assets/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Regular.ttf'   ),
      [FONT_NAMES.barlow_semicondensed_medium     ]: require('../../assets/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Medium.ttf'    ),
      [FONT_NAMES.barlow_semicondensed_semi_bold  ]: require('../../assets/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-SemiBold.ttf'  ),
      [FONT_NAMES.barlow_semicondensed_bold       ]: require('../../assets/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Bold.ttf'      ),
      //[FONT_NAMES.barlow_semicondensed_extra_bold ]: require('../../assets/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-ExtraBold.ttf' ),
      //[FONT_NAMES.barlow_semicondensed_black      ]: require('../../assets/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Black.ttf'     ),
      //------ Barlow Condensed ------
      //[FONT_NAMES.barlow_condensed_regular   ]: require('../../assets/fonts/Barlow_Condensed/BarlowCondensed-Regular.ttf'  ),
      //[FONT_NAMES.barlow_condensed_medium    ]: require('../../assets/fonts/Barlow_Condensed/BarlowCondensed-Medium.ttf'   ),
      //[FONT_NAMES.barlow_condensed_semi_bold ]: require('../../assets/fonts/Barlow_Condensed/BarlowCondensed-SemiBold.ttf' ),
      //[FONT_NAMES.barlow_condensed_bold      ]: require('../../assets/fonts/Barlow_Condensed/BarlowCondensed-Bold.ttf'     ),
      //[FONT_NAMES.barlow_condensed_extra_bold]: require('../../assets/fonts/Barlow_Condensed/BarlowCondensed-ExtraBold.ttf'),
      //[FONT_NAMES.barlow_condensed_black     ]: require('../../assets/fonts/Barlow_Condensed/BarlowCondensed-Black.ttf'    ),
    });
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
  };

  _render(){
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