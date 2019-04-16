import React from 'react';
import { StyleSheet, RefreshControl, Alert, View, Text, Platform, ToastAndroid, TouchableOpacity, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { ROUTES , HEADER_HEIGHT} from '../Constants';
import { BLUE, PURPLE } from '../Colors';

import { timeout, setStateAsync, plural } from '../functions/Utils';
import { TipsStore } from '../functions/TipsStore';
import { TipsLastUpdated } from '../functions/MiscStore';
import { TipModel } from '../models/TipModel';

import { ViewWithBlurredHeader, IconFooter, Card, AnimatedListItem } from '../components/Views';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import TimeAgo from 'react-native-timeago';
import { Header, NavigationEvents } from 'react-navigation';
import { Divider } from 'react-native-elements';

class HeaderCard extends React.PureComponent {
  static propTypes = {
    tips: PropTypes.array,
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
    this.imageHeader = require('../../assets/icons/lightbulb.png');
  };

  _renderDetails(){
    const { styles } = HeaderCard;
    const { tips, lastUpdated } = this.props;
    
    const time  = lastUpdated * 1000;
    const count = tips.length || '--';

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
          <Text style={styles.headerTitle   }>Useful Tips</Text>
          <Text style={styles.headerSubtitle}>A bunch of tips to help you in study and do better!</Text>
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
            <Text style={styles.headerSubtitle}>You can swipe down to refresh and download the tips from the server.</Text>
          </View>
        </Card>
      </Animatable.View>
  );
  };
};

class TipItem extends React.PureComponent { 
  static propTypes = {
    tip: PropTypes.object,
    onPress: PropTypes.func,
    index: PropTypes.number,
  };

  static styles = StyleSheet.create({
    divider: {
      marginVertical: 10,
      marginHorizontal: 15,
    },
    textTitle: {
      fontSize: 24, 
      fontWeight: 'bold',
      color: PURPLE[1100]
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
    const { onPress, tip, index } = this.props;
    onPress && onPress({tip, index});
  };

  render(){
    const { styles } = TipItem;
    const { tip } = this.props;

    //wrap inside model
    const model = new TipModel(tip);

    return(
      <Card>      
        <TouchableOpacity onPress={this._handleOnPress}>
          <Text style={styles.textTitle}>
            {model.title}
          </Text>
          <Text style={styles.textSubtitle}>
            {`Last updated on ${model.dateposted}`}
          </Text>
          <Divider style={styles.divider}/>
          <Text style={styles.textBody} numberOfLines={4}>
            {model.tip}
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };
};

class TipList extends React.PureComponent {
  static propTypes = {
    tips: PropTypes.array,
    onPressTip:PropTypes.func,
  };

  _handleKeyExtractor = (item) => {
    return `tipno:${item.tipnumber}-indexid:${item.indexid}`;
  };

  _handleOnPressTip = ({tip, index}) => {
    const { tips, onPressTip } = this.props;
    onPressTip && onPressTip({tip, tips, index});
  };

  _renderItemTip = ({item, index}) => {

    const animation = Platform.select({ios: 'fadeInUp', android: 'zoomIn'});

    return(
      <AnimatedListItem
        index={index}
        duration={500}
        multiplier={100}
        last={6}
        {...{animation}}
      >
        <TipItem 
          tip={item}
          onPress={this._handleOnPressTip}
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
    const { tips, ...flatListProps } = this.props;
    const data = _.compact(tips || []);
    return(
      <FlatList
        ref={r => this.flatlist = r}
        keyExtractor={this._handleKeyExtractor}
        renderItem={this._renderItemTip}
        ListEmptyComponent={this._renderEmpty}
        {...{data, ...flatListProps}}
      />
    );
  };
};

//show the setting screen
export class TipsScreen extends React.Component {
  static styles = StyleSheet.create({
  });

  constructor(props){
    super(props);

    const lastUpdated = TipsLastUpdated.get();
    this.state = {
      tips: [],
      refreshing: false,
      showContent: false,
      refreshControlTitle: '',
      lastUpdated,
    };
  };

  async componentWillMount(){
    //load data from storage
    const tips = await TipsStore.get();
    await setStateAsync(this, {tips});
  };

  shouldComponentUpdate(nextProps, nextState){
    return !_.isEqual(this.state, nextState)
  };

  componentDidFocus = () => {
    //mount or show contents on first show
    if(!this.state.showContent){
      this.setState({showContent: true});
    };
  };

  _getStatusText(status){
    const { STATUS } = TipsStore;
    switch (status) {
      case STATUS.FETCHING: return 'Fetching Tips from Server...';
      case STATUS.WRITING : return 'Saving Tips to Device...';
      case STATUS.FINISHED: return 'Refresh has finished.';
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
      //get tips
      const {tips, isTipsNew} = await TipsStore.refresh(this._onRefreshStateChange);
      
      if(isTipsNew){
        //show alert when there are no changes
        Alert.alert('Sorry...', 'There are no new tips to show.');
      };

      //set date last updated
      const lastUpdated = await TipsLastUpdated.setTimestamp();
      this.setState({refreshing: false, tips, lastUpdated});

    } catch(error){
      console.log('Unable to refresh tips...');
      console.log(error);

      //avoid flicker
      await timeout(750);
      Alert.alert('Error', 'Unable to fetch new tips (Please try again)');
      this.setState({refreshing: false});
    };
  };
  
  _handleOnEndReached = () => {
    this.footer.show();
  };

  _handleOnPressTip = ({tip, tips, index}) => {
    const { navigation } = this.props;
    navigation && navigation.navigate(ROUTES.ViewTipRoute, {tip, tips, index});
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
    const { tips, lastUpdated } = this.state;
    return(
      <HeaderCard {...{tips, lastUpdated}}/>
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
    const { tips, showContent } = this.state;
    
    const onEndReachedThreshold = Platform.select({
      ios: 0, android: 0.1,
    });

    return(
      <ViewWithBlurredHeader hasTabBar={true} enableAndroid={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {showContent && <TipList
          //adjust top distance
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
          //callbacks
          onEndReached={this._handleOnEndReached}
          onPressTip={this._handleOnPressTip}
          //render UI
          refreshControl={this._renderRefreshCotrol()}
          ListHeaderComponent={this._renderHeader()}
          ListFooterComponent={this._renderFooter()}
          //pass down props
          {...{tips, onEndReachedThreshold}}
        />}
      </ViewWithBlurredHeader>
    );
  };
};

