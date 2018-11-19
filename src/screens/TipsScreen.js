import React from 'react';
import { StyleSheet, RefreshControl, Alert, View, Text, AsyncStorage, FlatList, Platform } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService' ;
import { HEADER_PROPS          } from '../Constants'         ;
import { CustomHeader          } from '../components/Header' ;
import { TipList               } from '../components/Tips'   ;
import { DrawerButton          } from '../components/Buttons';

import { timeout, setStateAsync, plural } from '../functions/Utils';
import { TipsStore } from '../functions/TipsStore';

import { ViewWithBlurredHeader, IconFooter, Card } from '../components/Views';

import { Header, createStackNavigator, NavigationEvents } from 'react-navigation';
import { Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import _ from 'lodash';
import TimeAgo from 'react-native-timeago';
import { TipsLastUpdated } from '../functions/MiscStore';


//show the setting screen
export class TipsScreen extends React.Component {
  static styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    headerTextContainer: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
    },
    headerTitle: {
      color: '#512DA8',
      fontSize: 20, 
      fontWeight: '800'
    },
    headerSubtitle: {
      fontSize: 16, 
      ...Platform.select({
        ios: {
          fontWeight: '200'
        },
        android: {
          fontWeight: '100',
          color: '#424242'
        },
      })
    },
    detailTitle: Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '500'
      },
      android: {
        fontSize: 17,
        fontWeight: '900'
      }
    }),
    detailSubtitle: Platform.select({
      ios: {
        fontSize: 16,
        fontWeight: '200'
      },
      android: {
        fontSize: 16,
        fontWeight: '100',
        color: '#424242'
      },
    }),
  });

  constructor(props){
    super(props);
    this.state = {
      tips: [],
      refreshing: false,
      showContent: false,
      lastUpdated: null,
    };

    this.imageHeader = require('../../assets/icons/lightbulb.png');
  };

  async componentWillMount(){
    //load data from storage
    const tips        = await TipsStore      .get();
    const lastUpdated = await TipsLastUpdated.get();

    await setStateAsync(this, {tips, lastUpdated});
  }

  shouldComponentUpdate(nextProps, nextState){
    return !_.isEqual(this.state, nextState)
  }

  componentDidFocus = () => {
    //mount or show contents on first show
    if(!this.state.showContent){
      this.setState({showContent: true});
    };
  };

  _onRefresh = async () => {
    //set ui to refrshing
    await setStateAsync(this, {refreshing: true });

    try {
      //get tips
      const {tips, isTipsNew} = await TipsStore.refresh();
      
      if(isTipsNew){
        //show alert when there are no changes
        Alert.alert('Sorry', 'No new tips to show');
      };

      //set date last updated
      const lastUpdated = await TipsLastUpdated.setTimestamp();

      this.setState({refreshing: false, tips, lastUpdated});

    } catch(error){
      //avoid flicker
      await timeout(750);

      Alert.alert('Error', 'Unable to fetch new tips (Please try again)');
      this.setState({refreshing: false});
    }
  };
  
  _handleOnEndReached = () => {
    this.footer.show();
  };

  _renderRefreshCotrol(){
    const { refreshing } = this.state;
    const prefix = refreshing? 'Checking' : 'Pull down to check';
    return(
      <RefreshControl 
        refreshing={this.state.refreshing} 
        onRefresh={this._onRefresh}
        title={prefix + ' for changes...'}
      />
    );
  };

  _renderHeader = () => {
    const { styles } = TipsScreen;
    const { tips, lastUpdated } = this.state;
    
    const time  = lastUpdated * 1000;
    const count = tips.length || '--';

    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    const Time = (props) => (lastUpdated?
      <TimeAgo {...props} {...{time}}/> :
      <Text    {...props}>
        {'--:--'}
      </Text>
    );

    return(
      <Animatable.View
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <Card style={styles.card}>
          <Animatable.Image
            source={this.imageHeader}
            style={styles.image}
            animation={'pulse'}
            easing={'ease-in-out'}
            iterationCount={"infinite"}
            duration={5000}
            useNativeDriver={true}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle   }>Useful Tips</Text>
            <Text style={styles.headerSubtitle}>A bunch of tips to help you in study and do better!</Text>
            <View style={{flexDirection: 'row', marginTop: 5}}>
              <View style={{flex: 1}}>
                <Text numberOfLines={1} style={styles.detailTitle   }>{'Resources: '}</Text>
                <Text numberOfLines={1} style={styles.detailSubtitle}>{`${count} ${plural('item', count)}`}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text numberOfLines={1} style={styles.detailTitle   }>{'Updated: '}</Text>
                <Time numberOfLines={1} style={styles.detailSubtitle}/>              
              </View>
            </View>
          </View>
        </Card>
      </Animatable.View>
    );
  };

  _renderFooter = () => {
    return(
      <View style={{marginBottom: 75, marginTop: 10}}>
        <IconFooter ref={r => this.footer = r}/>
      </View>
    );
  };

  render(){
    const { tips } = this.state;
    const offset = Header.HEIGHT;
    
    const onEndReachedThreshold = Platform.select({
      ios    : 0  ,
      android: 0.1,
    });

    return(
      <ViewWithBlurredHeader hasTabBar={true} enableAndroid={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {this.state.showContent && <TipList
          //adjust top distance
          contentInset ={{top: offset}}
          contentOffset={{x: 0, y: -offset}}
          //extra top distance
          contentContainerStyle={{ paddingTop: 12 }}
          //callbacks
          onEndReached={this._handleOnEndReached}
          //render UI
          refreshControl     ={this._renderRefreshCotrol()}
          ListHeaderComponent={this._renderHeader       ()}
          ListFooterComponent={this._renderFooter       ()}
          //pass down props
          {...{tips, onEndReachedThreshold}}
        />}
      </ViewWithBlurredHeader>
    );
  }
}

