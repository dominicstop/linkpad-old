import React from 'react';
import { StyleSheet, RefreshControl, Alert, View, Text, Platform, AsyncStorage, FlatList, ScrollView, ToastAndroid } from 'react-native';
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
import { Icon, Divider } from 'react-native-elements';
import _ from 'lodash';
import TimeAgo from 'react-native-timeago';

class HeaderCard extends React.PureComponent {
  static propTypes = {
    resources: PropTypes.array,
    lastUpdated: PropTypes.number,
  };

  static styles = {
    card: {
      flex: 1,
      flexDirection: 'row',
      marginTop: 0,
      marginBottom: 15,
      marginHorizontal: 0,
      paddingTop: 15,
      paddingHorizontal: 12,
      paddingBottom: 16,
      backgroundColor: 'white',
      shadowColor: 'black',
      elevation: 10,
      shadowRadius: 4,
      shadowOpacity: 0.4,
      shadowOffset:{
        width: 2,  
        height: 3,  
      },
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    headerTextContainer: {
      flex: 1, 
      justifyContent: 'center', 
    },
    headerTitle: {
      textAlign: 'center',      
      color: '#512DA8',
      fontSize: 20, 
      fontWeight: '800'
    },
    divider: {
      marginHorizontal: 15,
      marginVertical: 8,
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
  };

  constructor(props){
    super(props);
    this.imageHeader = require('../../assets/icons/book-keyboard.png');
  };

  _renderDetails(){
    const { styles } = HeaderCard;
    const { resources, lastUpdated } = this.props;
    
    const time  = lastUpdated * 1000;
    const count = resources.length || '--';

    const Time = (props) => (lastUpdated?
      <TimeAgo {...props} {...{time}}/> :
      <Text    {...props}>
        {'--:--'}
      </Text>
    );

    return(
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.detailTitle   }>{'Resources: '}</Text>
          <Text numberOfLines={1} style={styles.detailSubtitle}>{`${count} ${plural('item', count)}`}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.detailTitle   }>{'Updated: '}</Text>
          <Time numberOfLines={1} style={styles.detailSubtitle}/>              
        </View>
      </View>
    );
  };

  render(){
    const { styles } = HeaderCard;

    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <Animatable.View
        style={styles.card}
        duration={500}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
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
          <Divider style={styles.divider}/>
          {this._renderDetails()}
        </View>
      </Animatable.View>
    );
  };
};

//show the setting screen
export class ResourcesScreen extends React.Component {
  constructor(props){
    super(props);
    this.DEBUG = false;
    this.state = {
      resources: [],
      refreshing: false,
      refreshControlTitle: '',
      showContent: false,
      mount: false,
      lastUpdated: null,
    };
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

  _getStatusText(status){
    const { STATUS } = ResourcesStore;
    switch (status) {
      case STATUS.FETCHING: return 'Fetching resources from server...';
      case STATUS.SAVING_IMAGES: return 'Saving resources...';
      case STATUS.FINISHED: return 'Refresh finished.';
    };
  };

  _onRefreshStateChange = (status) => {
    const refreshControlTitle = this._getStatusText(status);
    ToastAndroid.showWithGravityAndOffset(
      refreshControlTitle,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      0, 125,
    );
    this.setState({refreshControlTitle});
  };

  _onRefresh = async () => {
    //set ui to refrshing
    await setStateAsync(this, {refreshing: true });

    try {
      //get resources
      const {resources, isResourcesNew} = await ResourcesStore.refresh(this._onRefreshStateChange);
      //set date last updated
      const lastUpdated = await ResourcesLastUpdated.setTimestamp();

      if(Platform.OS === 'ios'){
        //to reduce stutter
        await timeout(500);      
      };

      if(isResourcesNew){
        //show alert when there are no changes
        Alert.alert('Sorry', 'There are no new resources to show.')
      };

      this.setState({refreshing: false, resources, lastUpdated});

    } catch(error){
      //avoid flicker
      await timeout(750);
      console.log(error);
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
    const { refreshing, refreshControlTitle } = this.state;

    const title = refreshing? refreshControlTitle : 'Pull down to check for changes...';

    return(
      <RefreshControl 
        refreshing={this.state.refreshing} 
        onRefresh={this._onRefresh}
        {...{title}}
      />
    );
  };

  _renderHeader = () => {
    const { resources, lastUpdated } = this.state;
    return(
      <HeaderCard {...{ resources, lastUpdated}}/>
    );
  };

  _renderFooter = () => {
    return(
      <View style={{marginBottom: 75}}>
        <IconFooter ref={r => this.footer = r}/>
      </View>
    );
  };

  render(){
    const { resources, mount, showContent } = this.state;
    const offset = Header.HEIGHT;

    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {mount && showContent && <ResourceList
          //adjust top distance
          contentInset ={{top: offset}}
          contentOffset={{x: 0, y: -offset}}
          //callbacks
          onPress={this._handleOnPress}
          onEndReached={this._handleOnEndReached}
          //render UI
          refreshControl={this._renderRefreshCotrol()}
          ListHeaderComponent={this._renderHeader()}
          ListFooterComponent={this._renderFooter()}
          //pass down props
          {...{resources}}
        />}
      </ViewWithBlurredHeader>
    );
  };
};

