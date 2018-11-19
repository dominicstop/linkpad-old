import React from 'react';
import { StyleSheet, RefreshControl, Alert, View, Text, Platform, AsyncStorage, FlatList, ScrollView } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService'   ;
import { HEADER_PROPS          } from '../Constants'           ;
import { CustomHeader          } from '../components/Header'   ;
import { DrawerButton          } from '../components/Buttons'  ;
import { ResourceList          } from '../components/Resources';

import { ViewWithBlurredHeader, IconFooter, Card } from '../components/Views';

import { timeout, setStateAsync , plural} from '../functions/Utils';
import { ResourcesStore         } from '../functions/ResourcesStore';
import { ResourcesLastUpdated   } from '../functions/MiscStore';


import * as Animatable from 'react-native-animatable';
import { Header, createStackNavigator, NavigationEvents } from 'react-navigation';
import { Icon } from 'react-native-elements';
import _ from 'lodash';
import TimeAgo from 'react-native-timeago';


//show the setting screen
export class ResourcesScreen extends React.Component {
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
    this.DEBUG = false;
    this.state = {
      resources: [],
      refreshing: false,
      showContent: false,
      mount: false,
      lastUpdated: null,
    };

    this.imageHeader = require('../../assets/icons/book-keyboard.png');
  };

  async componentWillMount(){
    //load data from storage
    const resources   = await ResourcesStore      .get();
    const lastUpdated = await ResourcesLastUpdated.get();

    console.log('lastUpdated');
    console.log(lastUpdated);

    this.setState({resources, lastUpdated});
  };

  componentDidMount = async () => {
    //delay rendering
    setTimeout(() => { this.setState({mount: true}) }, 0);
  };

  shouldComponentUpdate(nextProps, nextState){
    return !_.isEqual(this.state, nextState)
  };

  componentDidFocus = () => {
    //mount or show contents on first show
    if(!this.state.showContent){
      this.setState({showContent: true});
    }
  };

  _onRefresh = async () => {
    //set ui to refrshing
    await setStateAsync(this, {refreshing: true });

    try {
      //get resources
      const {resources, isResourcesNew} = await ResourcesStore.refresh();

      if(isResourcesNew){
        //show alert when there are no changes
        Alert.alert('Sorry', 'No new resources to show')
      };

      //set date last updated
      const lastUpdated = await ResourcesLastUpdated.setTimestamp();

      this.setState({refreshing: false, resources, lastUpdated});

    } catch(error){
      //avoid flicker
      await timeout(750);

      Alert.alert('Error', 'Unable to fetch new resources (Please try again)');
      this.setState({refreshing: false});
    };
  };

  _handleOnPress = (resource, resources) => {
    const { navigation } = this.props;
    
    navigation && navigation.navigate('ViewResourceRoute', {
      resource, resources
    });
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
    const { styles } = ResourcesScreen;
    const { resources, lastUpdated } = this.state;
    
    const time  = lastUpdated * 1000;
    const count = resources.length || '--';

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
            <Text style={styles.headerTitle   }>Study Resources</Text>
            <Text style={styles.headerSubtitle}>A list of resources to help you learn more about a topic!</Text>
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
    const { resources, mount, showContent } = this.state;
    const offset = Header.HEIGHT;

    const onEndReachedThreshold = Platform.select({
      ios    : 0  ,
      android: 0.1,
    });

    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {mount && showContent && <ResourceList
          //adjust top distance
          contentInset ={{top: offset}}
          contentOffset={{x: 0, y: -offset}}
          //extra top distance
          contentContainerStyle={{ paddingTop: 12 }}
          //callbacks
          onPress     ={this._handleOnPress     }
          onEndReached={this._handleOnEndReached}
          //render UI
          refreshControl     ={this._renderRefreshCotrol()}
          ListHeaderComponent={this._renderHeader       ()}
          ListFooterComponent={this._renderFooter       ()}
          //pass down props
          {...{resources, onEndReachedThreshold}}
        />}
      </ViewWithBlurredHeader>
    );
  };
};

