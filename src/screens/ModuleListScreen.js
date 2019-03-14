import React from 'react';
import { StyleSheet, Text, View, Platform, RefreshControl } from 'react-native';
import PropTypes from 'prop-types';

import { ModulesLastUpdated } from '../functions/MiscStore';
import { timeout, setStateAsync} from '../functions/Utils';
import { ModuleStore } from '../functions/ModuleStore';

import { ViewWithBlurredHeader, IconFooter, Card } from '../components/Views'  ;
import { ModuleList } from '../components/Modules';

import * as Animatable from 'react-native-animatable';
import TimeAgo from 'react-native-timeago';
import { Header, NavigationEvents } from 'react-navigation';
import { Divider } from 'react-native-elements';
import {HEADER_HEIGHT} from '../Constants';


class ModulesHeader extends React.PureComponent {
  static propTypes = {
    modules: PropTypes.array,
    lastUpdated: PropTypes.number,
  };

  static styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      paddingTop: 15,
      marginBottom: 20,
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
    headerSubtitle: {
      fontSize: 16,
      marginTop: 2,
      textAlign: 'left',
      ...Platform.select({
        ios: {
          fontWeight: '200',
          color: '#202020',
        },
        android: {
          fontWeight: '100',
          color: '#424242'
        },
      })
    },
    divider: {
      marginHorizontal: 15,
      marginVertical: 8,
    },  
    detailTitle: Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '500',
        color: '#161616'
      },
      android: {
        fontSize: 17,
        fontWeight: '900',
        color: '#161616',
      }
    }),
    detailSubtitle: Platform.select({
      ios: {
        fontSize: 16,
        fontWeight: '200',
        color: '#161616',
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
    this.imageHeader = require('../../assets/icons/notes-pencil.png');    
  };

  _renderDetails(){
    const { styles } = ModulesHeader;
    const { modules = [], lastUpdated = 0 } = this.props;
    
    const time = lastUpdated * 1000;
    const moduleCount = modules.length || '--';

    const Time = (props) => (lastUpdated?
      <TimeAgo {...props} {...{time}}/> :
      <Text    {...props}>
        {'--:--'}
      </Text>
    );

    return(
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.detailTitle   }>{'Modules: '}</Text>
          <Text numberOfLines={1} style={styles.detailSubtitle}>{`${moduleCount} items`}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.detailTitle   }>{'Updated: '}</Text>
          <Time numberOfLines={1} style={styles.detailSubtitle}/>              
        </View>
      </View>
    );
  };

  render(){
    const { styles } = ModulesHeader;
    
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'fadeInRight',
    });

    return(
      <Animatable.View
        style={styles.card}
        duration={400}
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
          <Text style={styles.headerTitle}>
            {'Available Modules'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {'Each module contains several subjects with related topics. Choose a subject and start learning.'}
          </Text>
          <Divider style={styles.divider}/>
          {this._renderDetails()}
        </View>
      </Animatable.View>
    );
  };
};

//show a list of modules
export class ModuleListScreen extends React.Component {
  static styles = StyleSheet.create({

  });
  
  constructor(props){
    super(props);

    const lastUpdated = ModulesLastUpdated.get();

    this.state = {
      modules: [], 
      refreshing: false,
      mount: false,
      mountFooter: false,
      lastUpdated,
    };
  };

  shouldComponentUpdate(nextProps, nextState){
    const { modules, mount } = this.state;
    return modules != nextState.modules || mount != nextState.mount;
  };

  componentDidFocus = () => {
    //enable drawer when this screen is active
    const { setDrawerSwipe, getRefSubjectModal } = this.props.screenProps;
    setDrawerSwipe(true);

    //close the modal if it's open
    let modal = getRefSubjectModal();
    const isModalVisible = modal.isModalVisible();

    if(isModalVisible){
      modal.loadPracticeExams();
    };
  };

  componentDidMount = async () => {
    //delay rendering
    setTimeout(() => { this.setState({mount: true}) }, 500);
  };

  _onRefresh = async () => {
    await setStateAsync(this, {refreshing: true });

    let result = await Promise.all([
      ModuleStore       .refresh     (),
      ModulesLastUpdated.setTimestamp(),
      //avoid flicker
      timeout(1000),
    ]);

    await setStateAsync(this, {
      refreshing : false, 
      modules    : result[0],
      lastUpdated: result[1],
    });
  };
  
  componentWillMount = async () => {
    //get modules from storage
    let modules = await ModuleStore.get();
    //get lastupdated from store
    const lastUpdated = await ModulesLastUpdated.get();

    this.setState({modules, lastUpdated});
  };

  _navigateToModule = (modules, moduleData) => {
    this.props.navigation.navigate('SubjectListRoute', {
      modules, moduleData
    });
  };

  _onPressSubject = (subjectData, moduleData) => {
    const { getRefSubjectModal, setDrawerSwipe } = this.props.screenProps;
    const { modalClosedCallback, modalOpenedCallback } = getRefSubjectModal();

    //set callbacks for modal when opened/closed
    if(!modalClosedCallback) getRefSubjectModal().modalClosedCallback = () => setDrawerSwipe(true );
    if(!modalOpenedCallback) getRefSubjectModal().modalOpenedCallback = () => setDrawerSwipe(false);

    getRefSubjectModal().openSubjectModal(moduleData, subjectData);
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
    const { modules, lastUpdated } = this.state;
    return(
      <ModulesHeader {...{modules, lastUpdated}}/>
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
    const { modules } = this.state;
    
    const flatListProps = {
      //adjust top distance
      contentInset: {top: HEADER_HEIGHT},
      contentOffset: {x: 0, y: -HEADER_HEIGHT},
      //onEndReached callback not fired when on android
      onEndReachedThreshold: Platform.select({
        ios    : 0  ,
        android: 0.1,
      }),
    };

    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {modules && <ModuleList
          onPressModule ={this._navigateToModule}
          onPressSubject={this._onPressSubject}
          onEndReached={this._handleOnEndReached}
          refreshControl={this._renderRefreshCotrol()}
          ListHeaderComponent={this._renderHeader}
          ListFooterComponent={this._renderFooter}
          {...{modules, ...flatListProps}}
        />}
      </ViewWithBlurredHeader>
    );
  };
};
