import React from 'react';
import { StyleSheet, Text, View, Platform, NavigatorIOS, TouchableOpacity, LayoutAnimation, UIManager, RefreshControl, Clipboard } from 'react-native';

import   SubjectListScreen       from './SubjectListScreen'  ;
import   Constants               from '../Constants'         ;
import { ModuleList            } from '../components/Modules';
import { CustomHeader          } from '../components/Header' ;
import { DrawerButton          } from '../components/Buttons';
import { ViewWithBlurredHeader, IconFooter, Card } from '../components/Views'  ;
import { timeout } from '../functions/Utils';
import { ModuleStore, ModuleItemModel } from '../functions/ModuleStore';

import { Header, createStackNavigator, NavigationEvents } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import Chroma from 'chroma-js';
import TimeAgo from 'react-native-timeago';


import {setStateAsync} from '../functions/Utils';
import { ModulesLastUpdated } from '../functions/MiscStore';

//show a list of modules
export class ModuleListScreen extends React.Component {
  static styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      shadowRadius: 5,
      shadowOpacity: 0.3,
      marginBottom: 20,
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
          fontWeight: '200',
          color: '#202020',
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

    this.state = {
      modules: [], 
      refreshing: false,
      mount: false,
      mountFooter: false,
      lastUpdated: null,
    };

    this.imageHeader = require('../../assets/icons/notes-pencil.png');
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
    const { styles } = ModuleListScreen;
    const { modules, lastUpdated } = this.state;
    
    const time = lastUpdated * 1000;
    const moduleCount = modules.length || '--';

    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'fadeInRight',
    });

    const Time = (props) => (lastUpdated?
      <TimeAgo {...props} {...{time}}/> :
      <Text    {...props}>
        {'--:--'}
      </Text>
    );


    return(
      <Animatable.View
        duration={400}
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
            <Text style={styles.headerTitle   }>Available Modules</Text>
            <Text style={styles.headerSubtitle}>Choose a module and practice answering questions.</Text>
            <View style={{flexDirection: 'row', marginTop: 5}}>
              <View style={{flex: 1}}>
                <Text numberOfLines={1} style={styles.detailTitle   }>{'Modules: '}</Text>
                <Text numberOfLines={1} style={styles.detailSubtitle}>{`${moduleCount} items`}</Text>
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
      <View style={{marginBottom: 75}}>
        <IconFooter ref={r => this.footer = r}/>
      </View>
    );
  };

  render(){
    const { modules } = this.state;
    
    const offset = Header.HEIGHT;
    const flatListProps = {
      contentInset : {top: offset},
      contentOffset: {x: 0, y: -offset},
      contentContainerStyle: { paddingTop: 12 },
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
  }
};
