import React from 'react';
import { StyleSheet, RefreshControl, Alert, View, Text, Platform, FlatList, TouchableOpacity, ToastAndroid } from 'react-native';
import PropTypes from 'prop-types';

import { HEADER_HEIGHT } from '../Constants';
import { BLUE, PURPLE } from '../Colors';

import { ViewWithBlurredHeader, IconFooter, Card, AnimatedListItem } from '../components/Views';

import { timeout, setStateAsync , plural} from '../functions/Utils';
import { ResourcesStore       } from '../functions/ResourcesStore';
import { ResourcesLastUpdated } from '../functions/MiscStore';
import { ResourceModel } from '../models/ResourceModel';
import { NumberIndicator, DetailColumn, DetailRow } from '../components/StyledComponents';

import moment from 'moment';
import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import { NavigationEvents } from 'react-navigation';
import { Divider } from 'react-native-elements';
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

    const timeText = (lastUpdated
      ? moment(time).fromNow()
      : 'N/A'
    );

    return(
      <DetailRow>
        <DetailColumn
          title={'Resources'}
          subtitle={`${count} ${plural('item', count)}`}
          help={true}
          helpTitle={'Resource Count'}
          helpSubtitle={'Number of resources available.'}
          disableGlow={true}
        />
         <DetailColumn
          title={'Updated'}
          subtitle={timeText}
          help={true}
          helpTitle={'Time Updated'}
          helpSubtitle={`The resources list was last refreshed ${timeText}.`}
          disableGlow={true}
        />
      </DetailRow>
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

// shown when no exams have been created yet
class EmptyCard extends React.PureComponent {
  static styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      paddingVertical: 10,
    },  
    image: {
      width: 75, 
      height: 75,
      marginRight: 10,
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
  });

  constructor(props){
    super(props);
    this.imageHeader = require('../../assets/icons/folder-castle.png');
  };

  render() {
    const { styles } = EmptyCard;
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <Animatable.View
        duration={500}
        delay={300}
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
            <Text style={styles.headerTitle   }>No Items to Show</Text>
            <Text style={styles.headerSubtitle}>You can swipe down to refresh and download the resources from the server.</Text>
          </View>
        </Card>
      </Animatable.View>
  );
  };
};

class ResourceItem extends React.PureComponent { 
  static propTypes = {
    index   : PropTypes.number,
    resource: PropTypes.object,
    onPress : PropTypes.func  ,
  };

  static styles = StyleSheet.create({
    divider: {
      marginVertical: 10,
      marginHorizontal: 15,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textTitle: {
      flex: 1,
      fontSize: 24, 
      fontWeight: 'bold',
      color: PURPLE[1100],
      marginLeft: 7,
    },
    textSubtitle: {
      fontSize: 16, 
      fontWeight: '100', 
      color: 'grey',
    },
    textBody: {
      fontSize: 18, 
      fontWeight: '300', 
      textAlign: 'justify'
    },
    textLink: {
      fontSize: 18, 
      color: BLUE[800], 
      textDecorationLine: 'underline', 
      marginTop: 5
    },
  });

  constructor(props){
    super(props);
  };

  _handleOnPress = () => {
    const { onPress, resource } = this.props;
    onPress && onPress(resource);
  };

  render(){
    const { styles } = ResourceItem;
    const { resource, index } = this.props;

    //wrap inside model
    const model = new ResourceModel(resource);

    return(
      <Card>      
        <TouchableOpacity onPress={this._handleOnPress}>
          <View style={styles.titleContainer}>
            <NumberIndicator value={index + 1}/>
            <Text style={styles.textTitle}>
              {model.title}
            </Text>
          </View>
          <Text style={styles.textSubtitle}>
            {`Last updated on ${model.dateposted}`}
          </Text>
          <Divider style={styles.divider}/>
          <Text style={styles.textBody} numberOfLines={4}>
            {model.description}
          </Text>
          <Text style={styles.textLink}>
            {resource.link}
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };
};

export class ResourceList extends React.PureComponent {
  static propTypes = {
    onPress  : PropTypes.func,
    resources: PropTypes.array,
  };

  constructor(props){
    super(props);
    this.DEBUG = false;
  };

  _handleOnPress = (resource) => {
    const { onPress, resources } = this.props;
    onPress && onPress(resource, resources);
  };

  _renderItem = ({item, index}) => {
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return(
      <AnimatedListItem
        duration={500}
        multiplier={100}
        last={6}
        {...{index, animation}}
      >
        <ResourceItem 
          resource={item}
          onPress={this._handleOnPress}
          {...{index}}
        />
      </AnimatedListItem>
    );
  };

  _renderEmpty = () => {
    return(
      <EmptyCard/>
    );
  };

  render(){
    const { resources, ...flatListProps } = this.props;
    return(
      <FlatList
        ref={r => this.flatlist = r}
        data={resources || []}
        keyExtractor={item => item.indexid + ''}
        renderItem={this._renderItem}
        ListEmptyComponent={this._renderEmpty}
        {...flatListProps}
      />
    );
  };
};

//show the setting screen
export class ResourcesScreen extends React.Component {
  constructor(props){
    super(props);

    const lastUpdated = ResourcesLastUpdated.get();
    this.state = {
      resources: [],
      refreshing: false,
      refreshControlTitle: '',
      showContent: false,
      mount: false,
      lastUpdated
    };
  };

  async componentWillMount(){
    //load data from storage
    const resources = await ResourcesStore.get();
    this.setState({resources});
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
      case STATUS.FETCHING: return 'Fetching Resources from Server...';
      case STATUS.WRITING : return 'Saving Resources to Device...';
      case STATUS.FINISHED: return 'Refresh finished.';
    };
  };

  _onRefreshStateChange = (status) => {
    const refreshControlTitle = this._getStatusText(status);

    if(Platform.OS === 'android'){
      ToastAndroid.showWithGravityAndOffset(refreshControlTitle, ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, 125);
    } else {
      this.setState({refreshControlTitle});
    };
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
        Alert.alert('Sorry...', 'There are no new resources to show.')
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
        onRefresh={this._onRefresh}
        {...{title, refreshing}}
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
    
    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {mount && showContent && <ResourceList
          //adjust top distance
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
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

